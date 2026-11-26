interface LoadingSkeletonProps {
  rows?: number;
  label?: string;
}

export function LoadingSkeleton({
  rows = 4,
  label = 'Loading scientific data',
}: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="space-y-3 rounded-lg border border-lunar-border bg-lunar-surface p-5"
    >
      <span className="sr-only">{label}</span>
      <div className="h-4 w-48 animate-pulse rounded bg-lunar-panel" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-3 w-full animate-pulse rounded bg-lunar-panel/80" />
      ))}
    </div>
  );
}
