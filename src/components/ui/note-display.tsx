"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EnhanceMode } from '@/lib/gemini-service';
import MarkdownCodeBlock from './markdown-code-block';
import { AnimatedEditPopover } from './AnimatedEditPopover';

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  node?: any;
  inline?: boolean;
}

interface NoteDisplayProps {
  content: string;
  onEnhance: (mode: EnhanceMode) => Promise<void>;
  isEnhancing: boolean;
  onTitlesExtracted?: (titles: { id: string; text: string; level: number }[]) => void;
}

export function NoteDisplay({ content, onEnhance, isEnhancing, onTitlesExtracted }: NoteDisplayProps) {
  const [showEnhanceOptions, setShowEnhanceOptions] = useState(false);
  const [titles, setTitles] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const extractTitles = () => {
      const headingRegex = /^(#+)\s+(.*)$/gm;
      const matches: { id: string; text: string; level: number }[] = [];
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        matches.push({ id, text, level });
      }
      setTitles(matches);
      if (onTitlesExtracted) {
        onTitlesExtracted(matches);
      }
    };

    extractTitles();
  }, [content, onTitlesExtracted]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10">
        <AnimatedEditPopover onEnhance={onEnhance} isEnhancing={isEnhancing} />
      </div>

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
      <div className="p-4 prose dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
            h2: ({ ...props }) => <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />,
            h3: ({ ...props }) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
            p: ({ ...props }) => <p className="mb-4 leading-7" {...props} />,
            ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
            ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
            li: ({ ...props }) => <li className="mb-1" {...props} />,
            blockquote: ({ ...props }) => <blockquote className="border-l-4 border-muted pl-4 italic my-4" {...props} />,
            code: ({ inline, className, children }: CodeProps) => (
              <MarkdownCodeBlock
                inline={!!inline}
                className={className}
              >
                {children}
              </MarkdownCodeBlock>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
