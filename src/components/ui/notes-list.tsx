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
}

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: (id: string) => void;
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
      <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{excerpt || note.transcript}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {note.transcript ? 'Lecture' : 'Note'}
        </span>
        <span>{formatDistanceToNow(note.createdAt?.toDate() || new Date(), { addSuffix: true })}</span>
      </div>
    </div>
  );
}

interface NotesListProps {
  activeNoteId: string | null;
  onNoteSelect: (noteId: string) => void;
}

export function NotesList({ activeNoteId, onNoteSelect }: NotesListProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchNotes() {
      if (!user) return;
      
      try {
        const userNotes = await notesService.getNotes(user.uid);
        if (mounted) {
          setNotes(userNotes);
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
  }, [user]);

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
        <input
          type="text"
          placeholder="Search notes"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase text-gray-500">My Notes</h2>
        <button className="text-gray-500 hover:text-gray-800">
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">No notes yet</p>
        ) : (
          notes.map((note) => (
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