# LunaSpectra Backend (Phase 1)

FastAPI backend, SQLite database layer, and genuine Chandrayaan-2 CLASS data ingestion pipeline (`DOI: 10.17632/6mmd96j5bg.1`).

## Prerequisites

- **Python 3.11+** (verified on Windows with Python 3.13)
- Repository cloned at `C:\dev\LunaSpectra`

## Windows PowerShell Development Workflow

Run all commands from the repository root (`C:\dev\LunaSpectra`):

```powershell
cd C:\dev\LunaSpectra

# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Install backend and development dependencies
python -m pip install --upgrade pip
pip install -r backend\requirements-dev.txt

# 3. Acquire genuine Chandrayaan-2 CLASS data (Mendeley Data v1)
python backend\scripts\acquire_class_data.py

# 4. Inspect all raw files and generate inventory artifacts
python backend\scripts\inspect_class_data.py

# 5. Process real data into normalized Parquet tables & provenance reports
python backend\scripts\process_class_data.py

# 6. Initialize and seed SQLite database (backend/lunaspectra.db)
python backend\scripts\seed_database.py
```

### Alternative Module Invocation (from `backend/`)

```powershell
cd C:\dev\LunaSpectra\backend
python -m scripts.seed_database
```

### Start the FastAPI Server

From the repository root (`C:\dev\LunaSpectra`):

```powershell
uvicorn backend.app.main:app --reload
```

- Swagger UI: <http://127.0.0.1:8000/docs>
- Health endpoint: <http://127.0.0.1:8000/api/v1/health>

### Run Quality Gates & Tests

```powershell
cd C:\dev\LunaSpectra
ruff check backend
mypy backend\app
pytest backend\tests -v
```
