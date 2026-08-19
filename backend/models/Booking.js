const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    passportNumber: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    travel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Travel',
      required: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    passengers: {
      type: [passengerSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one passenger is required',
      },
    },
    numberOfTravelers: {
      type: Number,
      required: true,
      min: [1, 'Number of travelers must be at least 1'],
    },
    // Authoritative amount, always calculated server-side from
    // Travel.price * numberOfTravelers at creation time. Never trust a
    // total sent from the client.
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ travel: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
