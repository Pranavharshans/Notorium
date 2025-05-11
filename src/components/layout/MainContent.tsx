"use client";

import React, { useState } from 'react';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { NewLectureView } from '@/components/features/lecture/NewLectureView';
import { useQuotaPopup } from '@/context/QuotaPopupContext'; // Import the hook
import { EnhanceQuotaExhaustedError } from '@/lib/quota-service'; // Import the error
import { NoteView } from '@/components/features/notes/NoteView';
import { Note } from '@/types/note';
import { notesService } from '@/lib/notes-service';
import { aiProviderService } from '@/lib/ai-provider-service';
import { EnhanceMode } from '@/lib/openrouter-service';
import { Timestamp } from 'firebase/firestore';

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
  user: { uid: string };
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
  const { showQuotaPopup } = useQuotaPopup(); // Use the hook

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      await notesService.updateNote(selectedNoteId!, {
        title: updatedNote.title,
        transcript: updatedNote.transcript,
        notes: updatedNote.notes,
        tags: updatedNote.tags,
        bookmarked: updatedNote.bookmarked,
        updatedAt: Timestamp.now(),
      });
      setSelectedNote({
        ...updatedNote,
        updatedAt: Timestamp.now(),
      });
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
        updatedAt: Timestamp.now()
      };

      await notesService.updateNote(selectedNoteId, {
        notes: enhancedNotes,
        updatedAt: Timestamp.now(),
      });
      setSelectedNote(updatedNote);
      setShowEnhanceOptions(false);
      refreshNotes();
    } catch (err) {
      if (err instanceof EnhanceQuotaExhaustedError) {
        showQuotaPopup('enhance'); // Show the specific popup
        setNotesError(null); // Clear any previous generic error
      } else {
        // Handle other errors
        setNotesError('Failed to enhance notes. Please try again.');
        console.error('Error enhancing notes:', err);
      }
    } finally {
      setEnhancing(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-950">
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onConfirm={async () => {
          try {
            await notesService.deleteNote(selectedNoteId!);
            // Fetch updated notes list
            const updatedNotes = await notesService.getNotes(user.uid);
            // If there are notes, select the most recent one
            if (updatedNotes.length > 0) {
              setSelectedNote(updatedNotes[0]);
            } else {
              setSelectedNote(null);
            }
            setCurrentView('notes');
            refreshNotes();
          } catch (err) {
            console.error("Failed to delete note:", err);
            setNotesError("Failed to delete note. Please try again.");
          } finally {
            setIsDeleteModalOpen(false);
          }
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
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
            onNoteSelect={(noteId, note) => {
              setSelectedNote(note);
              setGeneratedNotes(null);
              refreshNotes();
            }}
          />
        )}

        {currentView === 'notes' && (
          <NoteView
            note={selectedNote}
            isEditing={isEditing}
            isDeleting={isDeleting}
            notesError={notesError}
            showEnhanceOptions={showEnhanceOptions}
            enhancing={enhancing}
            onEdit={() => setIsEditing(true)}
            onDelete={() => {
              if (!selectedNoteId) return;
              setIsDeleteModalOpen(true);
            }}
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