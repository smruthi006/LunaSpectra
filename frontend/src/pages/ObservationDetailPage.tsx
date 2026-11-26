import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Info, Sun } from 'lucide-react';
import {
  useObservationAbundancesQuery,
  useObservationDetailQuery,
  useObservationLineFluxesQuery,
  useObservationSpectraQuery,
} from '../api/queries';
import { AbundanceChart } from '../components/charts/AbundanceChart';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { ProvenancePanel } from '../components/common/ProvenancePanel';
import { ScientificValue } from '../components/common/ScientificValue';
import { SectionHeader } from '../components/common/SectionHeader';
import { SpectrumViewer } from '../components/spectra/SpectrumViewer';
import type { LineFlux } from '../types/api';

const LINE_FLUX_COLUMNS: DataTableColumn<LineFlux>[] = [
  {
    key: 'element',
    header: 'Element',
    render: (row) => <span className="font-semibold text-lunar-text">{row.element}</span>,
  },
  {
    key: 'line',
    header: 'Spectral Line',
    render: (row) =>
      row.spectral_line ? (
        <Badge tone="cyan">{row.spectral_line}</Badge>
      ) : (
        <span className="text-xs text-lunar-subtle">Combined / unspecified</span>
      ),
  },
  {
    key: 'value',
    header: 'Line Flux & Uncertainty',
    render: (row) => (
      <ScientificValue
        value={row.line_flux}
        uncertainty={row.uncertainty}
        unit={row.unit}
        decimals={4}
      />
    ),
  },
  {
    key: 'unit',
    header: 'Unit',
    render: (row) => <span className="font-mono text-xs text-lunar-cyan">{row.unit}</span>,
  },
];

export function ObservationDetailPage() {
  const { observationId } = useParams<{ observationId: string }>();

  const detail = useObservationDetailQuery(observationId);
  const spectra = useObservationSpectraQuery(observationId);
  const abundances = useObservationAbundancesQuery(observationId);
  const lineFluxes = useObservationLineFluxesQuery(observationId);

  const isLoading =
    detail.isLoading || spectra.isLoading || abundances.isLoading || lineFluxes.isLoading;
  const firstError = detail.error ?? spectra.error ?? abundances.error ?? lineFluxes.error;

  const refetchAll = () => {
    void detail.refetch();
    void spectra.refetch();
    void abundances.refetch();
    void lineFluxes.refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={4} label="Loading observation detail" />
        <LoadingSkeleton rows={6} label="Loading spectral and elemental data" />
      </div>
    );
  }

  if (firstError) {
    return (
      <div className="space-y-4">
        <Link to="/observations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Observations
          </Button>
        </Link>
        <ErrorState error={firstError} onRetry={refetchAll} />
      </div>
    );
  }

  if (!detail.data) {
    return (
      <EmptyState
        title="Observation Not Found"
        description="The requested observation could not be loaded."
      />
    );
  }

  const obs = detail.data;
  const spectraList = spectra.data?.spectra ?? obs.spectra;
  const bgSpectra = spectraList.filter((s) => s.spectrum_type === 'background');
  const solarSpectra = spectraList.filter(
    (s) => s.spectrum_type === 'solar_xsm' || s.spectrum_type === 'solar_model',
  );
  const abundanceList = abundances.data?.abundances ?? obs.abundances;
  const abundanceNotes = abundances.data?.notes ?? [];
  const fluxList = lineFluxes.data?.line_fluxes ?? obs.line_fluxes;

  const provDoi = typeof obs.provenance.doi === 'string' ? obs.provenance.doi : null;
  const provContrib =
    typeof obs.provenance.contributor === 'string' ? obs.provenance.contributor : null;
  const provInst =
    typeof obs.provenance.institution === 'string' ? obs.provenance.institution : null;
  const provLicense = typeof obs.provenance.license === 'string' ? obs.provenance.license : null;
  const provUrl = typeof obs.provenance.source_url === 'string' ? obs.provenance.source_url : null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/observations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Observations
          </Button>
        </Link>
      </div>

      {/* 1. Observation overview */}
      <PageHeader
        title={obs.observation_id}
        description={`Genuine Chandrayaan-2 CLASS observation on ${obs.observation_date ?? 'unspecified date'} (dataset ${obs.dataset_id}).`}
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge tone="emerald">Origin: {obs.data_origin}</Badge>
            <Badge tone="cyan">{spectraList.length} spectra</Badge>
            <Badge tone="accent">{fluxList.length} line fluxes</Badge>
          </div>
        }
      />

      {/* 2. Acquisition metadata & 10. Missing-field disclosure */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <SectionHeader
            title="Acquisition Metadata"
            subtitle="Preserved directly from FITS headers"
          />
          <dl className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-lunar-muted">Observation Date</dt>
              <dd className="mt-0.5 font-mono text-lunar-text">{obs.observation_date ?? 'null'}</dd>
            </div>
            <div>
              <dt className="text-lunar-muted">Exposure</dt>
              <dd className="mt-0.5 font-mono text-lunar-text">
                {obs.exposure !== null ? `${obs.exposure} seconds` : 'Not available (null)'}
              </dd>
            </div>
            <div>
              <dt className="text-lunar-muted">Acquisition Start (UTC)</dt>
              <dd className="mt-0.5 font-mono text-lunar-text">
                {obs.acquisition_start_time ?? 'Not available (null — STARTIME=0 sentinel)'}
              </dd>
            </div>
            <div>
              <dt className="text-lunar-muted">Acquisition End (UTC)</dt>
              <dd className="mt-0.5 font-mono text-lunar-text">
                {obs.acquisition_end_time ?? 'Not available (null)'}
              </dd>
            </div>
            <div>
              <dt className="text-lunar-muted">Latitude / Longitude</dt>
              <dd className="mt-0.5 font-mono text-lunar-subtle">
                {obs.latitude !== null && obs.longitude !== null
                  ? `${obs.latitude}, ${obs.longitude}`
                  : 'Absent in source dataset (null)'}
              </dd>
            </div>
            <div>
              <dt className="text-lunar-muted">Footprint Geometry</dt>
              <dd className="mt-0.5 font-mono text-lunar-subtle">
                {obs.footprint_geometry ?? 'Absent in source dataset (null)'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="Missing-Field Disclosure & Context"
            subtitle="Explicit list of fields absent or withheld in the source product"
          />
          {obs.missing_fields.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {obs.missing_fields.map((field) => (
                <Badge key={field} tone="amber">
                  {field}
                </Badge>
              ))}
            </div>
          ) : (
            <Badge tone="emerald">No missing fields reported</Badge>
          )}

          {/* 5. Background & 6. XSM/solar summary */}
          <div className="grid gap-3 pt-2 sm:grid-cols-2 text-xs">
            <div className="rounded-md border border-lunar-border bg-lunar-panel/50 p-3 space-y-1">
              <p className="font-semibold text-lunar-text">Background Spectrum</p>
              <p className="text-lunar-muted">
                {bgSpectra.length > 0
                  ? `${bgSpectra.length} background spectrum linked (${bgSpectra[0]?.point_count} channels, unit: ${bgSpectra[0]?.value_unit}).`
                  : 'No background spectrum linked.'}
              </p>
            </div>
            <div className="rounded-md border border-lunar-border bg-lunar-panel/50 p-3 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-lunar-text">
                <Sun className="h-3.5 w-3.5 text-lunar-amber" aria-hidden="true" />
                XSM / Solar Spectrum
              </p>
              <p className="text-lunar-muted">
                {solarSpectra.length > 0
                  ? `${solarSpectra.length} solar spectrum records linked (${solarSpectra.map((s) => s.spectrum_type).join(', ')}).`
                  : 'No XSM solar spectrum included for this observation date.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4, 5, 6. Spectral visualization */}
      <SpectrumViewer
        spectra={spectraList}
        sourceProducts={obs.source_products}
        exposure={obs.exposure}
      />

      {/* 8 & 9. Elemental abundance chart & uncertainty presentation */}
      <AbundanceChart abundances={abundanceList} notes={abundanceNotes} />

      {/* 7. Elemental line-flux table */}
      <Card className="space-y-4">
        <SectionHeader
          title="Modelled Elemental Line Fluxes"
          subtitle="XSPEC-modelled line fluxes and symmetric uncertainties preserved verbatim from source tables"
          actions={<Badge tone="accent">{fluxList.length} records</Badge>}
        />
        {fluxList.length > 0 ? (
          <>
            {fluxList.length > 10 ? (
              <Alert tone="info">
                Source file <code>flux_29may.txt</code> contains 3 spectral/model rows per element;
                all {fluxList.length} individual records are displayed below without averaging.
              </Alert>
            ) : null}
            <DataTable
              caption={`Elemental line fluxes for ${obs.observation_id}`}
              columns={LINE_FLUX_COLUMNS}
              rows={fluxList}
              getRowKey={(row) => row.id}
            />
          </>
        ) : (
          <EmptyState
            title="No Line-Flux Records"
            description="No modelled line fluxes were recorded for this observation."
          />
        )}
      </Card>

      {/* 3 & 11. Source-product provenance & citation */}
      <ProvenancePanel
        title="Source-Product Provenance & Citation"
        doi={provDoi}
        contributor={provContrib}
        institution={provInst}
        license={provLicense}
        sourceUrl={provUrl}
        sourceProducts={obs.source_products}
      />

      <Alert tone="info" title="Citation & Attribution">
        <span className="inline-flex items-center gap-1">
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Data from Chandrayaan-2 CLASS (ISRO / ISSDC), published via Mendeley Data DOI{' '}
          <code>{provDoi ?? '10.17632/6mmd96j5bg.1'}</code> under CC BY 4.0.
        </span>
      </Alert>
    </div>
  );
}
