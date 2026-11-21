import { useEffect, useState } from 'react';
import { Cloud, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { MediaFrame } from '../components/MediaFrame';
import { ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { AWSLearningResource, CommunityEvent } from '../types';

export function AwsBuildersPage({
  onOpenJoinModal,
}: {
  onOpenJoinModal: (track?: string) => void;
}) {
  const [resources, setResources] = useState<AWSLearningResource[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAwsData() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/aws-builders');
      if (!res.ok) throw new Error('Failed to load AWS Student Builder resources.');
      const data = (await res.json()) as {
        resources: AWSLearningResource[];
        events: CommunityEvent[];
      };
      setResources(data.resources);
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch AWS Builder data.');
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
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

      <div id="aws-paths" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {error && <ErrorBanner message={error} onRetry={loadAwsData} />}

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
                        <span className="text-orange-600 font-semibold">{item.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.format}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.duration}</span>
                        {item.is_demo === 1 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400">Demo</span>
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
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <article
                key={ev.id}
                className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-orange-600">
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
        </section>
      </div>
    </div>
  );
}
