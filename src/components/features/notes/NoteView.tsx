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
    <div className="bg-white rounded-lg p-4 border border-gray-200">
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {note.title || "Untitled Note"}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <NoteDisplay
              content={`# ${note.title}\n\n${note.notes}`}
              onEnhance={onEnhance}
              isEnhancing={enhancing}
            />
          </div>
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