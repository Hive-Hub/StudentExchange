import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import {
  CompetitionCard,
  LearningCard,
  ProjectCard,
} from '../components/ResourceCards';
import { EmptyState, LoadingGrid } from '../components/StateFeedback';
import {
  publicLearningHighlights,
  publicStudentProjects,
  publicWorkshopCompetitions,
} from '../data/fallbackCatalog';
import { fetchApiJsonWithFallback } from '../lib/api';
import type {
  Competition,
  LearningResource,
  StudentProject,
} from '../types';

export function ExplorePage() {
  const [query, setQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<
    'All' | 'Learning' | 'Projects' | 'Competitions'
  >('All');
  const [learning, setLearning] = useState<LearningResource[]>([]);
  const [projects, setProjects] = useState<StudentProject[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const [lResult, pResult, cResult] = await Promise.all([
      fetchApiJsonWithFallback<{ items: LearningResource[] }>('/api/learning', {
        items: publicLearningHighlights,
      }),
      fetchApiJsonWithFallback<{ items: StudentProject[] }>('/api/projects', {
        items: publicStudentProjects,
      }),
      fetchApiJsonWithFallback<{ items: Competition[] }>('/api/competitions', {
        items: publicWorkshopCompetitions,
      }),
    ]);

    setLearning(lResult.data.items);
    setProjects(pResult.data.items);
    setCompetitions(cResult.data.items);
    setLoading(false);
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const q = query.trim().toLowerCase();

  const matchedLearning = useMemo(
    () =>
      learning.filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      ),
    [learning, q]
  );

  const matchedProjects = useMemo(
    () =>
      projects.filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.tech_stack.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      ),
    [projects, q]
  );

  const matchedCompetitions = useMemo(
    () =>
      competitions.filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.organizer.toLowerCase().includes(q)
      ),
    [competitions, q]
  );

  const totalMatches =
    (sectionFilter === 'All' || sectionFilter === 'Learning' ? matchedLearning.length : 0) +
    (sectionFilter === 'All' || sectionFilter === 'Projects' ? matchedProjects.length : 0) +
    (sectionFilter === 'All' || sectionFilter === 'Competitions' ? matchedCompetitions.length : 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Explore Platform"
        description="Search across all StudentExchange learning resources, student projects, and competitions."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="site-container">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Explore StudentExchange
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-2xl">
            Search across courses, student-built open-source projects, and active competitions in one place.
          </p>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Python, React, AWS, AI, hackathons..."
                aria-label="Search platform resources"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="inline-flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['All', 'Learning', 'Projects', 'Competitions'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSectionFilter(tab)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      sectionFilter === tab
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="site-container py-12 space-y-14">
        {loading ? (
          <LoadingGrid count={6} />
        ) : totalMatches === 0 ? (
          <EmptyState
            title="No matching resources found"
            description="Try clearing your search term or switching back to all platform categories."
            onReset={() => {
              setQuery('');
              setSectionFilter('All');
            }}
          />
        ) : (
          <>
            {(sectionFilter === 'All' || sectionFilter === 'Learning') &&
              matchedLearning.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Learning Resources ({matchedLearning.length})
                    </h2>
                    <Link
                      to="/learning"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Open Learning Hub <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedLearning.slice(0, 3).map((item) => (
                      <LearningCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}

            {(sectionFilter === 'All' || sectionFilter === 'Projects') &&
              matchedProjects.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Student Projects ({matchedProjects.length})
                    </h2>
                    <Link
                      to="/projects"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      View Showcase <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedProjects.slice(0, 3).map((item) => (
                      <ProjectCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}

            {(sectionFilter === 'All' || sectionFilter === 'Competitions') &&
              matchedCompetitions.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Competitions & Opportunities ({matchedCompetitions.length})
                    </h2>
                    <Link
                      to="/competitions"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      All Opportunities <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedCompetitions.slice(0, 3).map((item) => (
                      <CompetitionCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}
          </>
        )}
      </div>
    </div>
  );
}
