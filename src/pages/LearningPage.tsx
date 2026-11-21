import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { LearningCard } from '../components/ResourceCards';
import { EmptyState, LoadingGrid } from '../components/StateFeedback';
import { publicLearningHighlights } from '../data/fallbackCatalog';
import { fetchApiJsonWithFallback } from '../lib/api';
import type { LearningResource } from '../types';

const categories = [
  'All',
  'Python',
  'Java',
  'Web Development',
  'Artificial Intelligence',
  'Machine Learning',
  'Cloud Computing',
  'AWS',
  'Cybersecurity',
  'IoT',
];

const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function LearningPage() {
  const [items, setItems] = useState<LearningResource[]>([]);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [freeFilter, setFreeFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchLearning() {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (difficulty !== 'All') params.set('difficulty', difficulty);
    if (freeFilter !== 'all') params.set('free', freeFilter);
    if (query.trim()) params.set('q', query.trim());

    const fallbackItems = publicLearningHighlights.filter((item) => {
      if (category !== 'All' && item.category !== category) return false;
      if (difficulty !== 'All' && item.difficulty !== difficulty) return false;
      if (freeFilter === 'free' && item.is_free !== 1) return false;
      if (freeFilter === 'paid' && item.is_free !== 0) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const { data } = await fetchApiJsonWithFallback<{ items: LearningResource[] }>(
      `/api/learning?${params.toString()}`,
      { items: fallbackItems }
    );
    setItems(data.items || fallbackItems);
    setLoading(false);
  }

  useEffect(() => {
    void fetchLearning();
  }, [category, difficulty, freeFilter]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Learning Hub"
        description="Free and open learning resources across Python, Java, Web Development, AI/ML, Cloud Computing, AWS, Cybersecurity, and IoT."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="site-container">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Learning Hub
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-2xl">
            Curated courses, documentation tracks, and hands-on tutorials organized by engineering discipline and skill level.
          </p>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void fetchLearning();
              }}
              className="lg:col-span-5 relative flex gap-2"
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
                  placeholder="Search courses or topics..."
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

            <div className="lg:col-span-7 flex flex-wrap items-center justify-start lg:justify-end gap-3">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                aria-label="Filter by difficulty"
                className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Levels' : d}
                  </option>
                ))}
              </select>

              <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { key: 'all', label: 'All' },
                    { key: 'free', label: 'Free' },
                    { key: 'paid', label: 'Paid / Audit' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFreeFilter(opt.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      freeFilter === opt.key
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="site-container py-12">
        {loading ? (
          <LoadingGrid count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No learning resources match those filters"
            description="Adjust your category, difficulty level, or search query to see available tracks."
            onReset={() => {
              setCategory('All');
              setDifficulty('All');
              setFreeFilter('all');
              setQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <LearningCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
