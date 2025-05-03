"use client";

import React, { useState } from 'react';
import { Note } from '@/types/note';

interface EditNoteFormProps {
  note: Note;
  onCancel: () => void;
  onSave: (updatedNote: Note) => Promise<void>;
}

export function EditNoteForm({ note, onCancel, onSave }: EditNoteFormProps) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.notes);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave({
        ...note,
        title,
        notes: note.notes, // Keep original notes content
        tags,
        updatedAt: new Date()
      });
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
    <form onSubmit={handleSubmit} className="w-full min-h-screen p-6 space-y-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="block w-full text-3xl font-medium bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Untitled"
        />
      </div>

      <div className="relative border-b border-gray-200 dark:border-gray-700 pb-4">
        <div
          className="block w-full bg-transparent text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[300px]"
        >
          {content}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="block w-full text-sm bg-transparent focus:outline-none text-gray-600 dark:text-gray-400 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Press Enter to add tags..."
        />
      </div>

      <div className="flex justify-end space-x-3 max-w-[1200px] mx-auto w-full">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}