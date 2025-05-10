"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  duration = 200,
  className,
  onComplete,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [i, setI] = useState<number>(0);

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      } else {
        clearInterval(typingEffect);
        onComplete?.();
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [duration, i, text, onComplete]);

  useEffect(() => {
    setDisplayedText("");
    setI(0);
  }, [text]);

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      <span>{displayedText ? displayedText : text}</span>
      <span className="inline-block w-[2px] h-[1em] ml-[2px] bg-gray-600 animate-[blink_0.7s_infinite]" />
    </h1>
  );
}
