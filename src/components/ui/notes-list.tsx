"use client";

import React from 'react';
import { Plus } from 'lucide-react';

// Placeholder data structure similar to ui3.png
const notes = [
  {
    id: 1,
    title: "Work on budget report for...",
    excerpt: "Working on a budget report for the next quarter involves planning and forecasting the financial performance...",
    tag: "Working",
    tagColor: "bg-orange-100 text-orange-800",
    time: "Today, 15:24",
    active: false,
  },
  {
    id: 2,
    title: "The Remarkable Story of...",
    excerpt: "Jeff Bezos is a business magnate and the founder, CEO, and president of Amazon, the world's largest online retailer...",
    tag: "Blogging",
    tagColor: "bg-cyan-100 text-cyan-800",
    time: "Today, 11:23",
    active: true, // Example of an active note
  },
  {
    id: 3,
    title: "Grocery shopping after work..",
    excerpt: "Grocery shopping after work can be a convenient way to get your weekly or monthly shopping done...",
    tag: "Personal",
    tagColor: "bg-purple-100 text-purple-800",
    time: "Today, 12:24",
    active: false,
  },
];

interface NoteItemProps {
  note: typeof notes[0];
  onClick: (id: number) => void;
}

function NoteItem({ note, onClick }: NoteItemProps) {
  return (
    <div 
      className={`p-4 border rounded-lg mb-3 cursor-pointer hover:shadow-md transition-shadow duration-200 ${note.active ? 'border-blue-500 bg-white' : 'border-gray-200 bg-white'}`}
      onClick={() => onClick(note.id)}
    >
      <h3 className="font-semibold text-sm mb-1 truncate">{note.title}</h3>
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{note.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${note.tagColor}`}>
          {note.tag}
        </span>
        <span>{note.time}</span>
      </div>
    </div>
  );
}

export function NotesList() {
  const [activeNoteId, setActiveNoteId] = React.useState<number | null>(2); // Default to the active note in placeholder

  const handleNoteClick = (id: number) => {
    setActiveNoteId(id);
    // In a real app, you'd also trigger loading the full note content
    // in the main editor area here.
    console.log("Selected note:", id);
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        {/* Search Input - Placeholder */}
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
        {notes.map((note) => (
          <NoteItem 
            key={note.id} 
            note={{ ...note, active: note.id === activeNoteId }} 
            onClick={handleNoteClick} 
          />
        ))}
      </div>
    </div>
  );
}