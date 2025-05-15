import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  content: string;
}

mermaid.initialize({
  theme: 'default',
  securityLevel: 'loose',
  logLevel: 0, // Crucial for suppressing Mermaid's own error UI
  startOnLoad: false,
  fontFamily: 'arial',
  deterministicIds: true,
});

const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('mermaid') || 
       message.includes('Flowchart') || 
       message.includes('Error parsing') ||
       message.includes('Error rendering') ||
       message.includes('Syntax error') ||
       message.includes('There can be only one'))) {
    return; 
  }
  originalConsoleError.apply(console, args);
};

function removeGlobalMermaidErrors() {
  const selectors = [
    'div[id^="mermaid-error-pane"]',
    'div[id*="mermaid-error-pane"]',
    'div[class*="mermaid-error-overlay"]',
    'div[class*="mermaid-live-editor-error-pane"]',
    'div[aria-live][role="alert"][style*="background-color: red"]',
    'div[id^="mermaidErrorMessage"]',
  ];
  selectors.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => el.remove());
    } catch (e) {
      originalConsoleError.call(console, "Error removing global mermaid element with selector:", selector, e);
    }
  });

  try {
    const svgs = document.querySelectorAll('svg'); 
    svgs.forEach(svg => {
      if (svg.textContent && svg.textContent.includes('Syntax error in text') && svg.textContent.includes('mermaid version')) {
        let parentToRemove: Element = svg;
        if (svg.parentElement && svg.parentElement.id && svg.parentElement.id.startsWith('dmermaid-')) {
            parentToRemove = svg.parentElement;
        }
        parentToRemove.remove();
      }
    });
  } catch (e) {
     originalConsoleError.call(console, "Error removing global mermaid SVG elements:", e);
  }
}

export default function MermaidDiagram({ content }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    let isMounted = true;
    removeGlobalMermaidErrors(); // Initial aggressive cleanup

    if (!observerRef.current) {
      observerRef.current = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          // If any nodes were added anywhere, trigger a full cleanup.
          // This is aggressive but aims to catch elusive error messages.
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            removeGlobalMermaidErrors();
            break; // Processed this set of mutations
          }
        }
      });
    }

    const observer = observerRef.current;
    try {
      // Observe the entire document body for additions/removals.
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      originalConsoleError.call(console, "Failed to start MutationObserver:", e);
    }

    if (elementRef.current) {
      const attemptRender = async () => {
        try {
          const uniqueId = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          document.documentElement.classList.add('processing-mermaid');
          removeGlobalMermaidErrors(); 

          const { svg, bindFunctions } = await mermaid.render(uniqueId, content);
          
          if (isMounted && elementRef.current) {
            elementRef.current.innerHTML = svg;
            if (bindFunctions) {
              bindFunctions(elementRef.current);
            }
            setTimeout(() => {
              if (isMounted && elementRef.current) {
                const errorElements = elementRef.current.querySelectorAll(
                  '.error-icon, .error-text, .error-message, [id*="syntax-error"], g.error-icon, g.marker.cross, text:contains(Syntax error)'
                );
                errorElements.forEach(el => el.remove());
                const remainingErrorsInDiagram = elementRef.current.querySelector('g.error-icon, g.marker.cross, text:contains("Syntax error")');
                setError(remainingErrorsInDiagram ? "⚠️" : null);
              }
              removeGlobalMermaidErrors(); 
            }, 0);
          }
        } catch (e) {
          if (isMounted) {
            setError("⚠️");
            if (elementRef.current) elementRef.current.innerHTML = '';
            originalConsoleError.call(console, "Mermaid render catch:", e);
          }
        } finally {
          if (isMounted) document.documentElement.classList.remove('processing-mermaid');
          setTimeout(removeGlobalMermaidErrors, 50); 
        }
      };
      attemptRender();
    }

    return () => {
      isMounted = false;
      if (observerRef.current) observerRef.current.disconnect();
      removeGlobalMermaidErrors(); 
    };
  }, [content]);

  return (
    <div className="mermaid-container">
      <div ref={elementRef} className="mermaid-diagram" />
      {error && (
        <div className="mermaid-error bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}