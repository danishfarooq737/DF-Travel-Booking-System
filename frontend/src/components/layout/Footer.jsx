import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-900 text-navy-200">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coral-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 20 C 9 10, 15 10, 20 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 4" />
              </svg>
            </span>
            DF Travel System
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-300">
            Search, book, and manage trips — flights, hotels, tours and cruises — from one clear dashboard.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><NavLink to="/search" className="hover:text-coral-400">Search trips</NavLink></li>
            <li><NavLink to="/about" className="hover:text-coral-400">About DF Travel System</NavLink></li>
            <li><NavLink to="/contact" className="hover:text-coral-400">Contact us</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><NavLink to="/login" className="hover:text-coral-400">Log in</NavLink></li>
            <li><NavLink to="/register" className="hover:text-coral-400">Create account</NavLink></li>
            <li><NavLink to="/dashboard" className="hover:text-coral-400">My bookings</NavLink></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-navy-400">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><NavLink to="/terms" className="hover:text-coral-400">Terms of service</NavLink></li>
            <li><NavLink to="/privacy" className="hover:text-coral-400">Privacy policy</NavLink></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800 py-5 text-center text-xs text-navy-400">
        © {new Date().getFullYear()} DF Travel System Travel Booking. All rights reserved.
      </div>
    </footer>
  );
}
