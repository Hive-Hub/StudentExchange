import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenJoinModal?: () => void;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Learning', to: '/learning' },
  { label: 'Exchange', to: '/explore' },
  { label: 'Bootcamp', to: '/bootcamp' },
  { label: 'Workshop', to: '/workshop' },
  { label: 'Community', to: '/community' },
  { label: 'About', to: '/about' },
];

export function Navbar({ onOpenJoinModal: _onOpenJoinModal }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 border-b ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-slate-200/80 shadow-sm'
          : 'bg-white border-[var(--border)]'
      }`}
    >
      <div className="site-container h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Simplified Brand Mark */}
        <Link
          to="/"
          aria-label="StudentExchange Home"
          className="inline-flex items-center gap-2.5 shrink-0 rounded-md py-1"
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
            <path d="M18 7.5L8 12.2L18 16.9L28 12.2L18 7.5Z" fill="#FFFFFF" />
            <path
              d="M26 13.4V18.2"
              stroke="#FB923C"
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
              stroke="#FB923C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[var(--navy)] whitespace-nowrap">
            Student<span className="text-[#C2410C]">Exchange</span>
          </span>
        </Link>

        {/* Zone 2: Primary Navigation with animated hover underlines */}
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
                `relative whitespace-nowrap shrink-0 py-1.5 transition-colors duration-150 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:origin-left after:transition-transform after:duration-200 ${
                  isActive
                    ? 'text-[var(--navy)] font-semibold after:scale-x-100 after:bg-[#1D4ED8]'
                    : 'text-slate-700 hover:text-[var(--navy)] after:scale-x-0 hover:after:scale-x-100 after:bg-[#3B82F6]'
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
            className="px-4 py-2 text-sm font-bold text-[#070B1A] bg-[var(--orange)] hover:bg-[#FDBA74] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0"
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
            className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-[#070B1A] bg-[var(--orange)] hover:bg-[#FDBA74] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Join Community
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2.5 text-slate-700 hover:text-[var(--navy)] rounded-lg border border-slate-200 cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <div className="site-container py-4">
            <nav
              aria-label="Mobile Navigation"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--navy)] text-white'
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
                className="px-4 py-2.5 text-sm font-bold text-[#070B1A] bg-[var(--orange)] hover:bg-[#FDBA74] rounded-lg transition-colors"
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
        </div>
      )}
    </header>
  );
}
