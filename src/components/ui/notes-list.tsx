"use client";

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { notesService } from '@/lib/notes-service';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  transcript: string;
  notes: string;
  createdAt: any;
  updatedAt: any;
  tags?: string[];
}

interface TranscriptDisplayProps {
  transcript: string;
}

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: (id: string) => void;
}

function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const truncatedTranscript = transcript.slice(0, 300); // Show first 300 characters instead of 100

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1">Transcript</p>
      <p className="text-xs text-gray-600">
        {expanded ? transcript : truncatedTranscript}
        {!expanded && transcript.length > 300 && "..."}
      </p>
      {transcript.length > 300 && (
        <button
          className="text-blue-500 text-xs hover:underline"
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from bubbling to parent
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
  // Get first line as title, rest as excerpt
  const lines = note.notes.split('\n');
  const title = lines[0] || 'Untitled Note';
  const excerpt = lines.slice(1).join('\n').trim();

  return (
    <div
      className={`p-4 border rounded-lg mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 ${isActive ? 'border-blue-500 bg-white' : 'border-gray-200 bg-white'}`}
      onClick={() => onClick(note.id)}
    >
      <h3 className="font-semibold text-sm mb-2 truncate">{title}</h3>
      {/* Notes section */}
      <div className="mb-2">
        <p className="text-xs text-gray-600 line-clamp-2">{excerpt}</p>
      </div>
      {/* Transcript section */}
      {note.transcript && <TranscriptDisplay transcript={note.transcript} />}
      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-1">
          {note.tags && note.tags.map(tag => {
            // Simple hash function to generate a color
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
              <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagColor}`}>
                {tag}
              </span>
            );
          })}
        </div>
        <span>{formatDistanceToNow(note.createdAt?.toDate() || new Date(), { addSuffix: true })}</span>
      </div>
    </div >
  );
}

interface NotesListProps {
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
  refreshKey: number;
}

export function NotesList({ activeNoteId, onNoteSelect, refreshKey }: NotesListProps) {
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
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(note => {
      const firstLine = note.notes.split('\n')[0] || '';
      return firstLine.toLowerCase().includes(query);
    });
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
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
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase text-gray-500">My Notes</h2>
        <button className="text-gray-500 hover:text-gray-800">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
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