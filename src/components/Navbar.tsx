import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal: () => void;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Learning', to: '/learning' },
  { label: 'Bootcamp', to: '/bootcamp' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Community', to: '/community' },
  { label: 'About', to: '/about' },
];

export function Navbar({ onOpenJoinModal }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Logo */}
        <Link
          to="/"
          aria-label="StudentExchange Home"
          className="relative inline-flex items-center h-9 w-[148px] sm:h-11 sm:w-[182px] overflow-hidden shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
        >
          <img
            src="/assets/aistudio/StudentExchange_Tech_Learning_Logo_ddc49316.png"
            alt="StudentExchange — Learn. Build. Exchange. Grow."
            referrerPolicy="no-referrer"
            className="w-[108%] max-w-none h-auto absolute left-1/2 top-1/2 -translate-x-[50.4%] -translate-y-[46.5%] invert hue-rotate-180 saturate-125 brightness-105 contrast-105"
          />
        </Link>

        {/* Zone 2: Single-line Primary Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'text-slate-900 border-blue-700 font-semibold'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Right Actions */}
        <div className="hidden xl:flex items-center gap-4 shrink-0">
          <a
            href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Join Community
          </a>
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex xl:hidden items-center gap-3 shrink-0">
          <a
            href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Join Community
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2.5 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4">
          <nav aria-label="Mobile Navigation" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
              className="px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            >
              Join Community
            </a>
            <Link
              to="/aws-builders"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              AWS Student Builders
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
