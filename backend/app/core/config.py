"""Application settings loaded from environment variables or .env."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve repository root: backend/app/core/config.py -> parents[3]
REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    """Runtime settings for the LunaSpectra FastAPI backend and pipeline."""

    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = Field(default="development")
    app_name: str = Field(default="LunaSpectra")
    api_version: str = Field(default="v1")
    api_host: str = Field(default="127.0.0.1")
    api_port: int = Field(default=8000)
    frontend_url: str = Field(default="http://localhost:5173")
    database_url: str = Field(
        default=f"sqlite:///{(REPO_ROOT / 'backend' / 'lunaspectra.db').as_posix()}"
    )
    data_raw_dir: Path = Field(default=REPO_ROOT / "data" / "raw")
    data_interim_dir: Path = Field(default=REPO_ROOT / "data" / "interim")
    data_processed_dir: Path = Field(default=REPO_ROOT / "data" / "processed")
    log_level: str = Field(default="INFO")

    @property
    def raw_dataset_dir(self) -> Path:
        return self._resolve_path(self.data_raw_dir) / "class_mendeley_v1"

    @property
    def interim_dataset_dir(self) -> Path:
        return self._resolve_path(self.data_interim_dir) / "class_mendeley_v1"

    @property
    def processed_dataset_dir(self) -> Path:
        return self._resolve_path(self.data_processed_dir) / "class_mendeley_v1"

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip() for o in self.frontend_url.split(",") if o.strip()]
        return origins or ["http://localhost:5173"]

    @staticmethod
    def _resolve_path(path: Path) -> Path:
        if path.is_absolute():
            return path
        return (REPO_ROOT / path).resolve()


def get_settings() -> Settings:
    """Create a Settings instance."""
    return Settings()
