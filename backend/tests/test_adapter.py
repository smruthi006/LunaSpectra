"""Tests for ClassMendeleyAdapter: checksums, format detection, and file parsing."""

from __future__ import annotations

from pathlib import Path

from app.adapters.class_mendeley import ClassMendeleyAdapter, compute_sha256


def test_inventory_checksums_and_formats(schema_raw_dir: Path) -> None:
    adapter = ClassMendeleyAdapter(schema_raw_dir)
    inventory = adapter.inventory_files()
    assert len(inventory) == 13

    by_name = {item["original_filename"]: item for item in inventory}
    fits_item = by_name["ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits"]
    assert fits_item["detected_format"] == "FITS"
    assert fits_item["open_success"] is True
    assert fits_item["row_count"] == 16
    assert "SPECTRUM" in fits_item["fits_hdu_names"]
    assert fits_item["sha256"] == compute_sha256(
        schema_raw_dir
        / "data_repository"
        / "181120"
        / "ch2_cla_scd_all_time_added_20191118T125848000-20191118T130504000.fits"
    )

    pha_item = by_name["CH2_XSM_20191118_90853504_90853624.pha"]
    assert pha_item["detected_format"] == "PHA_FITS"
    assert pha_item["open_success"] is True
    assert "STAT_ERR" in pha_item["column_names"]

    flux_item = by_name["flux_29may.txt"]
    assert flux_item["detected_format"] == "TXT_LINE_FLUX_TABLE"
    assert flux_item["row_count"] == 1


def test_unsupported_file_recorded_without_crashing(schema_raw_dir: Path) -> None:
    extra = schema_raw_dir / "data_repository" / "unexpected_binary.bin"
    extra.write_bytes(b"\x00\x01\x02\x03")

    adapter = ClassMendeleyAdapter(schema_raw_dir)
    inventory = adapter.inventory_files()
    unsupported = [x for x in inventory if x["original_filename"] == "unexpected_binary.bin"]
    assert len(unsupported) == 1
    assert unsupported[0]["open_success"] is False
    assert unsupported[0]["detected_format"] == "UNSUPPORTED_.bin"
    assert unsupported[0]["error_message"] is not None

    validation = adapter.validate_source()
    assert validation["valid"] is True
    assert any("unexpected_binary.bin" in w for w in validation["warnings"])
