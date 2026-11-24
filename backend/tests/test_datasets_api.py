"""Tests for datasets, dataset summary, elements, and map availability endpoints."""

from __future__ import annotations

from app.core.constants import DATASET_DOI, DATASET_ID
from fastapi.testclient import TestClient


def test_datasets_endpoints(seeded_client: TestClient) -> None:
    list_resp = seeded_client.get("/api/v1/datasets")
    assert list_resp.status_code == 200
    list_body = list_resp.json()
    assert list_body["total_items"] == 1
    assert list_body["items"][0]["id"] == DATASET_ID
    assert list_body["items"][0]["doi"] == DATASET_DOI

    detail_resp = seeded_client.get(f"/api/v1/datasets/{DATASET_ID}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["license"] == "CC BY 4.0"

    missing_resp = seeded_client.get("/api/v1/datasets/does_not_exist")
    assert missing_resp.status_code == 404
    assert missing_resp.json()["error"]["code"] == "DATASET_NOT_FOUND"


def test_dataset_summary_and_elements(seeded_client: TestClient) -> None:
    summary_resp = seeded_client.get("/api/v1/dataset/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["observation_count"] == 2
    assert summary["spectrum_count"] == 8
    assert summary["background_spectrum_count"] == 2
    assert summary["abundance_record_count"] == 4
    assert summary["line_flux_record_count"] == 12
    assert summary["date_range"]["distinct_dates"] == ["2019-11-18", "2020-05-29"]
    assert summary["coordinate_availability"]["available"] is False
    assert summary["coordinate_availability"]["coordinate_record_count"] == 0

    elems_resp = seeded_client.get("/api/v1/elements")
    assert elems_resp.status_code == 200
    elems = elems_resp.json()
    assert elems["total_items"] >= 5
    ca_item = next(e for e in elems["items"] if e["element"] == "Ca")
    assert ca_item["uncertainty_available"] is True
    assert "abundance" in ca_item["measurement_types"]
    assert "line_flux" in ca_item["measurement_types"]


def test_map_availability_no_fake_geojson(seeded_client: TestClient) -> None:
    resp = seeded_client.get("/api/v1/map/availability")
    assert resp.status_code == 200
    assert resp.json() == {
        "available": False,
        "reason": "The active real dataset does not provide verified geospatial coordinates.",
        "coordinate_record_count": 0,
        "footprint_record_count": 0,
    }


def test_empty_database_dataset_responses(empty_client: TestClient) -> None:
    assert empty_client.get("/api/v1/datasets").json() == {"items": [], "total_items": 0}
    assert empty_client.get("/api/v1/elements").json() == {"items": [], "total_items": 0}
    assert empty_client.get("/api/v1/dataset/summary").status_code == 404
    assert empty_client.get("/api/v1/map/availability").json()["available"] is False
