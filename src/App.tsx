import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JoinCommunityModal } from './components/JoinCommunityModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { LearningPage } from './pages/LearningPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CompetitionsPage } from './pages/CompetitionsPage';
import { CommunityPage } from './pages/CommunityPage';
import { AwsBuildersPage } from './pages/AwsBuildersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage, TermsPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { BootcampPage } from './pages/BootcampPage';
import { WorkshopPage } from './pages/WorkshopPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="font-mono text-sm font-semibold text-blue-700">404</p>
        <h1 className="font-display text-2xl font-bold text-slate-950">Page Not Found</h1>
        <p className="text-sm text-slate-600">
          The page you requested could not be found on StudentExchange.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinTrack, setJoinTrack] = useState<string | undefined>(undefined);

  function openJoin(track?: string) {
    setJoinTrack(track);
    setJoinOpen(true);
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <Navbar onOpenJoinModal={() => openJoin()} />

        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={<HomePage onOpenJoinModal={openJoin} />}
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route
              path="/bootcamp"
              element={<BootcampPage onOpenJoinModal={openJoin} />}
            />
            <Route
              path="/workshop"
              element={<WorkshopPage onOpenJoinModal={openJoin} />}
            />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route
              path="/community"
              element={<CommunityPage onOpenJoinModal={openJoin} />}
            />
            <Route
              path="/aws-builders"
              element={<AwsBuildersPage onOpenJoinModal={openJoin} />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />

        <JoinCommunityModal
          open={joinOpen}
          initialTrack={joinTrack}
          onClose={() => setJoinOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
