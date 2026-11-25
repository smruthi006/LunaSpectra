"""Top-level /api/v1 router registration."""

from __future__ import annotations

from app.api.routes import datasets, elements, health, observations, spectra
from fastapi import APIRouter

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(datasets.router)
api_router.include_router(elements.router)
api_router.include_router(observations.router)
api_router.include_router(spectra.router)
