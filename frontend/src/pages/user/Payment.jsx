import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById } from '../../api/bookings.js';
import { createPayment } from '../../api/payments.js';
import { stripePromise } from '../../utils/stripe.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StepIndicator from '../../components/booking/StepIndicator.jsx';
import CheckoutForm from '../../components/payment/CheckoutForm.jsx';
import { formatCurrency } from '../../utils/format.js';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  useDocumentTitle('Payment');

  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const bookingRes = await getBookingById(bookingId);
        if (!active) return;

        if (bookingRes.data.booking.paymentStatus === 'paid') {
          navigate(`/dashboard/bookings/${bookingId}`, { replace: true });
          return;
        }

        setBooking(bookingRes.data.booking);
        const paymentRes = await createPayment(bookingId);
        if (!active) return;
        setClientSecret(paymentRes.data.clientSecret);
        setStatus('success');
      } catch (err) {
        if (active) {
          setError(err.message || 'Could not start payment.');
          setStatus('error');
        }
      }
    })();
    return () => { active = false; };
  }, [bookingId, navigate]);

  if (status === 'loading') return <PageLoader label="Preparing secure payment…" />;
  if (status === 'error') return <ErrorState message={error} />;

  const returnUrl = `${window.location.origin}/payment/${bookingId}/return`;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <StepIndicator current={3} />

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between border-b border-navy-100 pb-4">
            <div>
              <p className="text-sm text-navy-400">Paying for</p>
              <p className="font-medium text-navy-900">{booking?.travel?.title || booking?.bookingReference}</p>
            </div>
            <span className="font-mono text-lg font-semibold text-navy-900">
              {formatCurrency(booking?.totalAmount, booking?.currency)}
            </span>
          </div>

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#f9552b' } } }}
            >
              <CheckoutForm returnUrl={returnUrl} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
