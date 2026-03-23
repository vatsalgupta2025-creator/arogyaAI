import pandas as pd
import numpy as np
import os

def generate_synthetic_patient_data(n_patients=2000, seq_len=30):
    """
    Generate synthetic longitudinal EHR data mimicking MIMIC-IV vitals.
    n_patients: Total distinct patients
    seq_len: Number of timestamps (e.g., hours) per patient
    """
    np.random.seed(42)
    print(f"Generating synthetic data for {n_patients} patients...")
    
    data = []
    
    for pid in range(n_patients):
        # 25% prevalence of sepsis in the dataset for balanced training
        is_sepsis = np.random.rand() < 0.25
        
        # Base demographics
        age = np.random.normal(65, 15)
        age = np.clip(age, 18, 95)
        sex = np.random.choice([0, 1])
        bmi = np.random.normal(28, 5)
        
        # Baseline vitals
        base_hr = np.random.normal(75, 10)
        base_spo2 = np.random.normal(97, 2)
        base_temp = np.random.normal(36.8, 0.4)
        base_rr = np.random.normal(14, 2)
        base_sbp = np.random.normal(120, 15)
        base_dbp = np.random.normal(80, 10)
        
        # Sepsis patients have deteriorating trends
        hr_trend = np.random.normal(0.5, 0.2) if is_sepsis else np.random.normal(0, 0.1)
        temp_trend = np.random.normal(0.05, 0.02) if is_sepsis else np.random.normal(0, 0.01)
        bp_trend = np.random.normal(-0.8, 0.3) if is_sepsis else np.random.normal(0, 0.2)
        rr_trend = np.random.normal(0.3, 0.1) if is_sepsis else np.random.normal(0, 0.05)
        lactate_trend = np.random.normal(0.1, 0.05) if is_sepsis else 0.0
        
        # Random walks for each hour
        hr = base_hr
        spo2 = base_spo2
        temp = base_temp
        rr = base_rr
        sbp = base_sbp
        dbp = base_dbp
        lactate = np.random.normal(1.0, 0.2)
        crp = np.random.normal(5.0, 2.0)
        procal = np.random.normal(0.1, 0.05)
        
        for hour in range(seq_len):
            # Update vitals
            hr += hr_trend + np.random.normal(0, 2)
            temp += temp_trend + np.random.normal(0, 0.1)
            sbp += bp_trend + np.random.normal(0, 5)
            dbp += (bp_trend * 0.6) + np.random.normal(0, 3)
            rr += rr_trend + np.random.normal(0, 1)
            spo2 -= (rr_trend * 0.5) + np.random.normal(0, 0.5)
            lactate += lactate_trend + np.random.normal(0, 0.1)
            
            # Sepsis onset usually happens near the end of the sequence
            if is_sepsis and hour > (seq_len * 0.6):
                crp += np.random.normal(2.0, 1.0)
                procal += np.random.normal(0.2, 0.1)
                
            # Cap physiological limits
            hr = np.clip(hr, 40, 200)
            temp = np.clip(temp, 35.0, 41.0)
            sbp = np.clip(sbp, 60, 220)
            dbp = np.clip(dbp, 30, 130)
            rr = np.clip(rr, 8, 45)
            spo2 = np.clip(spo2, 70, 100)
            lactate = max(0.5, lactate)
            crp = max(0.0, crp)
            procal = max(0.0, procal)
            
            # Feature calculation (similar to what server.py will do)
            # Slope over last 3 hours (simplified as difference here, model will learn logic)
            hr_slope_3h = hr_trend * 3 # Approximation for training
            temp_slope_3h = temp_trend * 3
            spo2_slope_3h = -(rr_trend * 0.5) * 3
            
            qsofa_score = int(rr >= 22) + int(sbp <= 100) + int(is_sepsis and hour > seq_len*0.8) # Mock altered mental status for sepsis
            
            # Sepsis target variable (1 if sepsis patient and close to shock)
            sepsis_target = 1 if (is_sepsis and hour >= seq_len - 6) else 0
            
            row = {
                'patient_id': pid,
                'hour': hour,
                'age': age,
                'sex': sex,
                'bmi': bmi,
                'hr': hr,
                'spo2': spo2,
                'temp': temp,
                'rr': rr,
                'sbp': sbp,
                'dbp': dbp,
                'lactate': lactate,
                'wbc': np.random.normal(8 + (5 if is_sepsis else 0), 2),
                'crp': crp,
                'procalcitonin': procal,
                'hr_slope_3h': hr_slope_3h,
                'temp_slope_3h': temp_slope_3h,
                'spo2_slope_3h': spo2_slope_3h,
                'qsofa_score': qsofa_score,
                'sepsis_history': int(np.random.rand() < 0.1),
                'diabetes_flag': int(np.random.rand() < 0.15),
                'hrv_dfa': np.random.normal(0.6 if is_sepsis else 0.9, 0.1),
                'sepsis_target': sepsis_target
            }
            data.append(row)
            
    df = pd.DataFrame(data)
    
    # Save the dataset
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/synthetic_vitals_sepsis.csv', index=False)
    print(f"Dataset generated! Shape: {df.shape}")
    print(f"Total Sepsis Positive Windows: {df['sepsis_target'].sum()}")
    return df

if __name__ == "__main__":
    generate_synthetic_patient_data(n_patients=5000, seq_len=24)
