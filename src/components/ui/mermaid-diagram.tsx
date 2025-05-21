import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Enhanced console filtering
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Helper function to check if a message should be filtered
const shouldFilterMessage = (args: unknown[]): boolean => {
  if (!args[0]) return false;
  const message = String(args[0]);
  
  // Filter out specific Mermaid patterns
  const mermaidPatterns = [
    'INFO :',
    'WARN :',
    'Graph after',
    'Graph before',
    'Position XBX',
    'Position X',
    'abc82',
    'dagre-',
    'chunk-',
    'mermaid',
    'Flowchart',
    'rendering',
    'recursivelyTraversePassiveMountEffects',
    'commitPassiveMountOnFiber',
    'XXX',
    'Layout',
    'XAX',
    'XBX',
    'Fix Map',
    'Edge',
    'Node XXX'
  ];

  // Check if message contains any of the patterns
  if (mermaidPatterns.some(pattern => message.includes(pattern))) {
    return true;
  }

  // Filter out graph data objects
  if (typeof args[0] === 'object' && args[0] !== null) {
    const obj = args[0] as Record<string, unknown>;
    // Filter out Mermaid graph objects
    if (
      ('options' in obj && 'nodes' in obj && 'edges' in obj) || // Graph structure
      ('id' in obj && typeof obj.id === 'string' && (
        obj.id.startsWith('L_') || // Edge IDs
        obj.id.startsWith('flowchart-') // Node IDs
      )) ||
      ('v' in obj && 'w' in obj && 'name' in obj) // Edge definitions
    ) {
      return true;
    }
  }

  return false;
};

// Override console methods with more specific filtering
console.log = function(...args: unknown[]) {
  if (!shouldFilterMessage(args)) {
    originalConsoleLog.apply(console, args);
  }
};

console.info = function(...args: unknown[]) {
  if (!shouldFilterMessage(args)) {
    originalConsoleInfo.apply(console, args);
  }
};

console.warn = function(...args: unknown[]) {
  if (!shouldFilterMessage(args)) {
    originalConsoleWarn.apply(console, args);
  }
};

console.error = function(...args: unknown[]) {
  // Only filter Mermaid-specific errors, let other errors through
  if (!shouldFilterMessage(args) || (args[0] && String(args[0]).includes('Error:') && !String(args[0]).includes('mermaid'))) {
    originalConsoleError.apply(console, args);
  }
};

interface MermaidDiagramProps {
  content: string;
}

mermaid.initialize({
  theme: 'default',
  securityLevel: 'loose',
  logLevel: 1, // Set to 1 to only show errors
  startOnLoad: false,
  fontFamily: 'arial',
  deterministicIds: true
});

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
      // Error handling removed
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
    // Error handling removed
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
      // Error handling removed
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
                  '.error-icon, .error-text, .error-message, [id*="syntax-error"], g.error-icon, g.marker.cross'
                );
                errorElements.forEach(el => el.remove());
                const remainingErrorsInDiagram = elementRef.current.querySelector('g.error-icon, g.marker.cross');
                setError(remainingErrorsInDiagram ? "⚠️" : null);
              }
              removeGlobalMermaidErrors(); 
            }, 0);
          }
        } catch (e) {
          if (isMounted) {
            setError("⚠️");
            if (elementRef.current) elementRef.current.innerHTML = '';
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