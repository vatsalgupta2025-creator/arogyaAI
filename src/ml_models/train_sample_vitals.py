"""
Sample Vitals CSV Training Script
==================================
Trains a model using sample_vitals.csv with generated risk labels
based on clinical thresholds.

Usage: python train_sample_vitals.py
"""

import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix


def generate_risk_label(row):
    """
    Generate risk label based on clinical thresholds.
    Returns 'High Risk' or 'Low Risk'
    """
    # Heart Rate: Normal 50-100, High Risk if >100 or <50
    if row['heart_rate'] > 100 or row['heart_rate'] < 50:
        return 'High Risk'
    
    # SpO2: Normal >=95%, High Risk if <94%
    if row['spo2'] < 94:
        return 'High Risk'
    
    # Temperature: Normal 36-38, High Risk if >38 or <36
    if row['temperature'] > 38 or row['temperature'] < 36:
        return 'High Risk'
    
    # Systolic BP: Normal 90-140, High Risk if >140 or <90
    if row['sbp'] > 140 or row['sbp'] < 90:
        return 'High Risk'
    
    # Diastolic BP: Normal 60-90, High Risk if >90 or <60
    if row['dbp'] > 90 or row['dbp'] < 60:
        return 'High Risk'
    
    # Respiratory Rate: Normal 12-20, High Risk if >20 or <12
    if row['respiratory_rate'] > 20 or row['respiratory_rate'] < 12:
        return 'High Risk'
    
    return 'Low Risk'


def train_sample_vitals_model():
    print("=" * 60)
    print("  Sample Vitals CSV Training")
    print("=" * 60)

    # 1. Load sample data
    csv_path = os.path.join(os.path.dirname(__file__), 'sample_vitals.csv')
    csv_path = os.path.normpath(csv_path)

    if not os.path.exists(csv_path):
        print(f"Error: Sample data not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    print(f"\nSample data loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")
    print(f"\nData preview:")
    print(df.head())

    # 2. Generate risk labels
    df['Risk Category'] = df.apply(generate_risk_label, axis=1)
    print(f"\nGenerated Risk Labels:")
    print(df[['heart_rate', 'spo2', 'temperature', 'Risk Category']].to_string())

    # 3. Define features
    feature_cols = ['heart_rate', 'spo2', 'temperature', 'sbp', 'dbp', 'respiratory_rate']
    target_col = 'Risk Category'

    print(f"\nFeatures: {feature_cols}")
    print(f"Target distribution:\n{df[target_col].value_counts()}")

    # 4. Prepare X, y
    X = df[feature_cols].copy()
    X = X.apply(pd.to_numeric, errors='coerce')
    X = X.fillna(X.median())

    le_target = LabelEncoder()
    y = le_target.fit_transform(df[target_col])
    print(f"\nTarget classes: {list(le_target.classes_)} -> {list(range(len(le_target.classes_)))}")

    # 5. Train/test split (use all data since small dataset)
    # For small datasets, we can use leave-one-out or small test size
    if len(df) >= 4:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )
    else:
        # Use all data for training if too few samples
        X_train, X_test, y_train, y_test = X, X, y, y

    print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")

    # 6. Train model
    print("\nTraining RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train, y_train)

    # 7. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n{'='*40}")
    print(f"  RESULTS")
    print(f"{'='*40}")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # 8. Cross-validation (for small datasets, use small cv)
    if len(df) >= 6:
        cv = min(3, len(df) // 2)  # Use 3-fold or less
        cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
        print(f"\n{cv}-Fold Cross-Validation...")
        print(f"  CV Accuracy: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")
    else:
        print("\nDataset too small for cross-validation")

    # 9. Save model
    output_dir = os.path.dirname(__file__)
    model_path = os.path.join(output_dir, 'sample_vitals_model.pkl')

    model_bundle = {
        'model': model,
        'feature_cols': feature_cols,
        'target_encoder': le_target,
        'accuracy': accuracy,
    }

    with open(model_path, 'wb') as f:
        pickle.dump(model_bundle, f)

    print(f"\nModel saved to: {model_path}")
    print(f"File size: {os.path.getsize(model_path) / 1024:.1f} KB")
    print("\nTraining complete!")


if __name__ == "__main__":
    train_sample_vitals_model()