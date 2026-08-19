/**
 * Custom operational error class. Controllers/services throw this (via
 * asyncHandler) whenever a request should fail with a specific HTTP status
 * and a safe, user-facing message. The centralized errorHandler middleware
 * knows how to serialize this consistently.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
