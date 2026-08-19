import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../../api/notifications.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { formatDateTime } from '../../utils/format.js';

const TYPE_STYLES = {
  booking_confirmation: 'bg-teal-500/10 text-teal-600',
  payment_success: 'bg-teal-500/10 text-teal-600',
  payment_failed: 'bg-coral-100 text-coral-700',
  payment_pending: 'bg-amber-100 text-amber-800',
  booking_cancelled: 'bg-navy-100 text-navy-600',
  general: 'bg-navy-100 text-navy-600',
};

export default function Notifications() {
  useDocumentTitle('Notifications');
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = () => {
    setStatus('loading');
    getNotifications()
      .then((res) => { setNotifications(res.data.notifications); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      // silently ignore — non-critical UI action
    }
  };

  if (status === 'loading') return <PageLoader />;
  if (status === 'error') return <ErrorState onRetry={load} />;

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Updates</p>
        <h1 className="mt-1 text-2xl font-semibold">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" description="Booking and payment updates will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start gap-3 p-4 transition-colors ${n.isRead ? '' : 'border-coral-200 bg-coral-50/40'}`}
            >
              <span className={`badge mt-0.5 flex-shrink-0 ${TYPE_STYLES[n.type] || TYPE_STYLES.general}`}>
                {n.type.replace(/_/g, ' ')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy-900">{n.subject}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-navy-500">{n.message}</p>
                <p className="mt-1 text-xs text-navy-400">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => handleRead(n._id)} className="flex-shrink-0 text-xs font-semibold text-coral-600 hover:text-coral-700">
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
