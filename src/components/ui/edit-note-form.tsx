"use client";

import { useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { notesService } from '@/lib/notes-service';

interface EditNoteFormProps {
  noteId: string;
  initialTranscript: string;
  initialNotes: string;
  initialTags: string[];
  onSave: () => void;
  onCancel: () => void;
}

export function EditNoteForm({
  noteId,
  initialTranscript,
  initialNotes,
  initialTags,
  onSave,
  onCancel
}: EditNoteFormProps) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [notes, setNotes] = useState(initialNotes);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await notesService.updateNote(noteId, {
        transcript,
        notes,
        tags
      });
      onSave();
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter notes"
        />
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
          disabled={saving}
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          disabled={saving}
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