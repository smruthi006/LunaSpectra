# Software Requirements Specification (SRS)

| Field | Value |
| --- | --- |
| **Document** | `docs/SRS.md` |
| **Version** | `0.1.0` |
| **Status** | `Draft — Planning Phase` |
| **Owner** | `[Member 4 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[All Team Members Placeholder]`, `[Faculty Guide Name Placeholder]` |

---

## 1. Purpose and Scope

This Software Requirements Specification defines the **planned** functional, data, non-functional, and interface requirements for the **LunaSpectra** MVP (a 2-credit, third-year CSE mini-project). Requirements marked **Proposed** or **Planned** represent design commitments subject to dataset verification in Phase 2 ([DATASET_GUIDE.md](DATASET_GUIDE.md)).

---

## 2. System Perspective

LunaSpectra comprises three decoupled subsystems:

1. **Offline Data & ML Pipeline (Python):** Reads verified Chandrayaan-2 products from `data/raw/`, outputs validated analytical Parquet tables to `data/processed/`, populates SQLite (`lunaspectra.db`), and executes versioned clustering/anomaly models.
2. **Backend API Service (FastAPI):** Exposes read-only observation, dataset, cluster, anomaly, and comparison endpoints over `/api/v1/*`.
3. **Frontend Web Application (React + TypeScript):** Renders an interactive 2D lunar explorer, observation details, region comparison, dashboard metrics, and methodology documentation.

---

## 3. Functional Requirements (Planned)

### 3.1 Data Ingestion and Validation (`FR-DATA`)

- **FR-DATA-01:** The pipeline shall ingest verified Chandrayaan-2 derived/processed elemental-abundance files (Approach A) from `data/raw/` without mutating raw source files.
- **FR-DATA-02:** The pipeline shall preserve `source_product_id`, `dataset_id`, `processing_level`, `product_version`, `provenance_uri`, and `ingestion_timestamp` for every observation.
- **FR-DATA-03:** The pipeline shall validate latitude (`[-90, 90]`) and normalize longitude to a single documented convention (see [DATA_DICTIONARY.md](DATA_DICTIONARY.md)).
- **FR-DATA-04:** Missing or unmeasured elemental values shall be stored as `NULL` / `NaN`, never coerced to `0`.
- **FR-DATA-05:** Elemental ratios (`Mg/Si`, `Al/Si`, `Fe/Si`) shall only be computed when both numerator and denominator are present, scientifically compatible, and the denominator is strictly positive (`> 0`).
- **FR-DATA-06:** Every record shall carry an explicit `data_origin` value (`mission` vs. `synthetic`) so synthetic test fixtures never silently mix with mission data.

### 3.2 Machine Learning & Analytics (`FR-ML`)

- **FR-ML-01:** Every clustering or anomaly-detection execution shall record a `model_runs` entry containing algorithm name, hyperparameters, feature list, preprocessing version, random seed, and creation timestamp.
- **FR-ML-02:** The pipeline shall support baseline K-Means clustering (and optional DBSCAN comparison) on explicitly selected, scaled features, computing Silhouette score and Davies–Bouldin index.
- **FR-ML-03:** The pipeline shall support statistical anomaly baselines (Z-score, MAD) and multivariate Isolation Forest (with optional LOF comparison), applying quality-flag screening prior to interpretation.
- **FR-ML-04:** Controlled synthetic anomaly injection tests shall verify anomaly-scoring behavior independently of real mission interpretation.

### 3.3 Backend API (`FR-API`)

- **FR-API-01:** All endpoints shall be served under `/api/v1` and validated via Pydantic schemas ([API_SPECIFICATION.md](API_SPECIFICATION.md)).
- **FR-API-02:** `GET /api/v1/map/observations` shall return valid GeoJSON `FeatureCollection` payloads containing observation points or footprint polygons.
- **FR-API-03:** List endpoints shall implement pagination (`limit`, `offset`) and safe filtering (element, quality status, `model_run_id`, bounding box, `data_origin`).
- **FR-API-04:** `POST /api/v1/regions/compare` shall accept two observation IDs or bounding regions and return composition summaries, ratio comparisons, differences, and quality/uncertainty warnings.

### 3.4 Frontend User Interface (`FR-UI`)

- **FR-UI-01:** The application shall provide the 7 planned views: Landing, Dashboard, Lunar Explorer, Observation Details, Region Comparison, Analysis & Methodology, and Data & Sources.
- **FR-UI-02:** The Lunar Explorer shall display only measured observation points or footprints with clear legends, coordinate readouts, layer selectors (element, cluster, anomaly), and quality filters.
- **FR-UI-03:** Observation Details and Region Comparison shall visibly display uncertainty values, quality flags, `model_run_id`, and provenance metadata.
- **FR-UI-04:** If `data_origin === "synthetic"` records are displayed in development/demo mode, the UI shall render a prominent banner warning that the data is synthetic.

---

## 4. External Interface Requirements

- **User Interface:** Responsive web UI built with React, TypeScript, Tailwind CSS, Leaflet, and Plotly.js or Recharts ([FRONTEND_SPECIFICATION.md](FRONTEND_SPECIFICATION.md)).
- **API Interface:** JSON and GeoJSON over HTTP/REST with OpenAPI documentation auto-generated by FastAPI.
- **Storage Interface:** Local filesystem (`data/`, `models/`), Apache Parquet, and SQLite via SQLAlchemy + Alembic ([DATABASE_DESIGN.md](DATABASE_DESIGN.md)).

---

## 5. Non-Functional Requirements

- **NFR-01 Reproducibility:** Fixed random seeds and versioned preprocessing configs shall produce deterministic ML outputs on identical input tables.
- **NFR-02 Scientific Transparency:** UI labels and docs shall avoid claiming mineral discoveries, global coverage, or unverified accuracy metrics.
- **NFR-03 Maintainability:** Frontend and backend codebases shall enforce type safety (TypeScript + Zod; Python type hints + Mypy + Pydantic) and automated linting (ESLint/Prettier; Ruff).
- **NFR-04 Testability:** Core parsing, ratio guards, API contracts, and UI error/empty states shall be covered by automated tests ([TESTING_STRATEGY.md](TESTING_STRATEGY.md)).
- **NFR-05 Security & Privacy:** No credentials, API keys, or raw mission archives shall be committed to Git ([SECURITY.md](../SECURITY.md)).

---

## 6. Out-of-Scope / Future Requirements

Raw CLASS+XSM spectral fitting, CesiumJS 3D globe rendering, PostGIS spatial clustering, user authentication, and multi-instrument fusion are deferred to Phase 8 ([ROADMAP.md](ROADMAP.md)).
