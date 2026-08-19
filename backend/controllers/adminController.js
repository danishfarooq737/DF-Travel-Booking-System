const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../utils/validators');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({ success: true, data: { users } });
});

// @desc    Update a user's role or active status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  const { role, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent an admin from accidentally locking themselves out.
  if (String(user._id) === req.user.id && role && role !== 'admin') {
    throw new ApiError(400, 'You cannot remove your own admin role');
  }

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid user id');
  }

  if (id === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account from the admin panel');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('travel', 'title destination departureDate')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: { bookings } });
});

// @desc    Update a booking's status (admin override)
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid booking id');
  }

  const { bookingStatus } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!allowedStatuses.includes(bookingStatus)) {
    throw new ApiError(400, `bookingStatus must be one of: ${allowedStatuses.join(', ')}`);
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  booking.bookingStatus = bookingStatus;
  await booking.save();

  res.status(200).json({ success: true, message: 'Booking status updated', data: { booking } });
});

// @desc    Get all payments (admin view)
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('booking', 'bookingReference totalAmount')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: { payments } });
});

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  getAllPayments,
};
