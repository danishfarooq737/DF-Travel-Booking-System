import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getTravelById } from '../api/travel.js';
import PageLoader from '../components/ui/PageLoader.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import useAuth from '../hooks/useAuth.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480"><rect width="800" height="480" fill="#eef3f7"/><path d="M0 340 C 200 260, 320 400, 520 300 S 800 220, 800 220 L800 480 L0 480 Z" fill="#d4e2ec"/></svg>`
  );

export default function TravelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [travel, setTravel] = useState(null);
  const [status, setStatus] = useState('loading');

  useDocumentTitle(travel?.title);

  useEffect(() => {
    setStatus('loading');
    getTravelById(id)
      .then((res) => { setTravel(res.data.travel); setStatus('success'); })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <PageLoader label="Loading trip details…" />;
  if (status === 'error' || !travel) {
    return (
      <div className="container-page py-16">
        <ErrorState message="We couldn't find that trip. It may have been removed." onRetry={() => navigate('/search')} />
      </div>
    );
  }

  const soldOut = travel.status === 'soldout' || travel.availableSeats === 0;
  const image = travel.images?.[0] || PLACEHOLDER;

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/book/${travel._id}` } } });
      return;
    }
    navigate(`/book/${travel._id}`);
  };

  return (
    <div className="container-page py-10">
      <nav className="mb-6 text-sm text-navy-400">
        <Link to="/search" className="hover:text-coral-600">Search</Link> / <span className="text-navy-600">{travel.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="animate-fadeUp">
          <div className="overflow-hidden rounded-2xl bg-navy-100">
            <img src={image} alt={travel.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER; }} className="h-72 w-full object-cover sm:h-96" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="badge bg-navy-100 text-navy-700 capitalize">{travel.travelType}</span>
            <span className="badge bg-navy-100 text-navy-700">{travel.destination}</span>
            {soldOut && <span className="badge bg-coral-100 text-coral-700">Sold out</span>}
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-navy-900">{travel.title}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-navy-100 bg-white p-5 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">Departs</dt>
              <dd className="mt-1 text-sm font-semibold text-navy-800">{formatDate(travel.departureDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">Returns</dt>
              <dd className="mt-1 text-sm font-semibold text-navy-800">{formatDate(travel.returnDate) || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">Duration</dt>
              <dd className="mt-1 text-sm font-semibold text-navy-800">{travel.durationDays} days</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-navy-400">From</dt>
              <dd className="mt-1 text-sm font-semibold text-navy-800">{travel.departureCity}</dd>
            </div>
          </dl>

          <div className="prose prose-navy mt-8 max-w-none">
            <h2 className="font-display text-xl font-semibold text-navy-900">About this trip</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-600">{travel.description}</p>
          </div>
        </div>

        <aside className="animate-fadeUp lg:sticky lg:top-24 lg:self-start" style={{ animationDelay: '0.1s' }}>
          <div className="card p-6">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-semibold text-navy-900">{formatCurrency(travel.price, travel.currency)}</span>
              <span className="text-sm text-navy-400">/ traveler</span>
            </div>
            <p className="mt-1 text-sm text-navy-500">
              {soldOut ? 'No seats currently available' : `${travel.availableSeats} of ${travel.totalSeats} seats available`}
            </p>

            <button onClick={handleBook} disabled={soldOut} className="btn-primary mt-5 w-full">
              {soldOut ? 'Sold out' : 'Book this trip'}
            </button>

            <ul className="mt-5 space-y-2 text-sm text-navy-500">
              <li className="flex items-center gap-2">
                <CheckIcon /> Instant booking confirmation
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon /> Secure payment via Stripe
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon /> Free cancellation before departure*
              </li>
            </ul>
            <p className="mt-3 text-xs text-navy-400">*Subject to the trip's cancellation policy.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-teal-500">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
