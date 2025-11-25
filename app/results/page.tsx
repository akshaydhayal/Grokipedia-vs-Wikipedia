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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Fetching and comparing articles...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Comparison: {topic}
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 text-sm"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Selected Sentence Details</h3>
          <div className="text-sm space-y-2">
            <div>
              <strong>Grokipedia:</strong> {selectedSentence.grokSentence.text}
            </div>
            {selectedSentence.bestMatch && (
              <div>
                <strong>Best Wikipedia Match:</strong> {selectedSentence.bestMatch.wikiSentence.text}
              </div>
            )}
            <div>
              <strong>Similarity:</strong> {(selectedSentence.similarity * 100).toFixed(1)}%
            </div>
            <div>
              <strong>Status:</strong> {selectedSentence.status}
            </div>
          </div>
          <button
            onClick={() => setSelectedSentence(null)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
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
        <div className={`border rounded-lg p-4 ${
          publishResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="font-semibold mb-2">
            {publishResult.success ? '✓ Published Successfully' : '✗ Publish Failed'}
          </h3>
          {publishResult.ual && (
            <div className="text-sm mb-2">
              <strong>UAL:</strong> <code className="bg-white px-2 py-1 rounded">{publishResult.ual}</code>
            </div>
          )}
          {publishResult.error && (
            <div className="text-sm text-red-700">{publishResult.error}</div>
          )}
          {publishResult.jsonld && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm font-medium">View JSON-LD</summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(publishResult.jsonld, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

