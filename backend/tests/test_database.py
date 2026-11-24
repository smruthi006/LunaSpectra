"""Tests for SQLite initialization and idempotent seeding."""

from __future__ import annotations

from pathlib import Path

from app.db.models import (
    DatasetModel,
    ElementalAbundanceModel,
    ElementalLineFluxModel,
    ObservationModel,
    SourceProductModel,
    SpectrumModel,
)
from app.db.session import create_app_engine, create_session_factory
from scripts.process_class_data import process_dataset
from scripts.seed_database import seed_from_processed
from sqlalchemy import func, select, text


def test_database_seeding_is_idempotent_and_enforces_fk(
    schema_raw_dir: Path, tmp_path: Path
) -> None:
    processed_dir = tmp_path / "processed"
    process_dataset(schema_raw_dir, processed_dir)

    db_path = tmp_path / "idempotent.db"
    engine = create_app_engine(f"sqlite:///{db_path.as_posix()}")

    first_counts = seed_from_processed(processed_dir, engine=engine)
    second_counts = seed_from_processed(processed_dir, engine=engine)
    assert first_counts == second_counts

    session_factory = create_session_factory(engine)
    with session_factory() as db:
        fk_status = db.execute(text("PRAGMA foreign_keys")).scalar()
        assert fk_status == 1
        assert db.scalar(select(func.count(DatasetModel.id))) == 1
        assert db.scalar(select(func.count(SourceProductModel.id))) == 13
        assert db.scalar(select(func.count(ObservationModel.id))) == 2
        assert db.scalar(select(func.count(SpectrumModel.id))) == 8
        assert db.scalar(select(func.count(ElementalLineFluxModel.id))) == 12
        assert db.scalar(select(func.count(ElementalAbundanceModel.id))) == 4

    engine.dispose()
