const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  getAllPayments,
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put(
  '/users/:id',
  [
    body('role').optional().isIn(['user', 'admin']),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  updateUser
);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);
router.put(
  '/bookings/:id',
  [body('bookingStatus').notEmpty().withMessage('bookingStatus is required')],
  validate,
  updateBookingStatus
);

router.get('/payments', getAllPayments);

module.exports = router;
