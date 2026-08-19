import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { initials } from '../../utils/format.js';

const publicLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
          isActive ? 'text-coral-600' : 'text-navy-600 hover:text-navy-900'
        } after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-coral-500 after:transition-all after:duration-200 ${
          isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled ? 'border-navy-100 bg-white/90 backdrop-blur-md shadow-sm' : 'border-transparent bg-white/70 backdrop-blur-sm'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-navy-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-coral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 20 C 9 10, 15 10, 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="0.5 4" />
              <circle cx="4" cy="20" r="2" fill="currentColor" />
              <circle cx="20" cy="4" r="2" fill="currentColor" />
            </svg>
          </span>
          DF Travel System
        </NavLink>

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
          {isAuthenticated && <NavItem to="/dashboard" label="Dashboard" />}
          {isAdmin && <NavItem to="/admin" label="Admin" />}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white transition-transform hover:scale-105"
                title={user?.name}
              >
                {initials(user?.name || 'U')}
              </NavLink>
              <button onClick={handleLogout} className="btn-outline !px-4 !py-2 text-sm">
                Log out
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="btn-ghost text-sm">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn-primary text-sm">
                Sign up
              </NavLink>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-navy-700 transition-colors hover:bg-navy-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-navy-100 bg-white transition-[max-height] duration-300 ease-out md:hidden ${
          open ? 'max-h-[26rem]' : 'max-h-0'
        }`}
      >
        <div className="container-page flex flex-col gap-1 py-3">
          {publicLinks.map((l) => (
            <NavItem key={l.to} {...l} onClick={() => setOpen(false)} />
          ))}
          {isAuthenticated && <NavItem to="/dashboard" label="Dashboard" onClick={() => setOpen(false)} />}
          {isAdmin && <NavItem to="/admin" label="Admin" onClick={() => setOpen(false)} />}
          <div className="mt-2 flex flex-col gap-2 border-t border-navy-100 pt-3">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="btn-outline w-full">
                  Profile
                </NavLink>
                <button onClick={handleLogout} className="btn-secondary w-full">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                  Log in
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
