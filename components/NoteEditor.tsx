'use client';

import { useState } from 'react';
import { CommunityNote, Discrepancy } from '@/types';

interface NoteEditorProps {
  note: CommunityNote;
  onSave: (note: CommunityNote) => void;
  onPublish: (note: CommunityNote) => void;
  isPublishing?: boolean;
}

export default function NoteEditor({ note, onSave, onPublish, isPublishing = false }: NoteEditorProps) {
  const [editedNote, setEditedNote] = useState<CommunityNote>(note);
  const [editingDiscrepancy, setEditingDiscrepancy] = useState<string | null>(null);
  const [activeDiscrepancyId, setActiveDiscrepancyId] = useState<string | null>(null);

  const activeDiscrepancy = activeDiscrepancyId
    ? editedNote.discrepancies.find((d) => d['@id'] === activeDiscrepancyId)
    : null;

  const updateSummary = (summary: string) => {
    setEditedNote({ ...editedNote, summary });
  };

  const updateDiscrepancy = (id: string, updates: Partial<Discrepancy>) => {
    setEditedNote({
      ...editedNote,
      discrepancies: editedNote.discrepancies.map(d =>
        d['@id'] === id ? { ...d, ...updates } : d
      ),
    });
  };

  const addEvidence = (id: string, evidence: string) => {
    const discrepancy = editedNote.discrepancies.find(d => d['@id'] === id);
    if (discrepancy && !discrepancy.evidence.includes(evidence)) {
      updateDiscrepancy(id, {
        evidence: [...discrepancy.evidence, evidence],
      });
    }
  };

  const removeEvidence = (id: string, evidenceIndex: number) => {
    const discrepancy = editedNote.discrepancies.find(d => d['@id'] === id);
    if (discrepancy) {
      updateDiscrepancy(id, {
        evidence: discrepancy.evidence.filter((_, i) => i !== evidenceIndex),
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="glass border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Community Note Editor</h2>
        
        {/* Summary Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Summary
          </label>
          <textarea
            value={editedNote.summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="w-full px-4 py-3 bg-dark-tertiary/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 text-slate-200 placeholder:text-slate-500"
            rows={3}
          />
        </div>

        {/* Discrepancies List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Discrepancies ({editedNote.discrepancies.length})</h3>
          
          {editedNote.discrepancies.map((discrepancy) => (
            <div
              key={discrepancy['@id']}
              className="bg-dark-tertiary/30 border border-slate-700/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:border-slate-500/70 transition-all cursor-pointer"
              onClick={() => setActiveDiscrepancyId(discrepancy['@id'])}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wide text-accent-cyan font-semibold mb-1">
                  {discrepancy.status.replace('_', ' ')}
                </div>
                <p className="text-sm text-slate-200 truncate">
                  {discrepancy.grok_sentence}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-slate-300 whitespace-nowrap px-2 py-1 rounded-full bg-slate-800/60 border border-slate-600/60">
                    {(discrepancy.similarity_score * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-accent-cyan hover:text-white transition-colors flex items-center gap-1">
                    Click to expand ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* JSON-LD Preview */}
        <div className="mt-6 border-t border-slate-700/50 pt-6">
          <details className="group">
            <summary className="cursor-pointer flex items-center justify-between text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              <span className="flex items-center gap-2">
                <span>📄</span>
                <span>Preview JSON-LD (This will be published to DKG)</span>
              </span>
              <span className="text-xs text-slate-500 group-open:hidden">Click to expand</span>
              <span className="text-xs text-slate-500 hidden group-open:inline">Click to collapse</span>
            </summary>
            <div className="mt-4 p-4 bg-dark-tertiary/40 border border-slate-700/60 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-400">
                  This is the JSON-LD structure that will be published to the OriginTrail DKG as a Knowledge Asset.
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(JSON.stringify(editedNote, null, 2));
                  }}
                  className="text-xs px-3 py-1.5 bg-dark-secondary/60 border border-slate-700/50 text-slate-300 rounded hover:bg-dark-secondary/80 transition-colors"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="text-xs text-slate-300 overflow-auto max-h-96 p-4 bg-dark-primary/50 rounded border border-slate-800/50">
                {JSON.stringify(editedNote, null, 2)}
              </pre>
            </div>
          </details>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => onSave(editedNote)}
            className="px-6 py-3 bg-dark-tertiary border border-slate-700/50 text-slate-300 rounded-xl hover:bg-dark-tertiary/80 hover:border-slate-600 transition-all"
          >
            Save Changes
          </button>
          <button
            onClick={() => onPublish(editedNote)}
            disabled={isPublishing}
            className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl hover:from-accent-cyan/90 hover:to-accent-purple/90 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-accent-cyan/20"
          >
            {isPublishing ? 'Publishing...' : 'Publish to DKG'}
          </button>
        </div>
      </div>
      {activeDiscrepancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-4xl bg-dark-secondary/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Discrepancy Details</h3>
                <p className="text-sm text-slate-400">Status: {activeDiscrepancy.status.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => setActiveDiscrepancyId(null)}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-accent-cyan mb-2 uppercase tracking-wide">
                    Grokipedia Sentence
                  </div>
                  <div className="text-sm text-slate-200 p-4 bg-dark-tertiary/60 rounded-lg border border-accent-cyan/20">
                    {activeDiscrepancy.grok_sentence}
                  </div>
                </div>
                {activeDiscrepancy.wiki_sentence && (
                  <div>
                    <div className="text-xs font-semibold text-accent-purple mb-2 uppercase tracking-wide">
                      Wikipedia Match
                    </div>
                    <div className="text-sm text-slate-300 p-4 bg-dark-tertiary/60 rounded-lg border border-accent-purple/20">
                      {activeDiscrepancy.wiki_sentence}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Similarity: <span className="text-slate-200">{(activeDiscrepancy.similarity_score * 100).toFixed(1)}%</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Note
                </label>
                {editingDiscrepancy === activeDiscrepancy['@id'] ? (
                  <textarea
                    value={activeDiscrepancy.note}
                    onChange={(e) => updateDiscrepancy(activeDiscrepancy['@id'], { note: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-tertiary/60 border border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 text-sm text-slate-200"
                    rows={3}
                    onBlur={() => setEditingDiscrepancy(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-sm text-slate-300 p-3 bg-dark-tertiary/60 rounded-lg border border-slate-700/60 cursor-text hover:border-accent-cyan/30 transition-colors"
                    onClick={() => setEditingDiscrepancy(activeDiscrepancy['@id'])}
                  >
                    {activeDiscrepancy.note}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Evidence Links
                </label>
                <div className="space-y-2">
                  {activeDiscrepancy.evidence.map((evidence, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-dark-tertiary/40 rounded-lg border border-slate-700/50">
                      <a
                        href={evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-cyan hover:text-accent-cyan/80 hover:underline flex-1 truncate"
                      >
                        {evidence}
                      </a>
                      <button
                        onClick={() => removeEvidence(activeDiscrepancy['@id'], idx)}
                        className="text-rose-400 hover:text-rose-300 text-lg px-2 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add evidence URL"
                    className="w-full px-4 py-2.5 text-sm bg-dark-tertiary/60 border border-slate-700/60 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addEvidence(activeDiscrepancy['@id'], input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
