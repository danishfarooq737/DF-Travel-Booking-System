import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getBookingById } from '../../api/bookings.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StepIndicator from '../../components/booking/StepIndicator.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 2500;

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const redirectStatus = searchParams.get('redirect_status');
  useDocumentTitle('Booking confirmation');

  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | success | error
  const attemptsRef = useRef(0);

  useEffect(() => {
    let active = true;
    let timer;

    const poll = async () => {
      try {
        const res = await getBookingById(bookingId);
        if (!active) return;
        setBooking(res.data.booking);

        const settled = ['paid', 'failed'].includes(res.data.booking.paymentStatus);
        attemptsRef.current += 1;

        if (settled || attemptsRef.current >= MAX_POLLS) {
          setStatus('success');
        } else {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (active) setStatus('error');
      }
    };

    poll();
    return () => { active = false; clearTimeout(timer); };
  }, [bookingId]);

  if (status === 'error') return <ErrorState />;
  if (status === 'loading' || !booking) return <PageLoader label="Confirming your payment…" />;

  const isPaid = booking.paymentStatus === 'paid';
  const isFailed = booking.paymentStatus === 'failed' || redirectStatus === 'failed';
  const isPending = !isPaid && !isFailed;

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <StepIndicator current={4} />

        <div className="card overflow-hidden p-8 text-center">
          {isPaid && (
            <div className="animate-fadeUp">
              <SuccessIcon />
              <h1 className="mt-4 font-display text-2xl font-semibold text-navy-900">Booking confirmed!</h1>
              <p className="mt-2 text-sm text-navy-500">
                Your payment was verified and your trip is booked. A confirmation email is on its way.
              </p>
            </div>
          )}

          {isPending && (
            <div className="animate-fadeUp">
              <PendingIcon />
              <h1 className="mt-4 font-display text-2xl font-semibold text-navy-900">Payment processing</h1>
              <p className="mt-2 text-sm text-navy-500">
                Your payment is still being confirmed. We'll email you as soon as it's finalized — you can also check
                back here or in "My bookings".
              </p>
            </div>
          )}

          {isFailed && (
            <div className="animate-fadeUp">
              <FailedIcon />
              <h1 className="mt-4 font-display text-2xl font-semibold text-navy-900">Payment failed</h1>
              <p className="mt-2 text-sm text-navy-500">
                Your payment could not be completed. No charge was made — you can try again from your booking.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-navy-50 p-4 text-left text-sm">
            <Row label="Booking reference" value={booking.bookingReference} />
            <Row label="Trip" value={booking.travel?.title} />
            <Row label="Departs" value={formatDate(booking.travel?.departureDate)} />
            <Row label="Amount" value={formatCurrency(booking.totalAmount, booking.currency)} />
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link to={`/dashboard/bookings/${booking._id}`} className="btn-primary flex-1">
              View booking
            </Link>
            <Link to="/search" className="btn-outline flex-1">
              Browse more trips
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-navy-400">{label}</span>
      <span className="font-medium text-navy-800">{value || '—'}</span>
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto">
      <circle cx="28" cy="28" r="27" className="animate-popIn origin-center" fill="#1b7a72" fillOpacity="0.1" />
      <circle cx="28" cy="28" r="20" fill="#1b7a72" />
      <path
        d="M18 28.5 25 35 39 21"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset="1"
        className="animate-checkDraw"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto animate-pulse">
      <circle cx="28" cy="28" r="27" fill="#E2A33B" fillOpacity="0.12" />
      <circle cx="28" cy="28" r="20" fill="#E2A33B" />
      <path d="M28 18v10l7 4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FailedIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto animate-popIn">
      <circle cx="28" cy="28" r="27" fill="#f9552b" fillOpacity="0.1" />
      <circle cx="28" cy="28" r="20" fill="#f9552b" />
      <path d="M21 21l14 14M35 21 21 35" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
