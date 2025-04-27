"use client";

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { notesService } from '@/lib/notes-service';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow } from 'date-fns';

import { Timestamp } from 'firebase/firestore';

interface Note {
  id: string;
  title: string;
  transcript: string;
  notes: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number };
  updatedAt: Timestamp | { seconds: number; nanoseconds: number };
  tags?: string[];
  bookmarked?: boolean;
}

interface TranscriptDisplayProps {
  transcript: string;
}

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: (id: string, note: Note) => void;
}

function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const truncatedTranscript = transcript.slice(0, 100); // Reduced from 300

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1">Transcript</p>
      <p className="text-xs text-gray-600">
        {expanded ? transcript : truncatedTranscript}
        {!expanded && transcript.length > 100 && "..."} // Reduced from 300
      </p>
      {transcript.length > 100 && ( // Reduced from 300
        <button
          className="text-blue-500 text-xs hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
}

function NoteItem({ note, isActive, onClick }: NoteItemProps) {
  const title = note.title || 'Untitled Note';
  const excerpt = note.notes.split('\n')[0] || '';

  return (
    <div
      className={`p-3 rounded-lg mb-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
        isActive ? 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
      onClick={() => onClick(note.id, note)}
      style={{ height: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
    >
      <h3 className="font-medium text-sm mb-2 truncate">{note.title || 'Untitled Note'}</h3>
      <div className="flex justify-between items-center text-xs mb-3">
        <div className="flex flex-wrap items-center justify-between w-full">
          <div className="flex items-center gap-1 flex-wrap max-w-[70%]">
            {note.tags && note.tags.slice(0, 3).map(tag => {
              let hash = 0;
              for (let i = 0; i < tag.length; i++) {
                hash = tag.charCodeAt(i) + ((hash << 5) - hash);
              }
              const colorIndex = Math.abs(hash) % 10;
              const tagColors = [
                "bg-red-100 text-red-800",
                "bg-green-100 text-green-800",
                "bg-yellow-100 text-yellow-800",
                "bg-blue-100 text-blue-800",
                "bg-indigo-100 text-indigo-800",
                "bg-purple-100 text-purple-800",
                "bg-pink-100 text-pink-800",
                "bg-gray-100 text-gray-800",
                "bg-teal-100 text-teal-800",
                "bg-orange-100 text-orange-800",
              ];
              const tagColor = tagColors[colorIndex];

              return (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor} truncate max-w-[100px]`}>
                  {tag}
                </span>
              );
            })}
          </div>
          <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">
            {formatDistanceToNow(
              note.createdAt instanceof Timestamp
                ? note.createdAt.toDate()
                : new Date((note.createdAt as { seconds: number }).seconds * 1000),
              { addSuffix: true }
            )}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-6">{note.notes}</p>
      </div>
    </div>
  );
}

interface NotesListProps {
  activeNoteId: string | null;
  onNoteSelect: (noteId: string, note: Note) => void;
  refreshKey: number;
  selectedCategories: string[];
  bookmarkedOnly?: boolean;
}

export function NotesList({ activeNoteId, onNoteSelect, refreshKey, selectedCategories, bookmarkedOnly }: NotesListProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    let mounted = true;

    async function fetchNotes() {
      if (!user) return;

      try {
        const userNotes = await notesService.getNotes(user.uid);
        if (mounted) {
          setNotes(userNotes);
          setFilteredNotes(userNotes);
          setLoading(false);
          setError(null);

          // If there's an active note, ensure it's selected in the list
          if (activeNoteId) {
            const activeNote = userNotes.find(note => note.id === activeNoteId);
            if (activeNote && onNoteSelect) {
              onNoteSelect(activeNoteId, activeNote);
            }
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load notes');
          setLoading(false);
        }
      }
    }

    setLoading(true);
    fetchNotes();

    return () => {
      mounted = false;
    };
  }, [user, refreshKey]);

  useEffect(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        (note.title || 'Untitled Note').toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(note =>
        note.tags?.some(tag => selectedCategories.includes(tag))
      );
    }

    // Apply bookmark filter
    if (bookmarkedOnly) {
      filtered = filtered.filter(note => note.bookmarked === true);
    }

    setFilteredNotes(filtered);
  }, [searchQuery, notes, selectedCategories, bookmarkedOnly]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="w-full border-r border-gray-200 bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full border-r border-gray-200 bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Reduced top padding */}
      <div className="px-4 pt-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="flex justify-end px-3">
        <button className="text-gray-500 hover:text-gray-800">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        {filteredNotes.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">
            {notes.length === 0 ? "No notes yet" : "No matching notes found"}
          </p>
        ) : (
          filteredNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onClick={onNoteSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}