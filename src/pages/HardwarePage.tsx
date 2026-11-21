import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { HardwareCard } from '../components/ResourceCards';
import { EmptyState, ErrorBanner, LoadingGrid } from '../components/StateFeedback';
import type { HardwareListing } from '../types';

const listingTypes = ['All', 'Buy', 'Sell', 'Exchange', 'Donate'];
const componentCategories = [
  'All',
  'Arduino boards',
  'ESP32 and ESP8266',
  'Raspberry Pi',
  'Sensors',
  'Electronic modules',
  'Development boards',
  'Robotics components',
];

export function HardwarePage({
  onContactSeller,
}: {
  onContactSeller: (listing: HardwareListing) => void;
}) {
  const [items, setItems] = useState<HardwareListing[]>([]);
  const [listingType, setListingType] = useState('All');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchHardware() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (listingType !== 'All') params.set('type', listingType);
      if (category !== 'All') params.set('category', category);
      if (query.trim()) params.set('q', query.trim());
      const res = await fetch(`/api/hardware?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load hardware listings.');
      const data = (await res.json()) as { items: HardwareListing[] };
      setItems(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchHardware();
  }, [listingType, category]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SeoHead
        title="Hardware Exchange"
        description="Buy, sell, exchange, or donate Arduino boards, ESP32, Raspberry Pi, sensors, and robotics components among students."
      />

      <section className="bg-white border-b border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-950 tracking-tight">
            Hardware Exchange
          </h1>
          <p className="text-base text-slate-600 mt-2 max-w-2xl">
            Your unused hardware could build someone's next big idea. Browse boards, sensors, and robotics kits with direct peer-to-peer seller contact—no account or checkout required.
          </p>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void fetchHardware();
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
                  placeholder="Search Arduino, ESP32, Raspberry Pi, location..."
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                {listingTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setListingType(t)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      listingType === t
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by hardware component category"
                className="px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                {componentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Component Types' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <ErrorBanner message={error} onRetry={fetchHardware} />}
        {loading ? (
          <LoadingGrid count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No hardware listings match those filters"
            description="Try selecting All listing types or clearing your search query."
            onReset={() => {
              setListingType('All');
              setCategory('All');
              setQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <HardwareCard key={item.id} item={item} onContactSeller={onContactSeller} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
