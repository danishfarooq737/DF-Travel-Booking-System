import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import RouteLine from '../components/ui/RouteLine.jsx';

const PASSWORD_RULES = [
  { test: (v) => v.length >= 8, label: 'At least 8 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /[0-9]/.test(v), label: 'One number' },
];

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(form.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passwordValid) {
      setError('Please meet all password requirements below.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created — welcome to DF Travel System!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md animate-fadeUp">
        <div className="mb-6 text-center">
          <RouteLine className="mx-auto h-8 w-32 text-coral-400" />
          <h1 className="mt-2 text-2xl font-semibold text-navy-900">Create your account</h1>
          <p className="mt-1 text-sm text-navy-500">Start booking trips in under a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700">
              {error}
            </p>
          )}

          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input
              id="name"
              required
              minLength={2}
              maxLength={100}
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((r) => {
                const met = r.test(form.password);
                return (
                  <li key={r.label} className={`flex items-center gap-1.5 text-xs ${met ? 'text-teal-600' : 'text-navy-400'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      {met ? (
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      )}
                    </svg>
                    {r.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-coral-600 hover:text-coral-700">Log in</Link>
        </p>
      </div>
    </div>
  );
}
