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
      <div className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., Climate Change, PlayStation 5, Artificial Intelligence)"
          className="flex-1 px-5 py-4 bg-dark-tertiary/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all backdrop-blur-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl hover:from-accent-cyan/90 hover:to-accent-purple/90 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-accent-cyan/20 hover:shadow-accent-cyan/30"
        >
          {isLoading ? 'Searching...' : 'Compare'}
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-400 text-center">
        Compare content from Wikipedia and Grokipedia
      </p>
    </form>
  );
}

