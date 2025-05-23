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
// import { aiProviderService, AIProvider } from "@/lib/ai-provider-service"; // Conted out AIProvider - @typescript-eslint/no-unused-va
import { aiProviderService } from "@/lib/ai-provider-service";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const { subscriptionData, loading: subscriptionLoading, isSubscriptionActive } = useSubscription();

  // State
  const [currentView, setCurrentView] = useState('notes');
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  // const [provider, setProvider] = useState<AIProvider>('gemini'); // Commented out - @typescript-eslint/no-unused-vars. setProvider was also unused.
  const [notesError, setNotesError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notesListRefreshKey, setNotesListRefreshKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  // const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false); // Commented out - @typescript-eslint/no-unused-vars. setIsTranscriptExpanded was also unused.
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

  const handleDeleteNote = async () => {
    if (!selectedNoteId) {
      console.error("Cannot delete: selectedNoteId is null.");
      setNotesError("Could not delete note: ID missing.");
      setIsDeleting(false);
      return;
    }

    try {
      await notesService.deleteNote(selectedNoteId);
      setSelectedNoteId(null);
      setSelectedNote(null);
      setIsDeleting(false);
      refreshNotes();
      setNotesError(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setNotesError("Failed to delete note. Please try again.");
      setIsDeleting(false);
    }
  };

  const refreshNotes = () => {
    console.log("HomePage - refreshNotes called, current key:", notesListRefreshKey);
    setNotesListRefreshKey(prev => {
      const newKey = prev + 1;
      console.log("HomePage - Setting new refresh key:", newKey);
      return newKey;
    });
  };

  // Combined loading state
  const isLoading = subscriptionLoading || user === undefined;

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) return null;

  return (
    <ClientLayout>
      <div className="relative">
        {/* Upgrade to Pro button in top right - only show if not active */}
        {!isSubscriptionActive && (
          <div className="absolute top-4 right-4 z-10">
            <Link href="/pricing">
              <button className="group flex items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm py-1.5 px-3 rounded-lg shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-indigo-700 hover:bg-gradient-to-br transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ease-in-out" />
                Upgrade to Pro
              </button>
            </Link>
          </div>
        )}
        
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
              console.log('[HomePage] onNoteSelect', noteId, note);
              if (noteId !== selectedNoteId) {
                setIsEditing(false);
              }
              setSelectedNoteId(noteId);
              setSelectedNote(note);
              setGeneratedNotes(null);
              setCurrentView('notes');
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
            setNotesError={setNotesError}
            setShowEnhanceOptions={setShowEnhanceOptions}
            setEnhancing={setEnhancing}
            refreshNotes={refreshNotes}
            user={user as { uid: string }}
          />
        </div>
      </div>
    </ClientLayout>
  );
}
