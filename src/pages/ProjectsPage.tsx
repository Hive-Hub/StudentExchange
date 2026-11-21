import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Search, X, CheckCircle2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { ProjectCard } from '../components/ResourceCards';
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { StudentProject } from '../types';

const projectCategories = ['All', 'AI/ML', 'IoT', 'Web Development', 'Mobile Apps', 'Cloud'];

export function ProjectsPage() {
  const [items, setItems] = useState<StudentProject[]>([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [submitOpen, setSubmitOpen] = useState(false);
  const [formState, setFormState] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    tech_stack: '',
    author_name: '',
    university: '',
    github_url: '',
    demo_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  async function fetchProjects() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load student projects.');
      const data = (await res.json()) as { items: StudentProject[] };
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch projects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProjects();
  }, [category]);

  async function handleSubmitProject(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setSubmitError(data.error || 'Could not submit project.');
      } else {
        setSubmitSuccess(
          data.message || 'Project submitted for review. Admins can approve it in /admin.'
        );
        setFormState({
          title: '',
          category: 'Web Development',
          description: '',
          tech_stack: '',
          author_name: '',
          university: '',
          github_url: '',
          demo_url: '',
        });
      }
    } catch {
      setSubmitError('Network error while submitting project.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Student Project Showcase"
        description="Explore student-built AI/ML, IoT, Web, Mobile, and Cloud projects with open-source repositories and live demos."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
                Student Project Showcase
              </h1>
              <p className="text-base text-slate-600 mt-2 max-w-2xl">
                Real engineering projects built by students across universities, complete with tech stacks, GitHub codebases, and live demos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess('');
                setSubmitError('');
                setSubmitOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Submit a Project</span>
            </button>
          </div>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void fetchProjects();
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
                  placeholder="Search by project, stack, or author..."
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

            <div className="inline-flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl">
              {projectCategories.map((cat) => (
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
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <ErrorBanner message={error} onRetry={fetchProjects} />}
        {loading ? (
          <LoadingGrid count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No approved projects match your filters"
            description="Try a different category or search keyword, or submit your own student build for review."
            onReset={() => {
              setCategory('All');
              setQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((project) => (
              <ProjectCard key={project.id} item={project} />
            ))}
          </div>
        )}
      </div>

      {/* Public Project Submission Modal */}
      {submitOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-project-title"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl my-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 id="submit-project-title" className="font-display text-lg font-bold text-slate-900">
                  Submit a Student Project
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Submissions enter the moderation queue and appear publicly once approved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmitOpen(false)}
                aria-label="Close modal"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm text-slate-700">{submitSuccess}</p>
                <button
                  type="button"
                  onClick={() => setSubmitOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitProject} className="mt-5 space-y-4">
                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.title}
                      onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      placeholder="Smart Energy Meter"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {projectCategories
                        .filter((c) => c !== 'All')
                        .map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Short Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    placeholder="What problem does it solve and how did you build it?"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Technology Stack *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.tech_stack}
                    onChange={(e) => setFormState({ ...formState, tech_stack: e.target.value })}
                    placeholder="React, Python, ESP32, AWS Lambda"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Author / Team *
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.author_name}
                      onChange={(e) => setFormState({ ...formState, author_name: e.target.value })}
                      placeholder="Priya Nair"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      University / Club
                    </label>
                    <input
                      type="text"
                      value={formState.university}
                      onChange={(e) => setFormState({ ...formState, university: e.target.value })}
                      placeholder="IIT Madras"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formState.github_url}
                      onChange={(e) => setFormState({ ...formState, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Live Demo URL
                    </label>
                    <input
                      type="url"
                      value={formState.demo_url}
                      onChange={(e) => setFormState({ ...formState, demo_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 disabled:opacity-60 rounded-lg cursor-pointer"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
