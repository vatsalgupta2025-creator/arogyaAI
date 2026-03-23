"""
Comprehensive Sepsis Prediction Model Training
=================================================
Trains a model using synthetic_vitals_sepsis.csv (120,000 rows, 23 features)
to predict sepsis risk from vital signs and medical indicators.

Usage: python train_sepsis_comprehensive.py
"""

import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, roc_auc_score, accuracy_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

def train_sepsis_model():
    print("=" * 70)
    print("  COMPREHENSIVE SEPSIS PREDICTION MODEL TRAINING")
    print("=" * 70)
    
    # 1. Load data
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'synthetic_vitals_sepsis.csv')
    csv_path = os.path.normpath(csv_path)
    
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return
    
    df = pd.read_csv(csv_path)
    print(f"\nDataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")
    
    # 2. Define features and target
    feature_cols = [
        'age', 'bmi', 'hr', 'spo2', 'temp', 'rr', 'sbp', 'dbp',
        'lactate', 'wbc', 'crp', 'procalcitonin',
        'hr_slope_3h', 'temp_slope_3h', 'spo2_slope_3h',
        'qsofa_score', 'sepsis_history', 'diabetes_flag', 'hrv_dfa'
    ]
    target_col = 'sepsis_target'
    
    print(f"\nFeatures ({len(feature_cols)}): {feature_cols}")
    print(f"Target: {target_col}")
    print(f"Target distribution:\n{df[target_col].value_counts()}")
    print(f"Sepsis rate: {df[target_col].mean()*100:.2f}%")
    
    # 3. Prepare X, y
    X = df[feature_cols].copy()
    X = X.apply(pd.to_numeric, errors='coerce')
    X = X.fillna(X.median())
    
    y = df[target_col].values
    
    # 4. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")
    
    # 5. Train model - HistGradientBoostingClassifier (handles imbalance well)
    print("\nTraining HistGradientBoostingClassifier...")
    model = HistGradientBoostingClassifier(
        max_iter=300,
        learning_rate=0.05,
        max_depth=8,
        min_samples_leaf=20,
        random_state=42,
        class_weight='balanced',  # Handle class imbalance
    )
    model.fit(X_train, y_train)
    
    # 6. Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_proba)
    
    print(f"\n{'='*50}")
    print(f"  RESULTS")
    print(f"{'='*50}")
    print(f"  Accuracy:  {accuracy:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Sepsis', 'Sepsis']))
    
    print("Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    print(f"  TN: {cm[0,0]}, FP: {cm[0,1]}, FN: {cm[1,0]}, TP: {cm[1,1]}")
    
    # 7. Cross-validation
    print("\n5-Fold Cross-Validation...")
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"  CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    cv_auc = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
    print(f"  CV ROC-AUC:  {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")
    
    # 8. Save model + metadata
    output_dir = os.path.dirname(__file__)
    model_path = os.path.join(output_dir, 'sepsis_comprehensive_model.pkl')
    
    model_bundle = {
        'model': model,
        'feature_cols': feature_cols,
        'accuracy': accuracy,
        'roc_auc': roc_auc,
        'cv_accuracy': float(cv_scores.mean()),
        'cv_auc': float(cv_auc.mean()),
        'threshold': 0.5,  # Default threshold
    }
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_bundle, f)
    
    print(f"\nModel saved to: {model_path}")
    print(f"File size: {os.path.getsize(model_path) / 1024:.1f} KB")
    print("\nTraining complete! Sepsis model ready for use.")


if __name__ == "__main__":
    train_sepsis_model()