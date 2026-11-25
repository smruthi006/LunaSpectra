# Testing Strategy

| Field | Value |
| --- | --- |
| **Document** | `docs/TESTING_STRATEGY.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 1 Backend Tests Implemented (ML & Frontend Tests Planned)` |
| **Owner** | `[Member 4 & All Owners Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[All Team Members Placeholder]` |

---

> [!NOTE]
> **Phase 1 Implementation Status:** Backend unit and API tests are **implemented** under `backend/tests/` (`test_health.py`, `test_adapter.py`, `test_processing.py`, `test_database.py`, `test_datasets_api.py`, `test_observations_api.py`) using small schema-faithful FITS/ASCII test fixtures (`backend/tests/conftest.py`). ML and React frontend tests remain **Planned** for future phases.

---

## 1. Testing Principles

1. **Test Against Explicit Synthetic Fixtures:** Unit and integration tests use small, deterministic synthetic fixtures in `data/sample/` (`data_origin = "synthetic"`), never large downloaded mission archives.
2. **Never Fabricate Counts:** Do not claim test counts, pass percentages, or coverage numbers until tests exist and have been executed.
3. **Contract-First Verification:** Both backend Pydantic models and frontend Zod schemas verify the exact shapes specified in [API_SPECIFICATION.md](API_SPECIFICATION.md).

---

## 2. Planned Test Coverage Matrix

| Area | Tooling (Planned) | Specific Scenarios to Verify |
| --- | --- | --- |
| **PDS4 / FITS Metadata Parsing** | `pytest` | Parse sample PDS4 XML / FITS headers; extract `source_product_id`, `product_version`, timestamps, and missing optional fields cleanly. |
| **Coordinate Validation** | `pytest` | Accept `center_latitude` in `[-90, 90]`; reject or quarantine values outside `[-90, 90]` or `NaN` coordinates. |
| **Longitude Normalization** | `pytest` | Normalize `[0, 360)` inputs consistently into canonical `[-180, 180]` East-positive convention (e.g., `270.0 -> -90.0`, `180.0` boundary handling). |
| **Missing Values (`NULL` Semantics)** | `pytest` | Confirm sentinel strings/numbers (`-999`, `"NA"`, empty cells) map to `NULL`/`NaN` and are **never** converted to `0.0`. |
| **Unit Consistency** | `pytest` | Reject or flag mixed measurement units within a single dataset table before ratio or ML computation. |
| **Duplicate Products** | `pytest` | Detect duplicate `source_product_id` or duplicate observation keys during ingestion and avoid silent double-counting. |
| **Footprint Geometry Validity** | `pytest` + `shapely` | Validate WKT/GeoJSON Point and Polygon geometries (`is_valid`, closed rings, coordinate order `[lon, lat]`). |
| **Feature Calculation** | `pytest` | Verify `Mg/Si`, `Al/Si`, `Fe/Si` calculations on known synthetic inputs and confirm provenance preservation. |
| **Division-by-Zero Protection** | `pytest` | Confirm `si_abundance == 0`, negative, `NULL`, or below-threshold denominators yield `NULL` ratio rather than `inf` or crash. |
| **Deterministic Model Runs** | `pytest` | Run K-Means and Isolation Forest twice with identical input and `random_seed` and verify identical assignments/scores. |
| **Synthetic vs. Real Separation** | `pytest` | Assert pipeline and API reject or prevent silent mixing of `data_origin = "synthetic"` with `data_origin = "mission"`. |
| **API Schema Validation** | `pytest` + FastAPI `TestClient` | Verify Pydantic response shapes, `422` validation errors, and `404` error envelopes across `/api/v1/*`. |
| **Pagination** | `pytest` + `TestClient` | Verify `limit`, `offset`, and `total` consistency on `/observations`, `/clusters`, and `/anomalies`. |
| **GeoJSON Validity** | `pytest` | Validate `/api/v1/map/observations` output conforms to RFC 7946 `FeatureCollection` (`type`, `features`, `[lon, lat]` coordinates). |
| **Frontend API Contract Validation** | `vitest` + `zod` | Parse mocked API payloads through frontend Zod schemas to catch backend/frontend contract drift early. |
| **Map Layer Rendering** | `vitest` + RTL | Verify layer selector controls (`element`, `cluster`, `anomaly`, `quality_flag`) update active state cleanly. |
| **Empty States** | `vitest` + RTL | Verify friendly empty-state UI when filters match zero observations. |
| **Error States** | `vitest` + RTL | Verify accessible error UI and retry controls when API returns `404`, `503`, or network failure. |
| **Accessibility** | `vitest` + RTL | Check ARIA labels, keyboard navigation on controls, and semantic headings/tables. |
| **End-to-End Observation Selection** | Planned integration test | Simulate selecting a map observation, fetching `/api/v1/observations/{id}`, and rendering detail + uncertainty metadata. |

---

## 3. Planned CI Checks (GitHub Actions)

Once code scaffolding begins in Phase 1/3, planned CI workflows will run:
- **Backend:** `ruff check`, `mypy`, `pytest`
- **Frontend:** `eslint`, `prettier --check`, `tsc --noEmit`, `vitest run`

---

## 4. Related Documents

- [Data Pipeline](DATA_PIPELINE.md)
- [ML Methodology](ML_METHODOLOGY.md)
- [API Specification](API_SPECIFICATION.md)
- [Frontend Specification](FRONTEND_SPECIFICATION.md)
