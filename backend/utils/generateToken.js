const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT access token for a given user id.
 *
 * Architecture note (documented per security requirements):
 * This API uses a single bearer access token sent via the
 * "Authorization: Bearer <token>" header rather than cookies.
 * Because the token is never stored in a cookie, the browser never attaches
 * it automatically to cross-site requests, so this API is not vulnerable to
 * classic CSRF attacks and no CSRF middleware is required. The trade-off
 * (documented in README "Known Limitations") is that there is no server-side
 * refresh-token rotation in this version; the access token simply expires
 * after JWT_EXPIRE and the user must log in again.
 */
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;
