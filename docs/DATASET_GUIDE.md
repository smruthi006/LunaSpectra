# Dataset Guide

| Field | Value |
| --- | --- |
| **Document** | `docs/DATASET_GUIDE.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Phase 1 Mendeley Dataset Verified (DOI: 10.17632/6mmd96j5bg.1); ISSDC PDS4 Expansion Pending` |
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

## 3. Phase 1 Active Real Dataset (`CLASS_CHANDRAYAAN2`)

In Phase 1, LunaSpectra ingests genuine public Chandrayaan-2 CLASS data from Mendeley Data:

- **Name:** `CLASS_CHANDRAYAAN2` (Version 1, published 30 October 2020)
- **DOI:** `10.17632/6mmd96j5bg.1` (<https://data.mendeley.com/datasets/6mmd96j5bg/1>)
- **Contributor / Institution:** Shyama Narendranath, Indian Space Research Organisation (ISRO)
- **License:** CC BY 4.0
- **Local Raw Staging (Git-Ignored):** `data/raw/class_mendeley_v1/`
- **Observed Scope:**
  - Two lunar observation dates: `2019-11-18` (`181120`) and `2020-05-29` (`290520`)
  - CLASS FITS + ASCII source spectra (`1024` channels) and background spectra
  - Onboard Fe-55 calibration spectra (pre-flight and post-flight)
  - Solar X-ray data (`SOLAR_DATA`): XSM spectrum `CH2_XSM_20191118_90853504_90853624.pha` (`512` channels with `STAT_ERR`) and Chianti isothermal solar model spectrum (`2019-11-18`)
  - XSPEC modelled line fluxes (`photons/cm2/s`) and X2ABUNDANCE weight-percent abundances (`wt%`)
- **Verified Limitations:**
  - **No geospatial coordinates or footprint polygons** exist in this dataset (`latitude = null`, `longitude = null`, `footprint_geometry = null`).
  - `181120/R2_abundance.txt` lists 5 header element names (`Na, Mg, Al, Si, Ca`) against 4 array entries (`[2.0, 5.0, 8.0, 18.0]`); element alignment is withheld rather than guessed.
  - Complete lunar coverage is **not** claimed.

See [REAL_DATA_INVENTORY.md](REAL_DATA_INVENTORY.md) and [REAL_DATA_FIELD_MAPPING.md](REAL_DATA_FIELD_MAPPING.md) for file-by-file verification.

### Phase 2 Verification Mandate (ISSDC / PRADAN PDS4 Expansion)

> [!IMPORTANT]
> To enable lunar mapping in Phase 2+, the team must inspect geolocated PDS4 bundles from ISSDC / PRADAN in `data/raw/` to verify:

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
>
> **Phase 1 Dataset Attribution (CC BY 4.0):**
> "Shyama Narendranath (Indian Space Research Organisation), *CLASS_CHANDRAYAAN2*, Version 1 (2020), Mendeley Data, DOI: `10.17632/6mmd96j5bg.1`, CC BY 4.0 (<http://creativecommons.org/licenses/by/4.0>)."

> [!WARNING]
> **TODO (Pre-Publication / Redistribution Check):** Before publishing results, hosting a public web demo, or redistributing any derived data tables, the team must re-check the latest official ISRO / ISSDC / PRADAN data-use policies and lunar basemap (USGS/NASA/LROC) attribution requirements.

---

## 6. Related Documents

- [Data Dictionary](DATA_DICTIONARY.md)
- [Data Pipeline](DATA_PIPELINE.md)
- [Ethics and Limitations](ETHICS_AND_LIMITATIONS.md)
- [References](REFERENCES.md)
