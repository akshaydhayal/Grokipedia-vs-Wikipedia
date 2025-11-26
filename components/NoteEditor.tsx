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

  const updateSummary = (summary: string) => {
    setEditedNote({ ...editedNote, summary });
  };

  const updateDiscrepancy = (id: string, updates: Partial<Discrepancy>) => {
    setEditedNote({
      ...editedNote,
      discrepancies: editedNote.discrepancies.map(d =>
        d.id === id ? { ...d, ...updates } : d
      ),
    });
  };

  const addEvidence = (id: string, evidence: string) => {
    const discrepancy = editedNote.discrepancies.find(d => d.id === id);
    if (discrepancy && !discrepancy.evidence.includes(evidence)) {
      updateDiscrepancy(id, {
        evidence: [...discrepancy.evidence, evidence],
      });
    }
  };

  const removeEvidence = (id: string, evidenceIndex: number) => {
    const discrepancy = editedNote.discrepancies.find(d => d.id === id);
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
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Discrepancies ({editedNote.discrepancies.length})</h3>
          
          {editedNote.discrepancies.map((discrepancy, index) => (
            <div
              key={discrepancy.id}
              className="border-2 border-slate-700/60 rounded-xl p-5 bg-dark-tertiary/40 hover:border-slate-600/80 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-accent-cyan mb-2 uppercase tracking-wide">
                      Grokipedia Sentence:
                    </div>
                    <div className="text-sm text-slate-200 p-4 bg-dark-secondary/60 rounded-lg border border-accent-cyan/20">
                      {discrepancy.grok_sentence}
                    </div>
                  </div>
                  
                  {discrepancy.wiki_sentence && (
                    <div>
                      <div className="text-xs font-semibold text-accent-purple mb-2 uppercase tracking-wide">
                        Wikipedia Match:
                      </div>
                      <div className="text-sm text-slate-300 p-4 bg-dark-secondary/60 rounded-lg border border-accent-purple/20">
                        {discrepancy.wiki_sentence}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-400 font-medium">
                    Similarity: <span className="text-slate-300">{(discrepancy.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700/50 my-4"></div>

              {/* Note Editor */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Note
                </label>
                {editingDiscrepancy === discrepancy.id ? (
                  <textarea
                    value={discrepancy.note}
                    onChange={(e) => updateDiscrepancy(discrepancy.id, { note: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-secondary/60 border border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50 text-sm text-slate-200"
                    rows={3}
                    onBlur={() => setEditingDiscrepancy(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-sm text-slate-300 p-4 bg-dark-secondary/60 rounded-lg border border-slate-700/60 cursor-text hover:border-accent-cyan/30 transition-colors"
                    onClick={() => setEditingDiscrepancy(discrepancy.id)}
                  >
                    {discrepancy.note}
                  </div>
                )}
              </div>

              {/* Evidence Links */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Evidence Links
                </label>
                <div className="space-y-2">
                  {discrepancy.evidence.map((evidence, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-dark-secondary/40 rounded-lg border border-slate-700/50">
                      <a
                        href={evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-cyan hover:text-accent-cyan/80 hover:underline flex-1 truncate"
                      >
                        {evidence}
                      </a>
                      <button
                        onClick={() => removeEvidence(discrepancy.id, idx)}
                        className="text-rose-400 hover:text-rose-300 text-lg px-2 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add evidence URL"
                    className="w-full px-4 py-2.5 text-sm bg-dark-secondary/60 border border-slate-700/60 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addEvidence(discrepancy.id, input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
