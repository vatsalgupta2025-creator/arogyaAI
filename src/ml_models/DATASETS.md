# MedFlow ML Models - Dataset Recommendations

This document recommends datasets for training each ML model in the MedFlow healthcare monitoring platform.

---

## Dataset Overview Table

| Model | Recommended Dataset | Access | Size | Relevance |
|-------|-------------------|--------|------|-----------|
| **Trajectory Forecasting** | MIMIC-IV | PhysioNet | 40K patients | ⭐⭐⭐⭐⭐ |
| **Sepsis Early Warning** |PhysioNet Challenge 2019 | Public | 36K admissions | ⭐⭐⭐⭐⭐ |
| **Anomaly Detection** | MIMIC-III | PhysioNet | 38K patients | ⭐⭐⭐⭐⭐ |
| **Equity & Bias** | Diversity SpO2 Study | Research | 2K patients | ⭐⭐⭐⭐ |
| **Differential Diagnosis** | PubMed Clinical | NCBI | 500K+ cases | ⭐⭐⭐ |
| **HRV Analysis** | PTB-XL | PhysioNet | 21K ECGs | ⭐⭐⭐⭐ |

---

## Detailed Dataset Recommendations

### 1. Trajectory Forecasting (LSTM Model)

**Purpose**: Predict vital sign trajectories 6 hours ahead

#### Primary Dataset: MIMIC-IV (Medical Information Mart for Intensive Care IV)
- **URL**: https://physionet.org/content/mimiciv/2.2/
- **Size**: ~40,000 patients, 50,000+ admissions
- **Data Type**: Hourly vital signs, labs, medications
- **Time Range**: 2008-2019

**Why MIMIC-IV?**
- Contains continuous vital sign waveforms (high-resolution)
- Includes ICU stay with detailed temporal data
- Ground truth labels for outcomes (death, discharge)

**Alternative**: MIMIC-III v1.4
- Older but more extensively validated
- URL: https://physionet.org/content/mimic3/1.4/

#### Key Features to Extract:
```
- heart_rate, systolic_bp, diastolic_bp
- respiratory_rate, spO2, temperature
- gcs (for mental status)
- timestamps with minute-level granularity
```

---

### 2. Sepsis Early Warning (XGBoost Model)

**Purpose**: Early detection of sepsis onset

#### Primary Dataset: PhysioNet Challenge 2019
- **URL**: https://physio.net/content/physionet-challenge-2019/1.0.0/
- **Size**: 36,000+ admissions from 3 hospitals
- **Data Type**: Hourly vital signs + 26 lab values + demographics
- **Labels**: Sepsis onset time (by Sepsis-3 criteria)

**Why This Dataset?**
- Specifically designed for sepsis prediction
- Multi-center data (improves generalization)
- Gold-standard Sepsis-3 labels

**Alternative**:PhysioNet Challenge 2023 (Early Prediction of Sepsis)
- URL: https://physio.net/content/physionet-challenge-2023/1.0.0/
- More recent, includes ICU and ED data

#### Feature Engineering Guidelines:
```
# Baseline features (from dataset)
- hr, temp, resp_rate, map, spo2
- wbc, lactate, bilirubin, creatinine
- urine_output, gcs

# Derived features
- qsofa_score (respiratory rate ≥22, sbp ≤100, gcs <15)
- sofa_score components
- vital sign slopes (change over last 3-6 hours)
- hrv metrics (if available in waveform)
- shock_index = hr / sbp
```

---

### 3. Anomaly Detection (Autoencoder/VAE)

**Purpose**: Learn individual patient baselines, detect deviations

#### Primary Dataset: MIMIC-IV + Personal Baseline Extension
- Use MIMIC-IV with additional cohort of 500+ patients with
  30+ days continuous monitoring each

**Why Extended Monitoring?**
- Need long-term data to establish personal baselines
- Minimum 14 days recommended per patient

#### Alternative: eICU Collaborative Research Database
- **URL**: https://physionet.org/content/eicu-crd/2.0/
- **Size**: 200K+ ICU admissions
- **Advantage**: Multi-center, diverse patient population

#### Preprocessing for Personal Baseline:
```python
# For each patient:
1. Filter to first 14 days of data
2. Remove outlier readings (beyond 3 IQR)
3. Calculate per-patient statistics:
   - median, Q1, Q3 for each vital
   - circadian patterns (hour-of-day effects)
   - context-specific ranges (resting vs active)
4. Store as patient baseline profile
```

---

### 4. Equity & Bias Detection (SpO2 Correction)

**Purpose**: Correct algorithmic bias in pulse oximetry

#### Primary Dataset: Diverse SpO2 Measurement Study

**Recommended Studies**:
1. **Fitzpatrick Skin Tone Study** (Multiple studies)
   - Reference: https://pubmed.ncbi.nlm.nih.gov/32315945/
   - Measures SpO2 accuracy across Fitzpatrick I-VI scale
   - Key finding: SpO2 overestimates by 2-4% in darker skin

2. **Masimo SpO2 Diversity Study**
   - Commercial dataset, may require partnership
   - Contains large diverse cohort measurements

3. **OEM Pulse Oximetry Bias Study**
   - URL: https://clinicaltrials.gov/ct2/show/NCT05291914
   - Ongoing study on SpO2 accuracy by race/ethnicity

#### Data Collection Guidelines:
```
Required Data Points:
- Measured SpO2 (from device under test)
- True SpO2 (from arterial blood gas - gold standard)
- Skin tone (Fitzpatrick scale I-VI)
- Hemoglobin level
- Perfusion index

Target Sample Size:
- Minimum 500 patients across all skin tones
- At least 100 per Fitzpatrick category (I, II, III, IV, V, VI)
```

#### Correction Formula (From Literature):
```
Corrected_SpO2 = Measured_SpO2 - Correction_Factor

Where Correction_Factor:
- Fitzpatrick I-II: 0%
- Fitzpatrick III: -0.3%
- Fitzpatrick IV: -1.5%
- Fitzpatrick V: -2.5%
- Fitzpatrick VI: -3.5%
```

---

### 5. Differential Diagnosis Assistant

**Purpose**: Generate differential diagnoses from vital patterns

#### Primary Dataset: PubMed Clinical Cases + MIMIC-IV

1. **MIMIC-IV Clinical Notes**
   - Contains discharge summaries with diagnoses
   - Map diagnoses to vital sign patterns

2. **PubMed Medical Case Reports**
   - URL: https://pubmed.ncbi.nlm.nih.gov/
   - Search: "case report [pt] AND vital signs"
   - Extract: Condition + presenting vitals

3. **SNOMED-CT Hierarchical Codes**
   - Map vital patterns to SNOMED condition codes
   - URL: https://uts.nlm.nih.gov/uts/

#### Knowledge Base Construction:
```python
# Example structure
CONDITIONS = {
    'sepsis': {
        'prior_probability': 0.05,  # ICU sepsis incidence
        'vital_signature': {
            'temp': (37.5, 40.0),  # Celsius
            'hr': (90, 130),       # bpm
            'rr': (22, 30),        # breaths/min
            'sbp': (90, 110)       # mmHg (often low)
        },
        'lab_signatures': {
            'lactate': (>2.0, 'mmol/L'),
            'wbc': (>12 or <4, 'x10^3/uL'),
            'procalcitonin': (>0.5, 'ng/mL')
        }
    },
    # ... additional conditions
}
```

---

### 6. HRV Complexity Analysis

**Purpose**: DFA alpha-1 for early sepsis detection

#### Primary Dataset: PTB-XL ECG Database
- **URL**: https://physionet.org/content/ptb-xl/1.0.1/
- **Size**: 21,837 ECG recordings from 10,344 patients
- **Duration**: 10 seconds to 10 minutes each

**Why PTB-XL?**
- High-quality ECG waveforms
- Includes clinical annotations
- Diverse cardiac conditions

#### Alternative: MIMIC-IV Waveform Database
- **URL**: https://physionet.org/content/mimic-iv-ecg/1.0/
- Contains continuous ECG from ICU stays

#### HRV Extraction Pipeline:
```python
# Steps to compute DFA Alpha-1 from ECG:
1. Load ECG waveform (sampling rate ≥250 Hz)
2. R-peak detection (e.g., biosppy, wfdb)
3. Generate RR interval series
4. Remove ectopic beats (filter outliers >20% from median)
5. Compute DFA alpha-1:
   - Box sizes: 4, 8, 16, 32, 64 beats
   - Fit slope in log-log plot
6. Interpretation:
   - α1 < 0.75: Reduced complexity (sepsis indicator)
   - 0.75 ≤ α1 ≤ 1.1: Normal range
   - α1 > 1.1: Pathological (e.g., heart failure)
```

---

## Data Access Instructions

### PhysioNet Access

1. **Create Account**: https://physionet.org/register/
2. **Request Access**: Each dataset has access request form
3. **Install wfdb**: `pip install wfdb`
4. **Download Data**:
   ```python
   import wfdb
   wfdb.get_record_list('mimiciv', '2.2')
   ```

### Alternative: Synthetic Data Generation

If access is limited, generate synthetic training data:
```python
# Generate synthetic vital trajectories
from src.data.vitals import generateVitalStream, DEFAULT_BASELINE

# Normal trajectories
normal_data = generateVitalStream(DEFAULT_BASELINE, 1000, 2, 'normal')

# Sepsis trajectories  
sepsis_data = generateVitalStream(DEFAULT_BASELINE, 500, 2, 'sepsis')
```

---

## Data Quality Requirements

| Aspect | Minimum Standard |
|--------|-----------------|
| **Missing Data** | <10% per feature |
| **Sampling Rate** | ≥1 reading per 5 minutes |
| **Patient Count** | ≥100 patients per condition |
| **Time Span** | ≥24 hours per patient |
| **Label Quality** | Physician-verified when possible |

---

## Preprocessing Checklist

- [ ] Remove duplicate timestamps
- [ ] Handle missing data (forward-fill for vitals <1hr)
- [ ] Outlier removal (values beyond physiological range)
- [ ] Normalize to common time zones
- [ ] Generate train/validation/test splits (70/15/15)
- [ ] Balance classes for classification tasks
- [ ] Store preprocessing pipeline with model

---

## License Information

| Dataset | License | Commercial Use |
|---------|---------|----------------|
| MIMIC-IV | PhysioNet Restricted | Requires DUA |
| MIMIC-III | PhysioNet Restricted | Requires DUA |
| eICU | MIT License | ✅ Commercial OK |
| PTB-XL | CC BY 4.0 | ✅ Commercial OK |
| PhysioNet Challenges | ODbL | ✅ Commercial OK |
| PubMed/Clinical | NLM Terms | ✅ Public domain |

**Note**: MIMIC datasets require Data Use Agreement (DUA) - free for research.

---

*Document Version: 1.0.0*  
*Generated for: MedFlow Healthcare Monitoring Platform*