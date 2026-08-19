import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

export default function CheckoutForm({ returnUrl, onProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');
    onProcessing?.(true);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // confirmPayment only returns here on immediate failure (e.g. card
    // declined synchronously); on success the browser redirects to returnUrl.
    if (confirmError) {
      setError(confirmError.message || 'Payment could not be processed. Please try again.');
      setSubmitting(false);
      onProcessing?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && (
        <p role="alert" className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">
          {error}
        </p>
      )}
      <button type="submit" disabled={!stripe || submitting} className="btn-primary w-full">
        {submitting ? 'Processing payment…' : 'Pay now'}
      </button>
      <p className="text-center text-xs text-navy-400">
        Payments are processed securely by Stripe. Your card details never touch our servers.
      </p>
    </form>
  );
}
