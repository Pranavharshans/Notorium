"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Sidebar, SidebarBody, useSidebar } from "@/components/ui/sidebar";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";

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

function NewLectureView() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">New Lecture</h2>
      <div className="max-w-2xl mx-auto">
        <div className="p-12 bg-white rounded-xl border border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">Record Live Lecture</h3>
            <p className="text-base text-gray-600 mb-8 max-w-lg mx-auto">
              Transform your lectures into comprehensive notes instantly with our AI-powered recording system.
            </p>
            <div className="text-sm bg-black/5 rounded-lg p-4 mb-8 inline-block">
              {isRecording ? (
                <span className="text-red-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
                  Recording in Progress
                </span>
              ) : (
                <span className="text-gray-600">
                  Click the microphone to start recording
                </span>
              )}
            </div>
          </div>
          
          <AIVoiceInput
            className="w-full scale-125 transform"
            onStart={() => {
              setIsRecording(true);
              console.log("Recording started");
            }}
            onStop={(duration: number) => {
              setIsRecording(false);
              setRecordingDuration(duration);
              console.log("Recording stopped after", duration, "seconds");
            }}
          />

          {recordingDuration > 0 && !isRecording && (
            <div className="text-center mt-8 space-y-6">
              <div className="bg-green-50 rounded-lg p-6 inline-block">
                <p className="text-base text-green-600 font-medium flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Recording complete! ({Math.round(recordingDuration)} seconds)
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Processing your lecture...
                  </p>
                  <div className="flex justify-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Our AI is analyzing your lecture and creating comprehensive notes. This may take a few minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState('home');

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
        <div className="max-w-5xl mx-auto">
          {currentView === 'new-lecture' && <NewLectureView />}
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
                  <p className="text-gray-600">Your processed lecture notes will appear here.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}