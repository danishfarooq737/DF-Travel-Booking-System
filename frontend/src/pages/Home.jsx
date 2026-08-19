import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchTravel } from '../api/travel.js';
import TravelCard from '../components/travel/TravelCard.jsx';
import TravelCardSkeleton from '../components/travel/TravelCardSkeleton.jsx';
import RouteLine from '../components/ui/RouteLine.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const HIGHLIGHTS = [
  {
    title: 'Real-time availability',
    body: 'Seats update the moment someone books — no overbooking, no surprises.',
  },
  {
    title: 'Secure payments',
    body: 'Every payment is verified server-side through Stripe before a trip is confirmed.',
  },
  {
    title: 'One place for every trip',
    body: 'Flights, hotels, tours, and cruises — booked, tracked, and managed in one dashboard.',
  },
];

export default function Home() {
  useDocumentTitle('Find your next trip');
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    searchTravel({ limit: 6, sort: '-createdAt' })
      .then((res) => { if (active) setFeatured(res.data.items); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(destination ? `/search?destination=${encodeURIComponent(destination)}` : '/search');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-16 top-10 h-72 w-72 animate-floatSlow rounded-full bg-coral-500/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-96 w-96 animate-floatSlow rounded-full bg-teal-500/10 blur-3xl" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="container-page relative py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fadeUp">
              <p className="eyebrow text-coral-400">Plan · Book · Go</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your whole trip,<br /> mapped out in one place.
              </h1>
              <p className="mt-5 max-w-md text-base text-navy-200">
                Compare flights, hotels, tours, and cruises, then book with confidence — every seat and price is
                confirmed in real time, and every payment is verified before your trip locks in.
              </p>

              <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-card-hover sm:flex-row">
                <input
                  className="input flex-1 !border-none !ring-0 focus:!ring-0"
                  placeholder="Where do you want to go?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <button type="submit" className="btn-primary sm:px-6">
                  Search trips
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-navy-400">
                <RouteLine className="h-10 w-40 text-coral-400" />
                <span className="text-xs">From booking to boarding pass</span>
              </div>
            </div>

            <div className="relative hidden animate-fadeUp lg:block" style={{ animationDelay: '0.15s' }}>
              <div className="animate-floatSlow rounded-3xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10">
                <div className="rounded-2xl bg-white p-5 shadow-card-hover">
                  <p className="eyebrow">Upcoming trip</p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-navy-900">Santorini Island Tour</h3>
                  <p className="mt-1 text-sm text-navy-500">Athens → Santorini · 6 days</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="badge bg-teal-500/10 text-teal-600">Confirmed</span>
                    <span className="font-mono text-lg font-semibold">$1,240</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-8 w-48 animate-floatSlow rounded-2xl bg-white p-4 shadow-card-hover" style={{ animationDelay: '2s' }}>
                <p className="text-xs font-semibold text-navy-400">Payment status</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-teal-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Verified &amp; paid
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => (
            <div key={h.title} className="card animate-fadeUp p-6" style={{ animationDelay: `${i * 0.08}s` }}>
              <h3 className="font-display text-lg font-semibold text-navy-900">{h.title}</h3>
              <p className="mt-2 text-sm text-navy-500">{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured trips */}
      <section className="container-page pb-20">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow">Fresh listings</p>
            <h2 className="mt-1 text-2xl font-semibold">Featured trips</h2>
          </div>
          <Link to="/search" className="hidden text-sm font-semibold text-coral-600 hover:text-coral-700 sm:block">
            View all trips →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <TravelCardSkeleton key={i} />)
            : featured.map((t) => <TravelCard key={t._id} travel={t} />)}
        </div>

        {!loading && featured.length === 0 && (
          <p className="mt-6 text-center text-sm text-navy-400">
            No trips are published yet — check back soon, or ask an admin to add listings.
          </p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/search" className="btn-outline">View all trips</Link>
        </div>
      </section>
    </div>
  );
}
