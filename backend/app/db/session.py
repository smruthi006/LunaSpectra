"""Database engine and session management with SQLite foreign-key enforcement."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

from app.core.config import get_settings
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


def _configure_sqlite_foreign_keys(dbapi_connection: Any, _connection_record: Any) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()


def create_app_engine(database_url: str | None = None) -> Engine:
    """Create a SQLAlchemy engine for the configured database URL."""
    url = database_url or get_settings().database_url
    connect_args: dict[str, Any] = {}
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    engine = create_engine(url, connect_args=connect_args, future=True)
    if url.startswith("sqlite"):
        event.listen(engine, "connect", _configure_sqlite_foreign_keys)
    return engine


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    """Create a sessionmaker bound to the provided SQLAlchemy engine."""
    return sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


_default_engine: Engine | None = None
_default_session_factory: sessionmaker[Session] | None = None


def get_session_factory() -> sessionmaker[Session]:
    """Return the cached default session factory."""
    global _default_engine, _default_session_factory
    if _default_session_factory is None:
        _default_engine = create_app_engine()
        _default_session_factory = create_session_factory(_default_engine)
    return _default_session_factory


def reset_engine_cache() -> None:
    """Dispose cached engine (primarily for test isolation)."""
    global _default_engine, _default_session_factory
    if _default_engine is not None:
        _default_engine.dispose()
    _default_engine = None
    _default_session_factory = None


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped SQLAlchemy Session."""
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
