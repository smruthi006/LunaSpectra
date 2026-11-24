"""Idempotent SQLite database initialization."""

from __future__ import annotations

from app.db import models  # noqa: F401
from app.db.base import Base
from app.db.session import create_app_engine
from sqlalchemy.engine import Engine


def initialize_database(engine: Engine | None = None) -> Engine:
    """Create all SQLAlchemy tables idempotently and return the engine."""
    target_engine = engine or create_app_engine()
    Base.metadata.create_all(bind=target_engine)
    return target_engine
