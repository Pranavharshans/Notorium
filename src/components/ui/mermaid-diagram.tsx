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
      console.log("Attempting to render Mermaid diagram with content:", content);
      try {
        // Generate a unique ID for each render attempt
        const uniqueId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        mermaid.render(uniqueId, content).then(({ svg, bindFunctions }) => {
          if (elementRef.current) {
            console.log("Mermaid rendering successful for ID:", uniqueId);
            elementRef.current.innerHTML = svg;
            if (bindFunctions) {
              bindFunctions(elementRef.current); // Bind interactions if any
            }
          }
        }).catch((error) => {
          console.error("Mermaid rendering failed inside promise for ID:", uniqueId, error);
          if (elementRef.current) {
            elementRef.current.innerHTML = `<pre>Error rendering Mermaid diagram: ${error.message}</pre>`;
          }
        });
      } catch (error: any) {
        console.error("Mermaid rendering failed synchronously:", error);
        if (elementRef.current) {
          elementRef.current.innerHTML = `<pre>Error rendering Mermaid diagram: ${error.message}</pre>`;
        }
      }
    }
  }, [content]);

  return <div ref={elementRef} className="mermaid-diagram" />;
}