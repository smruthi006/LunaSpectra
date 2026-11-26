import { Activity, Database, Layers, MapPinOff, Sun, Telescope } from 'lucide-react';
import {
  useDatasetsQuery,
  useDatasetSummaryQuery,
  useElementsQuery,
  useHealthQuery,
  useMapAvailabilityQuery,
  useObservationsQuery,
} from '../api/queries';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { ProvenancePanel } from '../components/common/ProvenancePanel';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatCard } from '../components/common/StatCard';
import type { ElementSummary } from '../types/api';

const ELEMENT_COLUMNS: DataTableColumn<ElementSummary>[] = [
  {
    key: 'element',
    header: 'Element',
    render: (row) => (
      <span className="font-semibold text-lunar-text">
        {row.element}{' '}
        {row.element_name ? (
          <span className="font-normal text-lunar-muted">({row.element_name})</span>
        ) : null}
      </span>
    ),
  },
  {
    key: 'types',
    header: 'Measurement Types',
    render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.measurement_types.map((t) => (
          <Badge key={t} tone={t === 'abundance' ? 'emerald' : 'accent'}>
            {t}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: 'units',
    header: 'Units',
    render: (row) => (
      <span className="font-mono text-xs text-lunar-cyan">{row.units.join(', ')}</span>
    ),
  },
  {
    key: 'flux_count',
    header: 'Line-Flux Records',
    align: 'right',
    render: (row) => <span className="font-mono">{row.line_flux_record_count}</span>,
  },
  {
    key: 'abund_count',
    header: 'Abundance Records',
    align: 'right',
    render: (row) => <span className="font-mono">{row.abundance_record_count}</span>,
  },
  {
    key: 'uncertainty',
    header: 'Uncertainty',
    render: (row) =>
      row.uncertainty_available ? (
        <Badge tone="emerald">Available</Badge>
      ) : (
        <Badge tone="neutral">Unavailable</Badge>
      ),
  },
];

export function DashboardPage() {
  const health = useHealthQuery();
  const summary = useDatasetSummaryQuery();
  const datasets = useDatasetsQuery();
  const elements = useElementsQuery();
  const mapAvail = useMapAvailabilityQuery();
  const observations = useObservationsQuery({ page: 1, page_size: 20 });

  const isLoading =
    health.isLoading ||
    summary.isLoading ||
    datasets.isLoading ||
    elements.isLoading ||
    mapAvail.isLoading ||
    observations.isLoading;

  const firstError =
    health.error ??
    summary.error ??
    datasets.error ??
    elements.error ??
    mapAvail.error ??
    observations.error;

  const refetchAll = () => {
    void health.refetch();
    void summary.refetch();
    void datasets.refetch();
    void elements.refetch();
    void mapAvail.refetch();
    void observations.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dataset Dashboard"
        description="Live summary statistics, element coverage, quality disclosures, and provenance queried directly from the FastAPI backend."
        badge={
          summary.data ? (
            <div className="flex flex-wrap gap-2">
              <Badge tone="emerald">Origin: {summary.data.data_origin}</Badge>
              <Badge tone="cyan">DOI: {summary.data.doi}</Badge>
              <Badge tone="neutral">v{summary.data.version}</Badge>
            </div>
          ) : null
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton rows={3} label="Loading dataset summary from backend" />
          <LoadingSkeleton rows={5} label="Loading element statistics" />
        </div>
      ) : firstError ? (
        <ErrorState error={firstError} onRetry={refetchAll} />
      ) : !summary.data || !health.data ? (
        <EmptyState
          title="No Dataset Seeded"
          description="The backend responded, but no active dataset record was found in SQLite."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Backend & Database"
              value={health.data.status.toUpperCase()}
              detail={`SQLite: ${health.data.database_status} · API ${health.data.api_version}`}
              icon={<Activity className="h-4 w-4" aria-hidden="true" />}
              accent="emerald"
            />
            <StatCard
              label="Lunar Observations"
              value={summary.data.observation_count}
              detail={`Dates: ${summary.data.date_range.distinct_dates.join(' & ') || 'None'}`}
              icon={<Telescope className="h-4 w-4" aria-hidden="true" />}
              accent="cyan"
            />
            <StatCard
              label="Spectra (Total / Bg / XSM)"
              value={`${summary.data.spectrum_count} / ${summary.data.background_spectrum_count} / ${summary.data.solar_spectrum_count}`}
              detail={`Calibration spectra: ${summary.data.calibration_spectrum_count}`}
              icon={<Sun className="h-4 w-4" aria-hidden="true" />}
            />
            <StatCard
              label="Flux / Abundance Records"
              value={`${summary.data.line_flux_record_count} / ${summary.data.abundance_record_count}`}
              detail={`Elements tracked: ${summary.data.available_elements.join(', ')}`}
              icon={<Layers className="h-4 w-4" aria-hidden="true" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-3">
              <SectionHeader
                title="Coordinate & Map Availability"
                subtitle="Verified status from /api/v1/map/availability"
              />
              <div className="flex items-start gap-3 rounded-md border border-lunar-amber/40 bg-lunar-amber/10 p-3 text-xs text-amber-100">
                <MapPinOff
                  className="mt-0.5 h-4 w-4 shrink-0 text-lunar-amber"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Geospatial Map: {mapAvail.data?.available ? 'Available' : 'Unavailable (false)'}
                  </p>
                  <p>{mapAvail.data?.reason ?? summary.data.coordinate_availability.note}</p>
                  <p className="font-mono text-[11px]">
                    coordinate_record_count={mapAvail.data?.coordinate_record_count ?? 0} ·
                    footprint_record_count={mapAvail.data?.footprint_record_count ?? 0}
                  </p>
                </div>
              </div>
              <div className="rounded-md border border-lunar-border bg-lunar-panel/50 p-3 text-xs">
                <p className="font-medium text-lunar-text">XSM Solar Data Availability</p>
                <p className="mt-1 text-lunar-muted">
                  Solar/XSM spectra recorded:{' '}
                  <span className="font-mono text-lunar-cyan">
                    {summary.data.solar_spectrum_count}
                  </span>{' '}
                  (linked to the 2019-11-18 observation via{' '}
                  <span className="font-mono">solar_xsm</span> and{' '}
                  <span className="font-mono">solar_model</span>).
                </p>
              </div>
            </Card>

            <Card className="space-y-3">
              <SectionHeader
                title="Missing-Field & Limitation Disclosure"
                subtitle="Null fields preserved transparently without zero substitution"
              />
              <dl className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(summary.data.missing_field_summary).map(([field, count]) => (
                  <div
                    key={field}
                    className="flex items-center justify-between rounded border border-lunar-border bg-lunar-panel/60 px-3 py-2"
                  >
                    <dt className="font-mono text-lunar-muted">{field}</dt>
                    <dd className="font-mono font-semibold text-lunar-amber">{count} null</dd>
                  </div>
                ))}
              </dl>
              <ul className="space-y-1.5 text-xs text-lunar-muted">
                {summary.data.known_limitations.map((lim, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lunar-amber" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {elements.data && observations.data ? (
            <DashboardCharts
              summary={summary.data}
              elements={elements.data.items}
              observations={observations.data.items}
            />
          ) : null}

          <Card className="space-y-4">
            <SectionHeader
              title="Available Elements & Units"
              subtitle="Per-element counts and uncertainty coverage reported by /api/v1/elements"
              actions={
                <Badge tone="neutral">
                  <Database className="h-3 w-3" aria-hidden="true" />
                  {elements.data?.total_items ?? 0} elements
                </Badge>
              }
            />
            {elements.data && elements.data.items.length > 0 ? (
              <DataTable
                caption="Available elements, measurement types, units, and record counts"
                columns={ELEMENT_COLUMNS}
                rows={elements.data.items}
                getRowKey={(row) => row.element}
              />
            ) : (
              <Alert tone="info">No elemental records were returned by /api/v1/elements.</Alert>
            )}
          </Card>

          <ProvenancePanel
            title={`Active Dataset Provenance — ${summary.data.name}`}
            doi={summary.data.doi}
            contributor={summary.data.contributor}
            institution={summary.data.institution}
            license={summary.data.license}
            sourceUrl={summary.data.source_url}
          />
        </>
      )}
    </div>
  );
}
