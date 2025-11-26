'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DiffViewer from '@/components/DiffViewer';
import NoteEditor from '@/components/NoteEditor';
import { ComparisonResult, CommunityNote, SentenceComparison, PublishResult } from '@/types';
import { generateCommunityNote } from '@/lib/dkg';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get('topic') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [communityNote, setCommunityNote] = useState<CommunityNote | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<SentenceComparison | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    if (!topic) {
      router.push('/');
      return;
    }

    fetchAndCompare();
  }, [topic]);

  const fetchAndCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch articles
      const fetchResponse = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Failed to fetch articles');
      }

      const fetchData = await fetchResponse.json();

      if (!fetchData.wikipedia || !fetchData.grokipedia) {
        throw new Error('Failed to fetch one or both articles');
      }

      // Step 2: Compare articles
      const compareResponse = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wikipedia: fetchData.wikipedia,
          grokipedia: fetchData.grokipedia,
        }),
      });

      if (!compareResponse.ok) {
        const errorData = await compareResponse.json();
        throw new Error(errorData.error || 'Failed to compare articles');
      }

      const comparisonData: ComparisonResult = await compareResponse.json();
      setComparison(comparisonData);

      // Step 3: Generate Community Note
      const note = generateCommunityNote(
        topic,
        comparisonData.comparisons,
        comparisonData.summary,
        comparisonData.wikipedia.url,
        comparisonData.grokipedia.url
      );
      setCommunityNote(note);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = (note: CommunityNote) => {
    setCommunityNote(note);
    // In a real app, you might save to localStorage or a backend
    console.log('Note saved:', note);
  };

  const handlePublishNote = async (note: CommunityNote) => {
    setIsPublishing(true);
    setPublishResult(null);

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      const result: PublishResult = await response.json();
      setPublishResult(result);

      if (result.success) {
        // Show success message
        alert(`Successfully published! UAL: ${result.ual || 'Check console for JSON-LD'}`);
      } else {
        alert(`Failed to publish: ${result.error}`);
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish note');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan mb-4"></div>
        <p className="text-slate-300">Fetching and comparing articles...</p>
        <p className="text-sm text-slate-500 mt-2">This may take a minute</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass border border-rose-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Error</h2>
        <p className="text-slate-300 mb-4">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!comparison || !communityNote) {
    return null;
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">
            Comparison: {topic}
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-accent-cyan hover:text-accent-cyan/80 text-sm transition-colors"
          >
            ← Back to Search
          </button>
        </div>
      </div>

      {/* Diff Viewer */}
      <DiffViewer
        comparison={comparison}
        onSentenceClick={setSelectedSentence}
      />

      {/* Selected Sentence Details */}
      {selectedSentence && (
        <div className="glass border border-accent-cyan/30 rounded-xl p-4 glow-cyan">
          <h3 className="font-semibold mb-3 text-slate-200">Selected Sentence Details</h3>
          <div className="text-sm space-y-2 text-slate-300">
            <div>
              <strong className="text-accent-cyan">Grokipedia:</strong> <span className="text-slate-200">{selectedSentence.grokSentence.text}</span>
            </div>
            {selectedSentence.bestMatch && (
              <div>
                <strong className="text-accent-purple">Best Wikipedia Match:</strong> <span className="text-slate-200">{selectedSentence.bestMatch.wikiSentence.text}</span>
              </div>
            )}
            <div>
              <strong className="text-slate-400">Similarity:</strong> <span className="text-slate-200">{(selectedSentence.similarity * 100).toFixed(1)}%</span>
            </div>
            <div>
              <strong className="text-slate-400">Status:</strong> <span className="text-slate-200">{selectedSentence.status}</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedSentence(null)}
            className="mt-3 text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Community Note Editor */}
      <NoteEditor
        note={communityNote}
        onSave={handleSaveNote}
        onPublish={handlePublishNote}
        isPublishing={isPublishing}
      />

      {/* Publish Result */}
      {publishResult && (
        <div className={`glass border rounded-xl p-4 ${
          publishResult.success
            ? 'border-emerald-500/30'
            : 'border-rose-500/30'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            publishResult.success ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {publishResult.success ? '✓ Published Successfully' : '✗ Publish Failed'}
          </h3>
          {publishResult.ual && (
            <div className="text-sm mb-2">
              <strong className="text-slate-300">UAL:</strong> <code className="bg-dark-tertiary/50 px-2 py-1 rounded text-accent-cyan text-xs">{publishResult.ual}</code>
            </div>
          )}
          {publishResult.error && (
            <div className="text-sm text-rose-400">{publishResult.error}</div>
          )}
          {publishResult.jsonld && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium text-slate-300 hover:text-accent-cyan transition-colors">View JSON-LD</summary>
              <pre className="mt-2 p-3 bg-dark-tertiary/50 rounded-lg text-xs overflow-auto max-h-64 text-slate-300 border border-slate-700/50">
                {JSON.stringify(publishResult.jsonld, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

