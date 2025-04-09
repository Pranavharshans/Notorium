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
      mermaid.render('mermaid-diagram', content).then((result) => {
        if (elementRef.current) {
          elementRef.current.innerHTML = result.svg;
        }
      });
    }
  }, [content]);

  return <div ref={elementRef} className="mermaid-diagram" />;
}