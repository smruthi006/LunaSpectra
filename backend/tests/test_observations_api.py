"""Tests for observation listing, details, spectra, abundances, line fluxes, and errors."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_observations_pagination_and_filtering(seeded_client: TestClient) -> None:
    resp = seeded_client.get("/api/v1/observations?page=1&page_size=1&sort=observation_date_asc")
    assert resp.status_code == 200
    body = resp.json()
    assert body["pagination"] == {
        "page": 1,
        "page_size": 1,
        "total_items": 2,
        "total_pages": 2,
    }
    assert body["items"][0]["observation_id"] == "CLASS_20191118"

    abund_filter = seeded_client.get("/api/v1/observations?has_abundance=true")
    assert abund_filter.status_code == 200
    assert abund_filter.json()["pagination"]["total_items"] == 1
    assert abund_filter.json()["items"][0]["observation_id"] == "CLASS_20200529"

    elem_filter = seeded_client.get("/api/v1/observations?element=Na")
    assert elem_filter.status_code == 200
    assert elem_filter.json()["pagination"]["total_items"] == 1
    assert elem_filter.json()["items"][0]["observation_id"] == "CLASS_20191118"


def test_observation_detail_spectra_abundances_and_fluxes(seeded_client: TestClient) -> None:
    detail = seeded_client.get("/api/v1/observations/CLASS_20200529")
    assert detail.status_code == 200
    d_body = detail.json()
    assert d_body["observation_date"] == "2020-05-29"
    assert "latitude" in d_body["missing_fields"]
    assert "acquisition_start_time" in d_body["missing_fields"]
    assert d_body["provenance"]["doi"] == "10.17632/6mmd96j5bg.1"

    spec_resp = seeded_client.get("/api/v1/observations/CLASS_20191118/spectra?max_points=5")
    assert spec_resp.status_code == 200
    s_body = spec_resp.json()
    assert s_body["spectrum_count"] == 4
    source_spec = next(s for s in s_body["spectra"] if s["spectrum_type"] == "source")
    assert source_spec["downsampled"] is True
    assert source_spec["returned_point_count"] == 5

    abund_may = seeded_client.get("/api/v1/observations/CLASS_20200529/abundances")
    assert abund_may.status_code == 200
    assert abund_may.json()["count"] == 4

    abund_nov = seeded_client.get("/api/v1/observations/CLASS_20191118/abundances")
    assert abund_nov.status_code == 200
    assert abund_nov.json()["count"] == 0
    assert len(abund_nov.json()["notes"]) == 1

    flux_may = seeded_client.get("/api/v1/observations/CLASS_20200529/line-fluxes")
    assert flux_may.status_code == 200
    assert flux_may.json()["count"] == 7


def test_structured_error_responses(seeded_client: TestClient, empty_client: TestClient) -> None:
    not_found = seeded_client.get("/api/v1/observations/UNKNOWN_OBS")
    assert not_found.status_code == 404
    assert not_found.json()["error"]["code"] == "OBSERVATION_NOT_FOUND"

    bad_page = seeded_client.get("/api/v1/observations?page=0")
    assert bad_page.status_code == 422
    assert bad_page.json()["error"]["code"] == "VALIDATION_ERROR"

    empty_list = empty_client.get("/api/v1/observations")
    assert empty_list.status_code == 200
    assert empty_list.json()["items"] == []
    assert empty_list.json()["pagination"]["total_items"] == 0
