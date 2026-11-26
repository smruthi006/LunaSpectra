import type { z } from 'zod';
import type {
  AbundanceSchema,
  DatasetSchema,
  DatasetsResponseSchema,
  DatasetSummarySchema,
  ElementSchema,
  ElementsResponseSchema,
  HealthSchema,
  LineFluxSchema,
  MapAvailabilitySchema,
  ObservationAbundancesResponseSchema,
  ObservationDetailSchema,
  ObservationLineFluxesResponseSchema,
  ObservationSpectraResponseSchema,
  ObservationSummarySchema,
  PaginatedObservationsResponseSchema,
  PaginationMetaSchema,
  SourceProductSchema,
  SpectrumSchema,
} from '../api/schemas';

export type HealthResponse = z.infer<typeof HealthSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type DatasetsResponse = z.infer<typeof DatasetsResponseSchema>;
export type DatasetSummary = z.infer<typeof DatasetSummarySchema>;
export type MapAvailability = z.infer<typeof MapAvailabilitySchema>;
export type ElementSummary = z.infer<typeof ElementSchema>;
export type ElementsResponse = z.infer<typeof ElementsResponseSchema>;
export type SourceProduct = z.infer<typeof SourceProductSchema>;
export type Spectrum = z.infer<typeof SpectrumSchema>;
export type ObservationSpectraResponse = z.infer<typeof ObservationSpectraResponseSchema>;
export type LineFlux = z.infer<typeof LineFluxSchema>;
export type Abundance = z.infer<typeof AbundanceSchema>;
export type ObservationSummary = z.infer<typeof ObservationSummarySchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type PaginatedObservationsResponse = z.infer<typeof PaginatedObservationsResponseSchema>;
export type ObservationDetail = z.infer<typeof ObservationDetailSchema>;
export type ObservationAbundancesResponse = z.infer<typeof ObservationAbundancesResponseSchema>;
export type ObservationLineFluxesResponse = z.infer<typeof ObservationLineFluxesResponseSchema>;

export type ObservationSort =
  'observation_date_asc' | 'observation_date_desc' | 'exposure_desc' | 'observation_id_asc';

export interface ObservationsQueryParams {
  page?: number;
  page_size?: number;
  observation_date?: string;
  element?: string;
  has_abundance?: boolean;
  has_spectrum?: boolean;
  sort?: ObservationSort;
}

export interface SpectraQueryParams {
  spectrum_type?: string;
  max_points?: number;
}
