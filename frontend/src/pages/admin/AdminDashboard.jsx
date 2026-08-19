import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetBookings, adminGetPayments, adminGetUsers } from '../../api/admin.js';
import { searchTravel } from '../../api/travel.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { formatCurrency } from '../../utils/format.js';

export default function AdminDashboard() {
  useDocumentTitle('Admin overview');
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    Promise.all([adminGetUsers(), adminGetBookings(), adminGetPayments(), searchTravel({ limit: 1 })])
      .then(([users, bookings, payments, travel]) => {
        const revenue = payments.data.payments
          .filter((p) => p.status === 'succeeded')
          .reduce((sum, p) => sum + p.amount, 0);
        setStats({
          users: users.data.users.length,
          bookings: bookings.data.bookings.length,
          pendingBookings: bookings.data.bookings.filter((b) => b.bookingStatus === 'pending').length,
          revenue,
          travelCount: travel.data.pagination.total,
        });
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  if (status === 'loading') return <PageLoader />;
  if (status === 'error') return <ErrorState onRetry={load} />;

  const cards = [
    { label: 'Total users', value: stats.users, to: '/admin/users' },
    { label: 'Total bookings', value: stats.bookings, to: '/admin/bookings' },
    { label: 'Pending bookings', value: stats.pendingBookings, to: '/admin/bookings' },
    { label: 'Confirmed revenue', value: formatCurrency(stats.revenue), to: '/admin/payments' },
    { label: 'Published listings', value: stats.travelCount, to: '/admin/travel' },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold">Overview</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card card-hover p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{c.label}</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-navy-900">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link to="/admin/travel/new" className="btn-primary">+ Add a new travel listing</Link>
      </div>
    </div>
  );
}
