import { loadStripe } from '@stripe/stripe-js';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// A missing/placeholder key is a common setup gap — warn loudly in the
// console rather than failing silently deep inside Stripe's SDK.
if (!publishableKey || publishableKey.includes('your_stripe')) {
  // eslint-disable-next-line no-console
  console.warn(
    '[DF Travel System] VITE_STRIPE_PUBLISHABLE_KEY is not set. Payments will not work until a real Stripe publishable key is added to frontend/.env.'
  );
}

export const stripePromise = loadStripe(publishableKey || '');
