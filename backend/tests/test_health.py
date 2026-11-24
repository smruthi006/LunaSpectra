"""Tests for /api/v1/health endpoint in both seeded and empty database states."""

from __future__ import annotations

from app.core.constants import DATA_ORIGIN_MISSION, DATASET_DOI, DATASET_ID
from fastapi.testclient import TestClient


def test_health_seeded(seeded_client: TestClient) -> None:
    resp = seeded_client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["application"] == "LunaSpectra"
    assert body["api_version"] == "v1"
    assert body["database_status"] == "connected"
    assert body["active_dataset"] == DATASET_ID
    assert body["dataset_doi"] == DATASET_DOI
    assert body["data_origin"] == DATA_ORIGIN_MISSION
    assert body["observation_count"] == 2
    assert body["spectrum_count"] == 8
    assert body["abundance_count"] == 4


def test_health_empty_database(empty_client: TestClient) -> None:
    resp = empty_client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["database_status"] == "connected"
    assert body["active_dataset"] is None
    assert body["observation_count"] == 0
    assert body["spectrum_count"] == 0
    assert body["abundance_count"] == 0
