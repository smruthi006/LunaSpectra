# Project Proposal

| Field | Value |
| --- | --- |
| **Document** | `docs/PROJECT_PROPOSAL.md` |
| **Version** | `0.1.0` |
| **Status** | `Draft — Planning Phase` |
| **Owner** | `[All 4 Team Members Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]`, `[Team Reviewers Placeholder]` |

---

## 1. Academic Identification

| Metadata | Details |
| --- | --- |
| **Product Name** | LunaSpectra |
| **Formal Academic Title** | LunaSpectra: Intelligent Analysis and Interactive Mapping of Lunar Elemental Composition Using Chandrayaan-2 Data |
| **Tagline** | Explore the Moon through data. |
| **Course / Credit Structure** | 2-Credit, Third-Year Computer Science and Engineering Mini-Project |
| **Primary Domain** | Data Science and Machine Learning |
| **Descriptive Domain** | AI/ML-Based Geospatial and Planetary Data Analytics |
| **Institution / Department** | `[College Name Placeholder]` — `[Department of CSE Placeholder]` |
| **Academic Year** | `[Academic Year Placeholder]` |
| **Faculty Guide** | `[Faculty Guide Name Placeholder]` |
| **Team Size** | 4 Students |

---

## 2. Executive Summary

**LunaSpectra** proposes an end-to-end, scientifically cautious software platform for cleaning, organizing, analyzing, and interactively mapping lunar elemental-composition observations associated with ISRO's **Chandrayaan-2** mission—specifically the **CLASS** (Chandrayaan-2 Large Area Soft X-ray Spectrometer) and **XSM** (Solar X-ray Monitor) instruments.

Designed within the realistic scope of a 2-credit undergraduate mini-project, LunaSpectra adopts **Approach A** as its primary MVP path: ingesting processed or derived geolocated elemental-abundance products (subject to PDS4 bundle verification in Phase 2) rather than claiming unsupported raw X-ray spectral calibration. The system pairs an offline reproducible Python data/ML pipeline with a proposed **FastAPI** backend and a **React + TypeScript + Leaflet** web explorer.

---

## 3. Background and Scientific Context

Chandrayaan-2's orbiter carries two complementary X-ray payloads:

- **CLASS** measures characteristic fluorescent X-rays emitted by lunar surface elements (such as Mg, Al, Si, Ca, and Fe) when excited by solar X-rays.
- **XSM** measures the incoming solar X-ray spectrum (1–15 keV) required to interpret CLASS spectra quantitatively.

Transforming raw instrument telemetry into elemental abundances requires response matrices, background subtraction, solar-spectrum coupling, and physical modelling. LunaSpectra respects this scientific boundary by clearly distinguishing processed/derived abundance exploration (MVP) from raw spectral processing (Optional Extension).

---

## 4. Objectives

1. **Reproducible Ingestion:** Build a deterministic ingestion and validation workflow for Chandrayaan-2 elemental-composition tables/products with strict coordinate, unit, and null handling.
2. **Metadata & Provenance Preservation:** Track `source_product_id`, `dataset_id`, processing level, version, footprint geometry, uncertainties, and quality flags throughout every transformation.
3. **Interpretable Unsupervised ML:** Group compositionally similar observations (K-Means baseline, optional DBSCAN comparison) and flag unusual measurements via quality-aware anomaly detection (Z-score, MAD, Isolation Forest, optional LOF comparison).
4. **Interactive 2D Lunar Mapping:** Render actual measured observation points or footprints (without implying unmeasured global pixel coverage) over a 2D lunar basemap.
5. **Observation & Region Comparison:** Allow users to inspect single observations and compare two selected regions with explicit uncertainty and quality warnings.

---

## 5. Scope and Non-Goals

### 5.1 MVP Scope (2-Credit Target)

- Reproducible data-ingestion and validation scripts
- Normalized Parquet analytical table and SQLite application database
- Summary statistics, quality metrics, and guarded elemental ratios (`Mg/Si`, `Al/Si`, `Fe/Si`)
- Versioned ML clustering and anomaly-detection pipeline tracked in `model_runs`
- Proposed FastAPI backend exposing GeoJSON, observation, cluster, anomaly, and comparison endpoints
- Planned React + TypeScript frontend with 7 core views and automated tests

### 5.2 Non-Goals and Scientific Boundaries

- Does **not** claim to discover new minerals or validate geological formations.
- Does **not** treat X-ray peak intensity as elemental weight percentage.
- Is **not** a lunar image-classification project or real-time satellite telemetry monitor.
- Does **not** blend synthetic test records with real mission data (`data_origin` isolation enforced).

See [ETHICS_AND_LIMITATIONS.md](ETHICS_AND_LIMITATIONS.md) for the complete scientific-honesty policy.

---

## 6. SDG Alignment

| Tier | Sustainable Development Goal | Alignment Rationale |
| --- | --- | --- |
| **Primary** | **SDG 9 — Industry, Innovation and Infrastructure** | Develops clean, modular, reproducible geospatial and ML data infrastructure for scientific archives. |
| **Secondary** | **SDG 4 — Quality Education** | Turns complex planetary XRF data into an accessible, transparent educational explorer. |
| **Supporting** | **SDG 17 — Partnerships for the Goals** | Demonstrates responsible attribution and open-science interoperability with ISRO/ISSDC and NASA/USGS planetary data. |

---

## 7. Team Allocation

- **Member 1 (`[Member 1 Name Placeholder]`):** Data acquisition, PDS4/FITS parsing, validation, and preprocessing.
- **Member 2 (`[Member 2 Name Placeholder]`):** Feature engineering, clustering, anomaly detection, and scientific evaluation.
- **Member 3 (`[Member 3 Name Placeholder]`):** Frontend UI, Leaflet lunar map, charts, and UX states.
- **Member 4 (`[Member 4 Name Placeholder]`):** FastAPI backend, SQLite/SQLAlchemy schema, API contracts, and repository integration.

---

## 8. Related Documents

- [Problem Statement](PROBLEM_STATEMENT.md)
- [Software Requirements Specification (SRS)](SRS.md)
- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Dataset Guide](DATASET_GUIDE.md)
- [Roadmap](ROADMAP.md)
- [Risk Register](RISK_REGISTER.md)
