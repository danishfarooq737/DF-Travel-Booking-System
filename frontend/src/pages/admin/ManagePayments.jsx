import { useEffect, useState } from 'react';
import { adminGetPayments } from '../../api/admin.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { PAYMENT_ADMIN_STATUS_STYLES } from '../../utils/constants.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';

export default function ManagePayments() {
  useDocumentTitle('Manage payments');
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    adminGetPayments()
      .then((res) => { setPayments(res.data.payments); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold">Payments</h1>
      </div>

      {status === 'loading' && <PageLoader />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && payments.length === 0 && <EmptyState title="No payments recorded yet" />}

      {status === 'success' && payments.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-navy-50/60">
                  <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-navy-700">
                    {p.stripePaymentIntentId || p._id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-navy-600">{p.booking?.bookingReference || '—'}</td>
                  <td className="px-4 py-3 capitalize text-navy-600">{p.provider}</td>
                  <td className="px-4 py-3 font-mono text-navy-800">{formatCurrency(p.amount, p.currency)}</td>
                  <td className="px-4 py-3">
                    <Badge className={PAYMENT_ADMIN_STATUS_STYLES[p.status] || 'bg-navy-100 text-navy-600'}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-navy-600">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
