import { Badge } from '../common/Badge';
import { useHealthQuery } from '../../api/queries';

export function BackendStatusIndicator() {
  const { data, isLoading, isError } = useHealthQuery();

  if (isLoading) {
    return (
      <Badge tone="neutral">
        <span className="h-2 w-2 rounded-full bg-lunar-muted" aria-hidden="true" />
        Checking backend
      </Badge>
    );
  }

  if (isError || !data) {
    return (
      <Badge tone="red">
        <span className="h-2 w-2 rounded-full bg-lunar-red" aria-hidden="true" />
        Backend offline
      </Badge>
    );
  }

  const healthy = data.status === 'ok' && data.database_status === 'connected';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone={healthy ? 'emerald' : 'amber'}>
        <span
          className={`h-2 w-2 rounded-full ${healthy ? 'bg-lunar-emerald' : 'bg-lunar-amber'}`}
          aria-hidden="true"
        />
        {healthy ? 'Backend connected' : `Backend ${data.status}`}
      </Badge>
      {data.active_dataset ? (
        <Badge tone="accent">
          Dataset: <span className="font-mono">{data.active_dataset}</span>
          {data.data_origin ? ` (${data.data_origin})` : ''}
        </Badge>
      ) : null}
    </div>
  );
}
