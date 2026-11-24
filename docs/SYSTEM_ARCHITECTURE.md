# System Architecture

| Field | Value |
| --- | --- |
| **Document** | `docs/SYSTEM_ARCHITECTURE.md` |
| **Version** | `0.1.0` |
| **Status** | `Proposed — Planning Phase` |
| **Owner** | `[Member 4 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[All Team Members Placeholder]`, `[Faculty Guide Name Placeholder]` |

---

> [!NOTE]
> All components, services, and data flows documented here are **Proposed** architectural specifications for the LunaSpectra MVP. Implementation begins in Phases 1–5.

---

## 1. Architectural Overview

LunaSpectra separates **heavyweight scientific data ingestion and ML execution** (offline Python pipeline) from **interactive querying and geospatial visualization** (FastAPI backend + React/TypeScript frontend). This separation keeps the web API fast and predictable while preserving strict scientific lineage from raw ISSDC files through processed Parquet tables and versioned `model_runs`.

---

## 2. High-Level System Architecture (Proposed)

```mermaid
flowchart TB
    subgraph External["External Data & Map Providers"]
        ISSDC["ISSDC / PRADAN Archive\n(Chandrayaan-2 Products)"]
        Basemap["USGS / LROC WMTS\n(2D Lunar Basemap Tiles)"]
    end

    subgraph Offline["Offline Python Pipeline (Planned)"]
        Ingestor["Product Parser\n(PDS4 / FITS / Derived CSV)"]
        Validator["Schema, Coordinate & Unit\nValidator + Ratio Guards"]
        ParquetStore[("Processed Parquet\ndata/processed/")]
        MLRunner["ML Pipeline\n(K-Means, DBSCAN, Isolation Forest, Z/MAD)"]
        ModelStore[("Model Artifacts\nmodels/")]
    end

    subgraph Persistence["Application Database (Planned)"]
        SQLite[("SQLite DB\nlunaspectra.db")]
    end

    subgraph Backend["FastAPI Service (Proposed)"]
        Router["REST Routers\n/api/v1/*"]
        Schemas["Pydantic Schemas\n& GeoJSON Serializer"]
        Services["Query, Filtering &\nRegion Comparison Logic"]
    end

    subgraph Frontend["React + TypeScript SPA (Planned)"]
        Pages["7 Planned Pages\n(Explorer, Dashboard, Compare, etc.)"]
        MapComp["React Leaflet\n2D Lunar Map"]
        Charts["Plotly.js / Recharts\nComposition Charts"]
        QueryClient["TanStack Query +\nZod Contract Validation"]
    end

    ISSDC -->|Manual / Scripted Download| Ingestor
    Ingestor --> Validator
    Validator --> ParquetStore
    Validator --> SQLite
    ParquetStore --> MLRunner
    MLRunner --> SQLite
    MLRunner --> ModelStore
    SQLite --> Services
    Services --> Schemas
    Schemas --> Router
    Router <-->|HTTP JSON & GeoJSON| QueryClient
    QueryClient --> Pages
    Pages --> MapComp
    Pages --> Charts
    Basemap -->|Tile Requests| MapComp
```

---

## 3. Scientific Data Lineage

Maintaining end-to-end traceability prevents analytical results from being detached from their physical measurement context.

```mermaid
flowchart LR
    Raw["Immutable Raw Product\n(data/raw/, source_product_id)"] --> Parsed["Interim Parsed Record\n(data/interim/, units & coords)"]
    Parsed --> Clean["Validated Feature Table\n(data/processed/*.parquet)"]
    Clean --> ObsDB["SQLite: source_products,\nobservations, footprints,\nelemental_measurements, quality_metrics"]
    Clean --> MLRun["ML Execution\n(model_runs: seed, config, features)"]
    MLRun --> DerivedDB["SQLite: feature_vectors,\ncluster_results, anomaly_results"]
    ObsDB --> JoinView["Joined API Response\n(Observation + Provenance + ML)"]
    DerivedDB --> JoinView
```

Key lineage invariants:
- Source measurements (`elemental_measurements`) and derived ML outputs (`cluster_results`, `anomaly_results`) are stored in **separate normalized tables**.
- Every derived ML result links back to a specific `model_run_id`.
- `data_origin` (`mission` or `synthetic`) travels from ingestion to the UI.

---

## 4. Frontend and Backend Interaction

```mermaid
sequenceDiagram
    participant User as User Browser
    participant FE as React + TanStack Query + Zod
    participant API as FastAPI (/api/v1)
    participant DB as SQLite (SQLAlchemy)

    User->>FE: Open Lunar Explorer (select Mg layer, quality=GOOD)
    FE->>API: GET /api/v1/map/observations?element=Mg&quality=GOOD&model_run_id=1
    API->>DB: Query observations + footprints + elemental_measurements + ML results
    DB-->>API: Matching rows
    API-->>FE: 200 OK (GeoJSON FeatureCollection)
    FE->>FE: Validate payload with Zod schema
    FE-->>User: Render footprint polygons/points & legend on Leaflet map
```

---

## 5. Request Lifecycle: Selecting an Observation on the Map

```mermaid
sequenceDiagram
    participant User as User
    participant Map as Leaflet Lunar Map
    participant Store as React View State
    participant API as FastAPI Backend
    participant DB as SQLite Database
    participant Panel as Observation Detail Panel

    User->>Map: Click observation footprint / point
    Map->>Store: Emit selected observation_id
    Store->>API: GET /api/v1/observations/{observation_id}
    API->>DB: Fetch observation, source_product, dataset,\nfootprints, elemental_measurements,\nquality_metrics, cluster & anomaly results
    alt Observation exists
        DB-->>API: Complete joined record
        API-->>Store: 200 OK (ObservationDetail JSON)
        Store->>Panel: Render composition, uncertainty, quality,\ncluster/anomaly context & provenance URI
    else Not found
        DB-->>API: Empty result
        API-->>Store: 404 Not Found (Structured Error)
        Store->>Panel: Display accessible error state
    end
```

---

## 6. Architectural Trade-offs (2-Credit Scope)

| Decision | Choice for MVP | Rationale | Future Scaling Path |
| --- | --- | --- | --- |
| **Database** | SQLite + local Parquet | Zero-ops setup for 4-student local development; fast analytical reads via PyArrow. | PostgreSQL + PostGIS (Phase 8) |
| **ML Execution** | Offline Python batch scripts | Avoids slow synchronous training inside API requests; ensures reproducible `model_runs`. | Background worker / task queue if needed |
| **Map Projection** | 2D Leaflet lunar basemap | Lightweight, reliable, supports GeoJSON footprints and custom tile layers. | CesiumJS 3D lunar globe (Phase 8) |
| **Spectral Input** | Approach A derived abundances | Fits 2-credit scope without claiming unverified spectral response modelling. | Approach B raw CLASS+XSM (Phase 8) |

---

## 7. Related Documents

- [Data Pipeline](DATA_PIPELINE.md)
- [Database Design](DATABASE_DESIGN.md)
- [API Specification](API_SPECIFICATION.md)
- [Frontend Specification](FRONTEND_SPECIFICATION.md)
- [ML Methodology](ML_METHODOLOGY.md)
