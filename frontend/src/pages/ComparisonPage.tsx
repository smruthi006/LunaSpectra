import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GitCompare } from 'lucide-react';
import { useObservationDetailQuery, useObservationsQuery } from '../api/queries';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { ScientificValue } from '../components/common/ScientificValue';
import { SectionHeader } from '../components/common/SectionHeader';
import { Select } from '../components/common/Select';
import { computeSafeDifference, formatScientificNumber } from '../utils/formatters';
import type { LineFlux } from '../types/api';

interface FluxComparisonRow {
  key: string;
  element: string;
  spectralLine: string;
  recordsA: LineFlux[];
  recordsB: LineFlux[];
  deltaSummary: string;
}

function summarizeFluxGroup(records: LineFlux[]): string {
  if (records.length === 0) return 'Not present';
  const valid = records.filter((r): r is LineFlux & { line_flux: number } => r.line_flux !== null);
  if (valid.length === 0) return 'null';
  const unit = valid[0]?.unit ?? '';
  if (valid.length === 1 && valid[0]) {
    const unc =
      valid[0].uncertainty !== null ? ` ± ${formatScientificNumber(valid[0].uncertainty, 4)}` : '';
    return `${formatScientificNumber(valid[0].line_flux, 4)}${unc} ${unit}`;
  }
  const vals = valid.map((v) => v.line_flux);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  return `${valid.length} rows: ${formatScientificNumber(minVal, 4)} – ${formatScientificNumber(maxVal, 4)} ${unit}`;
}

export function ComparisonPage() {
  const obsList = useObservationsQuery({ page: 1, page_size: 20, sort: 'observation_date_asc' });
  const items = useMemo(() => obsList.data?.items ?? [], [obsList.data?.items]);

  const [idA, setIdA] = useState<string>('');
  const [idB, setIdB] = useState<string>('');

  useEffect(() => {
    if (items.length >= 2 && !idA && !idB) {
      setIdA(items[0]?.observation_id ?? '');
      setIdB(items[1]?.observation_id ?? '');
    } else if (items.length === 1 && !idA) {
      setIdA(items[0]?.observation_id ?? '');
    }
  }, [items, idA, idB]);

  const detailA = useObservationDetailQuery(idA || undefined);
  const detailB = useObservationDetailQuery(idB || undefined);

  const sameSelected = Boolean(idA && idB && idA === idB);

  const fluxRows = useMemo<FluxComparisonRow[]>(() => {
    const a = detailA.data;
    const b = detailB.data;
    if (!a || !b) return [];

    const mapA = new Map<string, LineFlux[]>();
    const mapB = new Map<string, LineFlux[]>();

    for (const fl of a.line_fluxes) {
      const key = `${fl.element}::${fl.spectral_line ?? ''}`;
      const list = mapA.get(key) ?? [];
      list.push(fl);
      mapA.set(key, list);
    }
    for (const fl of b.line_fluxes) {
      const key = `${fl.element}::${fl.spectral_line ?? ''}`;
      const list = mapB.get(key) ?? [];
      list.push(fl);
      mapB.set(key, list);
    }

    const allKeys = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();
    return allKeys.map((key) => {
      const [element = '', spectralLine = ''] = key.split('::');
      const recA = mapA.get(key) ?? [];
      const recB = mapB.get(key) ?? [];

      let deltaSummary = 'Not comparable';
      if (recA.length === 0 || recB.length === 0) {
        deltaSummary = 'Element/line absent in one observation';
      } else if (recA.length === 1 && recB.length === 1 && recA[0] && recB[0]) {
        const diff = computeSafeDifference(
          recA[0].line_flux,
          recA[0].unit,
          recB[0].line_flux,
          recB[0].unit,
        );
        if (diff.comparable && diff.delta !== null) {
          const pct =
            diff.percentDifference !== null
              ? ` (${diff.percentDifference >= 0 ? '+' : ''}${diff.percentDifference.toFixed(1)}%)`
              : '';
          deltaSummary = `${diff.delta >= 0 ? '+' : ''}${formatScientificNumber(diff.delta, 4)} ${recA[0].unit}${pct}`;
        } else {
          deltaSummary = diff.reason ?? 'Not comparable';
        }
      } else {
        deltaSummary = `Multiple source rows (A: ${recA.length}, B: ${recB.length}) — range shown; no single 1:1 delta manufactured`;
      }

      return {
        key,
        element,
        spectralLine: spectralLine || 'Combined / unspecified',
        recordsA: recA,
        recordsB: recB,
        deltaSummary,
      };
    });
  }, [detailA.data, detailB.data]);

  const fluxColumns: DataTableColumn<FluxComparisonRow>[] = [
    {
      key: 'element',
      header: 'Element',
      render: (r) => <span className="font-semibold text-lunar-text">{r.element}</span>,
    },
    {
      key: 'line',
      header: 'Spectral Line',
      render: (r) => <span className="text-xs text-lunar-muted">{r.spectralLine}</span>,
    },
    {
      key: 'obsA',
      header: idA || 'Observation A',
      render: (r) => <span className="font-mono text-xs">{summarizeFluxGroup(r.recordsA)}</span>,
    },
    {
      key: 'obsB',
      header: idB || 'Observation B',
      render: (r) => <span className="font-mono text-xs">{summarizeFluxGroup(r.recordsB)}</span>,
    },
    {
      key: 'delta',
      header: 'Difference (B - A)',
      render: (r) => <span className="text-xs text-lunar-cyan">{r.deltaSummary}</span>,
    },
  ];

  const obsA = detailA.data;
  const obsB = detailB.data;

  const abundanceComparable = Boolean(
    obsA &&
    obsB &&
    obsA.abundances.some((a) => a.abundance !== null) &&
    obsB.abundances.some((b) => b.abundance !== null),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compare Observations"
        description="Side-by-side scientific comparison of two real Chandrayaan-2 CLASS observations with strict unit and missing-data guards."
        badge={<Badge tone="cyan">Strict Comparability Rules</Badge>}
      />

      {obsList.isLoading ? (
        <LoadingSkeleton rows={3} label="Loading selectable observations" />
      ) : obsList.error ? (
        <ErrorState error={obsList.error} onRetry={() => void obsList.refetch()} />
      ) : items.length < 2 ? (
        <EmptyState
          title="Two Observations Required"
          description="At least two stored observations are needed to perform a comparison."
        />
      ) : (
        <>
          <Card className="grid gap-4 sm:grid-cols-2">
            <Select
              id="compare-obs-a"
              label="Observation A"
              value={idA}
              onChange={(e) => setIdA(e.target.value)}
              options={items.map((o) => ({
                value: o.observation_id,
                label: `${o.observation_id} (${o.observation_date ?? 'no date'})`,
              }))}
            />
            <Select
              id="compare-obs-b"
              label="Observation B"
              value={idB}
              onChange={(e) => setIdB(e.target.value)}
              options={items.map((o) => ({
                value: o.observation_id,
                label: `${o.observation_id} (${o.observation_date ?? 'no date'})`,
              }))}
            />
          </Card>

          {sameSelected ? (
            <Alert tone="warning" title="Select Two Distinct Observations">
              Observation A and Observation B currently point to the same record ({idA}). Select two
              different observations for a meaningful comparison.
            </Alert>
          ) : null}

          {detailA.isLoading || detailB.isLoading ? (
            <LoadingSkeleton rows={6} label="Loading observation comparison details" />
          ) : detailA.error || detailB.error ? (
            <ErrorState error={detailA.error ?? detailB.error} />
          ) : obsA && obsB ? (
            <div className="space-y-6">
              {/* Metadata & Spectrum / XSM comparison */}
              <div className="grid gap-6 lg:grid-cols-2">
                {[obsA, obsB].map((obs, idx) => {
                  const hasXsm = obs.spectra.some((s) => s.spectrum_type === 'solar_xsm');
                  const bgCount = obs.spectra.filter(
                    (s) => s.spectrum_type === 'background',
                  ).length;
                  return (
                    <Card key={`${idx}-${obs.observation_id}`} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitCompare className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                          <h2 className="font-mono text-sm font-semibold text-lunar-text">
                            {idx === 0 ? 'A' : 'B'}: {obs.observation_id}
                          </h2>
                        </div>
                        <Link
                          to={`/observations/${encodeURIComponent(obs.observation_id)}`}
                          className="inline-flex items-center gap-1 text-xs text-lunar-cyan hover:underline"
                        >
                          Detail
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <dt className="text-lunar-muted">Date</dt>
                          <dd className="font-mono text-lunar-text">
                            {obs.observation_date ?? 'null'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-lunar-muted">Exposure</dt>
                          <dd className="font-mono text-lunar-text">
                            {obs.exposure !== null ? `${obs.exposure} s` : 'null'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-lunar-muted">Start Time</dt>
                          <dd className="font-mono text-lunar-text">
                            {obs.acquisition_start_time ?? 'null'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-lunar-muted">End Time</dt>
                          <dd className="font-mono text-lunar-text">
                            {obs.acquisition_end_time ?? 'null'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-lunar-muted">Spectra (Background)</dt>
                          <dd className="font-mono text-lunar-text">
                            {obs.spectra.length} ({bgCount} bg)
                          </dd>
                        </div>
                        <div>
                          <dt className="text-lunar-muted">XSM Solar Data</dt>
                          <dd>
                            {hasXsm ? (
                              <Badge tone="emerald">Available</Badge>
                            ) : (
                              <Badge tone="neutral">Not included</Badge>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </Card>
                  );
                })}
              </div>

              {/* Abundance comparison */}
              <Card className="space-y-4">
                <SectionHeader
                  title="Elemental Abundance Comparison (wt%)"
                  subtitle="Derived weight-percent values and uncertainties"
                />
                {!abundanceComparable ? (
                  <Alert tone="warning" title="Abundance Comparison Unavailable">
                    Direct abundance comparison is unavailable because equivalent verified abundance
                    records are not available for both observations.
                  </Alert>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  {[obsA, obsB].map((obs, idx) => (
                    <div
                      key={`${idx}-${obs.observation_id}`}
                      className="rounded-md border border-lunar-border bg-lunar-panel/50 p-4 space-y-2"
                    >
                      <p className="font-mono text-xs font-semibold text-lunar-text">
                        {obs.observation_id} ({obs.abundances.length} verified records)
                      </p>
                      {obs.abundances.length === 0 ? (
                        <p className="text-xs text-lunar-muted">
                          No unambiguous abundance records available (181120/R2_abundance.txt has a
                          5-element header vs. 4-value array mismatch and is withheld).
                        </p>
                      ) : (
                        <ul className="space-y-1.5 text-xs">
                          {obs.abundances.map((ab) => (
                            <li key={ab.id} className="flex items-center justify-between">
                              <span className="font-semibold text-lunar-text">{ab.element}</span>
                              <ScientificValue
                                value={ab.abundance}
                                unit={ab.unit}
                                uncertainty={ab.uncertainty}
                                uncertaintyUpper={ab.uncertainty_upper}
                                uncertaintyLower={ab.uncertainty_lower}
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Line-flux comparison */}
              <Card className="space-y-4">
                <SectionHeader
                  title="Elemental Line-Flux Comparison (photons/cm2/s)"
                  subtitle="Numerical differences are computed only for matching 1:1 elements with identical non-null units"
                />
                <DataTable
                  caption="Comparison of modelled elemental line fluxes between selected observations"
                  columns={fluxColumns}
                  rows={fluxRows}
                  getRowKey={(r) => r.key}
                />
              </Card>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
