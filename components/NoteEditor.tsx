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
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Community Note Editor</h2>
        
        {/* Summary Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Summary
          </label>
          <textarea
            value={editedNote.summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Discrepancies List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Discrepancies ({editedNote.discrepancies.length})</h3>
          
          {editedNote.discrepancies.map((discrepancy) => (
            <div
              key={discrepancy.id}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Grokipedia Sentence:
                  </div>
                  <div className="text-sm text-gray-900 mb-3 p-2 bg-white rounded border">
                    {discrepancy.grok_sentence}
                  </div>
                  
                  {discrepancy.wiki_sentence && (
                    <>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Wikipedia Match:
                      </div>
                      <div className="text-sm text-gray-600 mb-3 p-2 bg-white rounded border">
                        {discrepancy.wiki_sentence}
                      </div>
                    </>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-2">
                    Similarity: {(discrepancy.similarity_score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Note Editor */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                {editingDiscrepancy === discrepancy.id ? (
                  <textarea
                    value={discrepancy.note}
                    onChange={(e) => updateDiscrepancy(discrepancy.id, { note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2}
                    onBlur={() => setEditingDiscrepancy(null)}
                    autoFocus
                  />
                ) : (
                  <div
                    className="text-sm text-gray-700 p-2 bg-white rounded border cursor-text"
                    onClick={() => setEditingDiscrepancy(discrepancy.id)}
                  >
                    {discrepancy.note}
                  </div>
                )}
              </div>

              {/* Evidence Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evidence Links
                </label>
                <div className="space-y-1">
                  {discrepancy.evidence.map((evidence, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <a
                        href={evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex-1 truncate"
                      >
                        {evidence}
                      </a>
                      <button
                        onClick={() => removeEvidence(discrepancy.id, idx)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add evidence URL"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => onPublish(editedNote)}
            disabled={isPublishing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isPublishing ? 'Publishing...' : 'Publish to DKG'}
          </button>
        </div>
      </div>
    </div>
  );
}

