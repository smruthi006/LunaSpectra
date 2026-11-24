# API Specification

| Field | Value |
| --- | --- |
| **Document** | `docs/API_SPECIFICATION.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 1 Real-Data Endpoints Implemented; Geospatial & ML Endpoints Proposed` |
| **Owner** | `[Member 4 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Member 3 Name Placeholder]`, `[Member 1 Name Placeholder]` |

---

> [!NOTE]
> **Implementation Status:** Core Phase 1 endpoints (`/health`, `/datasets`, `/datasets/{dataset_id}`, `/dataset/summary`, `/elements`, `/observations`, `/observations/{observation_id}`, `/observations/{observation_id}/spectra`, `/observations/{observation_id}/abundances`, `/observations/{observation_id}/line-fluxes`, and `/map/availability`) are **Implemented** in `backend/app/api/routes/` serving genuine Chandrayaan-2 CLASS data (`DOI: 10.17632/6mmd96j5bg.1`, `data_origin: "mission"`). Because this dataset lacks verified coordinates, `/api/v1/map/availability` returns `available: false` and `/api/v1/map/observations` remains **Proposed**.

---

## 1. API Conventions

- **Base Path:** `/api/v1`
- **Swagger UI:** `/docs`
- **Content-Type:** `application/json` (`application/geo+json` or `application/json` for future GeoJSON responses)
- **Coordinates:** Canonical East-positive planetocentric longitude `[-180.0, 180.0]`, latitude `[-90.0, 90.0]` (`null` in Phase 1 when absent from source).
- **Null Semantics:** Missing or unmeasured values serialize as JSON `null`, never `0`.
- **Pagination:** Phase 1 `GET /api/v1/observations` uses `page` (default `1`, `>= 1`) and `page_size` (default `20`, `1..200`), returning `pagination: { page, page_size, total_items, total_pages }`.
- **Standard Error Envelope:**
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Human-readable description",
      "details": {}
    }
  }
  ```

---

## 2. Endpoint Summary

| Method | Route | Status |
| --- | --- | --- |
| `GET` | `/api/v1/health` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/datasets` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/datasets/{dataset_id}` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/dataset/summary` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/elements` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/observations` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/observations/{observation_id}` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/observations/{observation_id}/spectra` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/observations/{observation_id}/abundances` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/observations/{observation_id}/line-fluxes` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/map/availability` | **Implemented (Phase 1)** |
| `GET` | `/api/v1/map/observations` | Proposed (Phase 2+) |
| `GET` | `/api/v1/clusters` | Proposed (Phase 4+) |
| `GET` | `/api/v1/anomalies` | Proposed (Phase 4+) |
| `GET` | `/api/v1/model-runs` | Proposed (Phase 4+) |
| `GET` | `/api/v1/model-runs/{model_run_id}` | Proposed (Phase 4+) |
| `POST` | `/api/v1/regions/compare` | Proposed (Phase 3+) |
| `POST` | `/api/v1/exports` | Proposed (Phase 3+) |

---

## 3. Detailed Endpoint Specifications

### 3.1 `GET /api/v1/health`

- **Status:** Proposed
- **Purpose:** Verify API process health and SQLite database connectivity.
- **Method:** `GET`
- **Route:** `/api/v1/health`
- **Path parameters:** None
- **Query parameters:** None
- **Validation rules:** None
- **Pagination:** Not applicable
- **Successful response:** `200 OK` with service status, API version, and database readiness flag.
- **Error responses:** `503 Service Unavailable` if database connection check fails.
- **Illustrative request:** `GET /api/v1/health`
- **Illustrative response:**
  ```json
  {
    "status": "ok",
    "service": "LunaSpectra API",
    "api_version": "v1",
    "database": "connected"
  }
  ```
- **Related database entities:** None (connection probe only).

---

### 3.2 `GET /api/v1/datasets`

- **Status:** Proposed
- **Purpose:** List registered datasets and their provenance/origin status.
- **Method:** `GET`
- **Route:** `/api/v1/datasets`
- **Path parameters:** None
- **Query parameters:** `data_origin` (optional: `mission` | `synthetic`), `limit` (int, default `50`), `offset` (int, default `0`)
- **Validation rules:** `data_origin` must match allowed enum; `limit` in `1..500`; `offset >= 0`.
- **Pagination:** `limit` / `offset` with `total` count in response envelope.
- **Successful response:** `200 OK` returning paginated dataset records.
- **Error responses:** `422 Unprocessable Entity` on invalid query parameters.
- **Illustrative request:** `GET /api/v1/datasets?data_origin=synthetic&limit=10&offset=0`
- **Illustrative response:**
  ```json
  {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "items": [
      {
        "dataset_id": "SYN_DATASET_V0",
        "name": "Illustrative Synthetic Dataset",
        "instrument": "CLASS",
        "processing_level": "SYNTHETIC",
        "version": "0.0",
        "data_origin": "synthetic",
        "source_uri": "synthetic://sample/dataset"
      }
    ]
  }
  ```
- **Related database entities:** `datasets`, `source_products`.

---

### 3.3 `GET /api/v1/datasets/{dataset_id}`

- **Status:** Proposed
- **Purpose:** Retrieve detailed metadata, attribution, and product counts for a single dataset.
- **Method:** `GET`
- **Route:** `/api/v1/datasets/{dataset_id}`
- **Path parameters:** `dataset_id` (string, required, alphanumeric/underscore/hyphen)
- **Query parameters:** None
- **Validation rules:** `dataset_id` length `1..64`, safe identifier pattern `^[A-Za-z0-9_-]+$`.
- **Pagination:** Not applicable.
- **Successful response:** `200 OK` with dataset metadata and source-product summary.
- **Error responses:** `404 Not Found` if `dataset_id` does not exist; `422` on malformed ID.
- **Illustrative request:** `GET /api/v1/datasets/SYN_DATASET_V0`
- **Illustrative response:**
  ```json
  {
    "dataset_id": "SYN_DATASET_V0",
    "name": "Illustrative Synthetic Dataset",
    "instrument": "CLASS",
    "processing_level": "SYNTHETIC",
    "version": "0.0",
    "data_origin": "synthetic",
    "product_count": 3,
    "observation_count": 6,
    "attribution": "Synthetic development fixture — not Chandrayaan-2 mission data."
  }
  ```
- **Related database entities:** `datasets`, `source_products`, `observations`.

---

### 3.4 `GET /api/v1/dataset/summary`

- **Status:** Proposed
- **Purpose:** Provide aggregate Dashboard metrics (observation count, spatial bounds, quality distribution, available elements, and latest `model_run_id`).
- **Method:** `GET`
- **Route:** `/api/v1/dataset/summary`
- **Path parameters:** None
- **Query parameters:** `dataset_id` (optional string), `data_origin` (optional: `mission` | `synthetic`)
- **Validation rules:** At least valid enum for `data_origin`; prevents mixing `mission` and `synthetic` silently by reporting counts per `data_origin`.
- **Pagination:** Not applicable.
- **Successful response:** `200 OK` with summary statistics.
- **Error responses:** `404 Not Found` if filtered `dataset_id` does not exist; `422` on invalid query parameters.
- **Illustrative request:** `GET /api/v1/dataset/summary?dataset_id=SYN_DATASET_V0`
- **Illustrative response:**
  ```json
  {
    "dataset_id": "SYN_DATASET_V0",
    "data_origin": "synthetic",
    "observation_count": 6,
    "spatial_bounds": {
      "min_lat": -71.2,
      "max_lat": 35.15,
      "min_lon": -168.9,
      "max_lon": 155.6
    },
    "quality_breakdown": {
      "GOOD": 3,
      "CAUTION": 2,
      "POOR": 1
    },
    "available_elements": ["Mg", "Al", "Si", "Ca", "Fe"],
    "latest_model_run_id": "syn-run-001"
  }
  ```
- **Related database entities:** `datasets`, `observations`, `elemental_measurements`, `quality_metrics`, `model_runs`.

---

### 3.5 `GET /api/v1/elements`

- **Status:** Proposed
- **Purpose:** List elemental definitions, measurement units, and availability counts.
- **Method:** `GET`
- **Route:** `/api/v1/elements`
- **Path parameters:** None
- **Query parameters:** `dataset_id` (optional string)
- **Validation rules:** Optional `dataset_id` must match identifier pattern.
- **Pagination:** Not applicable (small bounded element catalog).
- **Successful response:** `200 OK` returning element catalog array.
- **Error responses:** `422` on invalid `dataset_id`.
- **Illustrative request:** `GET /api/v1/elements`
- **Illustrative response:**
  ```json
  {
    "items": [
      {
        "symbol": "Mg",
        "name": "Magnesium",
        "unit": "wt%",
        "unit_verified": false,
        "non_null_count": 5
      },
      {
        "symbol": "Si",
        "name": "Silicon",
        "unit": "wt%",
        "unit_verified": false,
        "non_null_count": 5
      }
    ]
  }
  ```
- **Related database entities:** `elements`, `elemental_measurements`.

---

### 3.6 `GET /api/v1/observations`

- **Status:** Proposed
- **Purpose:** Query paginated, filterable lunar observations with core elemental summaries and optional ML run overlays.
- **Method:** `GET`
- **Route:** `/api/v1/observations`
- **Path parameters:** None
- **Query parameters:** `dataset_id`, `data_origin`, `quality_flag` (`GOOD` | `CAUTION` | `POOR`), `min_lat`, `max_lat`, `min_lon`, `max_lon`, `element`, `model_run_id`, `limit` (default `50`), `offset` (default `0`).
- **Validation rules:** `min_lat <= max_lat` in `[-90, 90]`; `min_lon <= max_lon` in `[-180, 180]`; `limit` in `1..500`; `offset >= 0`.
- **Pagination:** `limit` / `offset` with `total`.
- **Successful response:** `200 OK` with paginated observations.
- **Error responses:** `422` on out-of-range coordinates or invalid filter values.
- **Illustrative request:** `GET /api/v1/observations?data_origin=synthetic&quality_flag=GOOD&limit=2&offset=0`
- **Illustrative response:**
  ```json
  {
    "total": 3,
    "limit": 2,
    "offset": 0,
    "items": [
      {
        "observation_id": "syn-obs-001",
        "source_product_id": "SYN_PROD_001",
        "center_latitude": 12.5,
        "center_longitude": -24.3,
        "quality_flag": "GOOD",
        "data_origin": "synthetic"
      }
    ]
  }
  ```
- **Related database entities:** `observations`, `source_products`, `quality_metrics`, `elemental_measurements`, `cluster_results`, `anomaly_results`.

---

### 3.7 `GET /api/v1/observations/{observation_id}`

- **Status:** Proposed
- **Purpose:** Fetch full scientific, spatial, uncertainty, quality, provenance, and ML detail for a single observation.
- **Method:** `GET`
- **Route:** `/api/v1/observations/{observation_id}`
- **Path parameters:** `observation_id` (string, required)
- **Query parameters:** `model_run_id` (optional string to select ML assignment context)
- **Validation rules:** Non-empty identifier `^[A-Za-z0-9_-]+$`.
- **Pagination:** Not applicable.
- **Successful response:** `200 OK` with complete observation record.
- **Error responses:** `404 Not Found` if `observation_id` does not exist; `422` on malformed ID.
- **Illustrative request:** `GET /api/v1/observations/syn-obs-001?model_run_id=syn-run-001`
- **Illustrative response:**
  ```json
  {
    "observation_id": "syn-obs-001",
    "dataset_id": "SYN_DATASET_V0",
    "source_product_id": "SYN_PROD_001",
    "processing_level": "SYNTHETIC",
    "product_version": "0.0",
    "acquisition_start_time": "2026-01-01T00:00:00Z",
    "acquisition_end_time": "2026-01-01T00:00:16Z",
    "center_latitude": 12.5,
    "center_longitude": -24.3,
    "footprint_geojson": { "type": "Point", "coordinates": [-24.3, 12.5] },
    "measurements": {
      "Mg": { "value": 4.8, "uncertainty": 0.6, "unit": "wt%" },
      "Al": { "value": 13.2, "uncertainty": 1.1, "unit": "wt%" },
      "Si": { "value": 21.0, "uncertainty": 1.4, "unit": "wt%" }
    },
    "ratios": { "Mg/Si": 0.229, "Al/Si": 0.629 },
    "quality_flag": "GOOD",
    "quality_score": 0.9,
    "solar_observation_reference": "SYN_XSM_REF_01",
    "ml_context": {
      "model_run_id": "syn-run-001",
      "cluster_label": 0,
      "anomaly_score": 0.12,
      "is_flagged_anomaly": false
    },
    "data_origin": "synthetic",
    "provenance_uri": "synthetic://sample/001"
  }
  ```
- **Related database entities:** `observations`, `source_products`, `datasets`, `footprints`, `elemental_measurements`, `elements`, `quality_metrics`, `cluster_results`, `anomaly_results`, `model_runs`.

---

### 3.8 `GET /api/v1/map/observations`

- **Status:** Proposed
- **Purpose:** Return geolocated observation points or footprint polygons as a GeoJSON `FeatureCollection` for 2D Leaflet map rendering.
- **Method:** `GET`
- **Route:** `/api/v1/map/observations`
- **Path parameters:** None
- **Query parameters:** `element` (optional, e.g., `Mg`), `quality_flag`, `model_run_id`, `cluster_label`, `anomalies_only` (bool), `min_lat`, `max_lat`, `min_lon`, `max_lon`, `data_origin`, `limit` (default `500`, max `2000`), `offset` (default `0`).
- **Validation rules:** Coordinate bounds validated (`lat` in `[-90, 90]`, `lon` in `[-180, 180]`); `limit <= 2000`.
- **Pagination:** `limit` / `offset` with `metadata.total` in GeoJSON foreign member or headers.
- **Successful response:** `200 OK` valid RFC 7946 GeoJSON `FeatureCollection`.
- **Error responses:** `422` on invalid bounding box or element symbol.
- **Illustrative request:** `GET /api/v1/map/observations?element=Mg&data_origin=synthetic&limit=100`
- **Illustrative response:**
  ```json
  {
    "type": "FeatureCollection",
    "metadata": {
      "total": 1,
      "limit": 100,
      "offset": 0,
      "data_origin": "synthetic"
    },
    "features": [
      {
        "type": "Feature",
        "id": "syn-obs-001",
        "geometry": {
          "type": "Point",
          "coordinates": [-24.3, 12.5]
        },
        "properties": {
          "observation_id": "syn-obs-001",
          "element": "Mg",
          "value": 4.8,
          "uncertainty": 0.6,
          "quality_flag": "GOOD",
          "cluster_label": 0,
          "is_flagged_anomaly": false,
          "data_origin": "synthetic"
        }
      }
    ]
  }
  ```
- **Related database entities:** `observations`, `footprints`, `elemental_measurements`, `quality_metrics`, `cluster_results`, `anomaly_results`.

---

### 3.9 `GET /api/v1/clusters`

- **Status:** Proposed
- **Purpose:** Retrieve cluster summary statistics and paginated cluster memberships for a specified `model_run_id`.
- **Method:** `GET`
- **Route:** `/api/v1/clusters`
- **Path parameters:** None
- **Query parameters:** `model_run_id` (required string), `cluster_label` (optional int), `limit` (default `50`), `offset` (default `0`).
- **Validation rules:** `model_run_id` must reference an existing clustering run; `limit` in `1..500`.
- **Pagination:** `limit` / `offset` on member list; summary array per cluster included.
- **Successful response:** `200 OK` with cluster summaries and observation references.
- **Error responses:** `404 Not Found` if `model_run_id` is unknown; `422` if missing `model_run_id`.
- **Illustrative request:** `GET /api/v1/clusters?model_run_id=syn-run-001&limit=20`
- **Illustrative response:**
  ```json
  {
    "model_run_id": "syn-run-001",
    "algorithm": "KMeans",
    "cluster_summaries": [
      { "cluster_label": 0, "count": 4, "note": "Synthetic example summary" }
    ],
    "total": 4,
    "limit": 20,
    "offset": 0,
    "items": [
      { "observation_id": "syn-obs-001", "cluster_label": 0, "distance_to_centroid": 0.41 }
    ]
  }
  ```
- **Related database entities:** `model_runs`, `cluster_results`, `observations`.

---

### 3.10 `GET /api/v1/anomalies`

- **Status:** Proposed
- **Purpose:** Retrieve ranked anomaly scores and quality-aware flags for a specified `model_run_id`.
- **Method:** `GET`
- **Route:** `/api/v1/anomalies`
- **Path parameters:** None
- **Query parameters:** `model_run_id` (required string), `quality_flag` (optional), `flagged_only` (bool, default `true`), `limit` (default `50`), `offset` (default `0`).
- **Validation rules:** `model_run_id` required; `limit` in `1..500`.
- **Pagination:** `limit` / `offset` ordered by descending anomaly severity.
- **Successful response:** `200 OK` with anomaly records and quality caution metadata.
- **Error responses:** `404 Not Found` if `model_run_id` does not exist; `422` on invalid query params.
- **Illustrative request:** `GET /api/v1/anomalies?model_run_id=syn-run-002&flagged_only=true`
- **Illustrative response:**
  ```json
  {
    "model_run_id": "syn-run-002",
    "method": "IsolationForest",
    "total": 1,
    "limit": 50,
    "offset": 0,
    "items": [
      {
        "observation_id": "syn-obs-004",
        "anomaly_score": 0.89,
        "is_flagged": true,
        "quality_flag": "POOR",
        "caution_note": "Low quality_flag — verify signal quality before scientific interpretation."
      }
    ]
  }
  ```
- **Related database entities:** `model_runs`, `anomaly_results`, `observations`, `quality_metrics`.

---

### 3.11 `GET /api/v1/model-runs`

- **Status:** Proposed
- **Purpose:** List recorded ML model runs with algorithm type, preprocessing version, seed, and creation timestamp.
- **Method:** `GET`
- **Route:** `/api/v1/model-runs`
- **Path parameters:** None
- **Query parameters:** `task_type` (`clustering` | `anomaly`), `data_origin` (`mission` | `synthetic`), `limit` (default `50`), `offset` (default `0`).
- **Validation rules:** Valid enum filters; `limit` in `1..500`.
- **Pagination:** `limit` / `offset`.
- **Successful response:** `200 OK` with list of `model_runs`.
- **Error responses:** `422` on invalid filter.
- **Illustrative request:** `GET /api/v1/model-runs?data_origin=synthetic`
- **Illustrative response:**
  ```json
  {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "items": [
      {
        "model_run_id": "syn-run-001",
        "task_type": "clustering",
        "algorithm": "KMeans",
        "preprocessing_version": "v0.1-robust",
        "random_seed": 42,
        "data_origin": "synthetic",
        "created_at": "2026-11-24T17:10:00Z"
      }
    ]
  }
  ```
- **Related database entities:** `model_runs`.

---

### 3.12 `GET /api/v1/model-runs/{model_run_id}`

- **Status:** Proposed
- **Purpose:** Inspect full configuration, feature list, hyperparameters, and internal evaluation metrics for one `model_run_id`.
- **Method:** `GET`
- **Route:** `/api/v1/model-runs/{model_run_id}`
- **Path parameters:** `model_run_id` (string, required)
- **Query parameters:** None
- **Validation rules:** Non-empty identifier `^[A-Za-z0-9_-]+$`.
- **Pagination:** Not applicable.
- **Successful response:** `200 OK` with complete model-run metadata.
- **Error responses:** `404 Not Found` if missing; `422` on invalid ID.
- **Illustrative request:** `GET /api/v1/model-runs/syn-run-001`
- **Illustrative response:**
  ```json
  {
    "model_run_id": "syn-run-001",
    "task_type": "clustering",
    "algorithm": "KMeans",
    "features": ["mg_abundance", "al_abundance", "si_abundance", "fe_abundance"],
    "hyperparameters": { "n_clusters": 3 },
    "preprocessing_version": "v0.1-robust",
    "random_seed": 42,
    "metrics": { "silhouette_score": null, "davies_bouldin_index": null },
    "data_origin": "synthetic",
    "created_at": "2026-11-24T17:10:00Z"
  }
  ```
- **Related database entities:** `model_runs`.

---

### 3.13 `POST /api/v1/regions/compare`

- **Status:** Proposed
- **Purpose:** Compare elemental compositions, guarded ratios, uncertainties, and quality distributions across two selected observations or bounding boxes.
- **Method:** `POST`
- **Route:** `/api/v1/regions/compare`
- **Path parameters:** None
- **Query parameters:** None (JSON request body specifying `region_a` and `region_b` by `observation_id` or `bbox`).
- **Validation rules:** Both `region_a` and `region_b` required; coordinates in valid lunar bounds; must share compatible `data_origin` (never compare synthetic vs. mission silently).
- **Pagination:** Not applicable (summary comparison response).
- **Successful response:** `200 OK` with per-region statistics, elemental deltas, and quality/uncertainty warnings.
- **Error responses:** `400 Bad Request` if mixed `data_origin` or empty selection; `404` if observation IDs missing; `422` on schema errors.
- **Illustrative request:**
  ```json
  {
    "region_a": { "type": "observation", "observation_id": "syn-obs-001" },
    "region_b": { "type": "observation", "observation_id": "syn-obs-002" }
  }
  ```
- **Illustrative response:**
  ```json
  {
    "data_origin": "synthetic",
    "region_a_summary": { "count": 1, "mean_mg": 4.8, "mean_fe": 5.2, "quality_flags": ["GOOD"] },
    "region_b_summary": { "count": 1, "mean_mg": 6.1, "mean_fe": 12.4, "quality_flags": ["GOOD"] },
    "differences": { "delta_mg": -1.3, "delta_fe": -7.2 },
    "warnings": ["Illustrative synthetic comparison; small sample size (n=1 per selection)."]
  }
  ```
- **Related database entities:** `observations`, `elemental_measurements`, `quality_metrics`.

---

### 3.14 `POST /api/v1/exports`

- **Status:** Proposed
- **Purpose:** Generate and register a reproducible filtered JSON, CSV, or GeoJSON export request with provenance and `model_run_id` metadata.
- **Method:** `POST`
- **Route:** `/api/v1/exports`
- **Path parameters:** None
- **Query parameters:** None (JSON request body specifying `format`: `json` | `csv` | `geojson`, filter criteria, and optional `model_run_id`).
- **Validation rules:** `format` in allowed enum; bounded export row cap (e.g., max `5000` rows per MVP synchronous export).
- **Pagination:** Bounded row limit enforced in payload.
- **Successful response:** `201 Created` returning `export_id`, row count, provenance attribution text, and export payload/reference.
- **Error responses:** `400 Bad Request` if export exceeds row cap; `422` on invalid format/filters.
- **Illustrative request:**
  ```json
  {
    "format": "json",
    "dataset_id": "SYN_DATASET_V0",
    "quality_flag": "GOOD"
  }
  ```
- **Illustrative response:**
  ```json
  {
    "export_id": "exp-syn-001",
    "format": "json",
    "record_count": 3,
    "data_origin": "synthetic",
    "created_at": "2026-11-24T17:15:00Z"
  }
  ```
- **Related database entities:** `exports`, `observations`, `elemental_measurements`, `model_runs`.

---

## 4. Related Documents

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Database Design](DATABASE_DESIGN.md)
- [Frontend Specification](FRONTEND_SPECIFICATION.md)
- [Testing Strategy](TESTING_STRATEGY.md)
