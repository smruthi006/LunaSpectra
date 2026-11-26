import { RefreshCw, ServerCrash, ShieldAlert } from 'lucide-react';
import { isApiClientError } from '../../api/client';
import { Button } from './Button';

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title, onRetry }: ErrorStateProps) {
  const clientError = isApiClientError(error) ? error : null;
  const isOffline = clientError?.kind === 'network_offline' || clientError?.kind === 'timeout';
  const isContractMismatch =
    clientError?.kind === 'validation_error' || clientError?.kind === 'invalid_json';

  const heading =
    title ??
    (isOffline
      ? 'Backend Service Unreachable'
      : isContractMismatch
        ? 'API Contract Validation Error'
        : 'Unable to Load Scientific Data');

  const message = clientError
    ? clientError.message
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred while communicating with the backend.';

  const Icon = isOffline ? ServerCrash : ShieldAlert;

  return (
    <div
      role="alert"
      className="rounded-lg border border-lunar-red/45 bg-lunar-red/10 p-5 text-red-100"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-lunar-red" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{heading}</h3>
            {clientError ? (
              <span className="rounded bg-lunar-red/20 px-2 py-0.5 font-mono text-[11px] text-red-200">
                {clientError.code}
                {clientError.status ? ` (${clientError.status})` : ''}
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-red-100/90">{message}</p>
          {isOffline ? (
            <p className="text-xs text-red-200/80">
              Start the FastAPI backend from repository root:{' '}
              <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono">
                uvicorn backend.app.main:app --reload
              </code>
            </p>
          ) : null}
          {onRetry ? (
            <div className="pt-1">
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Retry request
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
