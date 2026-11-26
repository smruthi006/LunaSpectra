import { useId, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  children?: ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  const tipId = useId();
  return (
    <span className="group relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        aria-describedby={tipId}
        aria-label={text}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-lunar-muted hover:text-lunar-cyan"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-md border border-lunar-border bg-lunar-bg px-2.5 py-2 text-xs font-normal text-lunar-text opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
