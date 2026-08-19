const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../utils/validators');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail, templates } = require('../services/emailService');
const {
  createPaymentIntent,
  constructWebhookEvent,
  retrievePaymentIntent,
} = require('../services/stripeService');

// Currencies where Stripe expects a whole-unit (zero-decimal) amount rather
// than the smallest sub-unit.
const ZERO_DECIMAL_CURRENCIES = new Set([
  'JPY',
  'KRW',
  'VND',
  'CLP',
  'ISK',
  'HUF',
  'TWD',
  'UGX',
  'XOF',
  'XAF',
]);

const toSmallestUnit = (amount, currency) => {
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
};

// @desc    Create a Stripe payment intent for a booking
// @route   POST /api/payments/create
// @access  Private (owner only)
const createPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!isValidObjectId(bookingId)) {
    throw new ApiError(400, 'Invalid booking id');
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (booking.user.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to pay for this booking');
  }

  if (booking.bookingStatus === 'cancelled') {
    throw new ApiError(400, 'Cannot pay for a cancelled booking');
  }

  if (booking.paymentStatus === 'paid') {
    throw new ApiError(400, 'This booking has already been paid for');
  }

  /*
   * Check whether there is an existing pending payment in our database.
   *
   * IMPORTANT:
   * We cannot blindly reuse the PaymentIntent because the database status
   * may say "pending" while Stripe has already moved the PaymentIntent into
   * a terminal state such as succeeded or canceled.
   */
  const existingPending = await Payment.findOne({
    booking: booking.id,
    status: 'pending',
  });

  if (existingPending) {
    const existingIntent = await retrievePaymentIntent(
      existingPending.stripePaymentIntentId
    );

    /*
     * These Stripe states can still be used to collect payment details.
     */
    const reusableStatuses = [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
    ];

    if (reusableStatuses.includes(existingIntent.status)) {
      return res.status(200).json({
        success: true,
        message: 'Existing pending payment reused',
        data: {
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingPending.stripePaymentIntentId,
          reused: true,
        },
      });
    }

    /*
     * Stripe says the PaymentIntent succeeded, but our database still
     * says pending. Synchronize our database instead of attempting to
     * initialize Stripe Elements with a terminal PaymentIntent.
     */
    if (existingIntent.status === 'succeeded') {
      existingPending.status = 'succeeded';
      await existingPending.save();

      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      await booking.save();

      throw new ApiError(
        400,
        'This booking has already been paid. Please refresh the page.'
      );
    }

    /*
     * Stripe canceled the old PaymentIntent.
     */
    if (existingIntent.status === 'canceled') {
      existingPending.status = 'cancelled';
      existingPending.failureReason =
        'Stripe PaymentIntent was canceled.';
      await existingPending.save();
    } else {
      /*
       * Any other non-reusable state should not be sent to Stripe Elements.
       * Mark the old local payment as failed and allow the code below to
       * create a fresh PaymentIntent.
       */
      existingPending.status = 'failed';
      existingPending.failureReason =
        `Stripe PaymentIntent is in ${existingIntent.status} state.`;
      await existingPending.save();
    }
  }

  /*
   * Amount is always derived from the authoritative Booking.totalAmount
   * saved at booking creation time.
   *
   * Never trust the amount supplied by the frontend.
   */
  const amountInSmallestUnit = toSmallestUnit(
    booking.totalAmount,
    booking.currency
  );

  /*
   * Create a fresh PaymentIntent when there is no reusable pending
   * PaymentIntent.
   */
  const paymentIntent = await createPaymentIntent({
    amount: amountInSmallestUnit,
    currency: booking.currency,
    bookingId: booking.id,
    userId: req.user.id,
  });

  /*
   * Store the new PaymentIntent in our database.
   */
  await Payment.create({
    booking: booking.id,
    user: req.user.id,
    provider: 'stripe',
    stripePaymentIntentId: paymentIntent.id,
    amount: booking.totalAmount,
    currency: booking.currency,
    status: 'pending',
  });

  /*
   * Return the client secret to the frontend.
   *
   * The frontend uses this client secret to initialize Stripe Elements.
   */
  res.status(201).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    },
  });
});

// @desc    Get payment details by id
// @route   GET /api/payments/:id
// @access  Private (owner or admin only)
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid payment id');
  }

  const payment = await Payment.findById(id).populate('booking');

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  const isOwner = payment.user.toString() === req.user.id;

  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(
      403,
      'You are not authorized to view this payment'
    );
  }

  res.status(200).json({
    success: true,
    data: {
      payment,
    },
  });
});

/**
 * Applies a verified payment status update to the Payment and Booking
 * records, and fires the corresponding notification email.
 *
 * This is shared between the webhook handler and the manual verification
 * fallback so both paths stay synchronized.
 */
const applyPaymentStatus = async (
  paymentIntent,
  status,
  failureReason = ''
) => {
  const payment = await Payment.findOne({
    stripePaymentIntentId: paymentIntent.id,
  }).populate({
    path: 'booking',
    populate: {
      path: 'travel',
    },
  });

  if (!payment) {
    // Nothing to reconcile.
    // This can happen for PaymentIntents not created through this API.
    // eslint-disable-next-line no-console
    console.warn(
      `[payments] Received event for unknown PaymentIntent ${paymentIntent.id}`
    );

    return;
  }

  /*
   * Idempotency guard.
   *
   * Stripe can send the same webhook more than once.
   * Do not send duplicate emails or create duplicate notifications.
   */
  if (payment.status === status) {
    return;
  }

  payment.status = status;

  if (failureReason) {
    payment.failureReason = failureReason;
  }

  await payment.save();

  const booking = payment.booking;

  if (!booking) {
    return;
  }

  const user = await User.findById(booking.user);

  /*
   * Successful payment.
   */
  if (status === 'succeeded') {
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';

    await booking.save();

    const { subject, html } = templates.bookingConfirmation({
      name: user ? user.name : 'Customer',
      bookingReference: booking.bookingReference,
      travelTitle: booking.travel
        ? booking.travel.title
        : 'your trip',
      totalAmount: booking.totalAmount,
      currency: booking.currency,
    });

    const emailResult = await sendEmail({
      to: booking.contactEmail,
      subject,
      html,
    });

    await Notification.create({
      user: booking.user,
      booking: booking.id,
      type: 'payment_success',
      subject,
      message: html.replace(/<[^>]+>/g, ' ').trim(),
      emailStatus: emailResult.status,
      emailError: emailResult.error || '',
    });
  }

  /*
   * Failed payment.
   */
  if (status === 'failed') {
    booking.paymentStatus = 'failed';

    await booking.save();

    const { subject, html } = templates.paymentFailed({
      name: user ? user.name : 'Customer',
      bookingReference: booking.bookingReference,
    });

    const emailResult = await sendEmail({
      to: booking.contactEmail,
      subject,
      html,
    });

    await Notification.create({
      user: booking.user,
      booking: booking.id,
      type: 'payment_failed',
      subject,
      message: html.replace(/<[^>]+>/g, ' ').trim(),
      emailStatus: emailResult.status,
      emailError: emailResult.error || '',
    });
  }

  /*
   * Payment is processing.
   */
  if (status === 'pending') {
    const { subject, html } = templates.paymentPending({
      name: user ? user.name : 'Customer',
      bookingReference: booking.bookingReference,
    });

    const emailResult = await sendEmail({
      to: booking.contactEmail,
      subject,
      html,
    });

    await Notification.create({
      user: booking.user,
      booking: booking.id,
      type: 'payment_pending',
      subject,
      message: html.replace(/<[^>]+>/g, ' ').trim(),
      emailStatus: emailResult.status,
      emailError: emailResult.error || '',
    });
  }

  /*
   * PaymentIntent was canceled.
   */
  if (status === 'cancelled') {
    booking.paymentStatus = 'failed';

    await booking.save();
  }
};

// @desc    Stripe webhook endpoint — authoritative payment status
// @route   POST /api/payments/webhook
// @access  Public (verified via Stripe signature)
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    /*
     * req.body must be the raw Buffer here.
     *
     * app.js registers the webhook route before express.json().
     */
    event = constructWebhookEvent(req.body, signature);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[webhook] Signature verification failed: ${error.message}`
    );

    return res
      .status(400)
      .send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await applyPaymentStatus(
        event.data.object,
        'succeeded'
      );
      break;

    case 'payment_intent.payment_failed':
      await applyPaymentStatus(
        event.data.object,
        'failed',
        event.data.object.last_payment_error?.message ||
          'Payment failed'
      );
      break;

    case 'payment_intent.canceled':
      await applyPaymentStatus(
        event.data.object,
        'cancelled'
      );
      break;

    case 'payment_intent.processing':
      await applyPaymentStatus(
        event.data.object,
        'pending'
      );
      break;

    default:
      /*
       * Other Stripe event types are acknowledged but ignored.
       */
      break;
  }

  /*
   * Always acknowledge successful receipt so Stripe does not retry
   * unnecessarily.
   */
  res.status(200).json({
    received: true,
  });
});

// @desc    Manually re-verify payment status directly against Stripe
// @route   GET /api/payments/:id/verify
// @access  Private (owner or admin only)
const verifyPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, 'Invalid payment id');
  }

  const payment = await Payment.findById(id);

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  const isOwner = payment.user.toString() === req.user.id;

  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(
      403,
      'You are not authorized to verify this payment'
    );
  }

  const paymentIntent = await retrievePaymentIntent(
    payment.stripePaymentIntentId
  );

  const statusMap = {
    succeeded: 'succeeded',
    processing: 'pending',
    requires_payment_method: 'failed',
    canceled: 'cancelled',
  };

  const mappedStatus =
    statusMap[paymentIntent.status] || 'pending';

  await applyPaymentStatus(
    paymentIntent,
    mappedStatus
  );

  const refreshed = await Payment.findById(id);

  res.status(200).json({
    success: true,
    data: {
      payment: refreshed,
    },
  });
});

module.exports = {
  createPayment,
  getPaymentById,
  handleWebhook,
  verifyPayment,
};