import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  content: string;
}

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export default function MermaidDiagram({ content }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      try {
        // Generate a unique ID for each render attempt
        const uniqueId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        mermaid.render(uniqueId, content).then(({ svg, bindFunctions }) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = svg;
            if (bindFunctions) {
              bindFunctions(elementRef.current); // Bind interactions if any
            }
          }
        }).catch((error) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = `<pre>Error rendering Mermaid diagram: ${error.message}</pre>`;
          }
        });
      } catch (error: unknown) {
        if (elementRef.current) {
          elementRef.current.innerHTML = `<pre>Error rendering Mermaid diagram: ${error instanceof Error ? error.message : 'Unknown error'}</pre>`;
        }
      }
    }
  }, [content]);

  return <div ref={elementRef} className="mermaid-diagram" />;
}