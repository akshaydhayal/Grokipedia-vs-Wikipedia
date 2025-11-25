'use client';

import { ComparisonResult, SentenceComparison } from '@/types';
import { getStatusColor, getSimilarityLabel } from '@/lib/similarity';

interface DiffViewerProps {
  comparison: ComparisonResult;
  onSentenceClick?: (comparison: SentenceComparison) => void;
}

export default function DiffViewer({ comparison, onSentenceClick }: DiffViewerProps) {
  const { wikipedia, grokipedia, comparisons, summary } = comparison;

  return (
    <div className="w-full space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-700">{summary.matches}</div>
          <div className="text-sm text-green-600">Matches</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{summary.paraphrases}</div>
          <div className="text-sm text-yellow-600">Paraphrases</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-700">{summary.unique}</div>
          <div className="text-sm text-red-600">Unique/Hallucinations</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{summary.potentialHallucinations.length}</div>
          <div className="text-sm text-blue-600">High Risk</div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Wikipedia Column */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h3 className="font-semibold text-lg">Wikipedia</h3>
            <a
              href={wikipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Source →
            </a>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {wikipedia.sentences.map((sentence, index) => (
              <div
                key={index}
                className="p-2 text-sm border-l-2 border-gray-200 hover:bg-gray-50"
              >
                {sentence.text}
              </div>
            ))}
          </div>
        </div>

        {/* Grokipedia Column */}
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-4 pb-2 border-b">
            <h3 className="font-semibold text-lg">Grokipedia</h3>
            <a
              href={grokipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Source →
            </a>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {comparisons.map((comp, index) => {
              const colorClass = getStatusColor(comp.status);
              const similarityLabel = getSimilarityLabel(comp.similarity);
              
              return (
                <div
                  key={index}
                  className={`p-2 text-sm border-l-4 ${colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => onSentenceClick?.(comp)}
                  title={`Similarity: ${(comp.similarity * 100).toFixed(1)}% - ${similarityLabel}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span>{comp.grokSentence.text}</span>
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {(comp.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  {comp.bestMatch && comp.status !== 'unique' && (
                    <div className="mt-1 text-xs text-gray-600 italic">
                      Matches: "{comp.bestMatch.wikiSentence.text.substring(0, 100)}..."
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Match (≥85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Paraphrase (60-85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Unique/Hallucination (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}

