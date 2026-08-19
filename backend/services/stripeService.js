const Stripe = require('stripe');

let stripeClient = null;

/**
 * Lazily creates the Stripe client using STRIPE_SECRET_KEY. Throws a clear
 * error only when a Stripe operation is actually attempted without a key
 * configured, rather than crashing the whole server at boot — this keeps
 * the rest of the API usable even before Stripe credentials are added.
 */
const getStripeClient = () => {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const err = new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env to enable payments.'
    );
    err.statusCode = 503;
    throw err;
  }

  stripeClient = new Stripe(secretKey, { apiVersion: '2024-06-20' });
  return stripeClient;
};

/**
 * Creates a PaymentIntent for the given amount (in the smallest currency
 * unit, e.g. cents) and currency. Amount is always computed server-side by
 * the caller from the authoritative Booking.totalAmount — never trust an
 * amount from the frontend.
 */
const createPaymentIntent = async ({ amount, currency, bookingId, userId }) => {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    metadata: {
      bookingId: String(bookingId),
      userId: String(userId),
    },
    automatic_payment_methods: { enabled: true },
  });
};

/**
 * Verifies and constructs a Stripe webhook event from the raw request body
 * and signature header, using STRIPE_WEBHOOK_SECRET. This is the ONLY
 * trusted source of truth for payment status — the frontend can never be
 * trusted to report whether a payment succeeded.
 */
const constructWebhookEvent = (rawBody, signature) => {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    const err = new Error('STRIPE_WEBHOOK_SECRET is not configured');
    err.statusCode = 503;
    throw err;
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
};

/**
 * Fetches the current, authoritative status of a PaymentIntent directly
 * from Stripe (used as a fallback verification path in addition to webhooks).
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  const stripe = getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

module.exports = { createPaymentIntent, constructWebhookEvent, retrievePaymentIntent };
