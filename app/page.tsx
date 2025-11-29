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
      <div className="text-center mb-2">
        <h2 className="text-5xl font-bold mb-2 gradient-text">
          Compare AI vs Human Knowledge
        </h2>
        <p className="text-lg text-slate-300 mb-8">
          Analyze discrepancies between <span className="text-accent-cyan">Grokipedia</span> (AI-generated) and <span className="text-accent-purple">Wikipedia</span> (human-curated) content.
          Identify potential hallucinations and create verifiable Community Notes on the OriginTrail DKG.
        </p>
      </div>

      <SearchBox onSearch={handleSearch} isLoading={isLoading} />

      {/* Example Topics */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-wide mr-1">Try:</span>
        {/* {['Climate Change', 'PlayStation 5', 'Artificial Intelligence', 'Bitcoin', 'Elon Musk'].map((topic) => ( */}
        {[{title:'Climate Change',slug:'Climate_change'}, {title:'Elon Musk',slug:'Elon_Musk'},{title:'Artificial Intelligence',slug:'Artificial_intelligence'}, {title:'Bitcoin',slug:'Bitcoin'},{title:'PlayStation 5',slug:'PlayStation_5'}].map((topic) => (
          <button
            key={topic.slug}
            onClick={() => handleSearch(topic.slug)}
            className="px-3 py-1.5 bg-dark-tertiary/30 border border-slate-700/40 text-slate-400 rounded-lg text-sm hover:border-accent-cyan/50 hover:text-accent-cyan hover:bg-dark-tertiary/50 transition-all"
          >
            {topic.title}
          </button>
        ))}
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="glass p-4 rounded-xl border border-slate-700/50 hover:border-accent-cyan/30 transition-all hover:shadow-lg hover:shadow-accent-cyan/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-cyan">🔍 Compare</h3>
          <p className="text-sm text-slate-400">
            Fetch articles from both Wikipedia and Grokipedia for any topic
          </p>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-700/50 hover:border-accent-purple/30 transition-all hover:shadow-lg hover:shadow-accent-purple/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-purple">📊 Analyze</h3>
          <p className="text-sm text-slate-400">
            Use AI embeddings to detect similarities, paraphrases, and potential hallucinations
          </p>
        </div>
        <div className="glass p-4 rounded-xl border border-slate-700/50 hover:border-accent-pink/30 transition-all hover:shadow-lg hover:shadow-accent-pink/10">
          <h3 className="font-semibold text-lg mb-2 text-accent-pink">📝 Publish</h3>
          <p className="text-sm text-slate-400">
            Create and publish structured Community Notes to the OriginTrail DKG
          </p>
        </div>
      </div>
    </div>
  );
}

