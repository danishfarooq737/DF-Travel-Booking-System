import { useEffect, useState } from 'react';
import { adminDeleteUser, adminGetUsers, adminUpdateUser } from '../../api/admin.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import useToast from '../../hooks/useToast.js';
import useAuth from '../../hooks/useAuth.js';
import PageLoader from '../../components/ui/PageLoader.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { initials } from '../../utils/format.js';

export default function ManageUsers() {
  useDocumentTitle('Manage users');
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setStatus('loading');
    adminGetUsers()
      .then((res) => { setUsers(res.data.users); setStatus('success'); })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleRoleChange = async (id, role) => {
    setBusyId(id);
    try {
      const res = await adminUpdateUser(id, { role });
      // The update endpoint returns a slimmed-down user shape (id, not _id) —
      // merge just the changed fields instead of replacing the row.
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role: res.data.user.role, isActive: res.data.user.isActive } : u)));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setBusyId(pendingDelete._id);
    try {
      await adminDeleteUser(pendingDelete._id);
      setUsers((prev) => prev.filter((u) => u._id !== pendingDelete._id));
      toast.success('User removed');
      setPendingDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold">Users</h1>
      </div>

      {status === 'loading' && <PageLoader />}
      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && users.length === 0 && <EmptyState title="No users found" />}

      {status === 'success' && users.length > 0 && (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">
                  {initials(u.name)}
                </span>
                <div>
                  <p className="font-medium text-navy-900">{u.name}</p>
                  <p className="text-xs text-navy-400">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="input !w-auto !py-1.5 text-sm"
                  value={u.role}
                  disabled={busyId === u._id || u._id === currentUser?.id}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={() => setPendingDelete(u)}
                  disabled={u._id === currentUser?.id}
                  className="text-xs font-semibold text-coral-600 hover:text-coral-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this user?"
        description={pendingDelete ? `"${pendingDelete.name}" and their account will be permanently removed.` : ''}
        confirmLabel="Delete user"
        loading={busyId === pendingDelete?._id}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
