const express = require('express');

const { body } = require('express-validator');

const validate = require('../middleware/validate');

const { protect } = require('../middleware/auth');

const { authLimiter } = require('../middleware/rateLimiter');

const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

const router = express.Router();

const strongPassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

// ============================================================
// REGISTER
// POST /api/auth/register
// ============================================================
router.post(
  '/register',
  authLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),

    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),

    strongPassword,

    body('phone')
      .optional()
      .trim()
      .isLength({ max: 20 }),
  ],
  validate,
  register
);

// ============================================================
// LOGIN WITH EMAIL AND PASSWORD
// POST /api/auth/login
// ============================================================
router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

// ============================================================
// LOGIN WITH GOOGLE
// POST /api/auth/google
// ============================================================
router.post(
  '/google',
  authLimiter,
  googleLogin
);

// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// ============================================================
router.get(
  '/me',
  protect,
  getMe
);

// ============================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// ============================================================
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }),

    body('phone')
      .optional()
      .trim()
      .isLength({ max: 20 }),
  ],
  validate,
  updateProfile
);

// ============================================================
// CHANGE PASSWORD
// PUT /api/auth/change-password
// ============================================================
router.put(
  '/change-password',
  protect,
  authLimiter,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),

    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/)
      .withMessage('New password must contain at least one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('New password must contain at least one number'),
  ],
  validate,
  changePassword
);

// ============================================================
// LOGOUT
// POST /api/auth/logout
// ============================================================
router.post(
  '/logout',
  protect,
  logout
);

module.exports = router;