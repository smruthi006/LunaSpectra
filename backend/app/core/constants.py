"""Canonical constants for the Phase 1 Chandrayaan-2 CLASS Mendeley dataset."""

from __future__ import annotations

DATASET_ID = "class_mendeley_v1"
DATASET_NAME = "CLASS_CHANDRAYAAN2"
DATASET_DOI = "10.17632/6mmd96j5bg.1"
DATASET_VERSION = "1"
DATASET_CONTRIBUTOR = "Shyama Narendranath"
DATASET_INSTITUTION = "Indian Space Research Organisation"
DATASET_LICENSE = "CC BY 4.0"
DATASET_SOURCE_URL = "https://data.mendeley.com/datasets/6mmd96j5bg/1"
DATASET_PUBLIC_API_FILES_URL = (
    "https://data.mendeley.com/public-api/datasets/6mmd96j5bg/files?folder_id=root&version=1"
)
DATASET_PUBLIC_API_META_URL = (
    "https://data.mendeley.com/public-api/datasets/6mmd96j5bg?version=1"
)
DATA_ORIGIN_MISSION = "mission"

CLASS_CHANNEL_TO_KEV = 0.0135

ELEMENT_NAMES: dict[str, str] = {
    "O": "Oxygen",
    "Na": "Sodium",
    "Mg": "Magnesium",
    "Al": "Aluminium",
    "Si": "Silicon",
    "Ca": "Calcium",
    "Ti": "Titanium",
    "Fe": "Iron",
}
