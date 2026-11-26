import { ExternalLink, FileCheck2 } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import type { SourceProduct } from '../../types/api';
import { formatBytes } from '../../utils/formatters';

interface ProvenancePanelProps {
  title?: string;
  doi?: string | null;
  contributor?: string | null;
  institution?: string | null;
  license?: string | null;
  sourceUrl?: string | null;
  sourceProducts?: SourceProduct[];
}

export function ProvenancePanel({
  title = 'Provenance & Attribution',
  doi,
  contributor,
  institution,
  license,
  sourceUrl,
  sourceProducts = [],
}: ProvenancePanelProps) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-lunar-text">{title}</h3>
        </div>
        {license ? <Badge tone="emerald">{license}</Badge> : null}
      </div>

      <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-lunar-muted">DOI</dt>
          <dd className="mt-0.5 font-mono text-lunar-text">{doi ?? 'Not recorded'}</dd>
        </div>
        <div>
          <dt className="text-lunar-muted">Contributor</dt>
          <dd className="mt-0.5 text-lunar-text">{contributor ?? 'Not recorded'}</dd>
        </div>
        <div>
          <dt className="text-lunar-muted">Institution</dt>
          <dd className="mt-0.5 text-lunar-text">{institution ?? 'Not recorded'}</dd>
        </div>
        <div>
          <dt className="text-lunar-muted">Source Record</dt>
          <dd className="mt-0.5">
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-lunar-cyan hover:underline"
              >
                Mendeley Data
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-lunar-subtle">Not available</span>
            )}
          </dd>
        </div>
      </dl>

      {sourceProducts.length > 0 ? (
        <div className="space-y-2 border-t border-lunar-border pt-3">
          <p className="text-xs font-medium text-lunar-muted">
            Linked Source Products ({sourceProducts.length})
          </p>
          <ul className="divide-y divide-lunar-border/60 rounded-md border border-lunar-border bg-lunar-bg/60 text-xs">
            {sourceProducts.map((sp) => (
              <li
                key={sp.id}
                className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-lunar-text">{sp.original_filename}</p>
                  <p className="truncate text-[11px] text-lunar-subtle">
                    {sp.relative_path} &middot; SHA-256: {sp.checksum_sha256.slice(0, 16)}...
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone="neutral">{sp.format}</Badge>
                  <span className="font-mono text-[11px] text-lunar-muted">
                    {formatBytes(sp.file_size)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
