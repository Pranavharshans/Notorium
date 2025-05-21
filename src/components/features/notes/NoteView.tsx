"use client";

import React from 'react';
import { Pencil, Trash2, Download } from "lucide-react";
// import { cn } from "@/lib/utils";
import { EditNoteForm } from "@/components/ui/edit-note-form";
import { NoteDisplay } from "@/components/ui/note-display";
import { Note } from '@/types/note';
import { EnhanceMode } from "@/lib/openrouter-service";

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

  const handlePrint = () => {
    window.print();
  };
  
  // Function to generate consistent tag colors
  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % 10;
    const tagColors = [
      "bg-red-100 text-red-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-blue-100 text-blue-800",
      "bg-indigo-100 text-indigo-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-gray-100 text-gray-800",
      "bg-teal-100 text-teal-800",
      "bg-orange-100 text-orange-800",
    ];
    return tagColors[colorIndex];
  };

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
          <div className="flex justify-between items-start mb-6 no-print">
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
                  <button
                    onClick={handlePrint}
                    className="p-2 text-gray-500 hover:bg-gray-100"
                    title="Download as PDF"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              {/* Display tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  {note.tags.map(tag => (
                    <span 
                      key={tag} 
                      className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="note-content-for-print">
            <NoteDisplay
              content={`# ${note.title}\n\n${note.notes}`}
              onEnhance={onEnhance}
              isEnhancing={enhancing}
              showEnhanceOptions={true}
            />
          </div>
        </>
      )}

      {notesError && !isDeleting && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg no-print">
          {notesError}
        </div>
      )}
    </div>
  );
}