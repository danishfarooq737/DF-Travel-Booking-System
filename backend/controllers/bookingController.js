const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isValidObjectId, generateBookingReference } = require('../utils/validators');
const Booking = require('../models/Booking');
const Travel = require('../models/Travel');

// @desc    Create a new booking (pending, awaiting payment)
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { travelId, passengers, contactEmail, contactPhone } = req.body;

  if (!isValidObjectId(travelId)) {
    throw new ApiError(400, 'Invalid travel id');
  }

  if (!Array.isArray(passengers) || passengers.length === 0) {
    throw new ApiError(400, 'At least one passenger is required');
  }

  const numberOfTravelers = passengers.length;

  const travel = await Travel.findById(travelId);
  if (!travel) {
    throw new ApiError(404, 'Travel listing not found');
  }

  if (travel.status !== 'active') {
    throw new ApiError(400, 'This travel listing is not available for booking');
  }

  // Atomically reserve seats: only succeeds if enough seats are still
  // available at the moment of the update. This prevents a race condition
  // where two users simultaneously book the last remaining seats.
  const updatedTravel = await Travel.findOneAndUpdate(
    { _id: travelId, availableSeats: { $gte: numberOfTravelers } },
    { $inc: { availableSeats: -numberOfTravelers } },
    { new: true }
  );

  if (!updatedTravel) {
    throw new ApiError(409, 'Not enough seats available for the requested number of travelers');
  }

  // Total amount is always calculated server-side from the authoritative
  // Travel.price — the client can never influence the final price.
  const totalAmount = Number((travel.price * numberOfTravelers).toFixed(2));

  let booking;
  try {
    booking = await Booking.create({
      user: req.user.id,
      travel: travel.id,
      bookingReference: generateBookingReference(),
      passengers,
      numberOfTravelers,
      totalAmount,
      currency: travel.currency,
      contactEmail: contactEmail || req.user.email,
      contactPhone: contactPhone || req.user.phone,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
    });
  } catch (error) {
    // If booking creation fails after seats were reserved, release the
    // seats back so they are not lost.
    await Travel.findByIdAndUpdate(travelId, { $inc: { availableSeats: numberOfTravelers } });
    throw error;
  }

  res.status(201).json({ success: true, message: 'Booking created, awaiting payment', data: { booking } });
});

// @desc    Get current user's bookings (or all bookings for admins)
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user.id };

  if (req.query.status) {
    filter.bookingStatus = req.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate('travel', 'title destination departureDate images price currency')
    .sort('-createdAt');

  res.status(200).json({ success: true, data: { bookings } });
});

// @desc    Get single booking by id
// @route   GET /api/bookings/:id
// @access  Private (owner or admin only)
const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid booking id');
  }

  const booking = await Booking.findById(id).populate('travel');
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Server-side authorization check — never rely on the frontend to
  // prevent a user from viewing someone else's booking by guessing an id.
  const isOwner = booking.user.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to view this booking');
  }

  res.status(200).json({ success: true, data: { booking } });
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (owner or admin only)
const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid booking id');
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isOwner = booking.user.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to cancel this booking');
  }

  if (booking.bookingStatus === 'cancelled') {
    throw new ApiError(400, 'This booking is already cancelled');
  }

  if (booking.bookingStatus === 'completed') {
    throw new ApiError(400, 'A completed booking cannot be cancelled');
  }

  booking.bookingStatus = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();

  // Release the seats back to the travel listing, and re-activate the
  // listing if it had been marked soldout.
  const updatedTravel = await Travel.findByIdAndUpdate(
    booking.travel,
    { $inc: { availableSeats: booking.numberOfTravelers } },
    { new: true }
  );
  if (updatedTravel && updatedTravel.status === 'soldout' && updatedTravel.availableSeats > 0) {
    updatedTravel.status = 'active';
    await updatedTravel.save();
  }

  res.status(200).json({ success: true, message: 'Booking cancelled', data: { booking } });
});

module.exports = { createBooking, getBookings, getBookingById, cancelBooking };
