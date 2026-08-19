const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    type: {
      type: String,
      enum: [
        'booking_confirmation',
        'payment_success',
        'payment_failed',
        'payment_pending',
        'booking_cancelled',
        'general',
      ],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Whether the notification record itself has been read/dismissed
    // in the user's notification center (separate from email delivery status).
    isRead: {
      type: Boolean,
      default: false,
    },
    emailStatus: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      default: 'skipped',
    },
    emailError: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
