import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import useAuth from '../hooks/useAuth.js';
import useToast from '../hooks/useToast.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import RouteLine from '../components/ui/RouteLine.jsx';

export default function Login() {
  useDocumentTitle('Log in');

  const { login, googleLogin } = useAuth();

  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const redirectTo =
    location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login(form);

      toast.success('Welcome back!');

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google authentication failed.');
      return;
    }

    setError('');
    setGoogleSubmitting(true);

    try {
      await googleLogin(credentialResponse.credential);

      toast.success('Welcome! You are logged in with Google.');

      navigate(redirectTo, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message ||
          'Google login failed. Please try again.'
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleSubmitting(false);
    setError(
      'Google login was unsuccessful. Please try again.'
    );
  };

  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-md animate-fadeUp">

        <div className="mb-6 text-center">
          <RouteLine className="mx-auto h-8 w-32 text-coral-400" />

          <h1 className="mt-2 text-2xl font-semibold text-navy-900">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-navy-500">
            Log in to manage your bookings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card space-y-4 p-6"
        >
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-coral-50 px-3 py-2 text-sm font-medium text-coral-700"
            >
              {error}
            </p>
          )}

          <div>
            <label
              className="label"
              htmlFor="email"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label
              className="label"
              htmlFor="password"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            disabled={submitting || googleSubmitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-100" />
            </div>

            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-sm text-navy-400">
                OR
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>

          {googleSubmitting && (
            <p className="text-center text-sm text-navy-500">
              Signing in with Google…
            </p>
          )}

          <p className="text-center text-xs text-navy-400">
            By continuing with Google, you agree to use your
            Google account to authenticate securely.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-navy-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-coral-600 hover:text-coral-700"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}