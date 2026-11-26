import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { useElementsQuery, useObservationsQuery } from '../api/queries';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { DataTable, type DataTableColumn } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { Pagination } from '../components/common/Pagination';
import { Select } from '../components/common/Select';
import type { ObservationSort, ObservationSummary } from '../types/api';

const COLUMNS: DataTableColumn<ObservationSummary>[] = [
  {
    key: 'id',
    header: 'Observation ID',
    render: (row) => (
      <Link
        to={`/observations/${encodeURIComponent(row.observation_id)}`}
        className="font-mono font-semibold text-lunar-cyan hover:underline"
      >
        {row.observation_id}
      </Link>
    ),
  },
  {
    key: 'date',
    header: 'Observation Date',
    render: (row) => <span className="font-mono text-xs">{row.observation_date ?? 'null'}</span>,
  },
  {
    key: 'start',
    header: 'Start Time (UTC)',
    render: (row) =>
      row.acquisition_start_time ? (
        <span className="font-mono text-xs">{row.acquisition_start_time}</span>
      ) : (
        <span className="font-mono text-xs italic text-lunar-subtle">null (STARTIME=0)</span>
      ),
  },
  {
    key: 'end',
    header: 'End Time (UTC)',
    render: (row) =>
      row.acquisition_end_time ? (
        <span className="font-mono text-xs">{row.acquisition_end_time}</span>
      ) : (
        <span className="font-mono text-xs italic text-lunar-subtle">null</span>
      ),
  },
  {
    key: 'spectra',
    header: 'Spectra',
    render: (row) => (
      <Badge tone={row.spectrum_count > 0 ? 'cyan' : 'neutral'}>
        {row.spectrum_count} ({row.background_spectrum_count} bg)
      </Badge>
    ),
  },
  {
    key: 'abundances',
    header: 'Abundances',
    render: (row) =>
      row.abundance_count > 0 ? (
        <Badge tone="emerald">{row.abundance_count} verified</Badge>
      ) : (
        <Badge tone="amber">0 (withheld/unavailable)</Badge>
      ),
  },
  {
    key: 'fluxes',
    header: 'Line Fluxes',
    render: (row) => <Badge tone="accent">{row.line_flux_count} records</Badge>,
  },
  {
    key: 'coords',
    header: 'Coordinates',
    render: (row) =>
      row.latitude !== null && row.longitude !== null ? (
        <span className="font-mono text-xs">
          {row.latitude}, {row.longitude}
        </span>
      ) : (
        <span className="text-xs text-lunar-subtle">Unavailable</span>
      ),
  },
  {
    key: 'origin',
    header: 'Origin',
    render: (row) => <Badge tone="emerald">{row.data_origin}</Badge>,
  },
  {
    key: 'action',
    header: 'View',
    align: 'right',
    render: (row) => (
      <Link to={`/observations/${encodeURIComponent(row.observation_id)}`}>
        <Button variant="outline" size="sm">
          Inspect
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </Link>
    ),
  },
];

export function ObservationsPage() {
  const [page, setPage] = useState(1);
  const [observationDate, setObservationDate] = useState('');
  const [element, setElement] = useState('');
  const [hasAbundance, setHasAbundance] = useState<string>('');
  const [hasSpectrum, setHasSpectrum] = useState<string>('');
  const [sort, setSort] = useState<ObservationSort>('observation_date_asc');

  const elementsQuery = useElementsQuery();
  const obsQuery = useObservationsQuery({
    page,
    page_size: 20,
    observation_date: observationDate || undefined,
    element: element || undefined,
    has_abundance: hasAbundance === '' ? undefined : hasAbundance === 'true',
    has_spectrum: hasSpectrum === '' ? undefined : hasSpectrum === 'true',
    sort,
  });

  const resetFilters = () => {
    setPage(1);
    setObservationDate('');
    setElement('');
    setHasAbundance('');
    setHasSpectrum('');
    setSort('observation_date_asc');
  };

  const elementOptions = [
    { value: '', label: 'All elements' },
    ...(elementsQuery.data?.items.map((el) => ({
      value: el.element,
      label: el.element_name ? `${el.element} (${el.element_name})` : el.element,
    })) ?? []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Observations"
        description="Browse genuine Chandrayaan-2 CLASS lunar observations served by /api/v1/observations."
      />

      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            id="filter-date"
            label="Observation Date"
            value={observationDate}
            onChange={(e) => {
              setPage(1);
              setObservationDate(e.target.value);
            }}
            options={[
              { value: '', label: 'All dates' },
              { value: '2019-11-18', label: '2019-11-18' },
              { value: '2020-05-29', label: '2020-05-29' },
            ]}
          />

          <Select
            id="filter-element"
            label="Element"
            value={element}
            onChange={(e) => {
              setPage(1);
              setElement(e.target.value);
            }}
            options={elementOptions}
          />

          <Select
            id="filter-abundance"
            label="Abundance Availability"
            value={hasAbundance}
            onChange={(e) => {
              setPage(1);
              setHasAbundance(e.target.value);
            }}
            options={[
              { value: '', label: 'Any' },
              { value: 'true', label: 'Has verified abundance' },
              { value: 'false', label: 'No verified abundance' },
            ]}
          />

          <Select
            id="filter-spectrum"
            label="Spectrum Availability"
            value={hasSpectrum}
            onChange={(e) => {
              setPage(1);
              setHasSpectrum(e.target.value);
            }}
            options={[
              { value: '', label: 'Any' },
              { value: 'true', label: 'Has spectrum' },
              { value: 'false', label: 'No spectrum' },
            ]}
          />

          <Select
            id="filter-sort"
            label="Sort Order"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value as ObservationSort);
            }}
            options={[
              { value: 'observation_date_asc', label: 'Date (oldest first)' },
              { value: 'observation_date_desc', label: 'Date (newest first)' },
              { value: 'exposure_desc', label: 'Exposure (highest first)' },
              { value: 'observation_id_asc', label: 'Observation ID (A-Z)' },
            ]}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset filters
          </Button>
        </div>
      </Card>

      {obsQuery.isLoading ? (
        <LoadingSkeleton rows={4} label="Loading observations table" />
      ) : obsQuery.error ? (
        <ErrorState error={obsQuery.error} onRetry={() => void obsQuery.refetch()} />
      ) : !obsQuery.data || obsQuery.data.items.length === 0 ? (
        <EmptyState
          title="No Matching Observations"
          description="No real observations match the selected filter combination."
          action={
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            caption="Chandrayaan-2 CLASS real observations table"
            columns={COLUMNS}
            rows={obsQuery.data.items}
            getRowKey={(row) => row.id}
          />
          <Pagination
            page={obsQuery.data.pagination.page}
            totalPages={obsQuery.data.pagination.total_pages}
            totalItems={obsQuery.data.pagination.total_items}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
