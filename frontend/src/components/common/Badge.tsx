import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'cyan' | 'amber' | 'red' | 'emerald';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-lunar-border bg-lunar-panel text-lunar-muted',
  accent: 'border-lunar-accent/40 bg-lunar-accent/15 text-indigo-200',
  cyan: 'border-lunar-cyan/40 bg-lunar-cyan/10 text-cyan-200',
  amber: 'border-lunar-amber/40 bg-lunar-amber/15 text-amber-200',
  red: 'border-lunar-red/40 bg-lunar-red/15 text-red-200',
  emerald: 'border-lunar-emerald/40 bg-lunar-emerald/15 text-emerald-200',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
