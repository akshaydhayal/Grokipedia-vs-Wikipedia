'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBox from '@/components/SearchBox';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (topic: string, slug?: string) => {
    setIsLoading(true);
    try {
      // Navigate to results page with topic and optional slug as query params
      const params = new URLSearchParams({ topic });
      if (slug) {
        params.append('slug', slug);
      }
      router.push(`/results?${params.toString()}`);
    } catch (error) {
      console.error('Error navigating:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4 gradient-text">
          Compare AI vs Human Knowledge
        </h2>
        <p className="text-lg text-slate-300 mb-8">
          Analyze discrepancies between <span className="text-accent-cyan">Grokipedia</span> (AI-generated) and <span className="text-accent-purple">Wikipedia</span> (human-curated) content.
          Identify potential hallucinations and create verifiable Community Notes on the OriginTrail DKG.
        </p>
      </div>

      <SearchBox onSearch={handleSearch} isLoading={isLoading} />

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-xl border border-slate-700/50 hover:border-accent-cyan/30 transition-all hover:shadow-lg hover:shadow-accent-cyan/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-cyan">🔍 Compare</h3>
          <p className="text-sm text-slate-400">
            Fetch articles from both Wikipedia and Grokipedia for any topic
          </p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-700/50 hover:border-accent-purple/30 transition-all hover:shadow-lg hover:shadow-accent-purple/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-purple">📊 Analyze</h3>
          <p className="text-sm text-slate-400">
            Use AI embeddings to detect similarities, paraphrases, and potential hallucinations
          </p>
        </div>
        <div className="glass p-6 rounded-xl border border-slate-700/50 hover:border-accent-pink/30 transition-all hover:shadow-lg hover:shadow-accent-pink/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-pink">📝 Publish</h3>
          <p className="text-sm text-slate-400">
            Create and publish structured Community Notes to the OriginTrail DKG
          </p>
        </div>
      </div>

      <div className="mt-12 glass border border-slate-700/50 rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3 text-slate-200">Example Topics</h3>
        <div className="flex flex-wrap gap-2">
          {['Climate Change', 'PlayStation 5', 'Artificial Intelligence', 'Bitcoin', 'Elon Musk'].map((topic) => (
            <button
              key={topic}
              onClick={() => handleSearch(topic)}
              className="px-4 py-2 bg-dark-tertiary/50 border border-slate-700/50 text-slate-300 rounded-full text-sm hover:border-accent-cyan/50 hover:text-accent-cyan transition-all"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

