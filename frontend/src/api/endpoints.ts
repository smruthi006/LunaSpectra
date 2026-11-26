import type { ObservationsQueryParams, SpectraQueryParams } from '../types/api';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const base =
    typeof configured === 'string' && configured.trim().length > 0
      ? configured.trim()
      : DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, '');
}

export function getBackendDocsUrl(): string {
  const base = getApiBaseUrl();
  return base.replace(/\/api\/v\d+$/, '') + '/docs';
}

export function buildObservationsUrl(params: ObservationsQueryParams = {}): string {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set('page', String(params.page));
  if (params.page_size !== undefined) sp.set('page_size', String(params.page_size));
  if (params.observation_date) sp.set('observation_date', params.observation_date);
  if (params.element) sp.set('element', params.element);
  if (params.has_abundance !== undefined) sp.set('has_abundance', String(params.has_abundance));
  if (params.has_spectrum !== undefined) sp.set('has_spectrum', String(params.has_spectrum));
  if (params.sort) sp.set('sort', params.sort);
  const query = sp.toString();
  return query ? `/observations?${query}` : '/observations';
}

export function buildSpectraUrl(observationId: string, params: SpectraQueryParams = {}): string {
  const sp = new URLSearchParams();
  if (params.spectrum_type) sp.set('spectrum_type', params.spectrum_type);
  if (params.max_points !== undefined) sp.set('max_points', String(params.max_points));
  const query = sp.toString();
  const base = `/observations/${encodeURIComponent(observationId)}/spectra`;
  return query ? `${base}?${query}` : base;
}

export const API_ENDPOINTS = {
  health: '/health',
  datasets: '/datasets',
  datasetById: (datasetId: string) => `/datasets/${encodeURIComponent(datasetId)}`,
  datasetSummary: (datasetId?: string) =>
    datasetId ? `/dataset/summary?dataset_id=${encodeURIComponent(datasetId)}` : '/dataset/summary',
  elements: '/elements',
  observations: buildObservationsUrl,
  observationDetail: (observationId: string) =>
    `/observations/${encodeURIComponent(observationId)}`,
  observationSpectra: buildSpectraUrl,
  observationAbundances: (observationId: string) =>
    `/observations/${encodeURIComponent(observationId)}/abundances`,
  observationLineFluxes: (observationId: string) =>
    `/observations/${encodeURIComponent(observationId)}/line-fluxes`,
  mapAvailability: '/map/availability',
} as const;
