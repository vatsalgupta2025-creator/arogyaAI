from __future__ import annotations

from io import StringIO
from typing import BinaryIO

import numpy as np
import pandas as pd

from src.health_rules import heuristic_condition

REQUIRED_VITAL_COLUMNS = [
    "patient_id",
    "timestamp",
    "heart_rate",
    "spo2",
    "ecg_index",
    "temperature",
]


def _read_csv_any(input_file: str | BinaryIO) -> pd.DataFrame:
    if isinstance(input_file, str):
        return pd.read_csv(input_file)

    raw = input_file.read()
    if isinstance(raw, bytes):
        text = raw.decode("utf-8")
    else:
        text = str(raw)
    return pd.read_csv(StringIO(text))


def load_vitals(input_file: str | BinaryIO) -> pd.DataFrame:
    df = _read_csv_any(input_file)
    df.columns = [c.strip().lower() for c in df.columns]

    missing = [c for c in REQUIRED_VITAL_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in vitals data: {missing}")

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    if df["timestamp"].isna().all():
        df["timestamp"] = pd.date_range("2026-01-01", periods=len(df), freq="min")

    for col in ["heart_rate", "spo2", "ecg_index", "temperature"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["heart_rate", "spo2", "ecg_index", "temperature"])
    df = df.sort_values("timestamp").reset_index(drop=True)

    if "label" not in df.columns:
        df["label"] = df.apply(heuristic_condition, axis=1)

    return df


def load_reports(input_file: str | BinaryIO) -> pd.DataFrame:
    report_df = _read_csv_any(input_file)
    report_df.columns = [c.strip().lower() for c in report_df.columns]

    required = ["patient_id", "timestamp", "reported_condition"]
    missing = [c for c in required if c not in report_df.columns]
    if missing:
        raise ValueError(f"Missing required columns in report data: {missing}")

    report_df["timestamp"] = pd.to_datetime(report_df["timestamp"], errors="coerce")
    report_df = report_df.dropna(subset=["timestamp"]).sort_values("timestamp")
    return report_df


def generate_sample_vitals(n: int = 500, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    base_time = pd.Timestamp("2026-01-01 08:00:00")
    df = pd.DataFrame(
        {
            "patient_id": ["P-001"] * n,
            "timestamp": [base_time + pd.Timedelta(minutes=i) for i in range(n)],
            "heart_rate": rng.normal(loc=84, scale=16, size=n).clip(45, 160),
            "spo2": rng.normal(loc=96.5, scale=2.5, size=n).clip(82, 100),
            "ecg_index": rng.normal(loc=0.5, scale=0.25, size=n).clip(0, 1.2),
            "temperature": rng.normal(loc=36.9, scale=0.7, size=n).clip(35.4, 40.5),
        }
    )

    df["label"] = df.apply(heuristic_condition, axis=1)
    return df


def generate_sample_reports(vitals_df: pd.DataFrame, agreement: float = 0.86, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    reports = vitals_df[["patient_id", "timestamp", "label"]].copy()
    reports.rename(columns={"label": "reported_condition"}, inplace=True)

    classes = ["Normal", "Tachycardia Risk", "Fever Risk", "Hypoxemia Risk"]
    mask = rng.random(len(reports)) > agreement
    for idx in reports[mask].index:
        current = reports.at[idx, "reported_condition"]
        alternatives = [c for c in classes if c != current]
        reports.at[idx, "reported_condition"] = rng.choice(alternatives)

    return reports
