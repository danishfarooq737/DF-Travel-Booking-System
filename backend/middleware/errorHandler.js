/**
 * Centralized error-handling middleware. Must be registered LAST, after all
 * routes. Normalizes known error types (Mongoose, JWT, custom ApiError) into
 * a consistent JSON shape and NEVER leaks stack traces, connection strings,
 * or other internal details to the client in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong. Please try again later.';
  let details = err.details || undefined;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account or record with this ${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // Log full details server-side only (never sent to the client).
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${statusCode}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err.stack);
  }

  const response = {
    success: false,
    message,
  };

  if (details) response.errors = details;

  // Stack traces are only ever included outside production, for local debugging.
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
