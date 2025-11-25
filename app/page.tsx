'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBox from '@/components/SearchBox';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (topic: string) => {
    setIsLoading(true);
    try {
      // Navigate to results page with topic as query param
      router.push(`/results?topic=${encodeURIComponent(topic)}`);
    } catch (error) {
      console.error('Error navigating:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Compare AI vs Human Knowledge
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Analyze discrepancies between Grokipedia (AI-generated) and Wikipedia (human-curated) content.
          Identify potential hallucinations and create verifiable Community Notes on the OriginTrail DKG.
        </p>
      </div>

      <SearchBox onSearch={handleSearch} isLoading={isLoading} />

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-2">🔍 Compare</h3>
          <p className="text-sm text-gray-600">
            Fetch articles from both Wikipedia and Grokipedia for any topic
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-2">📊 Analyze</h3>
          <p className="text-sm text-gray-600">
            Use AI embeddings to detect similarities, paraphrases, and potential hallucinations
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg mb-2">📝 Publish</h3>
          <p className="text-sm text-gray-600">
            Create and publish structured Community Notes to the OriginTrail DKG
          </p>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2 text-blue-900">Example Topics</h3>
        <div className="flex flex-wrap gap-2">
          {['Climate Change', 'PlayStation 5', 'Artificial Intelligence', 'Bitcoin', 'Elon Musk'].map((topic) => (
            <button
              key={topic}
              onClick={() => handleSearch(topic)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

