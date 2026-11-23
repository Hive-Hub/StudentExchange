import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Cloud,
  ExternalLink,
  FolderGit2,
  MapPin,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { EmptyState, LoadingGrid } from '../components/StateFeedback';
import {
  publicEventsCatalog,
  publicLearningHighlights,
  publicPlatformStats,
  publicWorkshopCompetitions,
} from '../data/fallbackCatalog';
import { fetchApiJsonWithFallback } from '../lib/api';
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
  workshops?: Competition[];
}

interface HomePageProps {
  onOpenJoinModal: (track?: string) => void;
}

const statMetaMap: Record<
  string,
  {
    to: string;
    icon: typeof BookOpen;
    iconBg: string;
    iconColor: string;
    hoverBorder: string;
    fallbackNote: string;
  }
> = {
  learning_resources: {
    to: '/learning',
    icon: BookOpen,
    iconBg: 'bg-[var(--color-tint-blue)] border-blue-200',
    iconColor: 'text-[var(--color-blue)]',
    hoverBorder: 'hover:border-[var(--color-blue)]',
    fallbackNote: 'Free courses & open tracks',
  },
  student_projects: {
    to: '/projects',
    icon: FolderGit2,
    iconBg: 'bg-[var(--color-tint-violet)] border-violet-200',
    iconColor: 'text-[var(--color-violet)]',
    hoverBorder: 'hover:border-[var(--color-violet)]',
    fallbackNote: 'Open-source student builds',
  },
  community_events: {
    to: '/community',
    icon: CalendarDays,
    iconBg: 'bg-[var(--color-tint-teal)] border-teal-200',
    iconColor: 'text-[var(--color-teal-text)]',
    hoverBorder: 'hover:border-[var(--color-teal)]',
    fallbackNote: 'Workshops & live sessions',
  },
};

function sanitizeStatNote(note: string, statKey: string): string {
  const lower = note.toLowerCase();
  if (!note || lower.includes('demo') || lower.includes('editable')) {
    return statMetaMap[statKey]?.fallbackNote || 'Updated across StudentExchange';
  }
  return note;
}

const fallbackOverviewPayload: OverviewResponse = {
  stats: publicPlatformStats,
  learning: publicLearningHighlights,
  events: publicEventsCatalog,
  workshops: publicWorkshopCompetitions,
};

export function HomePage({ onOpenJoinModal }: HomePageProps) {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [workshops, setWorkshops] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventFilter, setSelectedEventFilter] = useState('All');

  async function loadOverview() {
    setLoading(true);
    const [overviewResult, workshopsResult] = await Promise.all([
      fetchApiJsonWithFallback<OverviewResponse>('/api/overview', fallbackOverviewPayload),
      fetchApiJsonWithFallback<{ items: Competition[] }>(
        '/api/competitions?type=Workshops',
        { items: publicWorkshopCompetitions }
      ),
    ]);

    const resolvedOverview: OverviewResponse = {
      stats: overviewResult.data?.stats?.length
        ? overviewResult.data.stats
        : publicPlatformStats,
      learning: overviewResult.data?.learning?.length
        ? overviewResult.data.learning
        : publicLearningHighlights,
      events: overviewResult.data?.events?.length
        ? overviewResult.data.events
        : publicEventsCatalog,
      workshops: overviewResult.data?.workshops?.length
        ? overviewResult.data.workshops
        : publicWorkshopCompetitions,
    };

    const resolvedWorkshops = workshopsResult.data?.items?.length
      ? workshopsResult.data.items
      : resolvedOverview.workshops || publicWorkshopCompetitions;

    setOverview(resolvedOverview);
    setWorkshops(resolvedWorkshops);
    setLoading(false);
  }

  useEffect(() => {
    void loadOverview();
  }, []);

  const statsList = (overview?.stats?.length ? overview.stats : publicPlatformStats).filter(
    (s) => s.stat_key !== 'hardware_listings'
  );
  const bootcampTracks = (overview?.learning || []).slice(0, 3);
  const allEvents = overview?.events || [];

  const filteredUpcomingEvents = allEvents
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
    });

  const pastEvents = allEvents.filter((ev) => ev.event_status === 'past');
  const workshopEvents = allEvents.slice(0, 4);

  return (
    <div>
      <SeoHead
        title="Learn. Build. Exchange. Grow."
        description="StudentExchange brings together free learning resources, structured bootcamps, hands-on workshops, and student-led technology communities."
      />

      {/* Section 1: Hero & Platform Statistics (White) */}
      <section className="bg-white border-b border-[var(--color-border)]">
        <div className="site-container py-12 lg:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-[var(--color-blue)] tracking-tight">
                Free for students · Open to all
              </p>
              <h1
                className="font-display font-extrabold text-[var(--color-navy)] tracking-tight mt-3 max-w-2xl leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Your Ideas Deserve a Place to Grow.
              </h1>
              <p className="text-base sm:text-lg text-[var(--color-text)] mt-5 leading-relaxed max-w-2xl">
                Discover free learning paths, join structured student bootcamps, attend hands-on workshops, and build with peer-led communities.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/learning"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[var(--color-navy)] hover:bg-[var(--color-blue)] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
                >
                  <span>Explore Learning</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/workshop"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[var(--color-navy)] bg-white border border-[var(--color-border)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange-text)] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-orange)]"
                >
                  <Wrench className="w-4 h-4 text-[var(--color-orange-text)]" aria-hidden="true" />
                  <span>Explore Workshops</span>
                </Link>
              </div>

              <p className="mt-6 text-sm text-[var(--color-muted)]">
                Open public access · No mandatory sign-up required to browse courses, bootcamps, or workshops.
              </p>
            </div>

            <div className="lg:col-span-6 flex">
              <div className="w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                <img
                  src="/src/assets/images/hero_student_makers_1795281326782.jpg"
                  alt="Engineering students collaborating with laptops, microcontroller boards, robotics, and cloud diagrams"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover min-h-[260px] lg:min-h-[420px]"
                />
              </div>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
            {loading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
                aria-busy="true"
                aria-label="Loading platform statistics"
              >
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-16 bg-slate-200 rounded" />
                      <div className="h-9 w-9 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="h-4 w-32 bg-slate-200 rounded mt-3" />
                    <div className="h-3.5 w-40 bg-slate-100 rounded mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {statsList.map((stat) => {
                  const meta = statMetaMap[stat.stat_key] || {
                    to: '/explore',
                    icon: BookOpen,
                    iconBg: 'bg-[var(--color-tint-blue)] border-blue-200',
                    iconColor: 'text-[var(--color-blue)]',
                    hoverBorder: 'hover:border-[var(--color-blue)]',
                    fallbackNote: 'Explore resources',
                  };
                  const IconComponent = meta.icon;

                  return (
                    <Link
                      key={stat.stat_key}
                      to={meta.to}
                      className={`group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 hover:-translate-y-0.5 hover:shadow-md ${meta.hoverBorder} hover:bg-white transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-3xl font-bold text-[var(--color-navy)] tabular-nums">
                          {stat.value}
                        </p>
                        <span
                          className={`w-9 h-9 rounded-lg border inline-flex items-center justify-center shrink-0 ${meta.iconBg} ${meta.iconColor}`}
                          aria-hidden="true"
                        >
                          <IconComponent className="w-4 h-4" />
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-navy)] mt-2.5 flex items-center justify-between gap-2">
                        <span>{stat.label}</span>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-[var(--color-muted)] group-hover:text-[var(--color-navy)] group-hover:translate-x-0.5 transition-all"
                          aria-hidden="true"
                        />
                      </p>
                      <p className="text-sm text-[var(--color-text)] mt-1">
                        {sanitizeStatNote(stat.note, stat.stat_key)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Upcoming Events & Live Sessions (Soft BG - Teal coded for Events) */}
      <section className="py-16 lg:py-20 bg-[var(--color-bg-soft)] border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-teal-text)]">
                Community Events
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight mt-1.5">
                Upcoming Events &amp; Live Sessions
              </h2>
              <p className="text-base text-[var(--color-text)] mt-2">
                Join upcoming student-led workshops, cloud study jams, bootcamp demo days, and campus clinics.
              </p>
            </div>
            <Link
              to="/community"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-teal-text)] hover:text-[var(--color-navy)] whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-teal)]"
            >
              <span>All Community Events</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div
            className="mt-7 inline-flex flex-wrap gap-1.5 p-1.5 bg-white border border-[var(--color-border)] rounded-xl"
            role="tablist"
            aria-label="Filter upcoming events"
          >
            {(['All', 'AWS Builder', 'Workshops', 'Bootcamps & Demos'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={selectedEventFilter === tab}
                onClick={() => setSelectedEventFilter(tab)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)] ${
                  selectedEventFilter === tab
                    ? 'bg-[var(--color-navy)] text-white shadow-sm'
                    : 'text-[var(--color-text)] hover:text-[var(--color-navy)] hover:bg-[var(--color-bg-soft)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={3} />
            ) : filteredUpcomingEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming sessions match this filter"
                description="Switch back to all upcoming events or browse our full community calendar."
                actionLabel="Show All Events"
                onReset={() => setSelectedEventFilter('All')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUpcomingEvents.map((ev) => (
                  <article
                    key={ev.id}
                    className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white overflow-hidden hover:border-[var(--color-teal)] transition-colors"
                  >
                    <div className="relative overflow-hidden bg-slate-100 aspect-[4/3]">
                      <img
                        src={ev.image_url || '/src/assets/images/hero_student_makers_1795281326782.jpg'}
                        alt={`${ev.title} — ${ev.community_group}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--color-muted)]">
                        <span
                          className={
                            ev.is_aws_initiative
                              ? 'text-[var(--color-orange-text)] font-semibold'
                              : 'text-[var(--color-teal-text)] font-semibold'
                          }
                        >
                          {ev.community_group}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--color-text)]">{ev.event_type}</span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[var(--color-navy)] mt-2.5 leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text)] mt-2 leading-relaxed flex-1">
                        {ev.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-1.5 text-sm text-[var(--color-text)]">
                        <p className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-[var(--color-teal-text)] shrink-0" aria-hidden="true" />
                          <span>{ev.event_date}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" aria-hidden="true" />
                          <span className="truncate">{ev.location}</span>
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onOpenJoinModal(ev.title)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-navy)] hover:bg-[var(--color-teal-text)] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]"
                        >
                          RSVP / Join
                        </button>
                        {ev.registration_url && (
                          <a
                            href={ev.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] whitespace-nowrap rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
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

      {/* Section 3: Past Events & Session Recaps (White - Teal coded for Events) */}
      <section className="py-16 lg:py-20 bg-white border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-teal-text)]">
                Session Archives
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight mt-1.5">
                Past Events &amp; Session Recaps
              </h2>
              <p className="text-base text-[var(--color-text)] mt-2">
                Explore completed student-led bootcamps, build clinics, and weekend sprints with archived slides and starter code.
              </p>
            </div>
            <Link
              to="/learning"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-blue)]"
            >
              <span>Browse Learning Archives</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={3} />
            ) : pastEvents.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No archived past events yet"
                description="Explore active community sessions and learning guides while new recaps are published."
                actionLabel="Browse Learning Hub"
                actionTo="/learning"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pastEvents.map((ev) => (
                  <article
                    key={ev.id}
                    className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] overflow-hidden hover:border-[var(--color-teal)] transition-colors"
                  >
                    <div className="relative overflow-hidden bg-slate-100 aspect-[4/3]">
                      <img
                        src={ev.image_url || '/src/assets/images/learning_cloud_code_1795281329282.jpg'}
                        alt={`${ev.title} — session recap`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--color-text)]">
                        <span className="text-[var(--color-teal-text)] font-semibold">Past Event</span>
                        <span aria-hidden="true">·</span>
                        <span>{ev.community_group}</span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[var(--color-navy)] mt-2.5 leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text)] mt-2 leading-relaxed flex-1">
                        {ev.description}
                      </p>

                      {ev.highlight_note && (
                        <p className="mt-4 font-mono text-xs text-[var(--color-navy)] bg-white border border-[var(--color-border)] rounded-lg px-3 py-2">
                          {ev.highlight_note}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3 text-xs">
                        <span className="font-mono text-[var(--color-text)] tabular-nums">
                          {ev.event_date}
                        </span>
                        {ev.registration_url && (
                          <a
                            href={ev.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] whitespace-nowrap rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
                          >
                            <span>Recap &amp; Notes</span>
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

      {/* Section 4: Bootcamps, Tracks & Hosting (Soft BG - Learning=Blue, Projects=Violet, Exchange=Orange) */}
      <section className="py-16 lg:py-20 bg-[var(--color-bg-soft)] border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue)]">
                Learning &amp; Bootcamps
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight mt-1.5">
                Bootcamps, Tracks &amp; Hosting
              </h2>
              <p className="text-base text-[var(--color-text)] mt-2">
                Jump into a structured multi-week bootcamp, showcase student projects, or join peer-led exchange sessions.
              </p>
            </div>
            <Link
              to="/bootcamp"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-blue)]"
            >
              <span>All Bootcamp Tracks</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8">
              <LoadingGrid count={3} />
            </div>
          ) : bootcampTracks.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={BookOpen}
                title="No featured bootcamp tracks right now"
                description="Browse our complete learning directory for open Python, Web, Cloud, and AI cohorts."
                actionLabel="Explore Learning Hub"
                actionTo="/learning"
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {bootcampTracks.map((track) => (
                <article
                  key={track.id}
                  className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-6 hover:border-[var(--color-blue)] transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--color-muted)]">
                    <span className="text-[var(--color-blue)] font-semibold">{track.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--color-text)]">{track.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        track.is_free
                          ? 'text-[var(--color-teal-text)] font-semibold'
                          : 'text-[var(--color-navy)] font-semibold'
                      }
                    >
                      {track.price_label}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[var(--color-navy)] mt-2.5 leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text)] mt-2 leading-relaxed flex-1">
                    {track.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-3 text-sm text-[var(--color-text)]">
                    <span className="inline-flex items-center gap-1.5 text-xs tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-blue)]" aria-hidden="true" />
                      {track.duration}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenJoinModal(track.title)}
                      className="text-xs font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
                    >
                      Register Interest
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Color-coded navigation strip: Learning (Blue), Projects (Violet), Exchange (Orange) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/learning"
              className="rounded-xl border border-blue-200 bg-[var(--color-tint-blue)] p-6 hover:border-[var(--color-blue)] transition-colors flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
            >
              <div>
                <p className="text-xs font-semibold text-[var(--color-blue)]">
                  Learning · Self-Paced Curriculum
                </p>
                <p className="font-display text-base font-bold text-[var(--color-navy)] mt-1">
                  Browse Free Learning Tracks
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-[var(--color-blue)] shrink-0" aria-hidden="true" />
            </Link>

            <Link
              to="/projects"
              className="rounded-xl border border-violet-200 bg-[var(--color-tint-violet)] p-6 hover:border-[var(--color-violet)] transition-colors flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-violet)]"
            >
              <div>
                <p className="text-xs font-semibold text-[var(--color-violet)]">
                  Projects · Student Showcase
                </p>
                <p className="font-display text-base font-bold text-[var(--color-navy)] mt-1">
                  Explore Student Projects
                </p>
              </div>
              <FolderGit2 className="w-5 h-5 text-[var(--color-violet)] shrink-0" aria-hidden="true" />
            </Link>

            <Link
              to="/workshop"
              className="rounded-xl border border-orange-200 bg-[var(--color-tint-orange)] p-6 hover:border-[var(--color-orange)] transition-colors flex items-center justify-between gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-orange)]"
            >
              <div>
                <p className="text-xs font-semibold text-[var(--color-orange-text)]">
                  Exchange · Peer Workshops
                </p>
                <p className="font-display text-base font-bold text-[var(--color-navy)] mt-1">
                  Explore Practical Workshops
                </p>
              </div>
              <Wrench className="w-5 h-5 text-[var(--color-orange-text)] shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5: Exchange & Technical Workshops (White - Orange coded for Exchange) */}
      <section className="py-16 lg:py-20 bg-white border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-orange-text)]">
                Workshops &amp; Peer Exchange
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight mt-1.5">
                Upcoming Technical Workshops
              </h2>
              <p className="text-base text-[var(--color-text)] mt-2">
                Practical build sessions, peer code exchanges, cloud architecture labs, and student-led coding sprints.
              </p>
            </div>
            <Link
              to="/workshop"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-orange-text)] hover:text-[var(--color-navy)] whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-orange)]"
            >
              <span>View All Workshops</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={2} />
            ) : workshopEvents.length === 0 && workshops.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="No workshops scheduled yet"
                description="View our full workshop calendar or propose a peer-led session for your campus."
                actionLabel="Explore Workshops"
                actionTo="/workshop"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshopEvents.map((ev) => (
                  <article
                    key={ev.id}
                    className="rounded-xl border border-[var(--color-border)] bg-white p-6 flex flex-col justify-between hover:border-[var(--color-orange)] transition-colors"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--color-text)]">
                        <span
                          className={
                            ev.is_aws_initiative
                              ? 'text-[var(--color-orange-text)] font-semibold'
                              : 'text-[var(--color-teal-text)] font-semibold'
                          }
                        >
                          {ev.community_group}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{ev.event_type}</span>
                      </div>

                      <h3 className="font-display text-lg font-bold text-[var(--color-navy)] mt-2.5">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text)] mt-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 text-[var(--color-text)]">
                        <p className="flex items-center gap-1.5 font-mono tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-[var(--color-orange-text)]" aria-hidden="true" />
                          <span>{ev.event_date}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-[var(--color-muted)]" aria-hidden="true" />
                          <span>{ev.location}</span>
                        </p>
                      </div>
                      {ev.registration_url && (
                        <a
                          href={ev.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--color-navy)] hover:bg-[var(--color-blue)] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
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
                    className="rounded-xl border border-orange-200 bg-[var(--color-tint-orange)] p-6 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-orange-text)]">
                        {ws.type} · {ws.location}
                      </p>
                      <h3 className="font-display text-lg font-bold text-[var(--color-navy)] mt-2">
                        {ws.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text)] mt-2 leading-relaxed">
                        {ws.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-orange-200 flex items-center justify-between text-xs">
                      <span className="font-mono text-[var(--color-navy)] tabular-nums">
                        Deadline: {ws.deadline}
                      </span>
                      <a
                        href={ws.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[var(--color-blue)] hover:text-[var(--color-navy)] rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
                      >
                        <span>Register</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 6: AWS Student Builder Community (Soft BG, site palette, vertically centered image, below Exchange/Workshops) */}
      <section className="py-16 lg:py-20 bg-[var(--color-bg-soft)] border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-orange-text)]">
                <Cloud className="w-4 h-4 text-[var(--color-orange)]" aria-hidden="true" />
                <span>Student-Led Community Initiative</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--color-navy)] tracking-tight mt-3 leading-tight">
                Build Your Future with the AWS Student Builder Community.
              </h2>
              <p className="text-base text-[var(--color-text)] mt-4 leading-relaxed">
                Explore cloud technologies, learn AWS services, collaborate on workshops, and connect with fellow student builders through practical campus sessions and study jams.
              </p>

              <div className="mt-5 rounded-lg border border-orange-200 bg-[var(--color-tint-orange)] px-4 py-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[var(--color-orange-text)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs sm:text-sm font-medium text-[var(--color-navy)]">
                  Independent student-led community, not an official AWS site.
                </p>
              </div>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--color-navy)]">
                {[
                  'AWS cloud learning resources',
                  'Beginner-friendly workshops',
                  'Hands-on cloud bootcamps',
                  'Student-led technical sessions',
                  'Community activities',
                  'AWS-related learning paths',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[var(--color-orange-text)] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/aws-builders"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-[var(--color-navy)] bg-[var(--color-orange)] hover:bg-[#FB923C] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-navy)]"
                >
                  <span>Explore AWS Learning</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={() => onOpenJoinModal('AWS Student Builder Community (Student-Led)')}
                  className="px-5 py-3 text-sm font-semibold text-[var(--color-navy)] bg-white border border-[var(--color-border)] hover:border-[var(--color-navy)] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
                >
                  Join Student Community
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-full rounded-2xl overflow-hidden border border-[var(--color-border)] bg-white shadow-sm">
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

      {/* Section 7: How StudentExchange Works — Learn -> Build -> Exchange -> Grow (White) */}
      <section className="py-16 lg:py-20 bg-white border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-blue)]">
              Platform Flow
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight mt-1.5">
              How StudentExchange Works
            </h2>
            <p className="text-base text-[var(--color-text)] mt-2">
              Four clear steps from open learning to shipping projects, exchanging skills, and growing with campus communities.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 border-t-4 border-t-[var(--color-blue)]">
              <span className="inline-flex font-mono text-xs font-bold text-[var(--color-blue)] bg-[var(--color-tint-blue)] px-2.5 py-1 rounded-md">
                01. Learning
              </span>
              <h3 className="font-display text-xl font-bold text-[var(--color-navy)] mt-3">
                Learn
              </h3>
              <p className="text-sm text-[var(--color-text)] mt-2.5 leading-relaxed">
                Explore open learning tracks across Python, Java, Web, Cloud, AI, and Cybersecurity with zero registration walls.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 border-t-4 border-t-[var(--color-violet)]">
              <span className="inline-flex font-mono text-xs font-bold text-[var(--color-violet)] bg-[var(--color-tint-violet)] px-2.5 py-1 rounded-md">
                02. Projects
              </span>
              <h3 className="font-display text-xl font-bold text-[var(--color-navy)] mt-3">
                Build
              </h3>
              <p className="text-sm text-[var(--color-text)] mt-2.5 leading-relaxed">
                Join multi-week student bootcamps and ship real open-source engineering projects alongside peer mentors.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 border-t-4 border-t-[var(--color-orange)]">
              <span className="inline-flex font-mono text-xs font-bold text-[var(--color-orange-text)] bg-[var(--color-tint-orange)] px-2.5 py-1 rounded-md">
                03. Exchange
              </span>
              <h3 className="font-display text-xl font-bold text-[var(--color-navy)] mt-3">
                Exchange
              </h3>
              <p className="text-sm text-[var(--color-text)] mt-2.5 leading-relaxed">
                Share templates, trade feedback in peer workshops and code reviews, and exchange practical engineering insights.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 border-t-4 border-t-[var(--color-teal)]">
              <span className="inline-flex font-mono text-xs font-bold text-[var(--color-teal-text)] bg-[var(--color-tint-teal)] px-2.5 py-1 rounded-md">
                04. Events
              </span>
              <h3 className="font-display text-xl font-bold text-[var(--color-navy)] mt-3">
                Grow
              </h3>
              <p className="text-sm text-[var(--color-text)] mt-2.5 leading-relaxed">
                Attend campus events, hackathons, and student-led cloud circles to grow your network and engineering impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Final Community CTA (Navy #0F172A to #1E3A8A gradient band, white text, orange primary button) */}
      <section
        className="py-16 lg:py-20 text-white"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}
      >
        <div className="site-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Don&apos;t Just Learn Technology. Build Something With It.
            </h2>
            <p className="text-base text-[#E2E8F0] mt-4 max-w-2xl mx-auto leading-relaxed">
              Pick a structured bootcamp track, RSVP for an upcoming workshop, or join a student-led cloud circle this month.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://chat.whatsapp.com/HnDtAQNCmC4CyVCVv8kLnJ"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-sm font-bold text-[#0F172A] bg-[#F97316] hover:bg-[#FB923C] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Join Our Community
              </a>
              <Link
                to="/workshop"
                className="px-6 py-3 text-sm font-semibold text-white bg-white/10 border border-white/30 hover:bg-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore Workshops
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
