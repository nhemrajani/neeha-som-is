"""Loading PPG-DaLiA.

The dataset ships one pickle per subject, written under Python 2, so it only
loads with ``encoding='latin1'``. Without that you get a UnicodeDecodeError
that looks like a corrupt file.

Preprocessing deliberately lives elsewhere: the protocol follows PaPaGei's
published pipeline rather than a reimplementation, so that the reproduction
result stays interpretable.
"""

from __future__ import annotations

import pickle
from pathlib import Path
from typing import Any

import numpy as np

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Sampling rates, as documented for the wrist device. Verify against the
# dataset README before relying on them for anything published.
WRIST_BVP_HZ = 64
WRIST_ACC_HZ = 32
LABEL_HZ = 0.5  # one heart-rate label per 2 seconds, over an 8-second window


def subject_path(subject: str, root: Path | None = None) -> Path:
    """Path to one subject's pickle, e.g. subject_path("S1")."""
    root = root or DATA_DIR
    return root / "PPG_FieldStudy" / subject / f"{subject}.pkl"


def load_subject(subject: str, root: Path | None = None) -> dict[str, Any]:
    """Load one subject. The latin1 encoding is required, not optional."""
    path = subject_path(subject, root)
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found. Download PPG-DaLiA from "
            "https://archive.ics.uci.edu/dataset/495/ppg+dalia and unzip it into data/."
        )
    with open(path, "rb") as handle:
        return pickle.load(handle, encoding="latin1")


def available_subjects(root: Path | None = None) -> list[str]:
    """Subject identifiers present on disk, ordered S1, S2, ... S15."""
    root = root or DATA_DIR
    field_study = root / "PPG_FieldStudy"
    if not field_study.exists():
        return []
    subjects = [p.name for p in field_study.iterdir() if p.is_dir() and p.name.startswith("S")]
    return sorted(subjects, key=lambda name: int(name[1:]))


def describe(obj: Any, name: str = "root", indent: int = 0) -> None:
    """Print the shape of a nested structure.

    Run this on a freshly loaded subject before doing anything else. Knowing
    what is actually in the file beats assuming.
    """
    pad = "  " * indent
    if isinstance(obj, dict):
        print(f"{pad}{name}: dict with {len(obj)} keys")
        for key, value in obj.items():
            describe(value, str(key), indent + 1)
    elif isinstance(obj, np.ndarray):
        print(f"{pad}{name}: array {obj.shape}, {obj.dtype}")
    elif isinstance(obj, (list, tuple)):
        print(f"{pad}{name}: {type(obj).__name__} of {len(obj)}")
    else:
        text = repr(obj)
        print(f"{pad}{name}: {type(obj).__name__} = {text[:60]}")


if __name__ == "__main__":
    found = available_subjects()
    if not found:
        print("No subjects found. Unzip PPG-DaLiA into data/ first.")
    else:
        print(f"{len(found)} subjects on disk: {', '.join(found)}\n")
        describe(load_subject(found[0]), found[0])
