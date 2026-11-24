# Deployment and Local Setup Guide

| Field | Value |
| --- | --- |
| **Document** | `docs/DEPLOYMENT_GUIDE.md` |
| **Version** | `0.1.0` |
| **Status** | `Preliminary — Planning Phase` |
| **Owner** | `[Member 4 Name Placeholder]` |
| **Last updated** | `2026-11-24` |
| **Reviewers** | `[All Team Members Placeholder]` |

---

> [!WARNING]
> **Preliminary Guide:** Application code (`backend/`, `frontend/`) is not yet initialized. Commands below document the **planned** local setup for a 2-credit academic mini-project and should be updated as each service is scaffolded in Phases 1–5.

---

## 1. Target Runtime Philosophy

For a 2-credit CSE mini-project, LunaSpectra intentionally avoids complex cloud infrastructure, managed clusters, or heavy multi-container orchestration in the MVP:

- **Local Development First:** Python 3.11+ (`venv`), FastAPI + Uvicorn, local SQLite (`lunaspectra.db`), local Parquet files (`data/processed/`), and Vite dev server (`localhost:5173`).
- **Docker (Optional Later):** Containerization may be added in Phase 7/8 if needed for reproducible academic demonstration.
- **PostgreSQL / PostGIS (Optional Future Scaling):** Deferred to Phase 8.

---

## 2. Prerequisites (Planned)

- **Git**
- **Python 3.11+**
- **Node.js (LTS)** and `npm` (or `pnpm`)
- Local disk space for ignored raw/processed Chandrayaan-2 files in `data/raw/` and `data/processed/`

---

## 3. Environment Configuration

1. Copy [.env.example](../.env.example) to `.env` locally (never commit `.env`):
   ```powershell
   Copy-Item .env.example .env
   ```
2. Default development values:
   - Backend API: `http://127.0.0.1:8000` (`/api/v1`)
   - Frontend Vite Server: `http://localhost:5173`
   - Database: `sqlite:///./lunaspectra.db`
   - Data Directories: `./data/raw`, `./data/interim`, `./data/processed`, `./models`

---

## 4. Planned Local Startup Sequence (Post-Scaffolding)

### 4.1 Offline Data & ML Pipeline (Phases 2 & 4)
1. Place verified Chandrayaan-2 files into `data/raw/` (or use explicit `data/sample/` synthetic fixtures for development).
2. Run planned ingestion & validation scripts from `scripts/` to populate `data/processed/` and `lunaspectra.db`.
3. Run planned ML baseline scripts to record `model_runs`, `cluster_results`, and `anomaly_results`.

### 4.2 Backend Service (Phase 3)
- Activate Python virtual environment, apply Alembic migrations, and start Uvicorn on `127.0.0.1:8000`.

### 4.3 Frontend Web App (Phase 5)
- Install packages inside `frontend/`, confirm `VITE_API_BASE_URL=http://localhost:8000/api/v1`, and start Vite on `localhost:5173`.

---

## 5. Pre-Deployment Verification Checklist

- [ ] Confirm `.env` is excluded from Git and contains no production secrets.
- [ ] Confirm `data/raw/`, `data/interim/`, `data/processed/`, and `models/` remain excluded from Git.
- [ ] Re-verify ISRO / ISSDC attribution and lunar basemap (USGS/NASA/LROC) tile usage terms before any public hosting.
- [ ] Confirm synthetic test data is either disabled or prominently bannered in non-development environments.

---

## 6. Related Documents

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Dataset Guide](DATASET_GUIDE.md)
- [Team Workflow](TEAM_WORKFLOW.md)
- [Security Policy](../SECURITY.md)
