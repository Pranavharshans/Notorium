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
  const content = Array.isArray(children) ? String(children[0]) : String(children);


  if (!inline && match && match[1] === 'mermaid') {
    return <MermaidDiagram content={content} />;
  }

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
