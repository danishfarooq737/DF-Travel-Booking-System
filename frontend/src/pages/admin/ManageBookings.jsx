import { useEffect, useState } from 'react';
import { adminGetBookings, adminUpdateBookingStatus } from '../../api/admin.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import useToast from '../../hooks/useToast.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { BOOKING_STATUSES, BOOKING_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export default function ManageBookings() {
  useDocumentTitle('Manage bookings');
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState('loading');
  const [updatingId, setUpdatingId] = useState(null);

  const load = () => {
    setStatus('loading');
    adminGetBookings()
      .then((res) => { setBookings(res.data.bookings); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await adminUpdateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.data.booking : b)));
      toast.success('Booking status updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold">Bookings</h1>
      </div>

      {status === 'loading' && <PageLoader />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && bookings.length === 0 && <EmptyState title="No bookings yet" />}

      {status === 'success' && bookings.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Trip</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Booked</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-navy-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-navy-700">{b.bookingReference}</td>
                  <td className="px-4 py-3 text-navy-700">{b.user?.name || '—'}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-navy-600">{b.travel?.title || '—'}</td>
                  <td className="px-4 py-3 font-mono text-navy-800">{formatCurrency(b.totalAmount, b.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge className={PAYMENT_STATUS_STYLES[b.paymentStatus]}>{b.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 text-navy-600">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`rounded-full border-none px-2.5 py-1 text-xs font-semibold ${BOOKING_STATUS_STYLES[b.bookingStatus]}`}
                      value={b.bookingStatus}
                      disabled={updatingId === b._id}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
