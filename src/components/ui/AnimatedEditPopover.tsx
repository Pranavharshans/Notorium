import { Edit3, Minimize, Maximize, MinusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EnhanceMode } from "@/lib/gemini-service"

interface AnimatedEditPopoverProps {
  onEnhance: (mode: EnhanceMode) => Promise<void>;
  isEnhancing: boolean;
}

export function AnimatedEditPopover({ onEnhance, isEnhancing }: AnimatedEditPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full p-2.5 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-800/40 transition-all duration-300 hover:rotate-12"
          disabled={isEnhancing}
        >
          <Edit3 className="h-4 w-4" />
          {isEnhancing && (
            <span className="absolute -top-1 -right-1 h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-40 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-slate-950/90 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        align="center"
        side="bottom"
        sideOffset={5}
        avoidCollisions={true}
      >
        <div className="grid gap-0.5">
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            onClick={() => onEnhance('simpler')}
            disabled={isEnhancing}
          >
            <Minimize className="h-3.5 w-3.5" />
            <span>Simplify</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            onClick={() => onEnhance('detailed')}
            disabled={isEnhancing}
          >
            <Maximize className="h-3.5 w-3.5" />
            <span>Expand</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            onClick={() => onEnhance('shorter')}
            disabled={isEnhancing}
          >
            <MinusSquare className="h-3.5 w-3.5" />
            <span>Shorten</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}