"use client";

import React from 'react';
import { Pencil, Trash2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditNoteForm } from "@/components/ui/edit-note-form";
import { NoteDisplay } from "@/components/ui/note-display";
import { Note } from '@/types/note';
import { EnhanceMode } from "@/lib/gemini-service";

interface NoteViewProps {
  note: Note | null;
  isEditing: boolean;
  isDeleting: boolean;
  notesError: string | null;
  showEnhanceOptions: boolean;
  enhancing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (updatedNote: Note) => Promise<void>;
  onCancelEdit: () => void;
  onEnhance: (mode: EnhanceMode) => Promise<void>;
  onToggleEnhanceOptions: () => void;
}

export function NoteView({
  note,
  isEditing,
  isDeleting,
  notesError,
  showEnhanceOptions,
  enhancing,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onEnhance,
  onToggleEnhanceOptions,
}: NoteViewProps) {
  if (!note) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      {isEditing ? (
        <EditNoteForm
          note={note}
          onCancel={onCancelEdit}
          onSave={onSave}
        />
      ) : (
        <>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {note.title || "Untitled Note"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={onToggleEnhanceOptions}
                      disabled={enhancing}
                      className={cn(
                        "p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400",
                        enhancing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Wand2 size={16} />
                    </button>
                    {showEnhanceOptions && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-20">
                        <button 
                          onClick={() => onEnhance('shorter')} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Summarize
                        </button>
                        <button 
                          onClick={() => onEnhance('detailed')} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Expand
                        </button>
                        <button 
                          onClick={() => onEnhance('simpler')} 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Simplify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <NoteDisplay
            content={note.notes}
            onEnhance={onEnhance}
            isEnhancing={enhancing}
          />
        </>
      )}

      {notesError && !isDeleting && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {notesError}
        </div>
      )}
    </div>
  );
}