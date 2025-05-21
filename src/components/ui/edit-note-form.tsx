"use client";

import React, { useState, useEffect } from 'react';
import { Note } from '@/types/note';
import { X, Save } from 'lucide-react';

interface EditNoteFormProps {
  note: Note;
  onCancel: () => void;
  onSave: (updatedNote: Note) => Promise<void>;
}

export function EditNoteForm({ note, onCancel, onSave }: EditNoteFormProps) {
  const [title, setTitle] = useState(note.title || '');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-focus the title on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const titleInput = document.getElementById('title') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
        titleInput.setSelectionRange(title.length, title.length);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [title.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Saving note with data:", {
        ...note,
        title,
        notes: note.notes,
        tags,
        updatedAt: new Date()
      });
      
      await onSave({
        ...note,
        title,
        notes: note.notes,
        tags,
        updatedAt: new Date()
      });
      
      console.log("Save completed successfully");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header with save and cancel buttons */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Note</h2>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="p-4 space-y-6">
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 text-gray-900 dark:text-white"
            placeholder="Untitled Note"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="block w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              placeholder="Press Enter to add tags..."
            />
          </div>
        </div>
      </div>
    </form>
  );
}