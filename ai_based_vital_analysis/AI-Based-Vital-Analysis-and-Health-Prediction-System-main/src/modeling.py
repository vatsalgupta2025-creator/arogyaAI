from __future__ import annotations

from dataclasses import dataclass

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

FEATURE_COLUMNS = ["heart_rate", "spo2", "ecg_index", "temperature"]


@dataclass
class ModelBundle:
    model: RandomForestClassifier
    encoder: LabelEncoder


def train_model(vitals_df: pd.DataFrame, random_state: int = 42) -> tuple[ModelBundle, dict]:
    df = vitals_df.dropna(subset=FEATURE_COLUMNS + ["label"]).copy()

    X = df[FEATURE_COLUMNS]
    y_raw = df["label"].astype(str)

    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)

    model = RandomForestClassifier(
        n_estimators=240,
        max_depth=10,
        random_state=random_state,
        class_weight="balanced_subsample",
    )

    # For tiny datasets, train on all rows and report train accuracy to avoid split failures.
    if len(df) < 2:
        model.fit(X, y)
        metrics = {
            "accuracy": 1.0,
            "train_size": int(len(X)),
            "test_size": 0,
            "split_strategy": "no_split_small_dataset",
        }
        return ModelBundle(model=model, encoder=encoder), metrics

    test_size = max(1, int(round(len(df) * 0.2)))
    if test_size >= len(df):
        test_size = 1

    class_counts = y_raw.value_counts()
    can_stratify = class_counts.min() >= 2 and test_size >= len(class_counts)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y if can_stratify else None,
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))

    metrics = {
        "accuracy": accuracy,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "split_strategy": "stratified" if can_stratify else "standard",
    }

    return ModelBundle(model=model, encoder=encoder), metrics


def predict_conditions(bundle: ModelBundle, vitals_df: pd.DataFrame) -> pd.Series:
    X = vitals_df[FEATURE_COLUMNS]
    y_pred = bundle.model.predict(X)
    labels = bundle.encoder.inverse_transform(y_pred)
    return pd.Series(labels, index=vitals_df.index, name="predicted_condition")
