import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock, Layers } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { MediaFrame } from '../components/MediaFrame';
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { LearningResource } from '../types';

const trackFilters = ['All', 'Web Development', 'Cloud & AWS', 'AI & Machine Learning', 'Embedded & IoT'];

function mapTrack(category: string): string {
  if (category === 'AWS' || category === 'Cloud Computing') return 'Cloud & AWS';
  if (category === 'Artificial Intelligence' || category === 'Machine Learning') {
    return 'AI & Machine Learning';
  }
  if (category === 'IoT') return 'Embedded & IoT';
  return 'Web Development';
}

export function BootcampPage({
  onOpenJoinModal,
}: {
  onOpenJoinModal: (track?: string) => void;
}) {
  const [items, setItems] = useState<LearningResource[]>([]);
  const [track, setTrack] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadBootcamps() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/learning');
      if (!res.ok) throw new Error('Failed to load bootcamp tracks.');
      const data = (await res.json()) as { items: LearningResource[] };
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch bootcamps.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBootcamps();
  }, []);

  const filtered = items.filter((item) => track === 'All' || mapTrack(item.category) === track);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Bootcamp"
        description="Structured multi-week student bootcamps in full-stack web engineering, cloud & AWS, AI/ML, and embedded IoT."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-blue-700">Structured Cohort Tracks</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mt-2">
              Student Bootcamps
            </h1>
            <p className="text-base text-slate-600 mt-2 max-w-2xl">
              Multi-week, project-based learning cohorts designed to take students from core fundamentals to deployed full-stack, cloud, AI, and hardware prototypes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenJoinModal('General StudentExchange Community')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Join Next Cohort
          </button>
        </div>

        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 mt-6">
          <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            {trackFilters.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrack(t)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  track === t
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 py-12">
        {error && <ErrorBanner message={error} onRetry={loadBootcamps} />}
        {loading ? (
          <LoadingGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No bootcamp tracks match that filter"
            description="Select All tracks to view every available student cohort."
            onReset={() => setTrack('All')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors"
              >
                <MediaFrame src={item.image_url} alt={item.title} aspectClass="aspect-[4/3]" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                    <span className="text-blue-700 font-semibold">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className={item.is_free ? 'text-emerald-700 font-semibold' : 'text-slate-700'}>
                      {item.price_label}
                    </span>
                  </div>

                  <h2 className="font-display text-lg font-bold text-slate-900 mt-2.5 leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {item.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {item.provider}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenJoinModal(item.title)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Register Interest
                    </button>
                    <a
                      href={item.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      <span>Syllabus</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
