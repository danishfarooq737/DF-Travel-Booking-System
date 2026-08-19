import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteTravel, searchTravel } from '../../api/travel.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import useToast from '../../hooks/useToast.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

export default function ManageTravel() {
  useDocumentTitle('Manage travel listings');
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setStatus('loading');
    searchTravel({ limit: 50, sort: '-createdAt' })
      .then((res) => { setItems(res.data.items); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTravel(pendingDelete._id);
      setItems((prev) => prev.filter((t) => t._id !== pendingDelete._id));
      toast.success('Listing deleted');
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Travel listings</h1>
        </div>
        <Link to="/admin/travel/new" className="btn-primary">+ New listing</Link>
      </div>

      {status === 'loading' && <PageLoader />}
      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'success' && items.length === 0 && (
        <EmptyState title="No listings yet" description="Create your first travel listing to start taking bookings." action={<Link to="/admin/travel/new" className="btn-primary">+ New listing</Link>} />
      )}

      {status === 'success' && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-navy-100 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Departs</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {items.map((t) => (
                <tr key={t._id} className="hover:bg-navy-50/60">
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-navy-800">{t.title}</td>
                  <td className="px-4 py-3 text-navy-600">{t.destination}</td>
                  <td className="px-4 py-3 text-navy-600">{formatDate(t.departureDate)}</td>
                  <td className="px-4 py-3 font-mono text-navy-800">{formatCurrency(t.price, t.currency)}</td>
                  <td className="px-4 py-3 text-navy-600">{t.availableSeats}/{t.totalSeats}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${t.status === 'active' ? 'bg-teal-500/10 text-teal-600' : t.status === 'soldout' ? 'bg-coral-100 text-coral-700' : 'bg-navy-100 text-navy-500'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/travel/${t._id}/edit`} className="text-xs font-semibold text-navy-600 hover:text-coral-600">Edit</Link>
                      <button onClick={() => setPendingDelete(t)} className="text-xs font-semibold text-coral-600 hover:text-coral-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this listing?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
