# Ethics, Scientific Honesty, and Limitations

| Field | Value |
| --- | --- |
| **Document** | `docs/ETHICS_AND_LIMITATIONS.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Mandatory Project Policy` |
| **Owner** | `[All 4 Team Members Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]` |

---

## 1. Scientific Honesty Commitments & Explicit Non-Goals

LunaSpectra handles real planetary-science concepts and must uphold strict academic and scientific integrity:

1. **No Mineral Discovery Claims:** LunaSpectra does **not** claim to discover new minerals, ore deposits, or landing-site resources.
2. **Not Image Classification or Real-Time Telemetry:** LunaSpectra is **not** a lunar image-classification project and is **not** a real-time satellite-monitoring system.
3. **Clusters Are Not Geological Formations:** An unsupervised ML cluster (e.g., from K-Means or DBSCAN) represents proximity in a chosen scaled feature space—it is **not** automatically a geological formation, mineral class, or rock type.
4. **Anomalies Are Not Automatically Scientific Discoveries:** A flagged anomaly in Z-score, MAD, Isolation Forest, or LOF is **not** automatically a valuable resource or physical discovery. An anomalous score can arise from:
   - Genuine compositional variation,
   - Measurement noise or poor signal-to-noise ratio,
   - Instrument calibration or solar-flare flux variations,
   - Missing contextual metadata, or
   - Upstream/downstream processing errors.
5. **X-Ray Intensity Is Not Elemental Weight Percentage:** X-ray fluorescence peak intensity cannot be equated directly to elemental abundance (`wt%`). Quantitative abundance estimation from raw CLASS observations requires detector calibration, background subtraction, simultaneous XSM solar-spectrum inputs, response matrices, spectral fitting, and physical matrix modelling.
6. **Raw Spectral Processing Is Optional Future Work:** Raw spectral inversion (Approach B) is **not** a guaranteed MVP feature. The preferred MVP (Approach A) relies on processed or derived geolocated abundance products once verified from downloaded PDS4 bundles and official documentation.
7. **No Implied Global Lunar Coverage:** Lunar observations must be displayed as discrete measured points or orbital footprints. Visual interpolation or heatmaps that imply every lunar pixel was measured are prohibited.
8. **Synthetic vs. Mission Data Separation:** Synthetic fixtures created for software testing or early UI prototyping must carry `data_origin = "synthetic"`, reside separately (`data/sample/`), and trigger a visible warning banner in the UI.
9. **Zero Fabricated Metrics or Statuses:** No model accuracy, latency, dataset size, observation count, test count, or scientific conclusion may be invented before empirical execution and verification.

---

## 2. Data Rights, Licensing, and Attribution Separation

LunaSpectra enforces a four-way separation of intellectual property and data rights:

| Asset Category | Governing Terms | Repository Policy |
| --- | --- | --- |
| **1. Student-Authored Source Code & Docs** | [MIT License](../LICENSE) | Openly hosted in this Git repository. |
| **2. Chandrayaan-2 / ISRO Mission Data** | ISRO / ISSDC archival policy | **Not** relicensed by MIT. Never committed to Git (`data/raw/` is ignored). |
| **3. Lunar Basemap Imagery** | Provider terms (e.g., USGS Astrogeology / NASA / LROC public domain & citation guidelines) | Consumed via documented tile/WMTS URLs with proper attribution. |
| **4. Third-Party Libraries** | Individual open-source licenses (React, FastAPI, Scikit-learn, Leaflet, etc.) | Tracked via dependency manifests once initialized. |

### Required ISRO / ISSDC Acknowledgement

All documentation, reports, and UI `Data & Sources` views using Chandrayaan-2 data must include:

> "We acknowledge the use of data from the Chandrayaan-II, second lunar mission of the Indian Space Research Organisation (ISRO), archived at the Indian Space Science Data Centre (ISSDC)."

> [!IMPORTANT]
> **TODO (Mandatory Before Publication or Redistribution):** The team must re-check the latest official ISRO / ISSDC / PRADAN data-use, citation, and redistribution policies—as well as the selected lunar basemap provider's terms—before any public deployment, journal/conference submission, or redistribution of derived outputs.

---

## 3. Responsible Academic Communication

All project presentations, reports, and README updates must describe planned features as **Proposed** or **Planned**, unverified dataset assumptions as **To be verified**, and completed checks strictly by their verified scope.

---

## 4. Related Documents

- [Dataset Guide](DATASET_GUIDE.md)
- [ML Methodology](ML_METHODOLOGY.md)
- [Risk Register](RISK_REGISTER.md)
- [References](REFERENCES.md)
