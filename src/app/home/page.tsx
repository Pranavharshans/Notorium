"use client";

import React, { useEffect, useState } from "react";
<<<<<<< HEAD

interface Note {
  id: string;
  transcript: string;
  notes: string;
  createdAt: any;
  updatedAt: any;
  tags?: string[];
  title?: string;
  bookmarked?: boolean;
}
=======
>>>>>>> 015489e937a614064d045fe8837058b8574770e3
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Note } from "@/types/note";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotesSidebar } from "@/components/layout/NotesSidebar";
import { MainContent } from "@/components/layout/MainContent";
import { notesService } from "@/lib/notes-service";
import { aiProviderService, AIProvider } from "@/lib/ai-provider-service";

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  // State
  const [currentView, setCurrentView] = useState('notes');
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [notesError, setNotesError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notesListRefreshKey, setNotesListRefreshKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
<<<<<<< HEAD
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category) // Remove if already selected
        : [...prev, category] // Add if not selected
    );
  };

=======
>>>>>>> 015489e937a614064d045fe8837058b8574770e3
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  // Authentication check
  useEffect(() => {
    if (user === null) {
      router.push("/");
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
    setNotesListRefreshKey(prev => prev + 1);
  };

  if (user === undefined) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
<<<<<<< HEAD
      <div className="w-20 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="mb-6">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full"/>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
            </div>
          )}
        </div>
        
        <nav className="flex flex-col items-center space-y-4">
           <button 
             onClick={() => { setCurrentView('new-lecture'); setSelectedNoteId(null); }}
             title="New Lecture"
             className={`p-2 rounded ${currentView === 'new-lecture' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             <Plus size={20}/>
           </button>
           <button 
             onClick={() => setCurrentView('notes')} 
             title="My Notes"
             className={`p-2 rounded ${currentView === 'notes' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
           >
             {icons.notes}
           </button>
           <button title="Bookmarks" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
             {icons.bookmarkIcon}
           </button>
           <button onClick={() => setBookmarkedOnly(!bookmarkedOnly)} title="Bookmarks" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
             {icons.bookmarkIcon}
           </button>
         </nav>
         
         <div className="mt-auto flex flex-col items-center space-y-4">
            <button title="Help" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
              {icons.helpIcon}
            </button>
            <button title="Settings" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
              {icons.settingsIcon}
            </button>
           <button onClick={signOutUser} title="Sign Out" className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded">
             {icons.signOut}
           </button>
        </div>
      </div>
=======
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view === 'new-lecture') setSelectedNoteId(null);
        }}
        onSignOut={signOutUser}
      />
>>>>>>> 015489e937a614064d045fe8837058b8574770e3

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

<<<<<<< HEAD
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <NotesList
            activeNoteId={selectedNoteId}
            onNoteSelect={(noteId, note) => {
              setSelectedNoteId(noteId);
              setSelectedNote(note);
              setGeneratedNotes(null);
              setCurrentView('notes');
              setIsEditing(false);
            }}
            refreshKey={notesListRefreshKey}
            selectedCategories={selectedCategories}
            bookmarkedOnly={bookmarkedOnly}
          />
        </div>
        <div className="p-4">
          <CategoriesList
            categories={categories}
            selectedCategories={selectedCategories}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>

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
          
          {currentView === 'notes' && (
            <div className="space-y-6">
              {selectedNoteId && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                  {selectedNote && isEditing ? (
                    <EditNoteForm
                      note={selectedNote}
                      onCancel={() => setIsEditing(false)}
                      onSave={async (updatedNote: { id: string; transcript: string; notes: string; tags: string[] }) => {
                        try {
                          await notesService.updateNote(selectedNoteId, updatedNote);
                          setSelectedNote(updatedNote);
                          setIsEditing(false);
                        } catch (err) {
                          console.error("Failed to update note:", err);
                          setNotesError("Failed to update note. Please try again.");
                        }
                      }}
                    />
                  ) : selectedNote ? (
                    <>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                              {selectedNote.title || "Untitled Note"}
                            </h2>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setIsDeleting(true)}
                                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (selectedNoteId) {
                                    await notesService.toggleBookmarkStatus(selectedNoteId);
                                    // Refresh the selected note to reflect the change
                                    const updatedNote = await notesService.getNotes(user.uid).then(notes => notes.find(note => note.id === selectedNoteId));
                                    if (updatedNote) {
                                      setSelectedNote(updatedNote);
                                    }
                                  }
                                }}
                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              >
                                <Bookmark size={16} />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setShowEnhanceOptions(!showEnhanceOptions)}
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
                                    <button onClick={() => handleEnhance('shorter')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Summarize</button>
                                    <button onClick={() => handleEnhance('detailed')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Expand</button>
                                    <button onClick={() => handleEnhance('simpler')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Simplify</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="prose dark:prose-invert max-w-none">
                        <button
                          onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                          className="w-full text-left mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Transcript</h3>
                            <span className="text-gray-500">{isTranscriptExpanded ? "Hide" : "Show"}</span>
                          </div>
                          {isTranscriptExpanded && (
                            <div className="mt-4 text-gray-600 dark:text-gray-300">
                              {selectedNote.transcript}
                            </div>
                          )}
                        </button>

                        <div className="mt-6">
                          <Markdown>{selectedNote.notes}</Markdown>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
=======
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
        user={user}
      />
>>>>>>> 015489e937a614064d045fe8837058b8574770e3
    </div>
  );
}
