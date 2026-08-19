const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Verifies the JWT bearer token on the Authorization header and attaches
 * the authenticated user (without the password field) to req.user.
 * Every protected route must use this — frontend route guards are for UX
 * only and are never trusted for security.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Not authorized, token is invalid or expired');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'Not authorized, user no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles, e.g. authorize('admin').
 * Must be used after protect().
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized, no user on request');
  }
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, authorize };
