import React from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "group relative z-0 flex overflow-hidden rounded-full px-8 py-4",
          "bg-black border border-white/20 text-white",
          "transform-gpu transition-all duration-300 ease-in-out hover:border-white/30 active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <div className="absolute inset-0 z-0 w-full animate-shimmer opacity-50" />
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
