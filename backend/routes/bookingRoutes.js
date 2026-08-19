const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');
const {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  bookingLimiter,
  [
    body('travelId').notEmpty().withMessage('travelId is required'),
    body('passengers')
      .isArray({ min: 1 })
      .withMessage('At least one passenger is required'),
    body('passengers.*.name').trim().notEmpty().withMessage('Passenger name is required'),
    body('passengers.*.age').isInt({ min: 0, max: 120 }).withMessage('Passenger age must be valid'),
    body('contactEmail').optional().isEmail().withMessage('A valid contact email is required'),
    body('contactPhone').optional().trim().isLength({ max: 20 }),
  ],
  validate,
  createBooking
);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
