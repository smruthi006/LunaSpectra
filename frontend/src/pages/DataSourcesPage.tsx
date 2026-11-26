import { ExternalLink, Globe2, ShieldAlert } from 'lucide-react';
import { useDatasetsQuery, useDatasetSummaryQuery } from '../api/queries';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeader } from '../components/common/SectionHeader';

export function DataSourcesPage() {
  const datasets = useDatasetsQuery();
  const summary = useDatasetSummaryQuery();

  const active = datasets.data?.items[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sources & Attribution"
        description="Official provenance, licensing separation, scientific limitations, and planned ISSDC/PRADAN archive integration."
        badge={<Badge tone="emerald">CC BY 4.0 + ISRO/ISSDC Attribution</Badge>}
      />

      {datasets.isLoading || summary.isLoading ? (
        <LoadingSkeleton rows={4} label="Loading dataset provenance from backend" />
      ) : datasets.error || summary.error ? (
        <ErrorState
          error={datasets.error ?? summary.error}
          onRetry={() => {
            void datasets.refetch();
            void summary.refetch();
          }}
        />
      ) : null}

      <Card className="space-y-4">
        <SectionHeader
          title={active?.name ?? 'CLASS_CHANDRAYAAN2'}
          subtitle="Active Phase 1 real Chandrayaan-2 CLASS dataset metadata"
          actions={
            <div className="flex flex-wrap gap-2">
              <Badge tone="emerald">Origin: {active?.data_origin ?? 'mission'}</Badge>
              <Badge tone="cyan">{active?.license ?? 'CC BY 4.0'}</Badge>
            </div>
          }
        />

        <dl className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-lunar-muted">DOI</dt>
            <dd className="mt-1 font-mono text-lunar-text">
              {active?.doi ?? '10.17632/6mmd96j5bg.1'}
            </dd>
          </div>
          <div>
            <dt className="text-lunar-muted">Contributor</dt>
            <dd className="mt-1 text-lunar-text">{active?.contributor ?? 'Shyama Narendranath'}</dd>
          </div>
          <div>
            <dt className="text-lunar-muted">Institution</dt>
            <dd className="mt-1 text-lunar-text">
              {active?.institution ?? 'Indian Space Research Organisation'}
            </dd>
          </div>
          <div>
            <dt className="text-lunar-muted">Version</dt>
            <dd className="mt-1 font-mono text-lunar-text">v{active?.version ?? '1'}</dd>
          </div>
          <div>
            <dt className="text-lunar-muted">Observation Scope</dt>
            <dd className="mt-1 font-mono text-lunar-text">
              {summary.data?.date_range.distinct_dates.join(', ') ?? '2019-11-18, 2020-05-29'} (
              {summary.data?.observation_count ?? 2} observations)
            </dd>
          </div>
          <div>
            <dt className="text-lunar-muted">Source URL</dt>
            <dd className="mt-1">
              <a
                href={active?.source_url ?? 'https://data.mendeley.com/datasets/6mmd96j5bg/1'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-lunar-cyan hover:underline"
              >
                Mendeley Data Record
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </dd>
          </div>
        </dl>

        {active?.available_content_types ? (
          <div className="space-y-2 border-t border-lunar-border pt-3">
            <p className="text-xs font-medium text-lunar-muted">
              Available Measurement &amp; Content Types
            </p>
            <div className="flex flex-wrap gap-1.5">
              {active.available_content_types.map((ct) => (
                <Badge key={ct} tone="neutral">
                  {ct}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2 border-t border-lunar-border pt-3 text-xs text-lunar-muted">
          <p className="font-medium text-lunar-text">Discovered Formats (23 Files)</p>
          <p>
            <code>FITS</code> (.fits), <code>PHA_FITS</code> (.pha),{' '}
            <code>TXT_OGIP_SPECTRUM_TABLE</code>, <code>TXT_LINE_FLUX_TABLE</code>,{' '}
            <code>TXT_ABUNDANCE_SCRIPT</code>, <code>TXT_NUMERIC_TWO_COL</code>,{' '}
            <code>TEXT_README</code>, and <code>ZIP_ARCHIVE</code>.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <SectionHeader
            title="Required ISRO / ISSDC &amp; CC BY 4.0 Attribution"
            subtitle="Distinct separation between scientific mission data and student software"
          />
          <blockquote className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3 text-xs italic text-lunar-text">
            &ldquo;We acknowledge the use of data from the Chandrayaan-II, second lunar mission of
            the Indian Space Research Organisation (ISRO), archived at the Indian Space Science Data
            Centre (ISSDC).&rdquo;
          </blockquote>
          <p className="text-xs leading-relaxed text-lunar-muted">
            Mendeley Data dataset <em>CLASS_CHANDRAYAAN2</em> (Shyama Narendranath, ISRO,{' '}
            <code>DOI: 10.17632/6mmd96j5bg.1</code>) is licensed under{' '}
            <strong className="text-lunar-text">CC BY 4.0</strong>. Student-authored application
            code in this repository is licensed separately under the{' '}
            <strong className="text-lunar-text">MIT License</strong>, which does not relicense ISRO
            or Mendeley scientific products.
          </p>
          <Alert tone="info">
            Note: Mendeley Data is a public research-paper dataset contributed by an ISRO scientist;
            it is <strong>not</strong> the official ISRO mission archive. Official archived
            Chandrayaan-2 mission products are distributed through ISRO&apos;s{' '}
            <a
              href="https://pradan.issdc.gov.in/pradan"
              target="_blank"
              rel="noreferrer"
              className="text-lunar-cyan underline"
            >
              ISSDC / PRADAN
            </a>{' '}
            portal.
          </Alert>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="Limitations &amp; Planned PRADAN Integration"
            subtitle="Roadmap toward geolocated lunar mapping"
          />
          <div className="flex items-start gap-2.5 text-xs text-lunar-muted">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-lunar-amber" aria-hidden="true" />
            <p>
              This dataset provides spectra, line fluxes, and derived abundances for only two dates
              and omits coordinates, footprint polygons, and global lunar coverage.
            </p>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-lunar-muted">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-lunar-cyan" aria-hidden="true" />
            <p>
              Planned integration with verified ISSDC/PRADAN PDS4 bundles will supply official
              latitude, longitude, footprint geometry, and broader orbital coverage to unlock the
              Lunar Explorer map and unsupervised ML pipelines.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
