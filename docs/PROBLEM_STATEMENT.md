# Problem Statement

| Field | Value |
| --- | --- |
| **Document** | `docs/PROBLEM_STATEMENT.md` |
| **Version** | `0.1.0` |
| **Status** | `Draft — Planning Phase` |
| **Owner** | `[Member 1 & Member 2 Placeholders]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]`, `[Team Reviewers Placeholder]` |

---

## 1. Problem Overview

India's **Chandrayaan-2** mission has archived extensive planetary observations at the **Indian Space Science Data Centre (ISSDC)** via the **PRADAN** portal, including data related to **CLASS** (Chandrayaan-2 Large Area Soft X-ray Spectrometer) and **XSM** (Solar X-ray Monitor). While these archives are an invaluable scientific and educational resource, students and exploratory analysts face recurring technical and methodological barriers when working with lunar elemental-composition datasets.

---

## 2. Core Challenges Addressed

### 2.1 Domain-Specific Formats and Scattered Metadata
Planetary science archives commonly distribute data using PDS4 XML labels, FITS tables, or specialized derived products. Extracting observation coordinates, footprint extents, time intervals, units, and quality indicators requires non-trivial parsing and domain verification before any machine learning or visualization can occur.

### 2.2 Disconnected Analysis and Spatial Exploration
Typical exploratory workflows rely on isolated notebooks that produce static plots. Without a structured backend and interactive map interface, comparing compositional differences between two lunar regions or drilling from a spatial map directly into an observation's provenance and uncertainty remains cumbersome.

### 2.3 Loss of Uncertainty, Quality, and Provenance Context
When scientific tables are flattened into standard ML inputs, critical metadata—measurement uncertainties, quality flags, solar-excitation context, processing levels, and product versions—are frequently dropped. Displaying raw ML cluster IDs or anomaly flags without uncertainty and quality caveats risks misinterpreting noise, calibration artifacts, or low signal-to-noise observations as physical discoveries.

### 2.4 Misleading Geospatial Visualization
Standard web-mapping defaults often encourage heatmaps or continuous rasters that visually imply full-surface coverage. For orbital spectrometer footprints like CLASS, observations cover discrete footprints or tracks; honest visualization must preserve true observation points or footprints without implying unmeasured pixels were observed.

---

## 3. Target Users

1. **CSE & Planetary Science Students:** Exploring how real orbital remote-sensing tables behave through clean schemas, reproducible ML, and interactive maps.
2. **Academic Evaluators & Faculty Reviewers:** Inspecting end-to-end data engineering, scientific rigor, and software-architecture discipline.
3. **Exploratory Researchers (Secondary):** Reviewing spatial patterns, quality distributions, and region-to-region elemental comparisons with explicit provenance links.

---

## 4. Proposed Solution Summary

LunaSpectra addresses these challenges by uniting:

- **Validated Data Engineering:** Explicit PDS4/derived-table verification, coordinate/unit checks, and strict `null` semantics (`null` = unmeasured/unavailable, never `0`).
- **Quality-Aware ML:** Unsupervised clustering and anomaly baselines linked to versioned `model_runs` records and filtered for data quality before interpretation.
- **Honest Geospatial Interface:** A 2D lunar map displaying measured footprints/points, side-by-side region comparison, and clear warnings distinguishing synthetic test data from Chandrayaan-2 mission products.

---

## 5. Related Documents

- [Project Proposal](PROJECT_PROPOSAL.md)
- [Software Requirements Specification](SRS.md)
- [Dataset Guide](DATASET_GUIDE.md)
- [Ethics and Limitations](ETHICS_AND_LIMITATIONS.md)
