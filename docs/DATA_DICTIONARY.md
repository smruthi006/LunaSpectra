# Data Dictionary

| Field | Value |
| --- | --- |
| **Document** | `docs/DATA_DICTIONARY.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 1 Schema Implemented (DOI: 10.17632/6mmd96j5bg.1); Phase 2 Geospatial Fields Conceptual` |
| **Owner** | `[Member 1 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Member 2 Name Placeholder]`, `[Member 4 Name Placeholder]` |

---

## 1. Schema Conventions

- **Phase 1 Implemented vs. Phase 2 Conceptual:** For the Phase 1 Mendeley dataset (`DOI: 10.17632/6mmd96j5bg.1`), verified canonical mappings are documented in [REAL_DATA_FIELD_MAPPING.md](REAL_DATA_FIELD_MAPPING.md) and stored in `data/processed/class_mendeley_v1/*.parquet` and `backend/lunaspectra.db`. Conceptual geospatial/quality fields below remain marked **To be verified** until geolocated ISSDC/PRADAN PDS4 bundles are inspected in Phase 2.
- **Null Semantics:** `NULL` (or `NaN` in Parquet) strictly means **unavailable, below detection threshold, or unmeasured** — **never `0`**. Replacing missing measurements with `0` is prohibited because it corrupts elemental averages, ratios, clustering, and anomaly scores.
- **Coordinate Convention:**
  - `center_latitude`: Planetocentric lunar latitude in decimal degrees, constrained to `[-90.0, 90.0]` (stored as `NULL` in Phase 1 because coordinates are absent in `10.17632/6mmd96j5bg.1`).
  - `center_longitude`: Canonical internal convention is **East-positive planetocentric longitude in `[-180.0, 180.0]`** (stored as `NULL` in Phase 1). If future source products use `[0.0, 360.0)`, ingestion will normalize values `> 180.0` via `lon - 360.0` while recording the transformation in pipeline logs.
- **Data Origin Separation:** `data_origin` must explicitly record whether a record originates from `mission` data or `synthetic` test fixtures. Phase 1 backend data uses `data_origin = "mission"` exclusively.

---

## 2. Conceptual Observation Schema

| # | Field Name | Planned Type | Unit / Format | Constraints / Null Rules | Verification Status | Description |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `observation_id` | `string` (UUID / deterministic ID) | Identifier | Primary key; non-null; unique | To be verified | Internal unique identifier for a single spatial/temporal measurement |
| 2 | `source_product_id` | `string` | Archive ID | Non-null | To be verified | Identifier of the originating ISSDC/PDS4 product file |
| 3 | `dataset_id` | `string` | Registry key | Non-null | To be verified | Logical dataset grouping identifier (e.g., CLASS derived level) |
| 4 | `processing_level` | `string` | e.g., `L2` / `Derived` | Non-null | To be verified | Archive processing level of the ingested product |
| 5 | `product_version` | `string` | Version string | Non-null | To be verified | Version number or tag from the source product label |
| 6 | `acquisition_start_time` | `datetime` (ISO 8601 UTC) | UTC timestamp | Nullable if omitted in derived tables | To be verified | Start timestamp of the observation integration window |
| 7 | `acquisition_end_time` | `datetime` (ISO 8601 UTC) | UTC timestamp | Must be `>= acquisition_start_time` when both present | To be verified | End timestamp of the observation integration window |
| 8 | `center_latitude` | `float64` | Degrees (`-90` to `+90`) | Non-null; `[-90.0, 90.0]` | To be verified | Footprint center latitude on the Moon |
| 9 | `center_longitude` | `float64` | Degrees (`-180` to `+180`) | Non-null; `[-180.0, 180.0]` East-positive | To be verified | Normalized footprint center longitude |
| 10 | `footprint_geometry` | `GeoJSON / WKT` | Lon/Lat geometry | Valid Polygon or Point; nullable if point-only product | To be verified | Spatial footprint polygon or point geometry in canonical longitude |
| 11 | `mg_abundance` | `float64` | `wt%` (subject to product) | Nullable (`NULL` = unmeasured); `>= 0` when physical abundance | To be verified | Magnesium abundance measurement |
| 12 | `mg_uncertainty` | `float64` | Same unit as abundance | Nullable; `>= 0` when present | To be verified | Reported uncertainty for `mg_abundance` |
| 13 | `al_abundance` | `float64` | `wt%` (subject to product) | Nullable (`NULL` = unmeasured); `>= 0` | To be verified | Aluminium abundance measurement |
| 14 | `al_uncertainty` | `float64` | Same unit as abundance | Nullable; `>= 0` when present | To be verified | Reported uncertainty for `al_abundance` |
| 15 | `si_abundance` | `float64` | `wt%` (subject to product) | Nullable (`NULL` = unmeasured); `>= 0` | To be verified | Silicon abundance measurement |
| 16 | `si_uncertainty` | `float64` | Same unit as abundance | Nullable; `>= 0` when present | To be verified | Reported uncertainty for `si_abundance` |
| 17 | `ca_abundance` | `float64` | `wt%` (subject to product) | Nullable (`NULL` = unmeasured); `>= 0` | To be verified | Calcium abundance measurement |
| 18 | `ca_uncertainty` | `float64` | Same unit as abundance | Nullable; `>= 0` when present | To be verified | Reported uncertainty for `ca_abundance` |
| 19 | `fe_abundance` | `float64` | `wt%` (subject to product) | Nullable (`NULL` = unmeasured); `>= 0` | To be verified | Iron abundance measurement |
| 20 | `fe_uncertainty` | `float64` | Same unit as abundance | Nullable; `>= 0` when present | To be verified | Reported uncertainty for `fe_abundance` |
| 21 | `quality_flag` | `string` / `enum` | Categorical (e.g., `GOOD`, `CAUTION`, `POOR`, `UNVERIFIED`) | Non-null | To be verified | Mapped data-quality status derived from source product flags |
| 22 | `quality_score` | `float64` | Normalized `[0.0, 1.0]` | Nullable | To be verified | Optional numeric quality or SNR-derived reliability score |
| 23 | `solar_observation_reference` | `string` | Reference ID / flare class | Nullable | To be verified | Linked XSM solar-state reference or excitation context ID |
| 24 | `data_origin` | `string` (`mission` \| `synthetic`) | Controlled enum | Non-null | Enforced | Distinguishes real mission observations from synthetic test rows |
| 25 | `provenance_uri` | `string` | URI / Archive path | Non-null | To be verified | Archive URL, PDS4 URN, or local verifiable source reference |
| 26 | `ingestion_timestamp` | `datetime` (ISO 8601 UTC) | UTC timestamp | Non-null | Enforced | Timestamp when the record entered the LunaSpectra pipeline |

---

## 3. Derived Ratio Fields (Pipeline-Computed Only When Guarded)

| Field | Formula | Guard Conditions |
| --- | --- | --- |
| `mg_si_ratio` | `mg_abundance / si_abundance` | Computed only if both non-null, compatible units, and `si_abundance > min_valid_denominator` |
| `al_si_ratio` | `al_abundance / si_abundance` | Computed only if both non-null, compatible units, and `si_abundance > min_valid_denominator` |
| `fe_si_ratio` | `fe_abundance / si_abundance` | Computed only if both non-null, compatible units, and `si_abundance > min_valid_denominator` |

---

## 4. Illustrative Synthetic Sample Table

> [!CAUTION]
> **ILLUSTRATIVE SYNTHETIC EXAMPLE — NOT CHANDRAYAAN-2 MISSION DATA.**
> The rows below contain fabricated placeholder numbers created strictly to illustrate the conceptual table layout and `null` / `data_origin` conventions. They do **not** represent real lunar measurements, calibrated abundances, or Chandrayaan-2 observations.

| `observation_id` | `source_product_id` | `dataset_id` | `processing_level` | `product_version` | `acquisition_start_time` | `acquisition_end_time` | `center_latitude` | `center_longitude` | `footprint_geometry` | `mg_abundance` | `mg_uncertainty` | `al_abundance` | `al_uncertainty` | `si_abundance` | `si_uncertainty` | `ca_abundance` | `ca_uncertainty` | `fe_abundance` | `fe_uncertainty` | `quality_flag` | `quality_score` | `solar_observation_reference` | `data_origin` | `provenance_uri` | `ingestion_timestamp` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `syn-obs-001` | `SYN_PROD_001` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:00:00Z` | `2026-01-01T00:00:16Z` | `12.50` | `-24.30` | `POINT(-24.30 12.50)` | `4.8` | `0.6` | `13.2` | `1.1` | `21.0` | `1.4` | `9.5` | `1.0` | `5.2` | `0.8` | `GOOD` | `0.90` | `SYN_XSM_REF_01` | `synthetic` | `synthetic://sample/001` | `2026-11-24T17:00:00Z` |
| `syn-obs-002` | `SYN_PROD_001` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:01:00Z` | `2026-01-01T00:01:16Z` | `-18.40` | `45.10` | `POINT(45.10 -18.40)` | `6.1` | `0.7` | `7.4` | `0.9` | `20.5` | `1.3` | `8.1` | `1.1` | `12.4` | `1.2` | `GOOD` | `0.87` | `SYN_XSM_REF_01` | `synthetic` | `synthetic://sample/002` | `2026-11-24T17:00:00Z` |
| `syn-obs-003` | `SYN_PROD_002` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:02:00Z` | `2026-01-01T00:02:16Z` | `35.15` | `-110.25` | `POINT(-110.25 35.15)` | `3.2` | `0.8` | `15.6` | `1.3` | `21.8` | `1.5` | `NULL` | `NULL` | `3.9` | `0.7` | `CAUTION` | `0.64` | `SYN_XSM_REF_02` | `synthetic` | `synthetic://sample/003` | `2026-11-24T17:00:00Z` |
| `syn-obs-004` | `SYN_PROD_002` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:03:00Z` | `2026-01-01T00:03:16Z` | `-42.80` | `155.60` | `POINT(155.60 -42.80)` | `NULL` | `NULL` | `11.0` | `2.4` | `19.4` | `2.1` | `7.8` | `1.9` | `NULL` | `NULL` | `POOR` | `0.32` | `NULL` | `synthetic` | `synthetic://sample/004` | `2026-11-24T17:00:00Z` |
| `syn-obs-005` | `SYN_PROD_003` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:04:00Z` | `2026-01-01T00:04:16Z` | `0.75` | `18.20` | `POINT(18.20 0.75)` | `5.5` | `0.5` | `8.9` | `0.8` | `20.9` | `1.2` | `8.4` | `0.9` | `10.1` | `1.0` | `GOOD` | `0.91` | `SYN_XSM_REF_03` | `synthetic` | `synthetic://sample/005` | `2026-11-24T17:00:00Z` |
| `syn-obs-006` | `SYN_PROD_003` | `SYN_DATASET_V0` | `SYNTHETIC` | `0.0` | `2026-01-01T00:05:00Z` | `2026-01-01T00:05:16Z` | `-71.20` | `-168.90` | `POINT(-168.90 -71.20)` | `2.9` | `0.9` | `14.1` | `1.6` | `NULL` | `NULL` | `10.2` | `1.5` | `4.1` | `0.9` | `CAUTION` | `0.58` | `SYN_XSM_REF_03` | `synthetic` | `synthetic://sample/006` | `2026-11-24T17:00:00Z` |

---

## 5. Related Documents

- [Dataset Guide](DATASET_GUIDE.md)
- [Data Pipeline](DATA_PIPELINE.md)
- [Database Design](DATABASE_DESIGN.md)
- [API Specification](API_SPECIFICATION.md)
