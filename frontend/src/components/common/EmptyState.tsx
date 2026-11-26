import type { ReactNode } from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-lunar-border bg-lunar-surface/60 px-6 py-10 text-center">
      <div className="mb-3 rounded-full border border-lunar-border bg-lunar-panel p-3 text-lunar-muted">
        {icon ?? <Database className="h-5 w-5" aria-hidden="true" />}
      </div>
      <h3 className="text-sm font-semibold text-lunar-text">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-lunar-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
