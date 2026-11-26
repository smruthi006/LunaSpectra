# Frontend Specification

| Field | Value |
| --- | --- |
| **Document** | `docs/FRONTEND_SPECIFICATION.md` |
| **Version** | `0.1.0` |
| **Status** | `Implemented — Phase 2 Real-Data Explorer (Leaflet Map Pending PRADAN Data)` |
| **Owner** | `[Member 3 Name Placeholder]` |
| **Last updated** | `2026-11-26` |
| **Reviewers** | `[Member 4 Name Placeholder]`, `[Member 2 Name Placeholder]` |

---

> [!NOTE]
> **Phase 2 Implementation Status:** The React + TypeScript + Vite SPA under [`frontend/`](../frontend/README.md) is **Implemented** and integrated with all 11 live FastAPI Phase 1 endpoints using Zod runtime contract schemas (`frontend/src/api/schemas.ts`) and TanStack Query hooks (`frontend/src/api/queries.ts`). Pages `Home`, `Dashboard`, `Observations`, `ObservationDetail`, `Compare`, `Methodology`, and `DataSources` display genuine Chandrayaan-2 CLASS data (`DOI: 10.17632/6mmd96j5bg.1`), while `LunarExplorer` inspects `/api/v1/map/availability` and renders an explicit unavailable disclosure when `available: false`. Live screenshots captured from the running app are stored in `assets/images/` (**not mockups**):
> - [`../assets/images/dashboard.png`](../assets/images/dashboard.png)
> - [`../assets/images/observation_detail_20191118.png`](../assets/images/observation_detail_20191118.png)
> - [`../assets/images/observation_detail_20200529.png`](../assets/images/observation_detail_20200529.png)
> - [`../assets/images/comparison.png`](../assets/images/comparison.png)
> - [`../assets/images/lunar_explorer_unavailable.png`](../assets/images/lunar_explorer_unavailable.png)
>
> Interactive Leaflet lunar map rendering and unsupervised ML overlays remain **Deferred/Planned** pending verified geolocated ISSDC/PRADAN products.

---

## 1. Frontend Architecture & Stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Geospatial Mapping:** React Leaflet & Leaflet (2D lunar basemap + GeoJSON footprint/point layers)
- **Charting:** Plotly.js or Recharts (elemental composition bars, error bars, PCA/cluster scatter plots)
- **Server State & Validation:** TanStack Query + Zod runtime schema validation on API responses
- **Quality & Testing:** Vitest, React Testing Library, ESLint, Prettier

---

## 2. Planned Application Pages (7 Core Views)

### 2.1 Landing Page (`/`)
- Project introduction (*LunaSpectra — Explore the Moon through data.*)
- High-level dataset overview and data-origin notice
- Concise visual explanation of lunar X-ray fluorescence (CLASS + XSM)
- Primary call-to-action button to open the **Lunar Explorer** (`/explorer`)

### 2.2 Dashboard (`/dashboard`)
- Dataset summary cards (total observation count, spatial coverage summary, available elements)
- Quality-flag distribution breakdown (`GOOD`, `CAUTION`, `POOR`, `UNVERIFIED`)
- Active `model_run_id` metadata (algorithm, preprocessing version, random seed, timestamp)
- Explicit notice if synthetic development data is loaded

### 2.3 Lunar Explorer (`/explorer`)
- **2D Lunar Basemap:** Configured with lunar CRS/tile source (e.g., USGS/LROC WAC global mosaic, subject to tile license verification)
- **Layer Controls:**
  - Element selector (`Mg`, `Al`, `Si`, `Ca`, `Fe`, or ratios where available)
  - Cluster overlay toggle (colored by `cluster_label` for selected `model_run_id`)
  - Anomaly overlay toggle (highlight flagged observations with quality caveat)
  - Quality filter (`GOOD` only vs. include `CAUTION`/`POOR`)
- **Map Chrome:** Dynamic color legend, live cursor latitude/longitude readout (`[-90, 90]`, `[-180, 180]`), and clickable observation points/footprints
- **Honest Representation:** Renders discrete points or footprint polygons only; never renders continuous interpolated heatmaps implying unmeasured lunar pixel coverage

### 2.4 Observation Details (`/observations/:observationId` or Slide-Over Inspector)
- `source_product_id`, `dataset_id`, `processing_level`, `product_version`, and `provenance_uri`
- Acquisition start/end timestamps
- Center coordinates and footprint geometry preview
- Elemental abundance bar chart **with visible uncertainty error bars** and explicit `Unmeasured (null)` indicators
- Quality status (`quality_flag`, `quality_score`) and `solar_observation_reference`
- Cluster assignment, anomaly score, and linked `model_run_id`

### 2.5 Region Comparison (`/compare`)
- Dual selector to choose **two observations** or **two bounding regions**
- Side-by-side elemental composition chart and guarded ratio comparison (`Mg/Si`, `Al/Si`, `Fe/Si`)
- Numerical difference table showing deltas and uncertainties
- Automatic **quality and uncertainty warnings** when sample sizes are small, uncertainties overlap, or `CAUTION`/`POOR` records are included

### 2.6 Analysis and Methodology (`/methodology`)
- Transparent breakdown of preprocessing steps, selected features, clustering baselines (K-Means, DBSCAN), anomaly detection (Z-score, MAD, Isolation Forest, LOF), evaluation metrics, and scientific limitations

### 2.7 Data and Sources (`/sources`)
- Dataset origin (`ISSDC / PRADAN`), product versions, required ISRO/ISSDC acknowledgement, basemap attribution, usage conditions, and interactive Data Dictionary summary

---

## 3. UI States, Contracts, and Accessibility

| Requirement | Planned Implementation |
| --- | --- |
| **Synthetic Data Banner** | Whenever API payloads contain `data_origin: "synthetic"`, render a non-dismissible top warning banner: *"Viewing synthetic development data — not Chandrayaan-2 mission observations."* |
| **Runtime API Validation** | Every TanStack Query fetcher parses JSON through **Zod** schemas matching [API_SPECIFICATION.md](API_SPECIFICATION.md) so schema mismatches surface immediately. |
| **Empty / Error / Loading States** | Dedicated skeleton loaders, retryable error cards, and clear empty-filter notices ("No observations match selected quality/bounding filters"). |
| **Accessibility** | Keyboard-navigable controls, ARIA labels on map layer toggles, colorblind-conscious palettes alongside shape/pattern cues, and minimum contrast compliance. |

---

## 4. Related Documents

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [API Specification](API_SPECIFICATION.md)
- [Testing Strategy](TESTING_STRATEGY.md)
- [Ethics and Limitations](ETHICS_AND_LIMITATIONS.md)
