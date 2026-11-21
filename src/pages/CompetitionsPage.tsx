import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { CompetitionCard } from '../components/ResourceCards';
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { Competition } from '../types';

const competitionTypes = [
  'All',
  'Hackathons',
  'AWS challenges',
  'Coding contests',
  'Student innovation programs',
  'Internships',
  'Workshops',
];

export function CompetitionsPage() {
  const [items, setItems] = useState<Competition[]>([]);
  const [selectedType, setSelectedType] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchCompetitions() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'All') params.set('type', selectedType);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/competitions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load competitions.');
      const data = (await res.json()) as { items: Competition[] };
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch competitions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchCompetitions();
  }, [selectedType]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Competitions & Opportunities"
        description="Discover student hackathons, AWS challenges, coding contests, innovation programs, internships, and technical workshops."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Competitions & Opportunities
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-2xl">
            Track upcoming hackathons, student-led cloud challenges, coding contests, internships, and technical workshops with clear deadlines and eligibility details.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void fetchCompetitions();
              }}
              className="flex gap-2 w-full max-w-md"
            >
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search hackathons, internships, organizers..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
              {competitionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedType === type
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 py-12">
        {error && <ErrorBanner message={error} onRetry={fetchCompetitions} />}
        {loading ? (
          <LoadingGrid count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No competitions match your filters"
            description="Reset the opportunity category or search keywords to browse all active listings."
            onReset={() => {
              setSelectedType('All');
              setQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((comp) => (
              <CompetitionCard key={comp.id} item={comp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
