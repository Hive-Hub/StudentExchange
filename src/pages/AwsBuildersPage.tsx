import { useEffect, useState } from 'react';
import { Cloud, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { MediaFrame } from '../components/MediaFrame';
import { EmptyState, LoadingGrid } from '../components/StateFeedback';
import { fetchApiJsonWithFallback } from '../lib/api';
import { publicEventsCatalog } from '../data/fallbackCatalog';
import type { AWSLearningResource, CommunityEvent } from '../types';

const fallbackAwsResources: AWSLearningResource[] = [
  {
    id: 1,
    title: 'Serverless REST APIs with Lambda & API Gateway',
    level: 'Foundational',
    service_focus: 'AWS Lambda · API Gateway · IAM',
    duration: '3 Hours Lab',
    format: 'Hands-On Workshop',
    description:
      'Build and deploy a student study-group API using serverless functions, least-privilege IAM policies, and structured logging.',
    resource_url: 'https://explore.skillbuilder.aws/',
    is_student_led: 1,
    is_demo: 0,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Static Web Hosting, CloudFront & Custom CI/CD Pipelines',
    level: 'Builder Lab',
    service_focus: 'Amazon S3 · CloudFront · GitHub Actions',
    duration: '2.5 Hours Lab',
    format: 'Guided Study Jam',
    description:
      'Deploy fast Vite + React student portfolios globally with automated build previews, caching headers, and HTTPS.',
    resource_url: 'https://aws.amazon.com/getting-started/',
    is_student_led: 1,
    is_demo: 0,
    created_at: '2026-11-01T00:00:00Z',
  },
];

export function AwsBuildersPage({
  onOpenJoinModal,
}: {
  onOpenJoinModal: (track?: string) => void;
}) {
  const [resources, setResources] = useState<AWSLearningResource[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAwsData() {
    setLoading(true);
    const awsFallbackEvents = publicEventsCatalog.filter((ev) => ev.is_aws_initiative === 1);
    const { data } = await fetchApiJsonWithFallback<{
      resources: AWSLearningResource[];
      events: CommunityEvent[];
    }>('/api/aws-builders', {
      resources: fallbackAwsResources,
      events: awsFallbackEvents,
    });
    setResources(data.resources);
    setEvents(data.events);
    setLoading(false);
  }

  useEffect(() => {
    void loadAwsData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="AWS Student Builder Community"
        description="Student-led AWS cloud learning paths, hands-on workshops, serverless projects, and study jams."
      />

      {/* Navy & Orange Hero */}
      <section className="bg-slate-950 text-white py-14 lg:py-20 border-b border-slate-800">
        <div className="site-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400">
              <Cloud className="w-4 h-4" aria-hidden="true" />
              <span>Independent Student-Led Community Initiative</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3 leading-tight">
              Build Your Future with the AWS Student Builder Community.
            </h1>
            <p className="text-base text-slate-300 mt-4 leading-relaxed">
              Explore cloud technologies, learn AWS services, collaborate on projects and connect with fellow student builders. All study jams, guides, and workshops listed here are student-led community initiatives and are not formally endorsed by Amazon Web Services unless explicitly noted.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onOpenJoinModal('AWS Student Builder Community (Student-Led)')}
                className="px-5 py-3 text-sm font-semibold text-slate-950 bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors cursor-pointer"
              >
                Join Student Community
              </button>
              <a
                href="#aws-paths"
                className="px-5 py-3 text-sm font-semibold text-white border border-slate-700 hover:border-orange-400 rounded-lg transition-colors"
              >
                Browse Learning Paths
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex">
            <MediaFrame
              src="/src/assets/images/aws_cloud_builders_1795281329492.jpg"
              alt="Students presenting cloud architecture in an auditorium"
              aspectClass="aspect-[16/9] lg:aspect-auto"
              className="w-full h-full rounded-2xl border border-slate-800"
            />
          </div>
        </div>
      </section>

      <div id="aws-paths" className="site-container py-14 space-y-14">

        <section>
          <h2 className="font-display text-2xl font-bold text-slate-950">
            AWS Learning Paths & Hands-On Labs
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Structured student-led cloud guides covering IAM, serverless APIs, IoT telemetry, and containers.
          </p>

          <div className="mt-6">
            {loading ? (
              <LoadingGrid count={4} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                        <span className="text-[#C2410C] font-semibold">{item.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.format}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.duration}</span>
                        {item.is_demo === 1 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#64748B]">Demo</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-lg font-bold text-slate-900 mt-2.5">
                        {item.title}
                      </h3>
                      <p className="font-mono text-xs text-slate-600 mt-1.5">{item.service_focus}</p>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500">
                        {item.is_student_led ? 'Student-Led Curriculum' : 'Community Guide'}
                      </span>
                      <a
                        href={item.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C2410C] hover:text-orange-800"
                      >
                        <span>Start Lab</span>
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-slate-950">
            Student-Led Technical Sessions & Workshops
          </h2>
          {events.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Cloud}
                title="No AWS Builder sessions scheduled yet"
                description="Check back soon for upcoming student-led study jams and workshops."
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => (
                <article
                  key={ev.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#C2410C]">
                      {ev.community_group} · {ev.event_type}
                    </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-2">{ev.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{ev.description}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    <p className="flex items-center gap-1.5 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{ev.event_date}</span>
                    </p>
                    <p className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{ev.location}</span>
                    </p>
                  </div>
                  {ev.registration_url && (
                    <a
                      href={ev.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      Join Session
                    </a>
                  )}
                </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
