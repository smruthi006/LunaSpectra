# Decision Log and Unresolved Placeholders

| Field | Value |
| --- | --- |
| **Document** | `docs/DECISION_LOG.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Living Governance Log` |
| **Owner** | `[Member 4 & All Team Members Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]` |

---

## 1. Architectural & Scope Decisions

| ID | Date | Decision | Rationale | Status |
| --- | --- | --- | --- | --- |
| **DEC-01** | `2026-11-24` | Prioritize **Approach A** (processed/derived geolocated abundance products) over raw spectral fitting for MVP | Fits a 2-credit CSE mini-project without claiming unverified X-ray response modelling. | Proposed (Confirm in Phase 2) |
| **DEC-02** | `2026-11-24` | Separate `elemental_measurements` from `cluster_results` and `anomaly_results` via `model_runs` | Preserves scientific provenance and supports reproducible ML experiments. | Proposed |
| **DEC-03** | `2026-11-24` | Standardize internal canonical longitude to **East-positive `[-180.0, 180.0]`** | Aligns directly with GeoJSON RFC 7946 and Leaflet coordinate expectations while supporting normalization from `[0, 360)`. | Proposed (Confirm in Phase 1/2) |
| **DEC-04** | `2026-11-24` | Use **SQLite + Apache Parquet** for local MVP storage instead of PostgreSQL/PostGIS | Zero-ops local workflow for 4-student academic development; PostGIS remains a Phase 8 scaling path. | Proposed |
| **DEC-05** | `2026-11-24` | Enforce mandatory `data_origin` (`mission` \| `synthetic`) across pipeline, DB, API, and UI | Prevents accidental mixing of synthetic development fixtures with Chandrayaan-2 mission observations. | Enforced Policy |
| **DEC-06** | `2026-11-24` | License student-authored code under **MIT**, keeping ISRO data and basemaps separate | Complies with open-source academic practice without relicensing third-party space-agency assets. | Active |

---

## 2. Unresolved Human & Institutional Placeholders

All placeholders below appear across repository files and **must be replaced by the project team** before academic submission or public release:

| Placeholder Token | Where Used | Owner to Fill | Current Status |
| --- | --- | --- | --- |
| `[Member 1 Name Placeholder]` & `[Student ID]` | `README.md`, `docs/TEAM_WORKFLOW.md`, `docs/PROJECT_PROPOSAL.md`, `docs/*` Owners | Member 1 | Pending team input |
| `[Member 2 Name Placeholder]` & `[Student ID]` | `README.md`, `docs/TEAM_WORKFLOW.md`, `docs/PROJECT_PROPOSAL.md`, `docs/*` Owners | Member 2 | Pending team input |
| `[Member 3 Name Placeholder]` & `[Student ID]` | `README.md`, `docs/TEAM_WORKFLOW.md`, `docs/PROJECT_PROPOSAL.md`, `docs/*` Owners | Member 3 | Pending team input |
| `[Member 4 Name Placeholder]` & `[Student ID]` | `README.md`, `docs/TEAM_WORKFLOW.md`, `docs/PROJECT_PROPOSAL.md`, `docs/*` Owners | Member 4 | Pending team input |
| `[College Name Placeholder]` | `README.md`, `CODE_OF_CONDUCT.md`, `docs/PROJECT_PROPOSAL.md` | All Members | Pending team input |
| `[Department Placeholder]` | `README.md`, `CODE_OF_CONDUCT.md`, `docs/PROJECT_PROPOSAL.md` | All Members | Pending team input |
| `[Faculty Guide Name Placeholder]` | `README.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/*` Reviewers | All Members | Pending team input |
| `[Academic Year Placeholder]` | `README.md`, `docs/PROJECT_PROPOSAL.md` | All Members | Pending team input |
| `[Contact Email Placeholder]` / `[Security Contact Email Placeholder]` | `README.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` | Member 4 | Pending team input |
| `[GitHub Organization / User Placeholder]` | `README.md`, `CODE_OF_CONDUCT.md` | Member 4 | Pending confirmation (`smruthi006` currently in remote) |
| `[LunaSpectra Project Team — Student Contributors Placeholder]` | `LICENSE` | All Members | Pending team names |
| UI Mockup / Screenshot Placeholders (`assets/images/mockup_*.png`) | `README.md`, `docs/FRONTEND_SPECIFICATION.md` | Member 3 | Reserved for Phase 5 |
| Deployment URL (if hosted later) | `README.md`, `docs/DEPLOYMENT_GUIDE.md` | Member 4 | Not applicable in Phase 0 |

---

## 3. Open Technical & Dataset Verification Items (Phase 2 Queue)

| Item | Question to Resolve in Phase 2 | Owner |
| --- | --- | --- |
| **VER-01** | Which exact Chandrayaan-2 CLASS derived/abundance products are available on PRADAN/ISSDC, and what are their file formats (`.xml` + `.fits`/`.csv`/`.tab`)? | Member 1 |
| **VER-02** | Which elements (`Mg`, `Al`, `Si`, `Ca`, `Fe`, others) and uncertainty columns are populated in the selected product? | Member 1 & Member 2 |
| **VER-03** | What exact coordinate convention (`0–360` vs `-180–180`) and footprint geometry format (center point vs. 4-corner polygon) appear in the source product? | Member 1 |
| **VER-04** | What exact quality flags and missing-value sentinels are defined in the PDS4 label? | Member 1 & Member 2 |
| **VER-05** | Which LROC/USGS lunar basemap WMTS endpoint and attribution string will be used in Leaflet? | Member 3 |
| **VER-06** | Re-check official ISRO / ISSDC / PRADAN data-use and redistribution policies prior to any public demo or publication. | All Members |
