# Project Roadmap

| Field | Value |
| --- | --- |
| **Document** | `docs/ROADMAP.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 0 In Review` |
| **Owner** | `[All 4 Team Members Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]` |

---

## Phase Overview

LunaSpectra follows an incremental 8-phase roadmap scoped to a 2-credit, third-year CSE mini-project (Phases 0–7 for the MVP; Phase 8 strictly optional future work).

---

## Phase 0 — Feasibility and Documentation *(Current Phase)*

- **Objectives:** Establish project scope, scientific boundaries, data strategy, database/API contracts, and repository governance before writing application code.
- **Deliverables:** Root governance files, `README.md`, 19 technical & planning docs under `docs/`, `.env.example`, `.gitignore`, GitHub issue/PR templates.
- **Dependencies:** Team alignment on 2-credit MVP boundaries and Chandrayaan-2 Approach A strategy.
- **Acceptance Criteria:** All docs pass internal link, Mermaid syntax, and scientific-honesty checks; faculty guide and team review completed.
- **Assigned Role:** All 4 Members (coordinated by Member 4).
- **Risks:** Scope expansion beyond 2 credits; unverified assumptions about archive schemas prior to Phase 2 download.

---

## Phase 1 — Repository and Contract Foundation

- **Objectives:** Initialize `develop` branch, configure linters/formatters/pre-commit hooks, and lock shared Pydantic/Zod/Parquet data contracts using small synthetic fixtures.
- **Deliverables:** `develop` branch, pre-commit config, `data/sample/` synthetic fixtures, agreed schema definitions.
- **Dependencies:** Phase 0 review approval.
- **Acceptance Criteria:** Team agrees on frozen v1 contracts for observations, units, `[-180, 180]` longitude convention, and `data_origin` tags.
- **Assigned Role:** Member 4 (lead) with Members 1, 2, 3.
- **Risks:** Frontend/backend schema drift; inconsistent coordinate conventions.

---

## Phase 2 — Dataset Proof of Concept

- **Objectives:** Inspect real Chandrayaan-2 CLASS/XSM archive listings on ISSDC/PRADAN, download small sample bundles into ignored `data/raw/`, and verify fields, units, coverage, and uncertainties.
- **Deliverables:** Verified product format notes in `docs/DATASET_GUIDE.md` & `docs/DATA_DICTIONARY.md`; prototype parser script in `scripts/`; updated `docs/DECISION_LOG.md`.
- **Dependencies:** Phase 1 contracts; ISSDC/PRADAN archive access.
- **Acceptance Criteria:** Confirm whether Approach A derived abundance products are directly usable; document exact elements, units, quality flags, and footprint structure.
- **Assigned Role:** Member 1 (lead), Member 2 (scientific verification).
- **Risks:** No directly usable abundance table; insufficient geolocation/uncertainty fields; large binary archive sizes.

---

## Phase 3 — Backend and Database Foundation

- **Objectives:** Implement SQLAlchemy models, Alembic migrations, SQLite loader, and FastAPI `/api/v1` endpoints with Pydantic validation and unit tests.
- **Deliverables:** `backend/` FastAPI service, `lunaspectra.db` schema migrations, `/health`, `/datasets`, `/observations`, `/map/observations`, `/regions/compare` endpoints, `pytest` API tests.
- **Dependencies:** Phase 1 contracts; Phase 2 verified schema fields.
- **Acceptance Criteria:** Endpoints pass schema, pagination, GeoJSON validity, and `404`/`422` error tests against synthetic and verified sample data.
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

## Phase 5 — Frontend and Lunar Map

- **Objectives:** Build the React + TypeScript + Vite SPA with the 7 planned pages, Leaflet 2D lunar basemap, layer controls, observation details, and region comparison charts.
- **Deliverables:** `frontend/` app, Zod contract validators, Leaflet map + GeoJSON overlays, Vitest/RTL UI tests.
- **Dependencies:** Phase 1 contracts; Phase 3 API endpoints; verified lunar basemap tile policy.
- **Acceptance Criteria:** Users can toggle elements/clusters/anomalies/quality filters, click observations to inspect details, compare two regions, and see synthetic banners when applicable.
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
