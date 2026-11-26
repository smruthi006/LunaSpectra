# LunaSpectra Frontend (Phase 2)

React + TypeScript + Vite planetary data explorer integrated with the Phase 1 Chandrayaan-2 CLASS FastAPI backend (`DOI: 10.17632/6mmd96j5bg.1`).

## Prerequisites

- **Node.js 20+ / 24+** and `npm`
- Phase 1 FastAPI backend running at `http://127.0.0.1:8000` (see [backend/README.md](../backend/README.md))

## Windows PowerShell Setup & Commands

```powershell
# From repository root
cd C:\dev\LunaSpectra\frontend

# 1. Configure environment variable (optional; defaults to http://127.0.0.1:8000/api/v1)
Copy-Item .env.example .env

# 2. Install packages
npm install

# 3. Run development server (http://localhost:5173)
npm run dev
```

## Quality Gates & Verification

```powershell
cd C:\dev\LunaSpectra\frontend
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```
