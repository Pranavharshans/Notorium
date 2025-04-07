"use client";

import React from 'react';
import { NewLectureView } from '@/components/features/lecture/NewLectureView';
import { NoteView } from '@/components/features/notes/NoteView';
import { Note } from '@/types/note';
import { notesService } from '@/lib/notes-service';
import { aiProviderService } from '@/lib/ai-provider-service';
import { EnhanceMode } from '@/lib/gemini-service';

interface MainContentProps {
  currentView: string;
  selectedNote: Note | null;
  selectedNoteId: string | null;
  isEditing: boolean;
  isDeleting: boolean;
  notesError: string | null;
  showEnhanceOptions: boolean;
  enhancing: boolean;
  setCurrentView: (view: string) => void;
  setGeneratedNotes: (notes: string | null) => void;
  setSelectedNote: (note: Note | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  setNotesError: (error: string | null) => void;
  setShowEnhanceOptions: (show: boolean) => void;
  setEnhancing: (enhancing: boolean) => void;
  refreshNotes: () => void;
  user: any; // TODO: Type this properly
}

export function MainContent({
  currentView,
  selectedNote,
  selectedNoteId,
  isEditing,
  isDeleting,
  notesError,
  showEnhanceOptions,
  enhancing,
  setCurrentView,
  setGeneratedNotes,
  setSelectedNote,
  setIsEditing,
  setNotesError,
  setShowEnhanceOptions,
  setEnhancing,
  refreshNotes,
  user
}: MainContentProps) {
  const handleSaveNote = async (updatedNote: Note) => {
    try {
      await notesService.updateNote(selectedNoteId!, updatedNote);
      setSelectedNote(updatedNote);
      setIsEditing(false);
      refreshNotes();
    } catch (err) {
      console.error("Failed to update note:", err);
      setNotesError("Failed to update note. Please try again.");
    }
  };

  const handleEnhance = async (mode: EnhanceMode) => {
    if (!selectedNote?.notes || !selectedNoteId) return;

    setEnhancing(true);
    setNotesError(null);

    try {
      const enhancedNotes = await aiProviderService.enhanceNotes(selectedNote.notes, mode);

      const updatedNote: Note = {
        ...selectedNote,
        notes: enhancedNotes,
        updatedAt: new Date()
      };

      await notesService.updateNote(selectedNoteId, updatedNote);
      setSelectedNote(updatedNote);
      setShowEnhanceOptions(false);
      refreshNotes();
    } catch (err) {
      setNotesError('Failed to enhance notes. Please try again.');
      console.error('Error enhancing notes:', err);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-950">
      <div className="h-full max-w-none">
        {notesError && !isDeleting && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {notesError}
          </div>
        )}

        {currentView === 'new-lecture' && (
          <NewLectureView
            setCurrentView={setCurrentView}
            setGeneratedNotes={setGeneratedNotes}
            user={user}
          />
        )}

        {currentView === 'notes' && selectedNoteId && (
          <NoteView
            note={selectedNote}
            isEditing={isEditing}
            isDeleting={isDeleting}
            notesError={notesError}
            showEnhanceOptions={showEnhanceOptions}
            enhancing={enhancing}
            onEdit={() => setIsEditing(true)}
            onDelete={() => {}} // TODO: Implement delete handler
            onSave={handleSaveNote}
            onCancelEdit={() => setIsEditing(false)}
            onEnhance={handleEnhance}
            onToggleEnhanceOptions={() => setShowEnhanceOptions(!showEnhanceOptions)}
          />
        )}
      </div>
    </main>
  );
}