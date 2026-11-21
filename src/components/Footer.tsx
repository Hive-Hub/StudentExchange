import { Link } from 'react-router-dom';
import { ExternalLink, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B1220] text-[#CBD5E1] border-t border-slate-800">
      <div className="site-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              to="/"
              aria-label="StudentExchange Home"
              className="inline-block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <svg
                width="248"
                height="52"
                viewBox="0 0 248 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="StudentExchange"
                className="h-13 w-auto block"
              >
                <rect width="248" height="52" rx="12" fill="#FFFFFF" />
                <rect x="8" y="8" width="36" height="36" rx="9" fill="#0F172A" />
                <path d="M26 15.5L16 20.2L26 24.9L36 20.2L26 15.5Z" fill="#FFFFFF" />
                <path
                  d="M34 21.4V26.2"
                  stroke="#F97316"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M20.5 29.2H30.5M30.5 29.2L27.8 26.6M30.5 29.2L27.8 31.8"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M31.5 34.8H21.5M21.5 34.8L24.2 32.2M21.5 34.8L24.2 37.4"
                  stroke="#F97316"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text
                  x="54"
                  y="33"
                  fill="#0F172A"
                  fontFamily="Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
                  fontSize="21"
                  fontWeight="800"
                  letterSpacing="-0.5"
                >
                  Student
                  <tspan fill="#EA580C">Exchange</tspan>
                </text>
              </svg>
            </Link>
            <p className="text-sm text-[#CBD5E1] leading-relaxed max-w-xs">
              An open public platform helping students discover free technical courses, showcase engineering work, join hands-on bootcamps and workshops, and connect with peer-led technology communities.
            </p>
            <a
              href="mailto:hello@studentexchange.community"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#CBD5E1] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Mail className="w-4 h-4 text-[#F97316] shrink-0" aria-hidden="true" />
              <span>hello@studentexchange.community</span>
            </a>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/learning" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Learning
                </Link>
              </li>
              <li>
                <Link to="/bootcamp" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Bootcamp
                </Link>
              </li>
              <li>
                <Link to="/workshop" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Workshop
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Exchange
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#CBD5E1] hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Community</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/aws-builders"
                  className="text-[#CBD5E1] hover:text-[#F97316] transition-colors"
                >
                  AWS Student Builder Community
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Student Communities &amp; Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-[#CBD5E1] hover:text-white transition-colors">
                  About StudentExchange
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Content Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Policies &amp; Social</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#CBD5E1] hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@studentexchange.community"
                  className="text-[#CBD5E1] hover:text-white transition-colors"
                >
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#CBD5E1] hover:text-white transition-colors"
                >
                  <span>GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#CBD5E1] hover:text-white transition-colors"
                >
                  <span>LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#CBD5E1] hover:text-white transition-colors"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#CBD5E1]">
          <p>© {new Date().getFullYear()} StudentExchange. Open student technology platform.</p>
          <p>
            Independent student-led community, not an official AWS site.
          </p>
        </div>
      </div>
    </footer>
  );
}
