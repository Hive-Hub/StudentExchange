import { useEffect, useState, type FormEvent } from 'react';
import { Check, Lock, LogOut, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import type {
  AWSLearningResource,
  CommunityEvent,
  Competition,
  ContactSubmission,
  HardwareListing,
  LearningResource,
  PlatformStat,
  StudentProject,
} from '../types';

interface DashboardData {
  stats: PlatformStat[];
  learning: LearningResource[];
  projects: StudentProject[];
  hardware: HardwareListing[];
  competitions: Competition[];
  events: CommunityEvent[];
  awsResources: AWSLearningResource[];
  submissions: ContactSubmission[];
}

type AdminTab =
  | 'stats'
  | 'projects'
  | 'learning'
  | 'hardware'
  | 'competitions'
  | 'community'
  | 'submissions';

export function AdminPage() {
  const [token, setToken] = useState('');
  const [authStatus, setAuthStatus] = useState<{ configured: boolean; envOverride: boolean } | null>(
    null
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>('stats');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Inline creation states
  const [statDrafts, setStatDrafts] = useState<Record<number, { value: string; note: string }>>({});
  const [newLearning, setNewLearning] = useState({
    title: '',
    category: 'Python',
    difficulty: 'Beginner',
    description: '',
    is_free: true,
    provider: 'StudentExchange',
    duration: '4 Weeks',
    resource_url: '',
  });
  const [newHardware, setNewHardware] = useState({
    title: '',
    category: 'Arduino boards',
    listing_type: 'Exchange',
    condition: 'Like New',
    price_label: 'Swap / Offer',
    location: '',
    seller_name: '',
    description: '',
    specs: '',
  });
  const [newComp, setNewComp] = useState({
    title: '',
    type: 'Hackathons',
    organizer: '',
    description: '',
    deadline: '',
    eligibility: 'University Students',
    registration_url: '',
    location: 'Online',
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    community_group: 'AWS Student Builder Group',
    event_type: 'Workshop',
    event_date: '',
    location: 'Online',
    description: '',
    registration_url: '',
    is_aws_initiative: true,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/admin/auth-status');
        if (res.ok) {
          const s = (await res.json()) as { configured: boolean; envOverride: boolean };
          setAuthStatus(s);
        }
      } catch {
        setAuthError('Unable to reach server.');
      }
    })();
  }, []);

  async function loadDashboard(bearer: string) {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${bearer}` },
      });
      if (res.status === 401) {
        setToken('');
        return;
      }
      if (res.ok) {
        const d = (await res.json()) as DashboardData;
        setData(d);
        const drafts: Record<number, { value: string; note: string }> = {};
        d.stats.forEach((st) => {
          drafts[st.id] = { value: st.value, note: st.note };
        });
        setStatDrafts(drafts);
      }
    } finally {
      setLoadingDash(false);
    }
  }

  async function handleSetup(e: FormEvent) {
    e.preventDefault();
    setAuthError('');
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !body.token) {
        setAuthError(body.error || 'Setup failed.');
      } else {
        setToken(body.token);
        setPassword('');
        setConfirmPassword('');
        setAuthStatus({ configured: true, envOverride: false });
        await loadDashboard(body.token);
      }
    } catch {
      setAuthError('Network error during setup.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !body.token) {
        setAuthError(body.error || 'Invalid credentials.');
      } else {
        setToken(body.token);
        setPassword('');
        await loadDashboard(body.token);
      }
    } catch {
      setAuthError('Network error during login.');
    } finally {
      setAuthLoading(false);
    }
  }

  async function adminFetch(url: string, init: RequestInit) {
    setActionMsg('');
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    if (res.ok) {
      await loadDashboard(token);
      setActionMsg('Saved changes to database.');
    }
  }

  if (!token) {
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <SeoHead
          title="Content Admin"
          description="Protected StudentExchange content management console."
        />

        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-2.5 text-slate-900">
            <Lock className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <h1 className="font-display text-xl font-bold">StudentExchange Content Admin</h1>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Public visitors never need an account. This protected console lets maintainers update platform statistics, approve student projects, and manage listings.
          </p>

          {authError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {authError}
            </div>
          )}

          {authStatus === null ? (
            <p className="mt-6 text-sm text-slate-500">Checking admin configuration...</p>
          ) : !authStatus.configured ? (
            <form onSubmit={handleSetup} className="mt-6 space-y-4">
              <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                First-run setup: claim an admin password (8+ characters) to lock this console, or configure <code className="font-mono">ADMIN_PASSCODE</code> in environment secrets.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Create Admin Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                {authLoading ? 'Claiming...' : 'Claim Admin Access'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                {authLoading ? 'Signing in...' : 'Sign In to Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <SeoHead
        title="Admin Console"
        description="Manage StudentExchange courses, project approvals, hardware listings, competitions, and events."
      />

      <div className="max-w-[1640px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Authenticated Admin Session</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-950 mt-1">
              Content Management Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {actionMsg && <span className="text-xs font-medium text-emerald-700">{actionMsg}</span>}
            <button
              type="button"
              onClick={() => {
                setToken('');
                setData(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-200/70 rounded-xl">
          {(
            [
              { id: 'stats', label: 'Platform Stats' },
              { id: 'projects', label: `Projects (${data?.projects.length ?? 0})` },
              { id: 'learning', label: `Learning (${data?.learning.length ?? 0})` },
              { id: 'hardware', label: `Hardware (${data?.hardware.length ?? 0})` },
              { id: 'competitions', label: `Competitions (${data?.competitions.length ?? 0})` },
              { id: 'community', label: `Events & AWS (${data?.events.length ?? 0})` },
              { id: 'submissions', label: `Inbox (${data?.submissions.length ?? 0})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loadingDash || !data ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-sm text-slate-500">
            Loading content records...
          </div>
        ) : (
          <>
            {/* Platform Stats */}
            {tab === 'stats' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Editable Platform Statistics
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Update the four homepage counters directly without changing frontend code.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {data.stats.map((st) => (
                    <div key={st.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-bold text-slate-900">{st.label}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={statDrafts[st.id]?.value ?? st.value}
                          onChange={(e) =>
                            setStatDrafts({
                              ...statDrafts,
                              [st.id]: {
                                value: e.target.value,
                                note: statDrafts[st.id]?.note ?? st.note,
                              },
                            })
                          }
                          className="px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={statDrafts[st.id]?.note ?? st.note}
                          onChange={(e) =>
                            setStatDrafts({
                              ...statDrafts,
                              [st.id]: {
                                value: statDrafts[st.id]?.value ?? st.value,
                                note: e.target.value,
                              },
                            })
                          }
                          className="px-3 py-2 text-xs border border-slate-300 rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void adminFetch(`/api/admin/stats/${st.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(statDrafts[st.id]),
                          })
                        }
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
                      >
                        Save Stat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Moderation */}
            {tab === 'projects' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Student Project Approvals & Showcase
                </h2>
                <div className="divide-y divide-slate-100">
                  {data.projects.map((p) => (
                    <div
                      key={p.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-xs text-slate-500">
                          <span className="font-semibold text-blue-700">{p.category}</span> ·{' '}
                          {p.author_name} · Status:{' '}
                          <span className="font-semibold text-slate-900">{p.status}</span>
                        </p>
                        <p className="font-display text-base font-bold text-slate-900 mt-0.5">
                          {p.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{p.tech_stack}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {p.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() =>
                              void adminFetch(`/api/admin/projects/${p.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: 'approved' }),
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() =>
                              void adminFetch(`/api/admin/projects/${p.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: 'rejected' }),
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            void adminFetch(`/api/admin/projects/${p.id}`, { method: 'DELETE' })
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          aria-label={`Delete ${p.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Resources */}
            {tab === 'learning' && (
              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void adminFetch('/api/admin/learning', {
                      method: 'POST',
                      body: JSON.stringify(newLearning),
                    });
                    setNewLearning({
                      title: '',
                      category: 'Python',
                      difficulty: 'Beginner',
                      description: '',
                      is_free: true,
                      provider: 'StudentExchange',
                      duration: '4 Weeks',
                      resource_url: '',
                    });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add Learning Resource
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Resource title"
                      value={newLearning.title}
                      onChange={(e) => setNewLearning({ ...newLearning, title: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newLearning.category}
                      onChange={(e) => setNewLearning({ ...newLearning, category: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {[
                        'Python',
                        'Java',
                        'Web Development',
                        'Artificial Intelligence',
                        'Machine Learning',
                        'Cloud Computing',
                        'AWS',
                        'Cybersecurity',
                        'IoT',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      required
                      placeholder="https://resource-url..."
                      value={newLearning.resource_url}
                      onChange={(e) =>
                        setNewLearning({ ...newLearning, resource_url: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Concise resource description"
                    value={newLearning.description}
                    onChange={(e) =>
                      setNewLearning({ ...newLearning, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Resource
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-slate-200 p-6 divide-y divide-slate-100">
                  {data.learning.map((l) => (
                    <div key={l.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {l.category} · {l.difficulty} · {l.price_label}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{l.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void adminFetch(`/api/admin/learning/${l.id}`, { method: 'DELETE' })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${l.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hardware Listings */}
            {tab === 'hardware' && (
              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void adminFetch('/api/admin/hardware', {
                      method: 'POST',
                      body: JSON.stringify(newHardware),
                    });
                    setNewHardware({
                      title: '',
                      category: 'Arduino boards',
                      listing_type: 'Exchange',
                      condition: 'Like New',
                      price_label: 'Swap / Offer',
                      location: '',
                      seller_name: '',
                      description: '',
                      specs: '',
                    });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add Hardware Listing
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Component name"
                      value={newHardware.title}
                      onChange={(e) => setNewHardware({ ...newHardware, title: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newHardware.listing_type}
                      onChange={(e) =>
                        setNewHardware({ ...newHardware, listing_type: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {['Buy', 'Sell', 'Exchange', 'Donate'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Price or exchange terms"
                      value={newHardware.price_label}
                      onChange={(e) =>
                        setNewHardware({ ...newHardware, price_label: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Location (e.g. Campus Lab)"
                      value={newHardware.location}
                      onChange={(e) => setNewHardware({ ...newHardware, location: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Seller name"
                      value={newHardware.seller_name}
                      onChange={(e) =>
                        setNewHardware({ ...newHardware, seller_name: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newHardware.category}
                      onChange={(e) =>
                        setNewHardware({ ...newHardware, category: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {[
                        'Arduino boards',
                        'ESP32 and ESP8266',
                        'Raspberry Pi',
                        'Sensors',
                        'Electronic modules',
                        'Development boards',
                        'Robotics components',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Component details and included accessories"
                    value={newHardware.description}
                    onChange={(e) =>
                      setNewHardware({ ...newHardware, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Hardware Listing
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-slate-200 p-6 divide-y divide-slate-100">
                  {data.hardware.map((h) => (
                    <div key={h.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {h.listing_type} · {h.category} · {h.price_label} · {h.location}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{h.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void adminFetch(`/api/admin/hardware/${h.id}`, { method: 'DELETE' })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${h.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitions */}
            {tab === 'competitions' && (
              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void adminFetch('/api/admin/competitions', {
                      method: 'POST',
                      body: JSON.stringify(newComp),
                    });
                    setNewComp({
                      title: '',
                      type: 'Hackathons',
                      organizer: '',
                      description: '',
                      deadline: '',
                      eligibility: 'University Students',
                      registration_url: '',
                      location: 'Online',
                    });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add Competition or Opportunity
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Title"
                      value={newComp.title}
                      onChange={(e) => setNewComp({ ...newComp, title: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <select
                      value={newComp.type}
                      onChange={(e) => setNewComp({ ...newComp, type: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {[
                        'Hackathons',
                        'AWS challenges',
                        'Coding contests',
                        'Student innovation programs',
                        'Internships',
                        'Workshops',
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Organizer"
                      value={newComp.organizer}
                      onChange={(e) => setNewComp({ ...newComp, organizer: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Deadline (e.g. 2026-12-20)"
                      value={newComp.deadline}
                      onChange={(e) => setNewComp({ ...newComp, deadline: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Eligibility"
                      value={newComp.eligibility}
                      onChange={(e) => setNewComp({ ...newComp, eligibility: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="url"
                      required
                      placeholder="https://registration-link..."
                      value={newComp.registration_url}
                      onChange={(e) =>
                        setNewComp({ ...newComp, registration_url: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Description"
                    value={newComp.description}
                    onChange={(e) => setNewComp({ ...newComp, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Competition
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-slate-200 p-6 divide-y divide-slate-100">
                  {data.competitions.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {c.type} · {c.organizer} · Deadline: {c.deadline}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{c.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void adminFetch(`/api/admin/competitions/${c.id}`, { method: 'DELETE' })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${c.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Events */}
            {tab === 'community' && (
              <div className="space-y-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void adminFetch('/api/admin/events', {
                      method: 'POST',
                      body: JSON.stringify(newEvent),
                    });
                    setNewEvent({
                      title: '',
                      community_group: 'AWS Student Builder Group',
                      event_type: 'Workshop',
                      event_date: '',
                      location: 'Online',
                      description: '',
                      registration_url: '',
                      is_aws_initiative: true,
                    });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add Community Event
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Community group"
                      value={newEvent.community_group}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, community_group: e.target.value })
                      }
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Date & time (e.g. 2026-12-18)"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      className="px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Event details"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-slate-200 p-6 divide-y divide-slate-100">
                  {data.events.map((ev) => (
                    <div key={ev.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          {ev.community_group} · {ev.event_date} · {ev.location}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{ev.title}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void adminFetch(`/api/admin/events/${ev.id}`, { method: 'DELETE' })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        aria-label={`Delete ${ev.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions Inbox */}
            {tab === 'submissions' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Contact, Hardware Inquiries & Community Joins
                </h2>
                {data.submissions.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6">No submissions recorded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.submissions.map((sub) => (
                      <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">
                            <span className="font-semibold text-blue-700">{sub.submission_type}</span>{' '}
                            · {sub.sender_name} ({sub.sender_email}) · Status: {sub.status}
                          </p>
                          <p className="text-sm font-bold text-slate-900">{sub.subject}</p>
                          <p className="text-sm text-slate-600">{sub.message}</p>
                        </div>
                        {sub.status !== 'reviewed' && (
                          <button
                            type="button"
                            onClick={() =>
                              void adminFetch(`/api/admin/submissions/${sub.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: 'reviewed' }),
                              })
                            }
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-700 rounded-lg cursor-pointer shrink-0"
                          >
                            Mark Reviewed
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
