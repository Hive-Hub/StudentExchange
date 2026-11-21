import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="site-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" aria-label="StudentExchange Home" className="inline-block">
              <img
                src="/assets/aistudio/StudentExchange_Tech_Learning_Logo_ddc49316.png"
                alt="StudentExchange — Learn. Build. Exchange. Grow."
                referrerPolicy="no-referrer"
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              An open public platform helping students discover free technical courses, showcase engineering work, join hands-on bootcamps and workshops, and connect with peer-led technology communities.
            </p>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/learning" className="text-slate-400 hover:text-white transition-colors">
                  Learning
                </Link>
              </li>
              <li>
                <Link to="/bootcamp" className="text-slate-400 hover:text-white transition-colors">
                  Bootcamp
                </Link>
              </li>
              <li>
                <Link to="/workshop" className="text-slate-400 hover:text-white transition-colors">
                  Workshop
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-slate-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
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
                <Link to="/aws-builders" className="text-slate-400 hover:text-orange-400 transition-colors">
                  AWS Student Builder Community
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-slate-400 hover:text-white transition-colors">
                  Student Communities & Events
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About StudentExchange
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Content Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Social Column */}
          <div>
            <h3 className="font-display text-sm font-semibold text-white mb-4">Policies & Social</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <span>Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} StudentExchange. Open student technology platform.</p>
          <p>
            AWS Student Builder activities are independent student-led community initiatives.
          </p>
        </div>
      </div>
    </footer>
  );
}
