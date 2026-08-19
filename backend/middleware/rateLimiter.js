const rateLimit = require('express-rate-limit');

/**
 * General limiter applied to all /api routes: 100 requests per 15 minutes
 * per IP. Generous enough for normal browsing/booking use, but blocks
 * scripted abuse.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

/**
 * Strict limiter for sensitive, abuse-prone endpoints: login, register,
 * password reset. 10 attempts per 15 minutes per IP protects against
 * brute-force credential guessing.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts, please try again in 15 minutes.',
  },
});

/**
 * Limiter for payment/booking creation endpoints to slow down automated
 * abuse without blocking legitimate rapid checkout flows.
 */
const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking/payment attempts, please slow down.',
  },
});

module.exports = { apiLimiter, authLimiter, bookingLimiter };
