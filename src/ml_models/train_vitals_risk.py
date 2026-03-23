"""
Human Vital Sign Risk Classifier - Training Script
=====================================================
Trains a Gradient Boosting model on humanvitalsigndata.csv to predict
patient risk category (High Risk / Low Risk) from vital signs.

Usage: python train_vitals_risk.py
"""

import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score, confusion_matrix


def train_vitals_risk_model():
    print("=" * 60)
    print("  Human Vital Sign Risk Classifier - Training")
    print("=" * 60)

    # 1. Load data
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'pages', 'humanvitalsigndata.csv')
    csv_path = os.path.normpath(csv_path)

    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    print(f"\nDataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")

    # 2. Define features and target
    feature_cols = [
        'Heart Rate',
        'Respiratory Rate',
        'Body Temperature',
        'Oxygen Saturation',
        'Systolic Blood Pressure',
        'Diastolic Blood Pressure',
        'Age',
        'Weight (kg)',
        'Height (m)',
        'Derived_HRV',
        'Derived_Pulse_Pressure',
        'Derived_BMI',
        'Derived_MAP',
    ]
    target_col = 'Risk Category'

    # Encode Gender as numeric
    le_gender = LabelEncoder()
    df['Gender_Encoded'] = le_gender.fit_transform(df['Gender'])
    feature_cols.append('Gender_Encoded')

    print(f"\nFeatures ({len(feature_cols)}): {feature_cols}")
    print(f"Target: {target_col}")
    print(f"Target distribution:\n{df[target_col].value_counts()}")

    # 3. Prepare X, y
    X = df[feature_cols].copy()
    X = X.apply(pd.to_numeric, errors='coerce')
    X = X.fillna(X.median())

    le_target = LabelEncoder()
    y = le_target.fit_transform(df[target_col])
    print(f"\nTarget classes: {list(le_target.classes_)} -> {list(range(len(le_target.classes_)))}")

    # 4. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")

    # 5. Train model
    print("\nTraining HistGradientBoostingClassifier...")
    model = HistGradientBoostingClassifier(
        max_iter=300,
        learning_rate=0.05,
        max_depth=6,
        min_samples_leaf=10,
        random_state=42,
        class_weight='balanced',
    )
    model.fit(X_train, y_train)

    # 6. Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)

    print(f"\n{'='*40}")
    print(f"  RESULTS")
    print(f"{'='*40}")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)

    # 7. Cross-validation
    print("\n5-Fold Cross-Validation...")
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"  CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    cv_auc = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
    print(f"  CV ROC-AUC:  {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")

    # 8. Save model + metadata
    output_dir = os.path.dirname(__file__)
    model_path = os.path.join(output_dir, 'vitals_risk_model.pkl')

    model_bundle = {
        'model': model,
        'feature_cols': feature_cols,
        'target_encoder': le_target,
        'gender_encoder': le_gender,
        'accuracy': accuracy,
        'roc_auc': roc_auc,
        'cv_accuracy': float(cv_scores.mean()),
    }

    with open(model_path, 'wb') as f:
        pickle.dump(model_bundle, f)

    print(f"\nModel saved to: {model_path}")
    print(f"File size: {os.path.getsize(model_path) / 1024:.1f} KB")
    print("\nTraining complete! Model ready for serving via /api/vitals-risk endpoint.")


if __name__ == "__main__":
    train_vitals_risk_model()
