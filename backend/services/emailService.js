const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Lazily creates (and caches) the nodemailer transporter from env vars.
 * Returns null if email is not configured, so callers can skip sending
 * gracefully instead of crashing.
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  return transporter;
};

/**
 * Sends an email. Never throws — if email is not configured or delivery
 * fails, it logs the problem and returns a status object instead, so that a
 * temporary email outage can never break the booking/payment flow.
 *
 * @returns {Promise<{ status: 'sent' | 'failed' | 'skipped', error?: string }>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    // eslint-disable-next-line no-console
    console.warn(`[email] Skipped sending "${subject}" to ${to} — EMAIL_* env vars not configured.`);
    return { status: 'skipped' };
  }

  try {
    await activeTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || undefined,
    });
    return { status: 'sent' };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[email] Failed to send "${subject}" to ${to}: ${error.message}`);
    return { status: 'failed', error: error.message };
  }
};

const templates = {
  bookingConfirmation: ({ name, bookingReference, travelTitle, totalAmount, currency }) => ({
    subject: 'Your travel booking has been confirmed',
    html: `
      <p>Hi ${name},</p>
      <p>Your travel booking has been successfully confirmed.</p>
      <ul>
        <li><strong>Booking Reference:</strong> ${bookingReference}</li>
        <li><strong>Travel:</strong> ${travelTitle}</li>
        <li><strong>Amount Paid:</strong> ${currency} ${totalAmount}</li>
        <li><strong>Booking Status:</strong> Confirmed</li>
        <li><strong>Payment Status:</strong> Paid</li>
      </ul>
      <p>Thank you for booking with us.</p>
    `,
  }),
  paymentFailed: ({ name, bookingReference }) => ({
    subject: 'Payment failed for your booking',
    html: `
      <p>Hi ${name},</p>
      <p>We were unable to process payment for booking <strong>${bookingReference}</strong>.
      Please try again or use a different payment method.</p>
    `,
  }),
  paymentPending: ({ name, bookingReference }) => ({
    subject: 'Your payment/booking is being processed',
    html: `
      <p>Hi ${name},</p>
      <p>Your payment/booking (${bookingReference}) is currently being processed.
      We will notify you by email once the process is completed.</p>
    `,
  }),
  bookingCancelled: ({ name, bookingReference }) => ({
    subject: 'Your booking has been cancelled',
    html: `
      <p>Hi ${name},</p>
      <p>Your booking <strong>${bookingReference}</strong> has been cancelled.</p>
    `,
  }),
};

module.exports = { sendEmail, templates };
