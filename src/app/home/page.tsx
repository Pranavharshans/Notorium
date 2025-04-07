"use client";

import React, { useEffect, useState } from "react";

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
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { User, Plus, Pencil, Trash2, Wand2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { NotesList } from "@/components/ui/notes-list";
import CategoriesList from "@/components/ui/categories-list";
import { EditNoteForm } from "@/components/ui/edit-note-form";
import { NoteDisplay } from "@/components/ui/note-display";
import { groqService, TranscriptionResult } from "@/lib/groq-service";
import { EnhanceMode } from "@/lib/gemini-service";
import { aiProviderService, AIProvider } from "@/lib/ai-provider-service";
import { notesService } from "@/lib/notes-service";
import Markdown from 'markdown-to-jsx';

import {
  Home,
  Upload,
  Book,
  LogOut,
  Bookmark,
  HelpCircle,
  Settings,
} from "lucide-react";

// Icons definition remains the same
const icons = {
  home: <Home width={20} height={20} />,
  upload: <Upload width={20} height={20} />,
  notes: <Book width={20} height={20} />,
  signOut: <LogOut width={20} height={20} />,
  bookmarkIcon: <Bookmark width={20} height={20} />,
  helpIcon: <HelpCircle width={20} height={20} />,
  settingsIcon: <Settings width={20} height={20} />,
};

function NewLectureView({
  setCurrentView,
  setGeneratedNotes,
  user
}: {
  setCurrentView: (view: string) => void;
  setGeneratedNotes: (notes: string | null) => void;
  user: any;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('gemini');

  const handleRecordingStart = () => {
    setIsRecording(true);
    setError(null);
    setTranscription(null);
    setCopySuccess(false);
  };

  const handleRecordingStop = async (duration: number, audioBlob: Blob) => {
    setRecordingDuration(duration);
    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      const result = await groqService.transcribeAudio(audioBlob);
      setTranscription(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process the recording. Please try again.";
      setError(errorMessage);
      console.error("Transcription error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (transcription?.text) {
      navigator.clipboard.writeText(transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleGenerateNotes = async () => {
    if (!transcription?.text) {
      console.log("No transcription available for generating notes");
      return;
    }
    setNotesLoading(true);
    setNotesError(null);
    try {
      console.log("Generating notes with transcript:", transcription.text);
      aiProviderService.setProvider(provider);
      const generatedNotes = await aiProviderService.generateNotesFromTranscript(transcription.text);
      console.log("Generated notes:", generatedNotes);
      
      if (user?.uid) {
        await notesService.createNote({
          transcript: transcription.text,
          notes: generatedNotes,
          userId: user.uid,
          tags: ['lecture', 'generated'] 
        });
      } else {
        console.error("Cannot save note: User not logged in.");
      }
      
      setGeneratedNotes(generatedNotes);
      setCurrentView('notes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate notes";
      console.error("Error generating notes:", errorMessage);
      setNotesError(errorMessage);
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 md:pt-12"> 
      <div className="w-full max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Record Live Lecture</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Transform your lectures into comprehensive notes instantly with our AI-powered recording system.
        </p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-12">
          <AIVoiceInput
            className="w-full scale-110 md:scale-125 transform"
            onStart={handleRecordingStart}
            onStop={handleRecordingStop}
          />
        </div>

        {isProcessing && (
          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-blue-600 dark:text-blue-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                Processing your lecture recording...
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our AI is analyzing your lecture. This may take a few minutes.
            </p>
          </div>
        )}

        {transcription && (
          <div className="mt-8 text-left w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lecture Transcription</h3>
              <button
                onClick={handleCopyToClipboard}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {transcription.text}
              </p>
              
              <div className="mt-4 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newProvider = provider === 'gemini' ? 'groq' : 'gemini';
                      setProvider(newProvider);
                      aiProviderService.setProvider(newProvider);
                    }}
                    className="px-4 py-2 rounded text-sm flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={notesLoading}
                  >
                    <RefreshCw size={16} />
                    {provider === 'gemini' ? 'Using Gemini' : 'Using Groq'}
                  </button>

                  <button
                    onClick={handleGenerateNotes}
                    disabled={notesLoading}
                    className={cn(
                      "px-4 py-2 rounded text-sm font-semibold flex items-center gap-2",
                      "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {notesLoading ? (
                       <>
                         <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                         Generating...
                       </>
                    ) : (
                       "Generate & Save Notes"
                    )}
                  </button>
                </div>
              </div>
               {notesError && (
                 <p className="text-sm text-red-600 dark:text-red-400 mt-2">{notesError}</p>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('notes');
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [notesError, setNotesError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<{ id: string; transcript: string; notes: string; title?: string; tags?: string[]; createdAt?: any } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notesListRefreshKey, setNotesListRefreshKey] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category) // Remove if already selected
        : [...prev, category] // Add if not selected
    );
  };

  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  const handleEnhance = async (mode: EnhanceMode) => {
    if (!selectedNote?.notes || !selectedNoteId) return; 
    
    setEnhancing(true);
    setNotesError(null);
    
    try {
      aiProviderService.setProvider(provider);
      const enhancedNotes = await aiProviderService.enhanceNotes(selectedNote.notes, mode);
      
      await notesService.updateNote(selectedNoteId, {
        ...selectedNote,
        notes: enhancedNotes
      });
      
      setSelectedNote(prevNote => prevNote ? { ...prevNote, notes: enhancedNotes } : null);
      
      setShowEnhanceOptions(false);
    } catch (err) {
      setNotesError('Failed to enhance notes. Please try again.');
      console.error('Error enhancing notes:', err);
    } finally {
      setEnhancing(false);
    }
  };

  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchNotesAndCategories() {
      if (!user?.uid) {
        return;
      }

      try {
        const notes = await notesService.getNotes(user.uid);

        // Calculate category counts
        const categoryCounts: { [key: string]: number } = {};
        notes.forEach(note => {
          if (note.tags) {
            note.tags.forEach(tag => {
              categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
            });
          }
        });

        // Convert category counts to array format
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

  if (user === undefined) {
     return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  if (!user) return null;

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
      setNotesListRefreshKey(prev => prev + 1);
      setNotesError(null);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setNotesError("Failed to delete note. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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

      <div className="w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        </div>
        
        <div className="p-4 flex justify-between items-center">
           <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">My Notes</h3>
        </div>

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
    </div>
  );
}
