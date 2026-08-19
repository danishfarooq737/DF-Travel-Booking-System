const { OAuth2Client } = require('google-auth-library');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    authProvider: 'local',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select('+password +loginAttempts +lockUntil');

  const genericError = () =>
    new ApiError(401, 'Invalid email or password');

  if (!user) {
    throw genericError();
  }

  if (user.isLocked) {
    throw new ApiError(
      423,
      'This account is temporarily locked due to multiple failed login attempts. Please try again later.'
    );
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME_MS;
      user.loginAttempts = 0;
    }

    await user.save({
      validateBeforeSave: false,
    });

    throw genericError();
  }

  if (user.loginAttempts || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save({
      validateBeforeSave: false,
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

// @desc    Login or register using Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, 'Google credential is required');
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(
      503,
      'Google authentication is not configured on the server'
    );
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    console.error(`Google token verification failed: ${error.message}`);

    throw new ApiError(
      401,
      'Invalid Google authentication credential'
    );
  }

  const payload = ticket.getPayload();

  if (!payload) {
    throw new ApiError(
      401,
      'Invalid Google authentication credential'
    );
  }

  const {
    sub: googleId,
    email,
    name,
    email_verified: emailVerified,
  } = payload;

  if (!googleId || !email) {
    throw new ApiError(
      401,
      'Google account information is incomplete'
    );
  }

  if (!emailVerified) {
    throw new ApiError(
      403,
      'Your Google email address must be verified'
    );
  }

  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({
    $or: [
      { googleId },
      { email: normalizedEmail },
    ],
  }).select('+password');

  if (user) {
    if (!user.isActive) {
      throw new ApiError(
        403,
        'This account has been deactivated'
      );
    }

    // Existing Google account.
    if (user.googleId === googleId) {
      user.isVerified = true;

      await user.save({
        validateBeforeSave: false,
      });
    } else {
      // Existing email/password account.
      //
      // We do NOT silently convert an existing local account into a
      // Google account. This prevents an account-linking/security issue.
      if (user.authProvider === 'local') {
        throw new ApiError(
          409,
          'An account with this email already exists. Please log in using your email and password.'
        );
      }

      throw new ApiError(
        409,
        'This Google account is already associated with another account'
      );
    }
  } else {
    user = await User.create({
      name: name || 'Google User',
      email: normalizedEmail,
      authProvider: 'google',
      googleId,
      isVerified: true,
      isActive: true,
    });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Google login successful',
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: {
      user: sanitizeUser(user),
    },
  });
});

// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Google users don't have a local password.
  if (!user.password) {
    throw new ApiError(
      400,
      'Google accounts do not have a password. Please manage your account through Google.'
    );
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    throw new ApiError(
      401,
      'Current password is incorrect'
    );
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
};