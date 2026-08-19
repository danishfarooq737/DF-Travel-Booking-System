import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelBooking, getBookingById } from '../../api/bookings.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import useToast from '../../hooks/useToast.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useDocumentTitle(booking?.bookingReference);

  const load = () => {
    setStatus('loading');
    getBookingById(id)
      .then((res) => { setBooking(res.data.booking); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelBooking(id);
      setBooking(res.data.booking);
      toast.success('Booking cancelled');
      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (status === 'loading') return <PageLoader />;
  if (status === 'error' || !booking) return <ErrorState onRetry={load} />;

  const canCancel = ['pending', 'confirmed'].includes(booking.bookingStatus);
  const canPay = booking.bookingStatus !== 'cancelled' && booking.paymentStatus !== 'paid';

  return (
    <div className="max-w-3xl">
      <Link to="/dashboard/bookings" className="text-sm text-navy-400 hover:text-coral-600">← Back to bookings</Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Booking {booking.bookingReference}</p>
          <h1 className="mt-1 text-2xl font-semibold">{booking.travel?.title || 'Trip'}</h1>
          <div className="mt-2 flex gap-2">
            <Badge className={BOOKING_STATUS_STYLES[booking.bookingStatus]}>{booking.bookingStatus}</Badge>
            <Badge className={PAYMENT_STATUS_STYLES[booking.paymentStatus]}>{booking.paymentStatus}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {canPay && (
            <button onClick={() => navigate(`/payment/${booking._id}`)} className="btn-primary">
              Pay now
            </button>
          )}
          {canCancel && (
            <button onClick={() => setConfirmOpen(true)} className="btn-danger">
              Cancel booking
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-navy-900">Trip details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Destination" value={booking.travel?.destination} />
            <Row label="Departs" value={formatDate(booking.travel?.departureDate)} />
            <Row label="Booked on" value={formatDate(booking.createdAt)} />
            {booking.cancelledAt && <Row label="Cancelled on" value={formatDate(booking.cancelledAt)} />}
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-base font-semibold text-navy-900">Payment summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Travelers" value={booking.numberOfTravelers} />
            <Row label="Total amount" value={formatCurrency(booking.totalAmount, booking.currency)} />
            <Row label="Contact email" value={booking.contactEmail} />
          </dl>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="font-display text-base font-semibold text-navy-900">Passengers</h2>
        <div className="mt-3 divide-y divide-navy-100">
          {booking.passengers.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-navy-800">{p.name}</span>
              <span className="text-navy-500">Age {p.age}{p.passportNumber ? ` · ${p.passportNumber}` : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        description="This will release the reserved seats and cannot be undone."
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-navy-400">{label}</dt>
      <dd className="font-medium text-navy-800">{value ?? '—'}</dd>
    </div>
  );
}
