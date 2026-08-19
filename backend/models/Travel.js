const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    departureCity: {
      type: String,
      required: [true, 'Departure city is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    travelType: {
      type: String,
      enum: ['flight', 'hotel', 'package', 'tour', 'cruise'],
      default: 'package',
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    returnDate: {
      type: Date,
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1'],
    },
    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'soldout'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Keep availableSeats in sync with status automatically.
travelSchema.pre('save', function syncStatus(next) {
  if (this.availableSeats <= 0 && this.status === 'active') {
    this.status = 'soldout';
  }
  next();
});

travelSchema.index({ destination: 1 });
travelSchema.index({ departureDate: 1 });
travelSchema.index({ price: 1 });
travelSchema.index({ status: 1 });
travelSchema.index({ title: 'text', destination: 'text', description: 'text' });

module.exports = mongoose.model('Travel', travelSchema);
