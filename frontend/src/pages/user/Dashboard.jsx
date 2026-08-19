import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../api/bookings.js';
import useAuth from '../../hooks/useAuth.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { BOOKING_STATUS_STYLES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    getMyBookings()
      .then((res) => { setBookings(res.data.bookings); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  if (status === 'loading') return <PageLoader />;
  if (status === 'error') return <ErrorState onRetry={load} />;

  const upcoming = bookings.filter((b) => ['pending', 'confirmed'].includes(b.bookingStatus));
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold">{user?.name}</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Total bookings</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-navy-900">{bookings.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Upcoming trips</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-navy-900">{upcoming.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">Total paid</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-navy-900">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-navy-900">Recent bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm font-semibold text-coral-600 hover:text-coral-700">
            View all →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Once you book a trip, it'll show up here with live status updates."
            action={<Link to="/search" className="btn-primary">Browse trips</Link>}
          />
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <Link key={b._id} to={`/dashboard/bookings/${b._id}`} className="card card-hover flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-900">{b.travel?.title || 'Trip'}</p>
                  <p className="text-xs text-navy-400">{b.bookingReference} · {formatDate(b.createdAt)}</p>
                </div>
                <Badge className={BOOKING_STATUS_STYLES[b.bookingStatus]}>{b.bookingStatus}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
