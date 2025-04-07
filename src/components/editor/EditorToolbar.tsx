"use client";

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      p-2 text-gray-600 dark:text-gray-400
      hover:text-gray-900 dark:hover:text-gray-100
      hover:bg-gray-100 dark:hover:bg-gray-700
      rounded-lg transition-colors
      disabled:opacity-50
      ${isActive ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : ''}
    `}
  >
    {children}
  </button>
);

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="p-2 flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <Underline size={18} />
      </ToolbarButton>

      <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered size={18} />
      </ToolbarButton>

      <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      >
        <Code size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote size={18} />
      </ToolbarButton>

      <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo size={18} />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo size={18} />
      </ToolbarButton>
    </div>
  );
}