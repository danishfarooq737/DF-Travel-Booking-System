import { useState } from 'react';
import useAuth from '../../hooks/useAuth.js';
import useToast from '../../hooks/useToast.js';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { changePassword as apiChangePassword } from '../../api/auth.js';
import { initials } from '../../utils/format.js';

export default function Profile() {
  useDocumentTitle('Profile settings');
  const { user, refreshProfile } = useAuth();
  const toast = useToast();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setSavingProfile(true);
    try {
      await refreshProfile(profileForm);
      toast.success('Profile updated');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setSavingPw(true);
    try {
      await apiChangePassword(pwForm);
      toast.success('Password updated');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="mt-1 text-2xl font-semibold">Profile settings</h1>
      </div>

      <div className="card flex items-center gap-4 p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-900 text-lg font-semibold text-white">
          {initials(user?.name || 'U')}
        </span>
        <div>
          <p className="font-semibold text-navy-900">{user?.name}</p>
          <p className="text-sm text-navy-500">{user?.email}</p>
          <span className="badge mt-1 bg-navy-100 text-navy-700 capitalize">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">Personal information</h2>
        {profileError && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">{profileError}</p>}
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" required minLength={2} className="input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" className="input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Email (cannot be changed)</label>
          <input disabled className="input bg-navy-50 text-navy-400" value={user?.email || ''} />
        </div>
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-navy-900">Change password</h2>
        {pwError && <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">{pwError}</p>}
        <div>
          <label className="label" htmlFor="currentPassword">Current password</label>
          <input id="currentPassword" type="password" required autoComplete="current-password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          <p className="mt-1 text-xs text-navy-400">At least 8 characters, one uppercase letter, one number.</p>
        </div>
        <button type="submit" disabled={savingPw} className="btn-secondary">
          {savingPw ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
