import React, { useState } from 'react';
import { Edit3, Minimize, Maximize, MinusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedEditPopoverProps {
  onEnhance: (mode: 'simpler' | 'detailed' | 'shorter') => Promise<void>;
  isEnhancing: boolean;
}

export function AnimatedEditPopover({ onEnhance, isEnhancing }: AnimatedEditPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle clicking outside to close the popover
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.popover-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative popover-container">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full p-2.5 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-800/40 transition-all duration-300 hover:rotate-12"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isEnhancing}
      >
        <Edit3 className="h-4 w-4" />
        {isEnhancing && (
          <span className="absolute -top-1 -right-1 h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-50 right-full top-1/2 -translate-y-1/2 mr-2 w-40 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-slate-950/90 rounded-md border border-gray-200 dark:border-gray-700 animate-in slide-in-from-right-2 duration-200 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-2 data-[state=closed]:duration-200">
          <div className="grid gap-0.5 p-1">
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              onClick={() => {
                onEnhance('simpler');
                setIsOpen(false);
              }}
              disabled={isEnhancing}
            >
              <Minimize className="h-3.5 w-3.5" />
              <span>Simplify</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
              onClick={() => {
                onEnhance('detailed');
                setIsOpen(false);
              }}
              disabled={isEnhancing}
            >
              <Maximize className="h-3.5 w-3.5" />
              <span>Expand</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors opacity-50 cursor-not-allowed"
              onClick={() => {
                onEnhance('shorter');
                setIsOpen(false);
              }}
              disabled={true}
            >
              <MinusSquare className="h-3.5 w-3.5" />
              <span>Shorten</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}