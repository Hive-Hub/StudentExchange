import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal?: () => void;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Learning', to: '/learning' },
  { label: 'Bootcamp', to: '/bootcamp' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Community', to: '/community' },
  { label: 'About', to: '/about' },
];

export function Navbar({ onOpenJoinModal: _onOpenJoinModal }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="site-container h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Simplified Brand Mark (Icon + Wordmark, no tagline) */}
        <Link
          to="/"
          aria-label="StudentExchange Home"
          className="inline-flex items-center gap-2.5 shrink-0 rounded-md py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="36" height="36" rx="9" fill="#0F172A" />
            <path
              d="M18 7.5L8 12.2L18 16.9L28 12.2L18 7.5Z"
              fill="#FFFFFF"
            />
            <path
              d="M26 13.4V18.2"
              stroke="#F97316"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M12.5 21.2H22.5M22.5 21.2L19.8 18.6M22.5 21.2L19.8 23.8"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23.5 26.8H13.5M13.5 26.8L16.2 24.2M13.5 26.8L16.2 29.4"
              stroke="#F97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 whitespace-nowrap">
            Student<span className="text-orange-600">Exchange</span>
          </span>
        </Link>

        {/* Zone 2: Primary Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium text-slate-700"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'text-slate-950 border-blue-700 font-semibold'
                    : 'text-slate-700 border-transparent hover:text-slate-950 hover:border-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Right Actions */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          <a
            href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Join Community
          </a>
        </div>

        {/* Mobile / Tablet Menu Trigger */}
        <div className="flex lg:hidden items-center gap-2.5 shrink-0">
          <a
            href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Join Community
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2.5 text-slate-700 hover:text-slate-950 rounded-lg border border-slate-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="site-container py-4">
          <nav aria-label="Mobile Navigation" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <a
              href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Join Community
            </a>
            <Link
              to="/aws-builders"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              AWS Student Builders
            </Link>
          </div>
          </div>
        </div>
      )}
    </header>
  );
}
