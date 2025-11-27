'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface KnowledgeAsset {
  _id: string;
  topic: string;
  ual: string;
  datasetRoot?: string;
  publishedAt: string;
  author?: string;
  summary: string;
  discrepancyCount: number;
  hallucinationCount: number;
  wikipediaUrl: string;
  grokipediaUrl: string;
}

function AssetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<KnowledgeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTopic, setSearchTopic] = useState(searchParams.get('topic') || '');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAssets();
  }, [searchTopic]);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchTopic) {
        params.set('topic', searchTopic);
      }
      
      const response = await fetch(`/api/assets?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.assets);
        setTotal(data.total);
      } else {
        setError(data.error || 'Failed to fetch assets');
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load knowledge assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
    // Update URL without reload
    const params = new URLSearchParams();
    if (searchTopic) {
      params.set('topic', searchTopic);
    }
    router.push(`/assets?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-slate-800/80 bg-dark-secondary/60 shadow-[0_10px_40px_rgba(2,6,23,0.6)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Published Knowledge Assets
            </h1>
            <p className="text-slate-400 text-sm">
              Browse all Community Notes published to the OriginTrail DKG
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg hover:from-accent-cyan/90 hover:to-accent-purple/90 transition-all font-semibold"
          >
            New Comparison
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            placeholder="Search by topic..."
            className="flex-1 px-4 py-2 bg-dark-tertiary/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 text-slate-200 placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-dark-tertiary border border-slate-700/50 text-slate-300 rounded-lg hover:bg-dark-tertiary/80 hover:border-slate-600 transition-all"
          >
            Search
          </button>
          {searchTopic && (
            <button
              type="button"
              onClick={() => {
                setSearchTopic('');
                router.push('/assets');
              }}
              className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {total > 0 && (
          <p className="text-sm text-slate-400 mt-3">
            Showing {assets.length} of {total} knowledge asset{total !== 1 ? 's' : ''}
          </p>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan mb-4"></div>
          <p className="text-slate-300">Loading knowledge assets...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="glass border border-rose-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Error</h2>
          <p className="text-slate-300">{error}</p>
        </div>
      )}

      {/* Assets Grid */}
      {!loading && !error && (
        <>
          {assets.length === 0 ? (
            <div className="glass border border-slate-700/50 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-lg">
                {searchTopic ? 'No knowledge assets found for this topic.' : 'No knowledge assets published yet.'}
              </p>
              {!searchTopic && (
                <Link
                  href="/"
                  className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg hover:from-accent-cyan/90 hover:to-accent-purple/90 transition-all font-semibold"
                >
                  Create Your First Comparison
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {assets.map((asset) => (
                <div
                  key={asset._id}
                  className="glass border border-slate-700/60 rounded-xl p-5 hover:border-accent-cyan/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Topic & Date */}
                    <div className="lg:w-48 flex-shrink-0">
                      <h3 className="text-lg font-bold text-slate-100 mb-1">
                        {asset.topic}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {formatDate(asset.publishedAt)}
                      </p>
                    </div>

                    {/* Middle: Summary & UAL */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                        {asset.summary}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">UAL:</span>
                        <code className="text-xs text-accent-cyan truncate bg-dark-tertiary/50 px-2 py-0.5 rounded max-w-md">
                          {asset.ual}
                        </code>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex lg:flex-col gap-4 lg:gap-1 lg:w-32 flex-shrink-0 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Discrepancies:</span>
                        <span className="font-semibold text-amber-400">{asset.discrepancyCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Hallucinations:</span>
                        <span className="font-semibold text-rose-400">{asset.hallucinationCount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={`https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(asset.ual)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/40 text-accent-cyan hover:text-white hover:border-accent-cyan/60 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                      >
                        View on DKG
                      </a>
                      <Link
                        href={`/results?topic=${encodeURIComponent(asset.topic)}`}
                        className="px-4 py-2 bg-dark-tertiary border border-slate-700/50 text-slate-300 rounded-lg hover:bg-dark-tertiary/80 transition-all text-sm whitespace-nowrap"
                      >
                        Compare
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      }
    >
      <AssetsContent />
    </Suspense>
  );
}


