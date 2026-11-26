import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-lunar-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-lunar-text">{title}</h1>
          {badge}
        </div>
        <p className="max-w-3xl text-sm text-lunar-muted">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
