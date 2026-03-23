import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, average_precision_score

def train_sepsis_model():
    print("Loading synthetic EHR dataset...")
    data_path = 'data/synthetic_vitals_sepsis.csv'
    
    if not os.path.exists(data_path):
        print(f"Error: Dataset {data_path} not found. Run data_generator.py first.")
        return
        
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")
    
    # Define features and target
    features = [
        'hr', 'spo2', 'temp', 'rr', 'sbp', 'dbp',
        'lactate', 'wbc', 'crp', 'procalcitonin',
        'hr_slope_3h', 'temp_slope_3h', 'spo2_slope_3h',
        'qsofa_score', 'sepsis_history', 'diabetes_flag',
        'age', 'sex', 'bmi', 'hrv_dfa'
    ]
    target = 'sepsis_target'
    
    print("Preparing train/test split...")
    # Group by patient_id to prevent data leakage (a patient is strictly in train OR test)
    patient_ids = df['patient_id'].unique()
    train_patients, test_patients = train_test_split(patient_ids, test_size=0.2, random_state=42)
    
    train_df = df[df['patient_id'].isin(train_patients)]
    test_df = df[df['patient_id'].isin(test_patients)]
    
    X_train = train_df[features]
    y_train = train_df[target]
    
    X_test = test_df[features]
    y_test = test_df[target]
    
    print(f"Train size: {X_train.shape[0]} samples. Test size: {X_test.shape[0]} samples.")
    print("Training HistGradientBoostingClassifier (LightGBM equivalent)...")
    
    # HistGradientBoosting natively handles missing values and is very fast
    model = HistGradientBoostingClassifier(
        max_iter=200,
        learning_rate=0.05,
        max_depth=6,
        random_state=42,
        class_weight='balanced'
    )
    
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    roc_auc = roc_auc_score(y_test, y_proba)
    pr_auc = average_precision_score(y_test, y_proba)
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"PR-AUC:  {pr_auc:.4f}")
    
    # Save the model
    model_filename = 'sepsis_hgbc_model.pkl'
    print(f"Saving model to {model_filename}...")
    with open(model_filename, 'wb') as f:
        pickle.dump(model, f)
        
    print("Training complete! Model is ready for serving in medflow_ml.py.")

if __name__ == "__main__":
    train_sepsis_model()
