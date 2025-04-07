"use client";

import React from 'react';
import { NotesList } from "@/components/ui/notes-list";
import CategoriesList from "@/components/ui/categories-list";
import { Note } from '@/types/note';

interface NotesSidebarProps {
  selectedNoteId: string | null;
  onNoteSelect: (noteId: string, note: Note) => void;
  notesListRefreshKey: number;
  selectedCategories: string[];
  categories: { name: string; count: number }[];
  onCategorySelect: (category: string) => void;
}

export function NotesSidebar({
  selectedNoteId,
  onNoteSelect,
  notesListRefreshKey,
  selectedCategories,
  categories,
  onCategorySelect
}: NotesSidebarProps) {
  return (
    <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
      </div>
      
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">My Notes</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <NotesList
          activeNoteId={selectedNoteId}
          onNoteSelect={onNoteSelect}
          refreshKey={notesListRefreshKey}
          selectedCategories={selectedCategories}
        />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <CategoriesList
          categories={categories}
          selectedCategories={selectedCategories}
          onCategorySelect={onCategorySelect}
        />
      </div>
    </div>
  );
}