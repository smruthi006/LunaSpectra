# Project Roadmap

| Field | Value |
| --- | --- |
| **Document** | `docs/ROADMAP.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 1 Backend & Phase 2 Real-Data Frontend Implemented` |
| **Owner** | `[All 4 Team Members Placeholder]` |
| **Last updated** | `2026-11-26` |
| **Reviewers** | `[Faculty Guide Name Placeholder]` |

---

## Phase Overview

LunaSpectra follows an incremental 8-phase roadmap scoped to a 2-credit, third-year CSE mini-project (Phases 0–7 for the MVP; Phase 8 strictly optional future work).

> [!NOTE]
> **Current Implementation Status (`develop` + `feature/real-data-frontend`):** Phase 1 (real CLASS FastAPI backend) is merged in `develop`, and the Phase 2 real-data React + TypeScript frontend (`frontend/`, without fake coordinates or ML) is implemented against those live Phase 1 endpoints. Geolocated PRADAN dataset expansion, Leaflet map rendering, and unsupervised ML baselines remain Planned pending geolocated data.

---

## Phase 0 — Feasibility and Documentation *(Completed)*

- **Objectives:** Establish project scope, scientific boundaries, data strategy, database/API contracts, and repository governance before writing application code.
- **Deliverables:** Root governance files, `README.md`, 19 technical & planning docs under `docs/`, `.env.example`, `.gitignore`, GitHub issue/PR templates.
- **Dependencies:** Team alignment on 2-credit MVP boundaries and Chandrayaan-2 Approach A strategy.
- **Acceptance Criteria:** All docs pass internal link, Mermaid syntax, and scientific-honesty checks; foundation committed on `main` and `develop`.
- **Assigned Role:** All 4 Members (coordinated by Member 4).
- **Risks:** Scope expansion beyond 2 credits; unverified assumptions about archive schemas prior to dataset download.

---

## Phase 1 — Real CLASS Data Ingestion, Database & FastAPI Backend *(Implemented & Merged in `develop`)*

- **Objectives:** Build an end-to-end backend vertical slice using genuine Chandrayaan-2 CLASS data (`DOI: 10.17632/6mmd96j5bg.1`), reproducible Parquet tables, SQLite storage, FastAPI endpoints, and automated tests.
- **Deliverables:** `backend/app/` FastAPI service, `backend/scripts/` (`acquire_class_data.py`, `inspect_class_data.py`, `process_class_data.py`, `seed_database.py`), `backend/tests/`, `docs/REAL_DATA_INVENTORY.md`, `docs/REAL_DATA_FIELD_MAPPING.md`.
- **Dependencies:** Phase 0 foundation; public access to Mendeley Data v1 (`10.17632/6mmd96j5bg.1`).
- **Acceptance Criteria:** Reproducible acquisition, inventory, Parquet processing, idempotent SQLite seeding, passing Ruff/Mypy/Pytest gates, and live endpoint verification.
- **Assigned Role:** Member 1 & Member 4 (with team review).
- **Risks:** Absent geospatial coordinates in Mendeley v1 (mitigated via honest `/api/v1/map/availability` reporting `available: false`); ambiguous element header in `181120/R2_abundance.txt`.

---

## Phase 2 — Real-Data Frontend Explorer & Geolocated ISSDC/PRADAN Expansion *(Frontend Explorer Implemented; PRADAN Acquisition Planned)*

- **Implemented in `feature/real-data-frontend`:** Complete React + TypeScript + Vite SPA (`frontend/`) with Zod runtime contract validation, TanStack Query hooks, Dashboard, Observations table, Observation Detail spectral/abundance/line-flux explorer, guarded Comparison view, honest unavailable Lunar Explorer state (`available: false`), Methodology, Data Sources, ESLint/TypeScript/Vitest/Build quality gates, and live application screenshots in `assets/images/`.
- **Planned (Geolocated Data Expansion):** Inspect geolocated Chandrayaan-2 CLASS/XSM PDS4 bundles on ISSDC/PRADAN to acquire verified latitude, longitude, and footprint polygons for lunar mapping.
- **Deliverables:** `frontend/` real-data UI (Implemented) + verified PDS4 product format notes in `docs/DATASET_GUIDE.md` & `docs/DATA_DICTIONARY.md` (Planned).
- **Dependencies:** Phase 1 backend foundation; ISSDC/PRADAN archive access.
- **Acceptance Criteria:** Confirm geolocated elements, units, quality flags, and footprint coordinates before enabling `/api/v1/map/observations` GeoJSON endpoints.
- **Assigned Role:** Member 1 (lead), Member 2 (scientific verification).
- **Risks:** No directly usable geolocated abundance table; large binary archive sizes.

---

## Phase 3 — Extended Backend Contracts (Geospatial & Comparison)

- **Objectives:** Extend the Phase 1 SQLAlchemy/FastAPI backend with geolocated observation endpoints (`/api/v1/map/observations`, `/api/v1/regions/compare`, `/api/v1/clusters`, `/api/v1/anomalies`) once verified geolocated data and ML runs exist.
- **Deliverables:** Extended database tables/migrations and REST endpoints built atop the Phase 1 SQLite core.
- **Dependencies:** Phase 1 backend; Phase 2 geolocated product verification.
- **Acceptance Criteria:** Endpoints pass schema, pagination, GeoJSON validity, and `404`/`422` error tests.
- **Assigned Role:** Member 4 (lead), Member 1 (DB loader integration).
- **Risks:** Performance bottlenecks on large GeoJSON responses; SQLite query tuning.

---

## Phase 4 — ML Baselines

- **Objectives:** Implement reproducible preprocessing, guarded ratios, K-Means (+ optional DBSCAN), PCA visualization coordinates, and quality-aware anomaly detection (Z-score, MAD, Isolation Forest, optional LOF).
- **Deliverables:** Reproducible ML runner in `scripts/`/`backend/`, persisted `model_runs`, `cluster_results`, `anomaly_results`, stability & synthetic-injection tests.
- **Dependencies:** Phase 2 verified feature table; Phase 3 `model_runs` schema.
- **Acceptance Criteria:** Deterministic runs logged in `model_runs`; internal evaluation metrics (Silhouette, Davies–Bouldin) and quality screening documented without overstated claims.
- **Assigned Role:** Member 2 (lead), Member 1 (feature validation).
- **Risks:** Sparse/missing element columns limiting multivariate vectors; noisy outliers dominating unscreened anomalies.

---

## Phase 5 — Interactive 2D Lunar Map & ML Overlays *(Core Real-Data Frontend Implemented in Phase 2; Leaflet Map & ML Layers Remaining)*

- **Completed in Phase 2 (`feature/real-data-frontend`):** Built the React + TypeScript + Vite SPA (`frontend/`) with Home, Dashboard, Observations, Observation Detail, Comparison, Lunar Explorer boundary (`available: false`), Methodology, Data Sources, Zod runtime contract validators, Recharts/SVG visualizations, and 13 Vitest/RTL UI tests.
- **Remaining in Phase 5:** Integrate Leaflet 2D lunar basemap tiles (`LROC`/`USGS`) plus cluster, anomaly, and quality-filter map layers once verified geolocated PRADAN products and Phase 3/4 endpoints exist.
- **Dependencies:** Phase 2 geolocated PRADAN verification; Phase 3 GeoJSON endpoints; Phase 4 ML runs; verified lunar basemap tile policy.
- **Acceptance Criteria:** Users can toggle elements/clusters/anomalies/quality filters, click geolocated observations on the lunar map, compare two regions, and see synthetic banners when applicable.
- **Assigned Role:** Member 3 (lead), Member 4 (API integration).
- **Risks:** Basemap tile licensing or projection mismatch (`[-180, 180]` vs Leaflet CRS); slow rendering with dense polygons.

---

## Phase 6 — Integration and Testing

- **Objectives:** Connect offline pipeline -> SQLite -> FastAPI -> React SPA end-to-end; verify data lineage, error/empty states, accessibility, and automated test suites.
- **Deliverables:** End-to-end integration test coverage, bug fixes on `develop`, verified CI workflow (if enabled).
- **Dependencies:** Phases 3, 4, and 5 completed.
- **Acceptance Criteria:** All planned tests in [TESTING_STRATEGY.md](TESTING_STRATEGY.md) pass on synthetic fixtures and verified dataset slices; zero mission/synthetic mix-ups.
- **Assigned Role:** All 4 Members.
- **Risks:** Late integration delays; merge conflicts across concurrent feature branches.

---

## Phase 7 — Documentation, Demonstration, and Final Submission

- **Objectives:** Finalize documentation with real verified metrics/screenshots (replacing mockups), complete academic project report, and tag milestone release on `main`.
- **Deliverables:** Updated `README.md`, verified `docs/`, project presentation/demo, semantic version tag (`v1.0.0`) on `main`.
- **Dependencies:** Phase 6 integration sign-off.
- **Acceptance Criteria:** Clean repository state (no committed secrets/raw data), accurate final metrics only, required ISRO/ISSDC acknowledgement verified.
- **Assigned Role:** All 4 Members.
- **Risks:** Insufficient time before academic evaluation deadline; outdated docs after late bug fixes.

---

## Phase 8 — Optional Extensions *(Post-MVP Only)*

- **Objectives:** Explore advanced capabilities only if MVP Phases 0–7 are complete and validated.
- **Candidate Deliverables:** Raw CLASS + XSM joint spectral analysis and peak fitting, advanced uncertainty propagation, CesiumJS 3D lunar globe, PostGIS spatial queries, external geological-unit overlays, user accounts, formatted report exports, explainable cluster characterization.
- **Dependencies:** Completed and defended MVP (Phase 7).
- **Acceptance Criteria:** Explicit scope approval so extensions do not destabilize MVP deliverables.
- **Assigned Role:** Optional / Post-Coursework.
- **Risks:** High planetary-spectroscopy validation complexity; infrastructure overhead.
