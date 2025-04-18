"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Note } from "@/types/note";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotesSidebar } from "@/components/layout/NotesSidebar";
import { MainContent } from "@/components/layout/MainContent";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { notesService } from "@/lib/notes-service";
import { aiProviderService } from "@/lib/ai-provider-service";

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  // State
  const [currentView, setCurrentView] = useState('notes');
  const [_, setGeneratedNotes] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notesListRefreshKey, setNotesListRefreshKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  // Authentication check
  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user) {
      // Initialize services with user ID
      aiProviderService.setUserId(user.uid);
    }
  }, [user, router]);

  // Fetch categories
  useEffect(() => {
    async function fetchNotesAndCategories() {
      if (!user?.uid) return;

      try {
        const notes = await notesService.getNotes(user.uid);
        const categoryCounts: { [key: string]: number } = {};
        
        notes.forEach(note => {
          if (note.tags) {
            note.tags.forEach(tag => {
              categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
            });
          }
        });

        const categoriesArray = Object.keys(categoryCounts).map(name => ({
          name,
          count: categoryCounts[name]
        }));

        setCategories(categoriesArray);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        setNotesError("Failed to load notes.");
      }
    }

    fetchNotesAndCategories();
  }, [user?.uid]);

  // Handlers
  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const refreshNotes = () => {
    setNotesListRefreshKey(prev => prev + 1);
  };

  if (user === undefined) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) return null;

  return (
    <ClientLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 divide-x divide-gray-200 dark:divide-gray-700">
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'new-lecture') setSelectedNoteId(null);
          }}
          onSignOut={signOutUser}
        />

        <NotesSidebar
          selectedNoteId={selectedNoteId}
          onNoteSelect={(noteId, note) => {
            setSelectedNoteId(noteId);
            setSelectedNote(note);
            setGeneratedNotes(null);
            setCurrentView('notes');
            setIsEditing(false);
          }}
          notesListRefreshKey={notesListRefreshKey}
          selectedCategories={selectedCategories}
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />

        <MainContent
          currentView={currentView}
          selectedNote={selectedNote}
          selectedNoteId={selectedNoteId}
          isEditing={isEditing}
          isDeleting={isDeleting}
          notesError={notesError}
          showEnhanceOptions={showEnhanceOptions}
          enhancing={enhancing}
          setCurrentView={setCurrentView}
          setGeneratedNotes={setGeneratedNotes}
          setSelectedNote={setSelectedNote}
          setIsEditing={setIsEditing}
          setIsDeleting={setIsDeleting}
          setNotesError={setNotesError}
          setShowEnhanceOptions={setShowEnhanceOptions}
          setEnhancing={setEnhancing}
          refreshNotes={refreshNotes}
          user={user}
        />
      </div>
    </ClientLayout>
  );
}
