import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Cloud,
  ExternalLink,
  MapPin,
  Users,
  Wrench,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { MediaFrame } from '../components/MediaFrame';
import { ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type {
  CommunityEvent,
  Competition,
  LearningResource,
  PlatformStat,
} from '../types';

interface OverviewResponse {
  stats: PlatformStat[];
  learning: LearningResource[];
  events: CommunityEvent[];
}

interface HomePageProps {
  onOpenJoinModal: (track?: string) => void;
}

export function HomePage({ onOpenJoinModal }: HomePageProps) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [workshops, setWorkshops] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEventFilter, setSelectedEventFilter] = useState('All');

  async function loadOverview() {
    setLoading(true);
    setError('');
    try {
      const [ovRes, wsRes] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/competitions?type=Workshops'),
      ]);
      if (!ovRes.ok) throw new Error('Failed to load platform overview.');
      const data = (await ovRes.json()) as OverviewResponse;
      setOverview(data);
      if (wsRes.ok) {
        const wsData = (await wsRes.json()) as { items: Competition[] };
        setWorkshops(wsData.items);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  const bootcampTracks = (overview?.learning || []).slice(0, 3);
  const upcomingSessions = overview?.events || [];

  return (
    <div>
      <SeoHead
        title="Learn. Build. Exchange. Grow."
        description="StudentExchange brings together free learning resources, structured bootcamps, hands-on workshops, and student-led technology communities."
      />

      {/* Section 1: Hero */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-blue-700 tracking-tight">
                StudentExchange · Learn. Build. Exchange. Grow.
              </p>
              <h1
                className="font-display font-extrabold text-slate-950 tracking-tight mt-3 max-w-2xl leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Your Ideas Deserve a Place to Grow.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-5 leading-relaxed max-w-2xl">
                Discover free learning paths, join structured student bootcamps, attend hands-on technical workshops, and connect with peer-led engineering communities.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/learning"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Learning</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                Open public access · No mandatory sign-up required to browse courses, bootcamps, or workshops.
              </p>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src="/src/assets/images/hero_student_makers_1795281326782.jpg"
                  alt="Engineering students collaborating with laptops, microcontroller boards, robotics, and cloud diagrams"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover min-h-[280px] lg:min-h-[420px]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Platform Statistics */}
          <div className="mt-12 pt-10 border-t border-slate-200">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {(overview?.stats || [
                { id: 1, stat_key: 'learning_resources', label: 'Learning Resources', value: '140+', note: 'Editable demo count' },
                { id: 2, stat_key: 'student_projects', label: 'Student Projects', value: '85+', note: 'Editable demo count' },
                { id: 3, stat_key: 'hardware_listings', label: 'Hardware Listings', value: '64', note: 'Editable demo count' },
                { id: 4, stat_key: 'community_events', label: 'Community Events', value: '28', note: 'Editable demo count' },
              ]).map((stat) => (
                <div key={stat.stat_key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                  <p className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{stat.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 mt-8">
          <ErrorBanner message={error} onRetry={loadOverview} />
        </div>
      )}

      {/* Section 2: Upcoming Events Cards */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Upcoming Events & Live Sessions
              </h2>
              <p className="text-base text-slate-600 mt-2">
                Join upcoming student-led workshops, cloud study jams, bootcamp demo days, and campus clinics.
              </p>
            </div>
            <Link
              to="/community"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <span>All Community Events</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div
            className="mt-7 inline-flex flex-wrap gap-1.5 p-1.5 bg-slate-200/70 rounded-xl"
            role="tablist"
            aria-label="Filter upcoming events"
          >
            {(['All', 'AWS Builder', 'Workshops', 'Bootcamps & Demos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedEventFilter(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedEventFilter === tab
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSessions
                  .filter((ev) => ev.event_status !== 'past')
                  .filter((ev) => {
                    if (selectedEventFilter === 'All') return true;
                    if (selectedEventFilter === 'AWS Builder') return ev.is_aws_initiative === 1;
                    if (selectedEventFilter === 'Workshops') {
                      return (
                        ev.event_type.toLowerCase().includes('workshop') ||
                        ev.event_type.toLowerCase().includes('clinic')
                      );
                    }
                    if (selectedEventFilter === 'Bootcamps & Demos') {
                      return (
                        ev.event_type.toLowerCase().includes('demo') ||
                        ev.event_type.toLowerCase().includes('bootcamp')
                      );
                    }
                    return true;
                  })
                  .map((ev) => (
                    <article
                      key={ev.id}
                      className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-slate-300 transition-colors"
                    >
                      <MediaFrame
                        src={ev.image_url || '/src/assets/images/hero_student_makers_1795281326782.jpg'}
                        alt={ev.title}
                        aspectClass="aspect-[4/3]"
                      />
                      <div className="p-5 flex-1 flex flex-col">
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

                        <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5 leading-snug">
                          {ev.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                          {ev.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5 font-mono tabular-nums">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                            <span>{ev.event_date}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                            <span className="truncate">{ev.location}</span>
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => onOpenJoinModal(ev.title)}
                            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            RSVP / Join
                          </button>
                          {ev.registration_url && (
                            <a
                              href={ev.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
                            >
                              <span>Event Details</span>
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Past Events & Session Recaps */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Past Events & Session Recaps
              </h2>
              <p className="text-base text-slate-600 mt-2">
                Explore completed student-led bootcamps, robotics build clinics, and weekend sprints with archived slides and starter code.
              </p>
            </div>
            <Link
              to="/learning"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <span>Browse Learning Archives</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={3} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {upcomingSessions
                  .filter((ev) => ev.event_status === 'past')
                  .map((ev) => (
                    <article
                      key={ev.id}
                      className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden hover:border-slate-300 transition-colors"
                    >
                      <MediaFrame
                        src={ev.image_url || '/src/assets/images/learning_cloud_code_1795281329282.jpg'}
                        alt={ev.title}
                        aspectClass="aspect-[4/3]"
                      />
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                          <span className="text-slate-700 font-semibold">Past Event</span>
                          <span aria-hidden="true">·</span>
                          <span>{ev.community_group}</span>
                          {ev.is_demo === 1 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400">Demo</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5 leading-snug">
                          {ev.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                          {ev.description}
                        </p>

                        {ev.highlight_note && (
                          <p className="mt-4 font-mono text-xs text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                            {ev.highlight_note}
                          </p>
                        )}

                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
                          <span className="font-mono text-slate-500 tabular-nums">{ev.event_date}</span>
                          {ev.registration_url && (
                            <a
                              href={ev.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap"
                            >
                              <span>Recap & Notes</span>
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 4: Event Formats, Bootcamps & Hosting */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Bootcamps, Tracks & Hosting
              </h2>
              <p className="text-base text-slate-600 mt-2">
                Jump into a structured multi-week bootcamp, join a peer study circle, or propose a workshop for your campus.
              </p>
            </div>
            <Link
              to="/bootcamp"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              <span>All Bootcamp Tracks</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {bootcampTracks.map((track) => (
              <article
                key={track.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                  <span className="text-blue-700 font-semibold">{track.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{track.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className={track.is_free ? 'text-emerald-700 font-semibold' : 'text-slate-700'}>
                    {track.price_label}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5 leading-snug">
                  {track.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">
                  {track.description}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    {track.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenJoinModal(track.title)}
                    className="font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    Register Interest
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/learning"
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-blue-700 transition-colors flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold text-blue-700">Self-Paced Curriculum</p>
                <p className="font-display text-base font-bold text-slate-900 mt-1">
                  Browse Free Learning Tracks
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            </Link>

            <Link
              to="/workshop"
              className="rounded-xl border border-slate-200 bg-white p-6 hover:border-orange-600 transition-colors flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold text-orange-600">Hands-On Labs</p>
                <p className="font-display text-base font-bold text-slate-900 mt-1">
                  Explore Practical Workshops
                </p>
              </div>
              <Wrench className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => onOpenJoinModal('Host a Student Event or Workshop')}
              className="text-left rounded-xl border border-slate-200 bg-white p-6 hover:border-slate-900 transition-colors flex items-center justify-between gap-4 cursor-pointer"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">Campus Organizers</p>
                <p className="font-display text-base font-bold text-slate-900 mt-1">
                  Propose or Host an Event
                </p>
              </div>
              <Users className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 6: Hands-On Technical Workshops */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Upcoming Technical Workshops
              </h2>
              <p className="text-base text-slate-600 mt-2">
                Practical sessions, KiCad hardware clinics, and student-led cloud labs open to every campus builder.
              </p>
            </div>
            <Link
              to="/workshop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 whitespace-nowrap shrink-0"
            >
              <span>View All Workshops</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingSessions.slice(0, 4).map((ev) => (
              <article
                key={ev.id}
                className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-slate-300 transition-colors"
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
                      <span>Workshop Details</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            ))}

            {workshops.slice(0, 2).map((ws) => (
              <article
                key={`ws-${ws.id}`}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-blue-700">
                    {ws.type} · {ws.location}
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-2">{ws.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ws.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 tabular-nums">
                    Deadline: {ws.deadline}
                  </span>
                  <a
                    href={ws.registration_url}
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
        </div>
      </section>

      {/* Section 7: AWS Student Builder Community */}
      <section className="py-16 lg:py-20 bg-slate-950 text-white">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400">
                <Cloud className="w-4 h-4" aria-hidden="true" />
                <span>Student-Led Community Initiative</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight mt-3 leading-tight">
                Build Your Future with the AWS Student Builder Community.
              </h2>
              <p className="text-base text-slate-300 mt-4 leading-relaxed">
                Explore cloud technologies, learn AWS services, collaborate on workshops and connect with fellow student builders. Activities on StudentExchange are independent, student-led community initiatives focused on practical cloud literacy.
              </p>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-200">
                {[
                  'AWS cloud learning resources',
                  'Beginner-friendly workshops',
                  'Hands-on cloud bootcamps',
                  'Student-led technical sessions',
                  'Community activities',
                  'AWS-related learning paths',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/aws-builders"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-950 bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore AWS Learning</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenJoinModal('AWS Student Builder Community (Student-Led)')}
                  className="px-5 py-3 text-sm font-semibold text-white border border-slate-700 hover:border-orange-400 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Join Student Community
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src="/assets/aistudio/Screenshot_2026-10-31_080355_0512b844.png"
                  alt="Sekhar Thirupathi selected as an AWS Student Builder Group Leader at QIS College of Engineering and Technology — Building a stronger student community through cloud, AI, and innovation."
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: How StudentExchange Works */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              How StudentExchange Works
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Three direct steps to move from guided learning to building alongside a student cohort.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-7">
              <p className="font-mono text-sm font-semibold text-blue-700">01.</p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-2">Learn</h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                Explore open learning tracks across Python, Java, Web, Cloud, AI, and embedded hardware with zero registration walls.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-7">
              <p className="font-mono text-sm font-semibold text-orange-600">02.</p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-2">Practice</h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                Join multi-week student bootcamps and weekend technical workshops led by peer mentors and campus builders.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-7">
              <p className="font-mono text-sm font-semibold text-blue-700">03.</p>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-2">Grow Together</h3>
              <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                Connect with student chapters and the AWS Student Builder Community to ship real cloud and engineering work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Community CTA */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Don't Just Learn Technology. Build Something With It.
          </h2>
          <p className="text-base text-slate-600 mt-4 max-w-2xl mx-auto">
            Pick a structured bootcamp track, RSVP for an upcoming workshop, or join a student-led cloud circle this month.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Join Our Community
            </a>
            <Link
              to="/workshop"
              className="px-6 py-3 text-sm font-semibold text-slate-900 bg-white border border-slate-300 hover:border-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Explore Workshops
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
