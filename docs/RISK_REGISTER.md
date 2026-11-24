# Risk Register

| Field | Value |
| --- | --- |
| **Document** | `docs/RISK_REGISTER.md` |
| **Version** | `0.1.0` |
| **Status** | `Active — Planning Phase` |
| **Owner** | `[All 4 Team Members Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[Faculty Guide Name Placeholder]` |

---

## 1. Risk Rating Legend

- **Likelihood:** `Low`, `Medium`, `High`
- **Impact:** `Low`, `Medium`, `High`, `Critical`

---

## 2. Project Risk Matrix

| ID | Risk | Likelihood | Impact | Mitigation Strategy | Owner Placeholder |
| --- | --- | --- | --- | --- | --- |
| **R-01** | **No directly usable abundance table** (selected ISSDC products may contain spectra/counts rather than ready elemental wt% tables) | Medium | High | Conduct Phase 2 dataset audit early; verify Approach A derived products or peer-reviewed published tables; keep schema decoupled from raw spectral inversion unless explicitly rescoped. | `[Member 1 Placeholder]` |
| **R-02** | **Scientific misinterpretation** (treating X-ray peak intensities as weight %, or clusters/anomalies as mineral discoveries) | Medium | High | Enforce explicit disclaimers in UI, `README.md`, and `ETHICS_AND_LIMITATIONS.md`; preserve units and uncertainty fields in every view. | `[Member 2 Placeholder]` |
| **R-03** | **Insufficient geolocation fields** (missing polygon corners or ambiguous footprint bounds) | Medium | Medium | Support both `Polygon` footprints and `Point` center coordinates in `footprints` schema; inspect PDS4 labels in Phase 2 before locking UI geometry. | `[Member 1 Placeholder]` |
| **R-04** | **Large files** (multi-gigabyte PDS4/FITS archives overwhelming local disk or Git) | Medium | Medium | Enforce `.gitignore` rules on `data/raw/`, `data/interim/`, `data/processed/`, and `*.fits`/`*.parquet`; test ingestion on bounded spatial/temporal slices first. | `[Member 1 Placeholder]` |
| **R-05** | **Missing uncertainty** (product lacks per-element error columns or uses undocumented sentinel codes) | Medium | High | Preserve `NULL` for unmeasured uncertainties; display explicit *"Uncertainty unavailable"* warnings in UI rather than inventing error bars. | `[Member 1 & Member 2]` |
| **R-06** | **Sparse spatial coverage** (CLASS flare-dependent observations do not cover the entire lunar globe uniformly) | High | Medium | Never interpolate across unmeasured pixels; render discrete footprints/points only and state partial coverage clearly in Dashboard & Explorer. | `[Member 3 Placeholder]` |
| **R-07** | **Coordinate / projection errors** (`0–360` vs `-180–180` longitude mismatch, `[lat, lon]` vs `[lon, lat]` GeoJSON order, antimeridian wrapping) | High | High | Standardize canonical `[-180, 180]` East-positive longitude in DB/API; write dedicated unit tests for longitude normalization and GeoJSON `[lon, lat]` ordering. | `[Member 1 & Member 3]` |
| **R-08** | **Synthetic and real data being mixed** (test fixtures accidentally included in mission analytics or UI charts) | Medium | Critical | Enforce mandatory `data_origin` (`mission` \| `synthetic`) column, API filter guards, separate `data/sample/` path, and non-dismissible synthetic UI banner. | `[Member 4 Placeholder]` |
| **R-09** | **Model results being overstated** (quoting Silhouette scores or synthetic checks as real-world validation accuracy) | Medium | High | Ban unsupported terms (`validated model`, `high accuracy`, `discovered minerals`); document internal vs. external evaluation limits clearly. | `[Member 2 Placeholder]` |
| **R-10** | **Frontend / backend schema mismatch** (divergent field names, null handling, or GeoJSON property keys) | Medium | Medium | Freeze v1 API contract in Phase 1; enforce Pydantic schemas on backend and Zod runtime validation on frontend. | `[Member 3 & Member 4]` |
| **R-11** | **Merge conflicts** (parallel work across 4 team members colliding on shared files) | Medium | Medium | Use `develop` + issue-linked feature branches, small focused PRs, clear module ownership, and frequent rebasing/merging from `develop`. | `[Member 4 Placeholder]` |
| **R-12** | **Secrets or mission data committed accidentally** (`.env`, ISSDC credentials, or `data/raw/` pushed to GitHub) | Low | Critical | Configure `.gitignore` from Day 1, use `.env.example` placeholders only, require PR checklist verification, and set up pre-commit checks in Phase 1. | `[Member 4 Placeholder]` |
| **R-13** | **Basemap licensing or tile availability problems** (external WMTS endpoint rate limits, CORS issues, or unclear attribution) | Medium | Medium | Verify USGS/NASA/LROC public-domain WMTS endpoints and attribution terms in Phase 2/5; keep tile URL configurable via environment settings. | `[Member 3 Placeholder]` |
| **R-14** | **Scope expansion beyond a 2-credit project** (attempting raw spectral fitting, 3D CesiumJS, or PostGIS prematurely) | High | High | Quarantine advanced features strictly into Phase 8 Optional Extensions; require unanimous team + faculty approval to alter MVP scope. | `[All 4 Members]` |
| **R-15** | **Team integration delays** (late backend or ML delivery blocking frontend integration before submission) | Medium | High | Use Phase 1 synthetic fixtures so frontend and backend can develop against mocked/seeded contracts in parallel without waiting for full Phase 2/4 outputs. | `[Member 4 Placeholder]` |

---

## 3. Related Documents

- [Roadmap](ROADMAP.md)
- [Ethics and Limitations](ETHICS_AND_LIMITATIONS.md)
- [Team Workflow](TEAM_WORKFLOW.md)
- [Decision Log](DECISION_LOG.md)
