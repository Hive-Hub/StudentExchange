import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, MapPin, ArrowRight } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { LoadingGrid } from '../components/StateFeedback';
import { publicEventsCatalog } from '../data/fallbackCatalog';
import { fetchApiJsonWithFallback } from '../lib/api';
import type { CommunityEvent } from '../types';

export function CommunityPage({
  onOpenJoinModal,
}: {
  onOpenJoinModal: (track?: string) => void;
}) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCommunity() {
    setLoading(true);
    const { data } = await fetchApiJsonWithFallback<{ events: CommunityEvent[] }>(
      '/api/community',
      { events: publicEventsCatalog }
    );
    setEvents(data.events?.length ? data.events : publicEventsCatalog);
    setLoading(false);
  }

  useEffect(() => {
    void loadCommunity();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Student Communities"
        description="Connect with campus maker collectives, open-source study circles, and student-led AWS builder groups."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="site-container flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
              Student Communities & Events
            </h1>
            <p className="text-base text-slate-600 mt-2 max-w-2xl">
              Join peer-led workshops, technical bootcamps, demo days, and study jams across partner student groups.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/aws-builders"
              className="px-4 py-2.5 text-sm font-semibold text-slate-900 border border-slate-300 hover:border-slate-900 rounded-lg transition-colors"
            >
              AWS Student Builders
            </Link>
            <button
              type="button"
              onClick={() => onOpenJoinModal()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer"
            >
              Join Community
            </button>
          </div>
        </div>
      </section>

      <div className="site-container py-12 space-y-14">
        {/* Student Circles */}
        <section>
          <h2 className="font-display text-2xl font-bold text-slate-950">Active Student Circles</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#C2410C]">Student-Led Cloud Group</p>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                  AWS Student Builder Community
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Peer-organized cloud study sessions, architecture labs, and serverless starter projects designed for university students.
                </p>
              </div>
              <Link
                to="/aws-builders"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#C2410C] hover:text-orange-800"
              >
                Explore Activities <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700">Practical Build Labs</p>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                  Hands-On Technical Workshops
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Weekend build clinics, cloud architecture labs, and guided developer study jams hosted by student organizers.
                </p>
              </div>
              <Link
                to="/workshop"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Explore Workshops <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700">Software & AI/ML</p>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                  Open Source Builders Guild
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Weekly code reviews, demo days, and collaborative open-source sprints across web, mobile, and applied machine learning.
                </p>
              </div>
              <Link
                to="/projects"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Explore Projects <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <h2 className="font-display text-2xl font-bold text-slate-950">Upcoming Community Events</h2>
          <p className="text-sm text-slate-600 mt-1">
            Open sessions hosted by student communities. Demonstration schedule entries are labeled accordingly.
          </p>

          <div className="mt-6">
            {loading ? (
              <LoadingGrid count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((ev) => (
                  <article
                    key={ev.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                        <span
                          className={
                            ev.is_aws_initiative ? 'text-[#C2410C] font-semibold' : 'text-blue-700 font-semibold'
                          }
                        >
                          {ev.community_group}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ev.event_type}</span>
                        {ev.is_demo === 1 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#64748B]">Demo Event</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ev.description}</p>
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
                          <span>Event Details</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
