# Dataset Guide

| Field | Value |
| --- | --- |
| **Document** | `docs/DATASET_GUIDE.md` |
| **Version** | `0.1.0` |
| **Status** | `Draft — Pending PDS4 Product Verification (Phase 2)` |
| **Owner** | `[Member 1 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Member 2 Name Placeholder]`, `[Faculty Guide Name Placeholder]` |

---

## 1. Scientific Foundation: Lunar X-Ray Fluorescence

LunaSpectra centers on elemental-composition observations associated with two payloads aboard the **Chandrayaan-2** orbiter:

1. **CLASS** (*Chandrayaan-2 Large Area Soft X-ray Spectrometer*)
2. **XSM** (*Solar X-ray Monitor*)

The physical measurement chain works as follows:

1. **The Sun emits X-rays** across the soft X-ray spectrum, with heightened intensity during solar flares and active coronal periods.
2. **Solar X-rays interact with the lunar surface**, penetrating the topmost layer of lunar regolith.
3. **Surface elements emit characteristic fluorescent X-rays** at discrete energies determined by atomic inner-shell transitions (e.g., lines associated with Mg, Al, Si, Ca, Ti, Fe, and Na).
4. **CLASS records the resulting lunar X-ray spectra** over its orbital collimator field of view (footprint).
5. **XSM measures the incoming solar X-ray spectrum** (1–15 keV) at high time cadence, providing the incident solar flux reference required for quantitative spectral interpretation.
6. **Scientific processing can then be used to investigate elemental composition** by accounting for solar excitation, detector response matrices, background signals, viewing geometry, and matrix effects.

---

## 2. Two-Tier Dataset Acquisition Strategy

### 2.1 Approach A — Preferred MVP (Processed / Derived Geolocated Products)

In **Approach A**, LunaSpectra ingests **processed or derived geolocated elemental-abundance products** (such as calibrated abundance tables or peer-reviewed derived datasets associated with CLASS observations, if suitable products are verified and accessible during Phase 2).

**Why Approach A is preferred for a 2-credit CSE mini-project:**

- **Appropriate Academic Scope:** Allows a four-student CSE team to focus on rigorous data engineering, schema normalization, uncertainty-aware machine learning, API design, and interactive geospatial visualization.
- **Scientific Honesty:** Avoids falsely claiming domain expertise in raw X-ray instrument response modelling, background subtraction, or solar-flare spectral fitting.
- **Reproducible Engineering:** Enables clean tabular/Parquet validation and transparent tracking of quality flags and uncertainties.

### 2.2 Approach B — Advanced Optional Extension (Raw CLASS + XSM Joint Spectral Analysis)

In **Approach B**, raw or low-level **CLASS** spectral products would be paired with **XSM** solar X-ray spectra, instrument calibration files, detector response matrices, and spacecraft attitude/ephemeris metadata to fit XRF peaks and estimate abundances.

**Why Approach B is deferred to Optional Extensions (Phase 8):**

- **High Spectroscopy Complexity:** Raw X-ray peak intensities are **not** directly equivalent to elemental weight percentages.
- **Required Physical Modelling:** Quantitative abundance inversion requires background modelling, response-matrix convolution, solar spectral coupling from XSM, and extensive scientific validation against lunar ground truth.
- **Risk to 2-Credit Timeline:** Attempting raw spectral inversion in the MVP would jeopardize core software engineering, testing, and visualization deliverables.

---

## 3. Verification Mandate (Phase 2 Prerequisite)

> [!IMPORTANT]
> No Chandrayaan-2 data files have been downloaded or inspected yet. Before writing production parsers or final SQL schemas, the team **must** inspect downloaded PDS4 products and their official bundle documentation in Phase 2 to verify:

- Exact file formats (e.g., PDS4 XML labels `.xml`, FITS tables `.fits`, CSV/ASCII tables)
- Exact column/field names, data types, and units (e.g., wt%, atom%, ratio, or count rate)
- Spatial coverage and coordinate conventions (planetocentric latitude, `0–360` vs. `-180–180` longitude)
- Footprint geometry representation (center point, bounding box corners, or polygon vertices)
- Explicit uncertainty fields and error definitions (e.g., 1-sigma error)
- Quality flags, solar-activity flags, and missing-data sentinel values
- Which elements (e.g., Mg, Al, Si, Ca, Fe) are genuinely available and sufficiently populated

---

## 4. Storage Rules and Synthetic Data Isolation

- **Raw Data (`data/raw/`):** Treated as **strictly immutable** and **git-ignored**. Never commit downloaded Chandrayaan-2 archives to Git.
- **Interim & Processed Data (`data/interim/`, `data/processed/`):** Git-ignored generated outputs (e.g., Parquet tables).
- **Sample Fixtures (`data/sample/`):** Small, explicitly synthetic or minimal non-mission schema fixtures used for unit tests and local development.
- **Mandatory Isolation:** Every record in the pipeline and database must carry `data_origin` (`mission` or `synthetic`). Synthetic fixtures must remain visibly and technically separated from mission observations.

---

## 5. Data Rights, Licensing, and Required Attribution

Source code in this repository is licensed under the MIT License ([LICENSE](../LICENSE)), which **does not** relicense Chandrayaan-2 data, ISSDC archives, or lunar basemap imagery.

> **Required Mission Data Acknowledgement:**
> "We acknowledge the use of data from the Chandrayaan-II, second lunar mission of the Indian Space Research Organisation (ISRO), archived at the Indian Space Science Data Centre (ISSDC)."

> [!WARNING]
> **TODO (Pre-Publication / Redistribution Check):** Before publishing results, hosting a public web demo, or redistributing any derived data tables, the team must re-check the latest official ISRO / ISSDC / PRADAN data-use policies and lunar basemap (USGS/NASA/LROC) attribution requirements.

---

## 6. Related Documents

- [Data Dictionary](DATA_DICTIONARY.md)
- [Data Pipeline](DATA_PIPELINE.md)
- [Ethics and Limitations](ETHICS_AND_LIMITATIONS.md)
- [References](REFERENCES.md)
