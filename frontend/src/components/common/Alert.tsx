import type { ReactNode } from 'react';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

export type AlertTone = 'info' | 'warning' | 'error';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<AlertTone, { container: string; icon: typeof Info }> = {
  info: {
    container: 'border-lunar-cyan/35 bg-lunar-cyan/10 text-cyan-100',
    icon: Info,
  },
  warning: {
    container: 'border-lunar-amber/45 bg-lunar-amber/10 text-amber-100',
    icon: AlertTriangle,
  },
  error: {
    container: 'border-lunar-red/50 bg-lunar-red/10 text-red-100',
    icon: XCircle,
  },
};

export function Alert({ tone = 'info', title, children, className = '' }: AlertProps) {
  const { container, icon: Icon } = TONE_STYLES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${container} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>
    </div>
  );
}
