"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { groqService, TranscriptionResult } from "@/lib/groq-service";
import { GoogleGenAI } from "@google/genai";

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
  generatedNotes,
  setGeneratedNotes
}: { 
  setCurrentView: (view: string) => void;
  generatedNotes: string | null;
  setGeneratedNotes: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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
    setGeneratedNotes(null);

    try {
      const result = await groqService.transcribeAudio(audioBlob);
      setTranscription(result);

      // Generate notes using Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: result.text,
        config: {
          systemInstruction: "You are a helpful lecture assistant. Summarize the key points from this lecture in clear, concise notes.",
        },
      });
      setGeneratedNotes(response.text || "No notes generated");
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

  return (
    <div className="flex flex-col items-center pt-16">
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
              
              <button
                onClick={() => setCurrentView('notes')}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Generate Notes
              </button>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mt-4">
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

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

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

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto h-full">
          {currentView === 'new-lecture' && (
            <NewLectureView 
              setCurrentView={setCurrentView}
              generatedNotes={generatedNotes}
              setGeneratedNotes={setGeneratedNotes}
            />
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
          {currentView === 'notes' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Notes</h2>
              <div className="grid gap-6">
                <div className="p-6 bg-white rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Generated Notes</h3>
                  {generatedNotes ? (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{generatedNotes}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600">No notes generated yet. Record a lecture first.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
