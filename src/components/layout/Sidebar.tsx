"use client";

import React from 'react';
import { User, Plus, Book, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onSignOut: () => void;
}

const icons = {
  home: <Book width={20} height={20} />,
  upload: <Plus width={20} height={20} />,
  notes: <Book width={20} height={20} />,
  signOut: <LogOut width={20} height={20} />,
  bookmarkIcon: <Bookmark width={20} height={20} />
};

export function Sidebar({ currentView, onViewChange, onSignOut }: SidebarProps) {
  const { user } = useAuth();
  // const router = useRouter();

  return (
    <div className="w-20 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
      <div className="mb-6">
        <Link href="/profile" className="block hover:opacity-80 transition-opacity">
          {user?.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || "User"} 
              width={32} 
              height={32} 
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500 dark:text-gray-400"/>
            </div>
          )}
        </Link>
      </div>
      
      <nav className="flex flex-col items-center space-y-4">
        <button 
          onClick={() => { onViewChange('new-lecture'); }}
          title="New Lecture"
          className={`p-2 rounded ${currentView === 'new-lecture' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <Plus size={20}/>
        </button>
        <button 
          onClick={() => onViewChange('notes')}
          title="My Notes"
          className={`p-2 rounded ${currentView === 'notes' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          {icons.notes}
        </button>
        {/* Bookmark icon hidden temporarily 
        <button 
          title="Bookmarks" 
          className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
        >
          {icons.bookmarkIcon}
        </button>
        */}
      </nav>
      
      <div className="mt-auto flex flex-col items-center space-y-4">
        <button
          onClick={onSignOut}
          title="Sign Out"
          className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 p-2 rounded"
        >
          {icons.signOut}
        </button>
      </div>
    </div>
  );
}