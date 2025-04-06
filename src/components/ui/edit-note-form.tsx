"use client";

import { useState } from 'react';
import { Save, X, Wand2, RefreshCw } from 'lucide-react';
import { notesService } from '@/lib/notes-service';
import { EnhanceMode } from '@/lib/gemini-service';
import { aiProviderService, AIProvider } from '@/lib/ai-provider-service';

interface EditNoteFormProps {
  note: {
    id: string;
    transcript: string;
    notes: string;
    tags?: string[];
  };
  onSave: (updatedNote: {
    id: string;
    transcript: string;
    notes: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

export function EditNoteForm({
  note,
  onSave,
  onCancel
}: EditNoteFormProps) {
  const [transcript, setTranscript] = useState(note.transcript);
  const [notes, setNotes] = useState(note.notes);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const handleEnhance = async (mode: EnhanceMode) => {
    setEnhancing(true);
    setError(null);
    try {
      aiProviderService.setProvider(provider);
      const enhancedNotes = await aiProviderService.enhanceNotes(notes, mode);
      setNotes(enhancedNotes);
      setShowEnhanceOptions(false);
    } catch (err) {
      setError('Failed to enhance notes. Please try again.');
      console.error('Error enhancing notes:', err);
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updatedNote = {
        ...note,
        transcript,
        notes,
        tags
      };
      onSave(updatedNote);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving note:', err);
    } finally {
      setSaving(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transcript
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter transcript"
        />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter notes"
            disabled={enhancing}
          />
          
          {/* AI Provider Toggle and Enhance Buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            {/* Provider Toggle */}
            <button
              type="button"
              onClick={() => {
                const newProvider = provider === 'gemini' ? 'groq' : 'gemini';
                setProvider(newProvider);
                aiProviderService.setProvider(newProvider);
              }}
              className="p-2 text-gray-500 hover:text-blue-600 bg-white rounded-md shadow-sm border border-gray-200 transition-colors duration-200 flex items-center gap-2"
              disabled={saving || enhancing}
            >
              <RefreshCw size={16} />
              <span className="text-sm">{provider === 'gemini' ? 'Gemini' : 'Groq'}</span>
            </button>

            {/* Enhance Button */}
            <button
              type="button"
              onClick={() => setShowEnhanceOptions(!showEnhanceOptions)}
              className="p-2 text-gray-500 hover:text-purple-600 bg-white rounded-md shadow-sm border border-gray-200 transition-colors duration-200 flex items-center gap-2"
              disabled={saving || enhancing}
            >
              <Wand2 size={16} />
              {enhancing && (
                <span className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>

          {/* Enhancement Options Dropdown */}
          {showEnhanceOptions && (
            <div className="absolute right-2 top-12 z-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => handleEnhance('detailed')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
                disabled={enhancing}
              >
                Make More Detailed
              </button>
              <button
                type="button"
                onClick={() => handleEnhance('shorter')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
                disabled={enhancing}
              >
                Make Shorter
              </button>
              <button
                type="button"
                onClick={() => handleEnhance('simpler')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
                disabled={enhancing}
              >
                Make Simpler
              </button>
              <button
                type="button"
                onClick={() => handleEnhance('complex')}
                className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50"
                disabled={enhancing}
              >
                Make More Complex
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex items-center flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="inline-flex items-center rounded-full bg-gray-200 px-3 py-0.5 text-sm font-medium text-gray-800 hover:bg-gray-300"
            >
              {tag}
              <X className="ml-1 h-4 w-4" />
            </button>
          ))}
        </div>
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const tag = (e.target as HTMLInputElement).value.trim();
              if (tag && !tags.includes(tag)) {
                addTag(tag);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Add a tag and press Enter"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2"
          disabled={saving || enhancing}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          disabled={saving || enhancing}
        >
          {saving ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}