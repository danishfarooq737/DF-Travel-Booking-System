import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTravelById } from '../../api/travel.js';
import { createBooking } from '../../api/bookings.js';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import StepIndicator from '../../components/booking/StepIndicator.jsx';
import PassengerRow from '../../components/booking/PassengerRow.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

const blankPassenger = () => ({ name: '', age: '', passportNumber: '' });

export default function Checkout() {
  const { travelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  useDocumentTitle('Book your trip');

  const [travel, setTravel] = useState(null);
  const [status, setStatus] = useState('loading');
  const [passengers, setPassengers] = useState([blankPassenger()]);
  const [contact, setContact] = useState({ contactEmail: '', contactPhone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTravelById(travelId)
      .then((res) => {
        setTravel(res.data.travel);
        setContact({ contactEmail: user?.email || '', contactPhone: user?.phone || '' });
        setStatus('success');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelId]);

  if (status === 'loading') return <PageLoader label="Preparing your booking…" />;
  if (status === 'error' || !travel) return <ErrorState onRetry={() => navigate(`/travel/${travelId}`)} />;

  const maxPassengers = Math.max(1, travel.availableSeats);
  const total = travel.price * passengers.length;

  const updatePassenger = (index, updated) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? updated : p)));
  };

  const addPassenger = () => {
    if (passengers.length >= maxPassengers) return;
    setPassengers((prev) => [...prev, blankPassenger()]);
  };

  const removePassenger = (index) => {
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await createBooking({
        travelId,
        passengers: passengers.map((p) => ({ ...p, age: Number(p.age) })),
        ...contact,
      });
      toast.success('Booking created — continue to payment');
      navigate(`/payment/${res.data.booking._id}`);
    } catch (err) {
      setError(err.message || 'Could not create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <StepIndicator current={2} />

        <div className="card p-6">
          <h1 className="font-display text-xl font-semibold text-navy-900">{travel.title}</h1>
          <p className="mt-1 text-sm text-navy-500">
            {travel.destination} · Departs {formatDate(travel.departureDate)} · {formatCurrency(travel.price, travel.currency)} / traveler
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Contact email</label>
                <input required type="email" className="input" value={contact.contactEmail} onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })} />
              </div>
              <div>
                <label className="label">Contact phone</label>
                <input className="input" value={contact.contactPhone} onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              {passengers.map((p, i) => (
                <PassengerRow key={i} index={i} passenger={p} onChange={updatePassenger} onRemove={removePassenger} removable={passengers.length > 1} />
              ))}
            </div>

            {passengers.length < maxPassengers && (
              <button type="button" onClick={addPassenger} className="btn-outline text-sm">
                + Add another passenger
              </button>
            )}
            <p className="text-xs text-navy-400">Up to {maxPassengers} traveler{maxPassengers === 1 ? '' : 's'} can be booked (seats available).</p>

            <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
              <span className="text-sm font-medium text-navy-600">Total for {passengers.length} traveler{passengers.length === 1 ? '' : 's'}</span>
              <span className="font-mono text-lg font-semibold text-navy-900">{formatCurrency(total, travel.currency)}</span>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating booking…' : 'Continue to payment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
