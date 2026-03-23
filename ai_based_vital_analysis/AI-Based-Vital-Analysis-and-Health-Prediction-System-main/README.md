# AI-Based Vital Analysis and Health Prediction System

This project is a ready-to-run prototype for Track 5: VIT Internship Special Track.

It provides:

- Vitals dataset input (uploaded CSV or generated sample data)
- ML-based condition prediction
- Comparison between predictions and medical report labels
- Interactive dashboard with alerts and trend visualizations

## Features

- Accepts vital parameters: `heart_rate`, `spo2`, `ecg_index`, `temperature`
- Trains a `RandomForestClassifier` on available labeled data
- Generates predicted health condition categories:
  - Normal
  - Tachycardia Risk
  - Fever Risk
  - Hypoxemia Risk
- Displays:
  - Model accuracy
  - Current patient snapshot
  - Alerts and trend insights
  - Graphs for vital trends and prediction distribution
  - Agreement score against medical report labels

## Project Structure

- `app.py`: Streamlit dashboard app
- `src/data_utils.py`: Data loading and sample-data generation
- `src/health_rules.py`: Threshold-based labels and alert logic
- `src/modeling.py`: ML training and inference
- `sample_data/`: Example input CSV files
- `requirements.txt`: Python dependencies

## Input CSV Formats

### Vitals CSV

Required columns:

`patient_id,timestamp,heart_rate,spo2,ecg_index,temperature`

Optional column:

`label`

If `label` is missing, the app auto-generates labels using rule-based medical thresholds.

### Medical Report CSV

Required columns:

`patient_id,timestamp,reported_condition`

## Setup and Run

1. Create a virtual environment (optional but recommended)
1. Install dependencies:

```bash
pip install -r requirements.txt
```

1. Run dashboard:

```bash
streamlit run app.py
```

1. Open the displayed local URL in your browser.

## Notes

- If you do not upload files, the app uses realistic synthetic sample data.
- `sample_data/` is included for quick manual testing.
- This is a prototype suitable for internship/demo submission and can be extended with real sensor streams and clinical datasets.
