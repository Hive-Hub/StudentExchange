import { useEffect, useState } from 'react';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { CommunityEvent, Competition } from '../types';

export function WorkshopPage({
  onOpenJoinModal,
}: {
  onOpenJoinModal: (track?: string) => void;
}) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [workshopPrograms, setWorkshopPrograms] = useState<Competition[]>([]);
  const [filter, setFilter] = useState<'All' | 'AWS Builder Labs' | 'Hardware & Maker' | 'Open Tech'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadWorkshops() {
    setLoading(true);
    setError('');
    try {
      const [evRes, compRes] = await Promise.all([
        fetch('/api/community'),
        fetch('/api/competitions?type=Workshops'),
      ]);
      if (!evRes.ok || !compRes.ok) {
        throw new Error('Failed to load workshops.');
      }
      const evData = (await evRes.json()) as { events: CommunityEvent[] };
      const compData = (await compRes.json()) as { items: Competition[] };
      setEvents(evData.events);
      setWorkshopPrograms(compData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkshops();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'All') return true;
    if (filter === 'AWS Builder Labs') return ev.is_aws_initiative === 1;
    if (filter === 'Hardware & Maker') return ev.community_group.toLowerCase().includes('maker');
    return ev.is_aws_initiative === 0 && !ev.community_group.toLowerCase().includes('maker');
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Workshop"
        description="Hands-on technical workshops, soldering clinics, and student-led AWS cloud study jams."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-orange-600">Hands-On Practical Sessions</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight mt-2">
              Technical Workshops
            </h1>
            <p className="text-base text-slate-600 mt-2 max-w-2xl">
              Weekend build clinics, KiCad PCB labs, and student-led AWS cloud study jams open to all university builders without registration gates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenJoinModal('AWS Student Builder Community (Student-Led)')}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Host or Join a Workshop
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            {(['All', 'AWS Builder Labs', 'Hardware & Maker', 'Open Tech'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  filter === tab
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {error && <ErrorBanner message={error} onRetry={loadWorkshops} />}

        {loading ? (
          <LoadingGrid count={4} />
        ) : filteredEvents.length === 0 && workshopPrograms.length === 0 ? (
          <EmptyState
            title="No workshops match that filter"
            description="Switch back to All workshops to view upcoming sessions."
            onReset={() => setFilter('All')}
          />
        ) : (
          <>
            {filteredEvents.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-slate-900 mb-5">
                  Live & Upcoming Sessions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEvents.map((ev) => (
                    <article
                      key={ev.id}
                      className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                          <span
                            className={
                              ev.is_aws_initiative
                                ? 'text-orange-600 font-semibold'
                                : 'text-blue-700 font-semibold'
                            }
                          >
                            {ev.community_group}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.event_type}</span>
                          {ev.is_demo === 1 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400">Demo</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5">
                          {ev.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {ev.description}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1 text-slate-600">
                          <p className="flex items-center gap-1.5 font-mono tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            <span>{ev.event_date}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            <span>{ev.location}</span>
                          </p>
                        </div>
                        {ev.registration_url && (
                          <a
                            href={ev.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>Workshop Details</span>
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {filter === 'All' && workshopPrograms.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-slate-900 mb-5">
                  Featured Workshop Tracks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {workshopPrograms.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-blue-700">
                          {item.type} · {item.location}
                        </p>
                        <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{item.organizer}</p>
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-600 tabular-nums">
                          Deadline: {item.deadline}
                        </span>
                        <a
                          href={item.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <span>Register</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
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
