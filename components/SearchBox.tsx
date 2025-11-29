'use client';

import { useState, useEffect, useRef } from 'react';

interface TypeaheadResult {
  slug: string;
  title: string;
  snippet: string;
  viewCount: string;
}

interface SearchBoxProps {
  onSearch: (topic: string, slug?: string) => void;
  isLoading?: boolean;
}

export default function SearchBox({ onSearch, isLoading = false }: SearchBoxProps) {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<TypeaheadResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions when topic changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (topic.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/typeahead?query=${encodeURIComponent(topic)}&limit=6`);
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowSuggestions(data.results?.length > 0);
        // Set first suggestion as selected by default
        setSelectedIndex(data.results?.length > 0 ? 0 : -1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [topic]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setShowSuggestions(false);
      onSearch(topic.trim());
    }
  };

  const handleSuggestionClick = (suggestion: TypeaheadResult) => {
    setTopic(suggestion.title);
    setShowSuggestions(false);
    onSearch(suggestion.title, suggestion.slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };


  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
      <div className="flex gap-3 items-start">
        <div className="flex-1 relative">
          <div className="relative">
            {/* Magnifying glass icon */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter a topic (e.g., Climate Change, PlayStation 5, Artificial Intelligence)"
              className="w-full pl-12 pr-4 py-4 bg-dark-tertiary/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 transition-all backdrop-blur-sm"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          
          
          {/* Loading indicator */}
          {isLoadingSuggestions && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-accent-cyan rounded-full animate-spin"></div>
            </div>
          )}

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 w-full mt-2 bg-dark-secondary/95 border border-slate-700/60 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden"
            >
              <div className="py-2 relative">
                {/* Close button with upward arrow - top right */}
                {/* <button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  className="absolute right-2 top-2 w-8 h-8 rounded-full bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-all"
                  aria-label="Close suggestions"
                >
                  <svg
                    className="w-4 h-4 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button> */}
                
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.slug}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-2.5 text-left transition-all flex items-center gap-3 ${
                      index === selectedIndex
                        ? 'bg-accent-cyan/20 text-white'
                        : 'hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    {/* Magnifying glass icon */}
                    <svg
                      className="w-5 h-5 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {/* Suggestion title */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{suggestion.title}</div>
                    </div>
                    {/* Right arrow icon */}
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
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
