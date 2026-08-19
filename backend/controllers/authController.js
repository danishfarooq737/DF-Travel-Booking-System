const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

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

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user: sanitizeUser(user), token },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password +loginAttempts +lockUntil'
  );

  // Use a generic message for both "no user" and "wrong password" so we
  // never reveal whether an email is registered (defense against
  // account-enumeration attacks).
  const genericError = () => new ApiError(401, 'Invalid email or password');

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
    await user.save({ validateBeforeSave: false });
    throw genericError();
  }

  // Successful login resets attempt counter.
  if (user.loginAttempts || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user: sanitizeUser(user), token },
  });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: sanitizeUser(req.user) } });
});

// @desc    Update current user's profile (name/phone only — not email/role)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    data: { user: sanitizeUser(user) },
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

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
// Note: this API is stateless (JWT bearer tokens, no server-side session
// store), so "logout" is primarily a client-side action — the client
// discards the token. This endpoint exists for a consistent API surface and
// to log the event; it returns success so the frontend can clear its state.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, updateProfile, changePassword, logout };
