import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export default function MyBookings() {
  useDocumentTitle('My bookings');
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filter, setFilter] = useState('');

  const load = (statusFilter) => {
    setStatus('loading');
    getMyBookings(statusFilter ? { status: statusFilter } : {})
      .then((res) => { setBookings(res.data.bookings); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(() => load(filter), [filter]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Your trips</p>
          <h1 className="mt-1 text-2xl font-semibold">My bookings</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-navy-900 text-white' : 'bg-navy-100 text-navy-600 hover:bg-navy-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && <PageLoader />}
      {status === 'error' && <ErrorState onRetry={() => load(filter)} />}

      {status === 'success' && bookings.length === 0 && (
        <EmptyState
          title="No bookings found"
          description="Try a different filter, or browse trips to make your first booking."
          action={<Link to="/search" className="btn-primary">Browse trips</Link>}
        />
      )}

      {status === 'success' && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b._id}
              to={`/dashboard/bookings/${b._id}`}
              className="card card-hover flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-navy-900">{b.travel?.title || 'Trip'}</p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {b.bookingReference} · {b.numberOfTravelers} traveler{b.numberOfTravelers === 1 ? '' : 's'} · {formatDate(b.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={BOOKING_STATUS_STYLES[b.bookingStatus]}>{b.bookingStatus}</Badge>
                <Badge className={PAYMENT_STATUS_STYLES[b.paymentStatus]}>{b.paymentStatus}</Badge>
                <span className="ml-2 font-mono text-sm font-semibold text-navy-900">{formatCurrency(b.totalAmount, b.currency)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
