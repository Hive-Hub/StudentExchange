import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Wrench } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { MediaFrame } from '../components/MediaFrame';
import { ErrorBanner } from '../components/StateFeedback';
import type { HardwareListing } from '../types';

export function HardwareDetailPage({
  onContactSeller,
}: {
  onContactSeller: (listing: HardwareListing) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<HardwareListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadItem() {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/hardware/${encodeURIComponent(id)}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Hardware listing not found.' : 'Failed to load listing.');
      }
      const data = (await res.json()) as { item: HardwareListing };
      setItem(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load listing.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItem();
  }, [id]);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/hardware"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950 mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Hardware Exchange</span>
        </Link>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 animate-pulse space-y-6">
            <div className="aspect-[16/9] bg-slate-100 rounded-lg" />
            <div className="h-7 w-1/2 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
          </div>
        ) : error || !item ? (
          <ErrorBanner message={error || 'Listing not found.'} onRetry={loadItem} />
        ) : (
          <>
            <SeoHead
              title={item.title}
              description={`${item.listing_type} ${item.title} (${item.condition}) located in ${item.location}.`}
            />

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-6 bg-slate-100">
                <MediaFrame
                  src={item.image_url}
                  alt={item.title}
                  aspectClass="aspect-[4/3] lg:h-full"
                />
              </div>

              <div className="lg:col-span-6 p-7 sm:p-9 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                    <span className="text-orange-600 font-semibold">{item.listing_type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.condition}</span>
                    {item.is_demo === 1 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">Demo Listing</span>
                      </>
                    )}
                  </div>

                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mt-2.5">
                    {item.title}
                  </h1>

                  <p className="font-mono text-xl font-bold text-slate-900 mt-4 tabular-nums">
                    {item.price_label}
                  </p>

                  {item.exchange_for && (
                    <p className="text-xs text-slate-600 mt-1">
                      Preferred trade: <span className="font-semibold">{item.exchange_for}</span>
                    </p>
                  )}

                  <p className="text-sm text-slate-600 mt-5 leading-relaxed">{item.description}</p>

                  {item.specs && (
                    <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>Technical Specifications</span>
                      </p>
                      <p className="font-mono text-xs text-slate-700 mt-1.5 leading-relaxed">
                        {item.specs}
                      </p>
                    </div>
                  )}

                  <dl className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>Listed by {item.seller_name}</span>
                    </div>
                    {item.seller_contact_note && (
                      <p className="text-xs text-slate-500 pl-6">{item.seller_contact_note}</p>
                    )}
                  </dl>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => onContactSeller(item)}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Contact Seller Directly
                  </button>
                  <Link
                    to="/hardware"
                    className="px-5 py-3 text-sm font-semibold text-slate-700 border border-slate-300 hover:border-slate-900 rounded-lg text-center transition-colors"
                  >
                    Browse More Parts
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
