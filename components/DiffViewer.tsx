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
        <div className="glass p-4 rounded-xl border border-emerald-500/30 glow-cyan">
          <div className="text-3xl font-bold text-emerald-400">{summary.matches}</div>
          <div className="text-sm text-slate-400">Matches</div>
        </div>
        <div className="glass p-4 rounded-xl border border-amber-500/30">
          <div className="text-3xl font-bold text-amber-400">{summary.paraphrases}</div>
          <div className="text-sm text-slate-400">Paraphrases</div>
        </div>
        <div className="glass p-4 rounded-xl border border-rose-500/30">
          <div className="text-3xl font-bold text-rose-400">{summary.unique}</div>
          <div className="text-sm text-slate-400">Unique/Hallucinations</div>
        </div>
        <div className="glass p-4 rounded-xl border border-accent-cyan/30 glow-cyan">
          <div className="text-3xl font-bold text-accent-cyan">{summary.potentialHallucinations.length}</div>
          <div className="text-sm text-slate-400">High Risk</div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Wikipedia Column */}
        <div className="rounded-lg p-5 bg-dark-secondary/40 border-2 border-slate-500 shadow-[0_0_20px_rgba(16,185,129,0.08)] backdrop-blur">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/60">
            <h3 className="font-bold text-xl text-accent-purple">Wikipedia</h3>
            <a
              href={wikipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-purple/80 hover:text-accent-purple transition-colors"
            >
              View Source →
            </a>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollable-content">
            {wikipedia.sentences.map((sentence, index) => (
              <div
                key={index}
                className="p-4 text-sm bg-dark-tertiary/40 border border-slate-700/60 rounded-lg hover:bg-dark-tertiary/60 hover:border-slate-600/80 transition-all"
              >
                <span className="text-slate-200 leading-relaxed">{sentence.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grokipedia Column */}
        <div className="rounded-lg p-5 bg-dark-secondary/40 border-2 border-slate-500 shadow-[0_0_20px_rgba(16,185,129,0.08)] backdrop-blur">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/60">
            <h3 className="font-bold text-xl text-accent-cyan">Grokipedia</h3>
            <a
              href={grokipedia.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-cyan/80 hover:text-accent-cyan transition-colors"
            >
              View Source →
            </a>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollable-content">
            {comparisons.map((comp, index) => {
              const colorClass = getStatusColor(comp.status);
              const similarityLabel = getSimilarityLabel(comp.similarity);
              
              return (
                <div
                  key={index}
                  className={`p-4 text-sm border-l-4 ${colorClass} cursor-pointer hover:opacity-90 transition-all rounded-lg`}
                  onClick={() => onSentenceClick?.(comp)}
                  title={`Similarity: ${(comp.similarity * 100).toFixed(1)}% - ${similarityLabel}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="leading-relaxed flex-1">{comp.grokSentence.text}</span>
                    <span className="text-xs font-bold whitespace-nowrap px-2.5 py-1 bg-black/20 rounded border border-white/10">
                      {(comp.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  {comp.bestMatch && comp.status !== 'unique' && (
                    <div className="mt-3 pt-3 text-xs opacity-80 italic border-t border-white/20">
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
      <div className="flex flex-wrap gap-4 text-sm glass p-4 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/30 border border-emerald-500/50 rounded"></div>
          <span className="text-slate-300">Match (≥85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500/30 border border-amber-500/50 rounded"></div>
          <span className="text-slate-300">Paraphrase (60-85%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-rose-500/30 border border-rose-500/50 rounded"></div>
          <span className="text-slate-300">Unique/Hallucination (&lt;60%)</span>
        </div>
      </div>
    </div>
  );
}
