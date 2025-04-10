import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import MermaidDiagram from './mermaid-diagram';

interface MarkdownCodeBlockProps {
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

export default function MarkdownCodeBlock({ inline = false, className = '', children }: MarkdownCodeBlockProps) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const content = Array.isArray(children) ? String(children[0]) : String(children);

  // For Mermaid diagrams, only render the MermaidDiagram component
  if (!inline && language === 'mermaid') {
    return <MermaidDiagram content={content} />;
  }

  // For all other code blocks, render the standard code block
  return (
    <code
      className={cn(
        "font-mono",
        inline
          ? "text-sm bg-muted px-1 py-0.5 rounded"
          : "block bg-muted p-4 rounded-lg overflow-x-auto my-4"
      )}
    >
      {children}
    </code>
  );
}
