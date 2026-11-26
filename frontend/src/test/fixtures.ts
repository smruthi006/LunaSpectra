import type {
  DatasetsResponse,
  DatasetSummary,
  ElementsResponse,
  HealthResponse,
  MapAvailability,
  ObservationAbundancesResponse,
  ObservationDetail,
  ObservationLineFluxesResponse,
  ObservationSpectraResponse,
  PaginatedObservationsResponse,
} from '../types/api';

// Test-only fixtures matching verified backend Pydantic shapes (never shipped in app code).
export const TEST_HEALTH: HealthResponse = {
  status: 'ok',
  application: 'LunaSpectra',
  api_version: 'v1',
  database_status: 'connected',
  active_dataset: 'class_mendeley_v1',
  dataset_doi: '10.17632/6mmd96j5bg.1',
  data_origin: 'mission',
  observation_count: 2,
  spectrum_count: 8,
  abundance_count: 4,
};

export const TEST_DATASETS: DatasetsResponse = {
  items: [
    {
      id: 'class_mendeley_v1',
      name: 'CLASS_CHANDRAYAAN2',
      doi: '10.17632/6mmd96j5bg.1',
      version: '1',
      contributor: 'Shyama Narendranath',
      institution: 'Indian Space Research Organisation',
      license: 'CC BY 4.0',
      source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
      data_origin: 'mission',
      description: 'Genuine Chandrayaan-2 CLASS lunar X-ray spectral data.',
      observation_count: 2,
      available_content_types: ['abundance', 'background', 'line_flux', 'solar_xsm', 'source'],
      created_at: '2026-11-24T18:11:27+00:00',
    },
  ],
  total_items: 1,
};

export const TEST_SUMMARY: DatasetSummary = {
  dataset_id: 'class_mendeley_v1',
  name: 'CLASS_CHANDRAYAAN2',
  doi: '10.17632/6mmd96j5bg.1',
  version: '1',
  contributor: 'Shyama Narendranath',
  institution: 'Indian Space Research Organisation',
  license: 'CC BY 4.0',
  source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
  data_origin: 'mission',
  observation_count: 2,
  spectrum_count: 8,
  background_spectrum_count: 2,
  calibration_spectrum_count: 2,
  solar_spectrum_count: 2,
  available_elements: ['Al', 'Ca', 'Fe', 'Mg', 'Na', 'O', 'Si'],
  abundance_record_count: 4,
  line_flux_record_count: 26,
  date_range: {
    earliest_date: '2019-11-18',
    latest_date: '2020-05-29',
    distinct_dates: ['2019-11-18', '2020-05-29'],
  },
  coordinate_availability: {
    available: false,
    coordinate_record_count: 0,
    footprint_record_count: 0,
    note: 'Geospatial coordinates and footprint polygons are absent in DOI 10.17632/6mmd96j5bg.1.',
  },
  missing_field_summary: {
    acquisition_start_time: 1,
    latitude: 2,
    longitude: 2,
    footprint_geometry: 2,
  },
  known_limitations: ['Only two lunar observation dates are present.'],
};

export const TEST_ELEMENTS: ElementsResponse = {
  items: [
    {
      element: 'Mg',
      element_name: 'Magnesium',
      measurement_types: ['abundance', 'line_flux'],
      units: ['photons/cm2/s', 'wt%'],
      abundance_record_count: 1,
      line_flux_record_count: 4,
      total_record_count: 5,
      uncertainty_available: true,
    },
    {
      element: 'Ca',
      element_name: 'Calcium',
      measurement_types: ['abundance', 'line_flux'],
      units: ['photons/cm2/s', 'wt%'],
      abundance_record_count: 1,
      line_flux_record_count: 6,
      total_record_count: 7,
      uncertainty_available: true,
    },
  ],
  total_items: 2,
};

export const TEST_MAP_UNAVAILABLE: MapAvailability = {
  available: false,
  reason: 'The active real dataset does not provide verified geospatial coordinates.',
  coordinate_record_count: 0,
  footprint_record_count: 0,
};

export const TEST_OBSERVATIONS: PaginatedObservationsResponse = {
  items: [
    {
      id: 'obs_class_20191118',
      observation_id: 'CLASS_20191118',
      dataset_id: 'class_mendeley_v1',
      observation_date: '2019-11-18',
      acquisition_start_time: '2019-11-18T12:58:48.000',
      acquisition_end_time: '2019-11-18T13:05:04.000',
      latitude: null,
      longitude: null,
      footprint_geometry: null,
      exposure: 368.0,
      data_origin: 'mission',
      spectrum_count: 4,
      background_spectrum_count: 1,
      abundance_count: 0,
      line_flux_count: 5,
      elements: ['Al', 'Mg', 'Na', 'O', 'Si'],
    },
    {
      id: 'obs_class_20200529',
      observation_id: 'CLASS_20200529',
      dataset_id: 'class_mendeley_v1',
      observation_date: '2020-05-29',
      acquisition_start_time: null,
      acquisition_end_time: '2020-05-29T10:45:48.257',
      latitude: null,
      longitude: null,
      footprint_geometry: null,
      exposure: 16.0,
      data_origin: 'mission',
      spectrum_count: 2,
      background_spectrum_count: 1,
      abundance_count: 4,
      line_flux_count: 21,
      elements: ['Al', 'Ca', 'Fe', 'Mg', 'O', 'Si'],
    },
  ],
  pagination: { page: 1, page_size: 20, total_items: 2, total_pages: 1 },
};

export const TEST_OBS_DETAIL_NOV: ObservationDetail = {
  id: 'obs_class_20191118',
  observation_id: 'CLASS_20191118',
  dataset_id: 'class_mendeley_v1',
  observation_date: '2019-11-18',
  acquisition_start_time: '2019-11-18T12:58:48.000',
  acquisition_end_time: '2019-11-18T13:05:04.000',
  latitude: null,
  longitude: null,
  footprint_geometry: null,
  exposure: 368.0,
  data_origin: 'mission',
  created_at: '2026-11-24T18:11:27+00:00',
  source_products: [
    {
      id: 'sp_nov_src',
      dataset_id: 'class_mendeley_v1',
      original_filename: 'ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits',
      relative_path: 'data_repository/181120/ch2_cla_scd.fits',
      checksum_sha256: 'f65183eb504d5b29ea02477cbd594cf8606578a07d7bcba7bff7bf2bb8dc85ea',
      format: 'FITS',
      file_size: 20160,
      source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
      parse_status: 'parsed',
      parse_error: null,
    },
  ],
  spectra: [
    {
      id: 'spec_nov_src',
      observation_id: 'obs_class_20191118',
      source_product_id: 'sp_nov_src',
      spectrum_type: 'source',
      point_count: 4,
      returned_point_count: 4,
      downsampled: false,
      energy_or_channel: [0, 1, 2, 3],
      measured_value: [1, 5, 12, 4],
      uncertainty: null,
      energy_unit: 'channel',
      value_unit: 'count',
    },
    {
      id: 'spec_nov_bg',
      observation_id: 'obs_class_20191118',
      source_product_id: 'sp_nov_src',
      spectrum_type: 'background',
      point_count: 4,
      returned_point_count: 4,
      downsampled: false,
      energy_or_channel: [0, 1, 2, 3],
      measured_value: [2, 3, 2, 1],
      uncertainty: null,
      energy_unit: 'channel',
      value_unit: 'count',
    },
    {
      id: 'spec_nov_xsm',
      observation_id: 'obs_class_20191118',
      source_product_id: 'sp_nov_src',
      spectrum_type: 'solar_xsm',
      point_count: 4,
      returned_point_count: 4,
      downsampled: false,
      energy_or_channel: [0, 1, 2, 3],
      measured_value: [0, 10, 20, 15],
      uncertainty: [0, 3, 4, 3],
      energy_unit: 'channel',
      value_unit: 'count',
    },
  ],
  line_fluxes: [
    {
      id: 'flux_nov_mg',
      observation_id: 'obs_class_20191118',
      source_product_id: 'sp_nov_src',
      element: 'Mg',
      spectral_line: null,
      line_energy: null,
      line_flux: 0.02,
      uncertainty: 0.005,
      unit: 'photons/cm2/s',
    },
    {
      id: 'flux_nov_na',
      observation_id: 'obs_class_20191118',
      source_product_id: 'sp_nov_src',
      element: 'Na',
      spectral_line: null,
      line_energy: null,
      line_flux: 0.013,
      uncertainty: 0.0003,
      unit: 'photons/cm2/s',
    },
  ],
  abundances: [],
  provenance: {
    dataset_name: 'CLASS_CHANDRAYAAN2',
    doi: '10.17632/6mmd96j5bg.1',
    contributor: 'Shyama Narendranath',
    institution: 'Indian Space Research Organisation',
    license: 'CC BY 4.0',
    source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
  },
  missing_fields: ['latitude', 'longitude', 'footprint_geometry', 'verified_abundances'],
};

export const TEST_OBS_DETAIL_MAY: ObservationDetail = {
  id: 'obs_class_20200529',
  observation_id: 'CLASS_20200529',
  dataset_id: 'class_mendeley_v1',
  observation_date: '2020-05-29',
  acquisition_start_time: null,
  acquisition_end_time: '2020-05-29T10:45:48.257',
  latitude: null,
  longitude: null,
  footprint_geometry: null,
  exposure: 16.0,
  data_origin: 'mission',
  created_at: '2026-11-24T18:11:27+00:00',
  source_products: [
    {
      id: 'sp_may_src',
      dataset_id: 'class_mendeley_v1',
      original_filename: 'ch2_cla_scd_all_time_added_20200529T104532257-20200529T104548257.fits',
      relative_path: 'data_repository/290520/ch2_cla_scd.fits',
      checksum_sha256: 'a9df7e37f34961172bd5ba1943920bb0019d39aabc9459ebc261dbbaabd79989',
      format: 'FITS',
      file_size: 20160,
      source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
      parse_status: 'parsed',
      parse_error: null,
    },
  ],
  spectra: [
    {
      id: 'spec_may_src',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      spectrum_type: 'source',
      point_count: 4,
      returned_point_count: 4,
      downsampled: false,
      energy_or_channel: [0, 1, 2, 3],
      measured_value: [0, 2, 8, 3],
      uncertainty: null,
      energy_unit: 'channel',
      value_unit: 'count',
    },
  ],
  line_fluxes: [
    {
      id: 'flux_may_mg_1',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      element: 'Mg',
      spectral_line: null,
      line_energy: null,
      line_flux: 0.32,
      uncertainty: 0.05,
      unit: 'photons/cm2/s',
    },
    {
      id: 'flux_may_mg_2',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      element: 'Mg',
      spectral_line: null,
      line_energy: null,
      line_flux: 0.68,
      uncertainty: 0.09,
      unit: 'photons/cm2/s',
    },
    {
      id: 'flux_may_ca_ka',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      element: 'Ca',
      spectral_line: 'Ca-Ka',
      line_energy: null,
      line_flux: 0.47,
      uncertainty: 0.03,
      unit: 'photons/cm2/s',
    },
  ],
  abundances: [
    {
      id: 'abund_may_mg',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      element: 'Mg',
      abundance: 3,
      uncertainty: 1,
      uncertainty_upper: 1,
      uncertainty_lower: 1,
      unit: 'wt%',
      derivation_note: 'Derived using X2ABUNDANCE code',
    },
    {
      id: 'abund_may_ca',
      observation_id: 'obs_class_20200529',
      source_product_id: 'sp_may_src',
      element: 'Ca',
      abundance: 9,
      uncertainty: null,
      uncertainty_upper: 3,
      uncertainty_lower: 1,
      unit: 'wt%',
      derivation_note: 'Asymmetric uncertainty preserved',
    },
  ],
  provenance: {
    dataset_name: 'CLASS_CHANDRAYAAN2',
    doi: '10.17632/6mmd96j5bg.1',
    contributor: 'Shyama Narendranath',
    institution: 'Indian Space Research Organisation',
    license: 'CC BY 4.0',
    source_url: 'https://data.mendeley.com/datasets/6mmd96j5bg/1',
  },
  missing_fields: ['acquisition_start_time', 'latitude', 'longitude', 'footprint_geometry'],
};

export const TEST_SPECTRA_NOV: ObservationSpectraResponse = {
  observation_id: 'CLASS_20191118',
  spectrum_count: TEST_OBS_DETAIL_NOV.spectra.length,
  spectra: TEST_OBS_DETAIL_NOV.spectra,
};

export const TEST_SPECTRA_MAY: ObservationSpectraResponse = {
  observation_id: 'CLASS_20200529',
  spectrum_count: TEST_OBS_DETAIL_MAY.spectra.length,
  spectra: TEST_OBS_DETAIL_MAY.spectra,
};

export const TEST_ABUND_NOV: ObservationAbundancesResponse = {
  observation_id: 'CLASS_20191118',
  count: 0,
  abundances: [],
  notes: [
    '181120/R2_abundance.txt lists 5 header elements (Na, Mg, Al, Si, Ca) vs 4 values; records are withheld rather than guessing element assignment.',
  ],
};

export const TEST_ABUND_MAY: ObservationAbundancesResponse = {
  observation_id: 'CLASS_20200529',
  count: 2,
  abundances: TEST_OBS_DETAIL_MAY.abundances,
  notes: [],
};

export const TEST_FLUX_NOV: ObservationLineFluxesResponse = {
  observation_id: 'CLASS_20191118',
  count: TEST_OBS_DETAIL_NOV.line_fluxes.length,
  line_fluxes: TEST_OBS_DETAIL_NOV.line_fluxes,
};

export const TEST_FLUX_MAY: ObservationLineFluxesResponse = {
  observation_id: 'CLASS_20200529',
  count: TEST_OBS_DETAIL_MAY.line_fluxes.length,
  line_fluxes: TEST_OBS_DETAIL_MAY.line_fluxes,
};

export function installFetchMock(routes: Record<string, unknown>): void {
  globalThis.fetch = (input: RequestInfo | URL) => {
    const rawUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const path = rawUrl.replace(/^https?:\/\/[^/]+\/api\/v1/, '');
    const cleanPath = path.split('?')[0] ?? path;
    const match = routes[path] ?? routes[cleanPath];
    if (match === undefined) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            error: { code: 'NOT_FOUND', message: `Unmocked path: ${path}`, details: {} },
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    }
    if (match instanceof Error) {
      return Promise.reject(match);
    }
    return Promise.resolve(
      new Response(JSON.stringify(match), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  };
}
