const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');
const { createPayment, getPaymentById, verifyPayment } = require('../controllers/paymentController');

// NOTE: The Stripe webhook route (POST /api/payments/webhook) is intentionally
// NOT defined here. It is mounted directly in server.js, before the global
// express.json() body parser, because Stripe webhook signature verification
// requires access to the raw, unparsed request body.

const router = express.Router();

router.use(protect);

router.post(
  '/create',
  bookingLimiter,
  [body('bookingId').notEmpty().withMessage('bookingId is required')],
  validate,
  createPayment
);

router.get('/:id', getPaymentById);
router.get('/:id/verify', verifyPayment);

module.exports = router;
