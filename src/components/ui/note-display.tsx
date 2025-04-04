"use client";

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import Markdown from 'markdown-to-jsx';
import { EnhanceMode } from '@/lib/gemini-service';

interface NoteDisplayProps {
  content: string;
  onEnhance: (mode: EnhanceMode) => Promise<void>;
  isEnhancing: boolean;
}

export function NoteDisplay({ content, onEnhance, isEnhancing }: NoteDisplayProps) {
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);

  return (
    <div className="relative">
      {/* AI Enhance Button */}
      <button
        type="button"
        onClick={() => setShowEnhanceOptions(!showEnhanceOptions)}
        className="absolute top-2 right-2 p-2 text-gray-500 hover:text-purple-600 bg-white rounded-md shadow-sm border border-gray-200 transition-colors duration-200 flex items-center gap-2 z-10"
        disabled={isEnhancing}
      >
        <Wand2 size={16} />
        {isEnhancing && (
          <span className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Enhancement Options Dropdown */}
      {showEnhanceOptions && (
        <div className="absolute right-2 top-12 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={async () => {
              await onEnhance('detailed');
              setShowEnhanceOptions(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
            disabled={isEnhancing}
          >
            Make More Detailed
          </button>
          <button
            type="button"
            onClick={async () => {
              await onEnhance('shorter');
              setShowEnhanceOptions(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
            disabled={isEnhancing}
          >
            Make Shorter
          </button>
          <button
            type="button"
            onClick={async () => {
              await onEnhance('simpler');
              setShowEnhanceOptions(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50 border-b border-gray-100"
            disabled={isEnhancing}
          >
            Make Simpler
          </button>
          <button
            type="button"
            onClick={async () => {
              await onEnhance('complex');
              setShowEnhanceOptions(false);
            }}
            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 disabled:opacity-50"
            disabled={isEnhancing}
          >
            Make More Complex
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isEnhancing && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-purple-600">
            <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Enhancing notes...</span>
          </div>
        </div>
      )}

      {/* Notes Content */}
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
          {content}
        </Markdown>
      </div>
    </div>
  );
}
