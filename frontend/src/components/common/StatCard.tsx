import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  accent?: 'default' | 'cyan' | 'amber' | 'emerald';
}

const ACCENT_BORDER: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'border-lunar-border',
  cyan: 'border-lunar-cyan/35',
  amber: 'border-lunar-amber/35',
  emerald: 'border-lunar-emerald/35',
};

export function StatCard({ label, value, detail, icon, accent = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-lg border ${ACCENT_BORDER[accent]} bg-lunar-surface p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-lunar-muted">{label}</p>
        {icon ? <span className="text-lunar-muted">{icon}</span> : null}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-lunar-text">{value}</p>
      {detail ? <p className="mt-1 text-xs text-lunar-muted">{detail}</p> : null}
    </div>
  );
}
