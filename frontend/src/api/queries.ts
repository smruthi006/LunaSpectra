import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { ApiClientError, apiFetch } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  DatasetSchema,
  DatasetsResponseSchema,
  DatasetSummarySchema,
  ElementsResponseSchema,
  HealthSchema,
  MapAvailabilitySchema,
  ObservationAbundancesResponseSchema,
  ObservationDetailSchema,
  ObservationLineFluxesResponseSchema,
  ObservationSpectraResponseSchema,
  PaginatedObservationsResponseSchema,
} from './schemas';
import type {
  Dataset,
  DatasetsResponse,
  DatasetSummary,
  ElementsResponse,
  HealthResponse,
  MapAvailability,
  ObservationAbundancesResponse,
  ObservationDetail,
  ObservationLineFluxesResponse,
  ObservationSpectraResponse,
  ObservationsQueryParams,
  PaginatedObservationsResponse,
  SpectraQueryParams,
} from '../types/api';

export function shouldRetrySafeGet(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) {
    return false;
  }
  if (error instanceof ApiClientError) {
    if (error.kind === 'validation_error' || error.kind === 'invalid_json') {
      return false;
    }
    if (error.kind === 'http_error' && error.status !== undefined && error.status < 500) {
      return false;
    }
  }
  return true;
}

export function useHealthQuery(
  options?: Omit<UseQueryOptions<HealthResponse, ApiClientError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<HealthResponse, ApiClientError>({
    queryKey: ['health'],
    queryFn: ({ signal }) => apiFetch(API_ENDPOINTS.health, HealthSchema, { signal }),
    staleTime: 15_000,
    ...options,
  });
}

export function useDatasetsQuery() {
  return useQuery<DatasetsResponse, ApiClientError>({
    queryKey: ['datasets'],
    queryFn: ({ signal }) => apiFetch(API_ENDPOINTS.datasets, DatasetsResponseSchema, { signal }),
    staleTime: 60_000,
  });
}

export function useDatasetQuery(datasetId: string | undefined) {
  return useQuery<Dataset, ApiClientError>({
    queryKey: ['dataset', datasetId],
    queryFn: ({ signal }) =>
      apiFetch(API_ENDPOINTS.datasetById(datasetId ?? ''), DatasetSchema, { signal }),
    enabled: Boolean(datasetId),
    staleTime: 60_000,
  });
}

export function useDatasetSummaryQuery(datasetId?: string) {
  return useQuery<DatasetSummary, ApiClientError>({
    queryKey: ['dataset-summary', datasetId ?? 'active'],
    queryFn: ({ signal }) =>
      apiFetch(API_ENDPOINTS.datasetSummary(datasetId), DatasetSummarySchema, { signal }),
    staleTime: 60_000,
  });
}

export function useElementsQuery() {
  return useQuery<ElementsResponse, ApiClientError>({
    queryKey: ['elements'],
    queryFn: ({ signal }) => apiFetch(API_ENDPOINTS.elements, ElementsResponseSchema, { signal }),
    staleTime: 60_000,
  });
}

export function useObservationsQuery(params: ObservationsQueryParams = {}) {
  return useQuery<PaginatedObservationsResponse, ApiClientError>({
    queryKey: ['observations', params],
    queryFn: ({ signal }) =>
      apiFetch(API_ENDPOINTS.observations(params), PaginatedObservationsResponseSchema, { signal }),
    staleTime: 30_000,
  });
}

export function useObservationDetailQuery(observationId: string | undefined) {
  return useQuery<ObservationDetail, ApiClientError>({
    queryKey: ['observation-detail', observationId],
    queryFn: ({ signal }) =>
      apiFetch(API_ENDPOINTS.observationDetail(observationId ?? ''), ObservationDetailSchema, {
        signal,
      }),
    enabled: Boolean(observationId),
    staleTime: 60_000,
  });
}

export function useObservationSpectraQuery(
  observationId: string | undefined,
  params: SpectraQueryParams = {},
) {
  return useQuery<ObservationSpectraResponse, ApiClientError>({
    queryKey: ['observation-spectra', observationId, params],
    queryFn: ({ signal }) =>
      apiFetch(
        API_ENDPOINTS.observationSpectra(observationId ?? '', params),
        ObservationSpectraResponseSchema,
        { signal },
      ),
    enabled: Boolean(observationId),
    staleTime: 60_000,
  });
}

export function useObservationAbundancesQuery(observationId: string | undefined) {
  return useQuery<ObservationAbundancesResponse, ApiClientError>({
    queryKey: ['observation-abundances', observationId],
    queryFn: ({ signal }) =>
      apiFetch(
        API_ENDPOINTS.observationAbundances(observationId ?? ''),
        ObservationAbundancesResponseSchema,
        { signal },
      ),
    enabled: Boolean(observationId),
    staleTime: 60_000,
  });
}

export function useObservationLineFluxesQuery(observationId: string | undefined) {
  return useQuery<ObservationLineFluxesResponse, ApiClientError>({
    queryKey: ['observation-line-fluxes', observationId],
    queryFn: ({ signal }) =>
      apiFetch(
        API_ENDPOINTS.observationLineFluxes(observationId ?? ''),
        ObservationLineFluxesResponseSchema,
        { signal },
      ),
    enabled: Boolean(observationId),
    staleTime: 60_000,
  });
}

export function useMapAvailabilityQuery() {
  return useQuery<MapAvailability, ApiClientError>({
    queryKey: ['map-availability'],
    queryFn: ({ signal }) =>
      apiFetch(API_ENDPOINTS.mapAvailability, MapAvailabilitySchema, { signal }),
    staleTime: 60_000,
  });
}
