'use client';

import { useState } from 'react';

interface SearchBoxProps {
  onSearch: (topic: string) => void;
  isLoading?: boolean;
}

export default function SearchBox({ onSearch, isLoading = false }: SearchBoxProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearch(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., Climate Change, PlayStation 5, Artificial Intelligence)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Compare'}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Compare content from Wikipedia and Grokipedia
      </p>
    </form>
  );
}

