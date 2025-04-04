"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { User, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { NotesList } from "@/components/ui/notes-list";
import { EditNoteForm } from "@/components/ui/edit-note-form";
import { groqService, TranscriptionResult } from "@/lib/groq-service";
import { geminiService } from "@/lib/gemini-service";
import { notesService } from "@/lib/notes-service";
import Markdown from 'markdown-to-jsx';

const icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  upload: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  ),
  notes: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  signOut: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
};

function NavLink({ 
  icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { open, animate } = useSidebar();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-2 py-2 w-full text-left",
        "text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white",
        isActive && "bg-gray-100 dark:bg-gray-800"
      )}
    >
      {icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm whitespace-pre group-hover:translate-x-1 transition duration-150"
      >
        {label}
      </motion.span>
    </button>
  );
}

function UserProfile({ user }: { user: any }) {
  const { open } = useSidebar();

  return (
    <div className="flex items-center gap-4 px-2 py-4">
      <div className={`${!open ? "w-8 h-8" : "w-10 h-10"} transition-all duration-300`}>
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName || "User"} 
            className="w-full h-full rounded-full"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
            <User className={`${!open ? "w-4 h-4" : "w-6 h-6"} text-gray-500`} />
          </div>
        )}
      </div>
      <motion.div 
        className="flex-1 min-w-0"
        animate={{
          width: open ? "auto" : 0,
          opacity: open ? 1 : 0
        }}
      >
        <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </motion.div>
    </div>
  );
}

function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  const { open } = useSidebar();

  return (
    <button
      onClick={onSignOut}
      className="flex items-center gap-2 px-2 py-2 mt-auto text-red-600 hover:text-red-700 transition-colors"
    >
      {icons.signOut}
      <motion.span
        animate={{
          width: open ? "auto" : 0,
          opacity: open ? 1 : 0
        }}
      >
        Sign Out
      </motion.span>
    </button>
  );
}

function Navigation({ currentView, setCurrentView }: { currentView: string; setCurrentView: (view: string) => void }) {
  const links = [
    { label: "Home", id: "home", icon: icons.home },
    { label: "New Lecture", id: "new-lecture", icon: icons.upload },
    { label: "My Notes", id: "notes", icon: icons.notes },
  ];

  return (
    <nav className="flex-1 mt-4">
      {links.map((link) => (
        <NavLink 
          key={link.id}
          icon={link.icon}
          label={link.label}
          isActive={currentView === link.id}
          onClick={() => setCurrentView(link.id)}
        />
      ))}
    </nav>
  );
}
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
  const [notes, setNotes] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

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
    const generatedNotes = await geminiService.generateNotesFromTranscript(transcription.text);
    console.log("Generated notes:", generatedNotes);
    
    // Save to Firebase
    if (user?.uid) {
      await notesService.createNote({
        transcript: transcription.text,
        notes: generatedNotes,
        userId: user.uid,
      });
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
    <div className="flex flex-col items-center pt-16"> {/* Removed justify-center h-full, added pt-16 */}
      <div className="w-full max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Record Live Lecture</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Transform your lectures into comprehensive notes instantly with our AI-powered recording system.
        </p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-12">
          <AIVoiceInput
            className="w-full scale-125 transform"
            onStart={handleRecordingStart}
            onStop={handleRecordingStop}
          />
        </div>

        {isProcessing && (
          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-3 bg-blue-50 rounded-lg">
              <p className="text-blue-600 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                Processing your lecture recording...
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Our AI is analyzing your lecture. This may take a few minutes.
            </p>
          </div>
        )}

        {transcription && (
          <div className="mt-8 text-left w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Lecture Transcription</h3>
              <button
                onClick={handleCopyToClipboard}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {transcription.text}
                </p>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">
                  Your transcription is ready. Would you like to view it in your notes?
                </p>
                <button 
                  onClick={() => setCurrentView('notes')} 
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View in Notes →
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateNotes}
                  className="text-green-600 hover:text-green-700 text-sm font-semibold"
                >
                  Generate Notes
                </button>
              </div>
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
  const [currentView, setCurrentView] = useState('new-lecture');
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<{transcript: string; notes: string; tags?: string[]} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notesListRefreshKey, setNotesListRefreshKey] = useState(0); // State to trigger list refresh
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false); // State for transcript expansion

  // Auth redirect effect
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Note content fetch effect
  useEffect(() => {
    async function fetchNoteContent() {
      if (!selectedNoteId || !user) {
        setSelectedNote(null);
        return;
      }

      try {
        // Get all notes and find the selected one
        const notes = await notesService.getNotes(user.uid);
        const note = notes.find(n => n.id === selectedNoteId);
        if (note) {
          setSelectedNote({
            transcript: note.transcript,
            notes: note.notes,
            tags: note.tags
          });
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        setNotesError('Failed to load note content');
      }
    }
  

    fetchNoteContent();
  }, [selectedNoteId, user]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar>
        <SidebarBody>
          <div className="flex flex-col h-full">
            <UserProfile user={user} />
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <SignOutButton onSignOut={signOutUser} />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Notes List Column */}
      <NotesList
        activeNoteId={selectedNoteId}
        onNoteSelect={(noteId) => {
          setSelectedNoteId(noteId);
          setGeneratedNotes(null); // Clear generated notes when selecting a saved note
          setCurrentView('notes');
        }}
        refreshKey={notesListRefreshKey} // Pass the refresh key
      />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Removed max-w-5xl and mx-auto to allow full width */}
        <div className="h-full">
          {currentView === 'new-lecture' && (
            <NewLectureView
              setCurrentView={setCurrentView}
              setGeneratedNotes={setGeneratedNotes}
              user={user}
            />
          )}
          {currentView === 'notes' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Notes</h2>
                <button
                  onClick={() => setCurrentView('new-lecture')}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  {icons.upload}
                  <span>New Lecture</span>
                </button>
              </div>

              {notesError && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {notesError}
                </div>
              )}

              {(selectedNote || generatedNotes) ? (
                <div className="space-y-8">
                  {selectedNote && !isEditing && (
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        {/* Main Content Area (Notes first, then Transcript) */}
                        <div className="flex-1 space-y-6">
                          {/* Notes Section */}
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Notes</h3>
                            <div className="bg-white border rounded-lg p-6 prose prose-slate max-w-none">
                              <Markdown options={{
                                overrides: {
                                  h1: {
                                    props: {
                                      className: 'text-3xl font-bold mt-6 mb-4'
                                    }
                                  },
                                  h2: {
                                    props: {
                                      className: 'text-2xl font-bold mt-5 mb-3'
                                    }
                                  },
                                  h3: {
                                    props: {
                                      className: 'text-xl font-bold mt-4 mb-2'
                                    }
                                  }
                                }
                              }}>
                                {selectedNote.notes}
                              </Markdown>
                            </div>
                          </div>

                          {/* Transcript Section */}
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Transcript</h3>
                            <div className="bg-gray-50 border rounded-lg p-4">
                              <p className="text-gray-600 whitespace-pre-wrap">
                                {isTranscriptExpanded
                                  ? selectedNote.transcript
                                  : `${selectedNote.transcript.substring(0, 300)}${selectedNote.transcript.length > 300 ? '...' : ''}`}
                              </p>
                              {selectedNote.transcript.length > 300 && (
                                <button
                                  onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                                  className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                                >
                                  {isTranscriptExpanded ? "See Less" : "See More"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons (Edit/Delete) */}
                        <div className="flex flex-col items-end gap-3 ml-4"> {/* Changed to flex-col and added ml-4 */}
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm" // Added text-sm
                          >
                            <Pencil size={14} /> {/* Adjusted size */}
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setIsDeleting(true)}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm" // Added text-sm
                          >
                            <Trash2 size={14} /> {/* Adjusted size */}
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedNote && isEditing && selectedNoteId && (
                    <EditNoteForm
                      noteId={selectedNoteId}
                      initialTranscript={selectedNote.transcript}
                      initialNotes={selectedNote.notes}
                      initialTags={selectedNote.tags || []}
                      onSave={() => {
                        setIsEditing(false);
                        // Refresh the note content
                        const noteId = selectedNoteId;
                        setSelectedNoteId(null); // Clear ID to trigger re-fetch
                        setTimeout(() => {
                          setSelectedNoteId(noteId); // Set ID back to trigger re-fetch
                        }, 0);
                        setNotesListRefreshKey(prev => prev + 1); // Trigger list refresh
                      }}
                      onCancel={() => setIsEditing(false)}
                    />
                  )}
                  
                  {generatedNotes && !selectedNote && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Recently Generated Notes</h3>
                      <div className="bg-white border rounded-lg p-6 prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 prose-a:text-blue-600" style={{ whiteSpace: "pre-wrap" }}>
                        <>
                          {useEffect(() => {
                            const html = document.querySelector('.prose')?.innerHTML;
                            console.log('Generated HTML:', html);
                          }, [generatedNotes])}
                          <Markdown>
                            {generatedNotes}
                          </Markdown>
                        </>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  Select a note from the sidebar to view its content or create a new one
                </div>
              )}

              {/* Delete Confirmation Dialog */}
              {isDeleting && selectedNoteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Delete Note</h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this note? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setIsDeleting(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await notesService.deleteNote(selectedNoteId);
                            setIsDeleting(false);
                            setSelectedNoteId(null);
                            setSelectedNote(null);
                            setNotesListRefreshKey(prev => prev + 1); // Trigger list refresh
                          } catch (err) {
                            console.error('Error deleting note:', err);
                            setNotesError('Failed to delete note');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {currentView === 'home' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Recent Lectures</h3>
                  <p className="text-gray-600">Your recorded lectures will appear here.</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                  <button
                    onClick={() => setCurrentView('new-lecture')}
                    className="mt-2 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    {icons.upload}
                    <span>Record New Lecture</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}