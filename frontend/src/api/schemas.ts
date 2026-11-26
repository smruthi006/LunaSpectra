import { z } from 'zod';

export const ApiErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).default({}),
});

export const ApiErrorResponseSchema = z.object({
  error: ApiErrorDetailSchema,
});

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  page_size: z.number().int().min(1),
  total_items: z.number().int().min(0),
  total_pages: z.number().int().min(0),
});

export const HealthSchema = z.object({
  status: z.string(),
  application: z.string(),
  api_version: z.string(),
  database_status: z.string(),
  active_dataset: z.string().nullable(),
  dataset_doi: z.string().nullable(),
  data_origin: z.string().nullable(),
  observation_count: z.number().int().min(0),
  spectrum_count: z.number().int().min(0),
  abundance_count: z.number().int().min(0),
});

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  doi: z.string(),
  version: z.string(),
  contributor: z.string(),
  institution: z.string(),
  license: z.string(),
  source_url: z.string(),
  data_origin: z.string(),
  description: z.string().nullable(),
  observation_count: z.number().int().min(0),
  available_content_types: z.array(z.string()),
  created_at: z.string(),
});

export const DatasetsResponseSchema = z.object({
  items: z.array(DatasetSchema),
  total_items: z.number().int().min(0),
});

export const DateRangeSchema = z.object({
  earliest_date: z.string().nullable(),
  latest_date: z.string().nullable(),
  distinct_dates: z.array(z.string()),
});

export const CoordinateAvailabilitySchema = z.object({
  available: z.boolean(),
  coordinate_record_count: z.number().int().min(0),
  footprint_record_count: z.number().int().min(0),
  note: z.string(),
});

export const DatasetSummarySchema = z.object({
  dataset_id: z.string(),
  name: z.string(),
  doi: z.string(),
  version: z.string(),
  contributor: z.string(),
  institution: z.string(),
  license: z.string(),
  source_url: z.string(),
  data_origin: z.string(),
  observation_count: z.number().int().min(0),
  spectrum_count: z.number().int().min(0),
  background_spectrum_count: z.number().int().min(0),
  calibration_spectrum_count: z.number().int().min(0),
  solar_spectrum_count: z.number().int().min(0),
  available_elements: z.array(z.string()),
  abundance_record_count: z.number().int().min(0),
  line_flux_record_count: z.number().int().min(0),
  date_range: DateRangeSchema,
  coordinate_availability: CoordinateAvailabilitySchema,
  missing_field_summary: z.record(z.string(), z.number().int().min(0)),
  known_limitations: z.array(z.string()),
});

export const MapAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.string(),
  coordinate_record_count: z.number().int().min(0),
  footprint_record_count: z.number().int().min(0),
});

export const ElementSchema = z.object({
  element: z.string(),
  element_name: z.string().nullable(),
  measurement_types: z.array(z.string()),
  units: z.array(z.string()),
  abundance_record_count: z.number().int().min(0),
  line_flux_record_count: z.number().int().min(0),
  total_record_count: z.number().int().min(0),
  uncertainty_available: z.boolean(),
});

export const ElementsResponseSchema = z.object({
  items: z.array(ElementSchema),
  total_items: z.number().int().min(0),
});

export const SourceProductSchema = z.object({
  id: z.string(),
  dataset_id: z.string(),
  original_filename: z.string(),
  relative_path: z.string(),
  checksum_sha256: z.string(),
  format: z.string(),
  file_size: z.number().int().min(0),
  source_url: z.string().nullable(),
  parse_status: z.string(),
  parse_error: z.string().nullable(),
});

export const SpectrumSchema = z.object({
  id: z.string(),
  observation_id: z.string(),
  source_product_id: z.string(),
  spectrum_type: z.string(),
  point_count: z.number().int().min(0),
  returned_point_count: z.number().int().min(0),
  downsampled: z.boolean(),
  energy_or_channel: z.array(z.number()),
  measured_value: z.array(z.number()),
  uncertainty: z.array(z.number()).nullable(),
  energy_unit: z.string().nullable(),
  value_unit: z.string(),
});

export const ObservationSpectraResponseSchema = z.object({
  observation_id: z.string(),
  spectrum_count: z.number().int().min(0),
  spectra: z.array(SpectrumSchema),
});

export const LineFluxSchema = z.object({
  id: z.string(),
  observation_id: z.string(),
  source_product_id: z.string(),
  element: z.string(),
  spectral_line: z.string().nullable(),
  line_energy: z.number().nullable(),
  line_flux: z.number().nullable(),
  uncertainty: z.number().nullable(),
  unit: z.string(),
});

export const AbundanceSchema = z.object({
  id: z.string(),
  observation_id: z.string(),
  source_product_id: z.string(),
  element: z.string(),
  abundance: z.number().nullable(),
  uncertainty: z.number().nullable(),
  uncertainty_upper: z.number().nullable(),
  uncertainty_lower: z.number().nullable(),
  unit: z.string(),
  derivation_note: z.string().nullable(),
});

export const ObservationSummarySchema = z.object({
  id: z.string(),
  observation_id: z.string(),
  dataset_id: z.string(),
  observation_date: z.string().nullable(),
  acquisition_start_time: z.string().nullable(),
  acquisition_end_time: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  footprint_geometry: z.string().nullable(),
  exposure: z.number().nullable(),
  data_origin: z.string(),
  spectrum_count: z.number().int().min(0),
  background_spectrum_count: z.number().int().min(0),
  abundance_count: z.number().int().min(0),
  line_flux_count: z.number().int().min(0),
  elements: z.array(z.string()),
});

export const PaginatedObservationsResponseSchema = z.object({
  items: z.array(ObservationSummarySchema),
  pagination: PaginationMetaSchema,
});

export const ObservationDetailSchema = z.object({
  id: z.string(),
  observation_id: z.string(),
  dataset_id: z.string(),
  observation_date: z.string().nullable(),
  acquisition_start_time: z.string().nullable(),
  acquisition_end_time: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  footprint_geometry: z.string().nullable(),
  exposure: z.number().nullable(),
  data_origin: z.string(),
  created_at: z.string(),
  source_products: z.array(SourceProductSchema),
  spectra: z.array(SpectrumSchema),
  line_fluxes: z.array(LineFluxSchema),
  abundances: z.array(AbundanceSchema),
  provenance: z.record(z.string(), z.unknown()),
  missing_fields: z.array(z.string()),
});

export const ObservationAbundancesResponseSchema = z.object({
  observation_id: z.string(),
  count: z.number().int().min(0),
  abundances: z.array(AbundanceSchema),
  notes: z.array(z.string()),
});

export const ObservationLineFluxesResponseSchema = z.object({
  observation_id: z.string(),
  count: z.number().int().min(0),
  line_fluxes: z.array(LineFluxSchema),
});
