from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import threading
import time

# Import the ML models from medflow_ml.py
from medflow_ml import SepsisEarlyWarningModel, AnomalyDetector, HRVAnalyzer
import torch
import os

try:
    from fetal_ecg_model import FetalECGModel
    import edfio
    from scipy.signal import butter, filtfilt
    has_fetal_model = True
except ImportError:
    has_fetal_model = False
app = Flask(__name__)
CORS(app)  # Enable CORS for the React frontend

# Initialize models
sepsis_model = SepsisEarlyWarningModel()
anomaly_detector = AnomalyDetector()
hrv_analyzer = HRVAnalyzer()

if has_fetal_model:
    fetal_model = FetalECGModel()
    model_path = os.path.join(os.path.dirname(__file__), 'fetal_ecg_model.pth')
    if os.path.exists(model_path):
        fetal_model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=True))
        fetal_model.eval()
        print("Loaded Fetal ECG Model.")
    else:
        print("fetal_ecg_model.pth not found. Model is uninitialized.")

@app.route('/api/analyze', methods=['POST'])
def analyze_vitals():
    try:
        data = request.json
        current = data.get('current', {})
        history = data.get('history', [])
        
        # 1. Sepsis Prediction
        sepsis_pred = sepsis_model.predict(current, history)
        
        # 2. HRV Analysis
        hrv_analysis = hrv_analyzer.analyze_hrv(current.get('hr', 75), 0)
        
        # 3. Anomaly Detection based on context
        anomalies = anomaly_detector.detect_context_anomalies(current, current.get('context', 'resting'))
        
        # Add a custom reasoning string based on the ML models
        reasoning = []
        if sepsis_pred.risk_score > 0.4:
            reasoning.append({
                "vital": "Systemic",
                "message": f"Elevated sepsis risk ({sepsis_pred.risk_score*100:.0f}%). Sepsis ML Model suggests: {sepsis_pred.recommended_actions[0]}",
                "severity": "critical"
            })
        
        for a in anomalies:
            reasoning.append({
                "vital": a['vital'].upper(),
                "message": f"Value {a['value']} deviates from {a['context']} baseline of {a['threshold']} (Anomaly Score Active)",
                "severity": a['severity']
            })

        response = {
            "sepsis_score": round(sepsis_pred.risk_score * 100),
            "hrv_dfa": hrv_analysis['dfa_alpha1'],
            "stability": max(0, 100 - (sepsis_pred.risk_score * 50) - (len(anomalies) * 10)),
            "anomalies": reasoning
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

demo_data = None
demo_idx = 0
demo_fs = 1000.0

def load_demo_data():
    global demo_data, demo_fs
    if demo_data is not None:
        return demo_data
    file = r"C:\Users\SAMSUNG\Downloads\abdominal-and-direct-fetal-ecg-database-1.0.0\abdominal-and-direct-fetal-ecg-database-1.0.0\r01.edf"
    try:
        edf = edfio.read_edf(file)
        demo_fs = edf.signals[0].sampling_frequency
        signals = np.zeros((4, len(edf.signals[0].data)))
        for i in range(4):
            signals[i, :] = edf.signals[i].data
            
        def filter_sig(data, fs):
            nyq = 0.5 * fs
            b, a = butter(3, [1.0/nyq, 100.0/nyq], btype='band')
            return filtfilt(b, a, data)
            
        for i in range(4):
            signals[i] = filter_sig(signals[i], demo_fs)
            signals[i] = (signals[i] - np.mean(signals[i])) / (np.std(signals[i]) + 1e-8)
        demo_data = signals
        return demo_data
    except Exception as e:
        print("Failed to load demo EDF data:", e)
        return None

@app.route('/api/fetal-ecg', methods=['POST'])
def analyze_fetal_ecg():
    global demo_idx, demo_fs
    if not has_fetal_model:
        return jsonify({"error": "Fetal model not available"}), 501
    try:
        data = request.json
        use_demo = data.get('use_demo', False)
        
        fs = data.get('fs', 1000.0)
        
        if use_demo:
            d_data = load_demo_data()
            if d_data is not None:
                seg_len = int(1.0 * demo_fs) # 1 second segment
                if demo_idx + seg_len > d_data.shape[1]:
                    demo_idx = 0
                signals = d_data[:, demo_idx:demo_idx+seg_len]
                demo_idx += seg_len
                fs = demo_fs
            else:
                signals = np.array(data.get('signals', []))
        else:
            signals = np.array(data.get('signals', []))

        if signals.shape[0] != 4 or signals.shape[1] == 0:
            return jsonify({"error": "Invalid signal format. Expected 4 channels."}), 400
            
        rem = signals.shape[1] % 4
        if rem != 0:
            pad_len = 4 - rem
            signals = np.pad(signals, ((0,0), (0,pad_len)), mode='edge')
            
        tensor_in = torch.tensor(signals, dtype=torch.float32).unsqueeze(0)
        
        with torch.no_grad():
            out = fetal_model(tensor_in).squeeze()
            
        probs = out.numpy()
        peaks = probs > 0.5
        peak_indices = np.where(peaks)[0]
        
        distinct_peaks = [peak_indices[0]] if len(peak_indices) > 0 else []
        if len(peak_indices) > 1:
            diffs = np.diff(peak_indices)
            for i in range(len(diffs)):
                if diffs[i] > 10:
                    distinct_peaks.append(peak_indices[i+1])
                
        if len(distinct_peaks) > 1:
            rr_intervals = np.diff(distinct_peaks) / fs
            fhr = 60.0 / np.mean(rr_intervals)
        else:
            fhr = 0.0
            
        return jsonify({
            "fhr": round(fhr, 1),
            "peaks_detected": len(distinct_peaks),
            "signal_quality": "good" if 110 <= fhr <= 160 else "concerning"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict-basic', methods=['POST'])
def predict_basic():
    try:
        import pandas as pd
        from sklearn.tree import DecisionTreeClassifier
        data_path = os.path.join(os.path.dirname(__file__), "..", "pages", "humanvitalsigndata.csv")
        data = pd.read_csv(data_path)
        X = data[["Heart Rate", "Oxygen Saturation", "Body Temperature"]]
        
        # the csv has "High Risk" and "Low Risk", map to "Risk" and "Normal" to fit the UI
        data["condition"] = data["Risk Category"].apply(lambda x: "Risk" if "High" in str(x) else ("Normal" if "Low" in str(x) else x))
        y = data["condition"]
        
        model = DecisionTreeClassifier()
        model.fit(X, y)
        
        req = request.json
        hr = req.get('heart_rate', 70)
        spo2 = req.get('spo2', 98)
        temp = req.get('temperature', 37.0)
        
        prediction = model.predict([[hr, spo2, temp]])[0]
        
        return jsonify({
            "prediction": prediction,
            "vitals": {"Heart Rate": hr, "SpO2": spo2, "Temperature": temp}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze-csvs', methods=['POST'])
def analyze_csvs():
    try:
        import pandas as pd
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder
        
        # 1. Read files
        if 'vitals' not in request.files:
            return jsonify({"error": "Missing vitals file"}), 400
            
        vitals_file = request.files['vitals']
        vitals_df = pd.read_csv(vitals_file)
        vitals_df.columns = [c.strip().lower() for c in vitals_df.columns]
        
        # Flexible column mapping - try to find common column names
        column_mapping = {
            'heart_rate': ['heart_rate', 'hr', 'heartrate', 'bpm', 'pulse'],
            'spo2': ['spo2', 'spo', 'oxygen', 'o2sat', 'saturation', 'oxigen'],
            'temperature': ['temperature', 'temp', 'body_temp', 'bt'],
            'sbp': ['sbp', 'systolic', 'systolic_bp', 'blood_pressure_systolic'],
            'dbp': ['dbp', 'diastolic', 'diastolic_bp', 'blood_pressure_diastolic'],
            'respiratory_rate': ['respiratory_rate', 'rr', 'resp_rate', 'breathing_rate'],
        }
        
        # Find actual columns in the CSV
        available_cols = {col.lower() for col in vitals_df.columns}
        feature_cols = []
        for standard_name, possible_names in column_mapping.items():
            for name in possible_names:
                if name in available_cols:
                    # Rename to standard name
                    actual_col = list(available_cols)[list(available_cols).index(name)]
                    if actual_col != standard_name:
                        vitals_df.rename(columns={actual_col: standard_name}, inplace=True)
                    feature_cols.append(standard_name)
                    break
        
        # If we don't have enough features, try to use what's available
        if len(feature_cols) < 2:
            # Use any numeric columns as features
            numeric_cols = vitals_df.select_dtypes(include=['number']).columns.tolist()
            feature_cols = [c for c in numeric_cols if c not in ['patient_id', 'timestamp', 'index']]
        
        if len(feature_cols) < 2:
            return jsonify({
                "error": f"CSV needs at least 2 numeric columns (e.g., heart_rate, spo2, temperature). Found columns: {list(vitals_df.columns)}",
                "suggestion": "Please ensure your CSV has columns like: heart_rate, spo2, temperature, or use standard column names"
            }), 400
            
        # Parse vitals
        for col in feature_cols:
            if col in vitals_df.columns:
                vitals_df[col] = pd.to_numeric(vitals_df[col], errors="coerce")
        vitals_df = vitals_df.dropna(subset=feature_cols)
        
        # Simple heuristic if no label
        if "label" not in vitals_df.columns:
            def get_heuristic(row):
                hr = row.get('heart_rate', 0)
                temp = row.get('temperature', 0)
                spo2 = row.get('spo2', 100)
                sbp = row.get('sbp', 0)
                dbp = row.get('dbp', 0)
                rr = row.get('respiratory_rate', row.get('rr', 0))
                
                # AI-based risk assessment
                conditions = []
                
                # Check for critical conditions
                if hr > 120:
                    conditions.append('Tachycardia')
                elif hr > 100:
                    conditions.append('Tachycardia Risk')
                elif hr < 50:
                    conditions.append('Bradycardia')
                    
                if temp > 38.5:
                    conditions.append('High Fever')
                elif temp > 38.0:
                    conditions.append('Fever')
                elif temp < 36.0:
                    conditions.append('Hypothermia')
                    
                if spo2 < 90:
                    conditions.append('Critical Hypoxemia')
                elif spo2 < 94:
                    conditions.append('Low Oxygen')
                elif spo2 < 96:
                    conditions.append('Oxygen Concern')
                    
                if sbp > 180 or dbp > 120:
                    conditions.append('Hypertensive Crisis')
                elif sbp > 140 or dbp > 90:
                    conditions.append('High Blood Pressure')
                elif sbp < 90 or dbp < 60:
                    conditions.append('Low Blood Pressure')
                    
                if rr > 24:
                    conditions.append('Tachypnea')
                elif rr < 12:
                    conditions.append('Bradypnea')
                    
                # Assess overall severity
                critical_count = sum(1 for c in conditions if 'Critical' in c or 'Crisis' in c)
                if critical_count > 0:
                    return 'Critical - ' + conditions[0]
                elif len(conditions) >= 3:
                    return 'Multiple Risks - ' + conditions[0]
                elif len(conditions) >= 1:
                    return conditions[0]
                else:
                    return 'Normal'
            
            vitals_df["label"] = vitals_df.apply(get_heuristic, axis=1)
            
        # 2. Train Model
        X = vitals_df[feature_cols]
        y_raw = vitals_df["label"].astype(str)
        encoder = LabelEncoder()
        y = encoder.fit_transform(y_raw)
        
        model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        
        metrics = {"accuracy": 1.0, "train_size": len(X), "test_size": 0}
        
        if len(X) < 2:
            model.fit(X, y)
        else:
            test_size = max(1, int(round(len(vitals_df) * 0.2)))
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
            model.fit(X_train, y_train)
            if len(X_test) > 0:
                metrics["accuracy"] = float(accuracy_score(y_test, model.predict(X_test)))
                
        # Predictions
        vitals_df["predicted_condition"] = encoder.inverse_transform(model.predict(X))
        
        # Charts Data
        latest = vitals_df.iloc[-1].to_dict() if len(vitals_df) > 0 else {}
        trend_data = vitals_df[['heart_rate', 'spo2', 'temperature']].tail(50).to_dict(orient='records')
        
        condition_counts = vitals_df['predicted_condition'].value_counts().to_dict()
        dist_data = [{"condition": k, "count": v} for k, v in condition_counts.items()]
        
        # 3. Reports merge
        agreement = 0.0
        comparison_docs = []
        if 'reports' in request.files and request.files['reports'].filename != '':
            reports_df = pd.read_csv(request.files['reports'])
            reports_df.columns = [c.strip().lower() for c in reports_df.columns]
            
            if 'patient_id' in vitals_df.columns and 'patient_id' in reports_df.columns and 'reported_condition' in reports_df.columns:
                vitals_df["timestamp"] = pd.to_datetime(vitals_df.get("timestamp", pd.Series(dtype='datetime64[ns]')), errors="coerce")
                reports_df["timestamp"] = pd.to_datetime(reports_df.get("timestamp", pd.Series(dtype='datetime64[ns]')), errors="coerce")
                
                comparison = vitals_df[["patient_id", "timestamp", "predicted_condition"]].merge(
                    reports_df[["patient_id", "timestamp", "reported_condition"]],
                    on=["patient_id", "timestamp"],
                    how="inner"
                )
                if not comparison.empty:
                    comparison["match"] = comparison["predicted_condition"] == comparison["reported_condition"]
                    agreement = float(comparison["match"].mean() * 100)
                    comparison['timestamp'] = comparison['timestamp'].astype(str)
                    comparison_docs = comparison.tail(20).to_dict(orient='records')
        
        return jsonify({
            "metrics": metrics,
            "latest_prediction": latest.get("predicted_condition", "Unknown"),
            "latest_vitals": latest,
            "agreement": agreement,
            "comparisons": comparison_docs,
            "trend_data": trend_data,
            "dist_data": dist_data,
            "alerts": [
                f"Critical: Tachycardia detected ({latest.get('heart_rate', 'N/A')} bpm)" if latest.get('heart_rate') and str(latest.get('heart_rate', 0)).replace('.', '', 1).isdigit() and float(latest.get('heart_rate', 0)) > 100 else None
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Load the trained vitals risk model at startup
import pickle
vitals_risk_model = None
vitals_risk_model_path = os.path.join(os.path.dirname(__file__), 'vitals_risk_model.pkl')
if os.path.exists(vitals_risk_model_path):
    try:
        with open(vitals_risk_model_path, 'rb') as f:
            vitals_risk_model = pickle.load(f)
        print("Loaded trained vitals risk model successfully!")
    except Exception as e:
        print(f"Failed to load vitals risk model: {e}")

# Load the comprehensive sepsis model at startup
sepsis_comprehensive_model = None
sepsis_model_path = os.path.join(os.path.dirname(__file__), 'sepsis_comprehensive_model.pkl')
if os.path.exists(sepsis_model_path):
    try:
        with open(sepsis_model_path, 'rb') as f:
            sepsis_comprehensive_model = pickle.load(f)
        print(f"Loaded comprehensive sepsis model! Accuracy: {sepsis_comprehensive_model['accuracy']:.4f}, ROC-AUC: {sepsis_comprehensive_model['roc_auc']:.4f}")
    except Exception as e:
        print(f"Failed to load sepsis comprehensive model: {e}")

@app.route('/api/sepsis-predict', methods=['POST'])
def predict_sepsis():
    """
    Use the trained comprehensive sepsis model to predict sepsis risk.
    """
    try:
        if sepsis_comprehensive_model is None:
            return jsonify({"error": "Sepsis model not loaded"}), 500
        
        data = request.json
        
        # Extract features from request (map frontend names to model features)
        features = {
            'age': float(data.get('age', 50)),
            'bmi': float(data.get('bmi', 25)),
            'hr': float(data.get('heart_rate', 75)),
            'spo2': float(data.get('spo2', 98)),
            'temp': float(data.get('temperature', 37)),
            'rr': float(data.get('respiratory_rate', 14)),
            'sbp': float(data.get('sbp', 120)),
            'dbp': float(data.get('dbp', 80)),
            'lactate': float(data.get('lactate', 1.0)),
            'wbc': float(data.get('wbc', 7.0)),
            'crp': float(data.get('crp', 5.0)),
            'procalcitonin': float(data.get('procalcitonin', 0.1)),
            'hr_slope_3h': float(data.get('hr_slope_3h', 0)),
            'temp_slope_3h': float(data.get('temp_slope_3h', 0)),
            'spo2_slope_3h': float(data.get('spo2_slope_3h', 0)),
            'qsofa_score': float(data.get('qsofa_score', 0)),
            'sepsis_history': float(data.get('sepsis_history', 0)),
            'diabetes_flag': float(data.get('diabetes_flag', 0)),
            'hrv_dfa': float(data.get('hrv_dfa', 0.9)),
        }
        
        # Create feature vector
        import pandas as pd
        feature_cols = sepsis_comprehensive_model['feature_cols']
        X = pd.DataFrame([features])[feature_cols]
        
        # Predict
        prediction = sepsis_comprehensive_model['model'].predict(X)[0]
        probability = sepsis_comprehensive_model['model'].predict_proba(X)[0]
        
        # Get risk percentage
        sepsis_probability = float(probability[1]) * 100  # Probability of sepsis (class 1)
        
        # Determine severity
        if sepsis_probability >= 70:
            severity = "Critical"
            recommendation = "Immediate medical attention required. Consider ICU evaluation."
        elif sepsis_probability >= 40:
            severity = "High"
            recommendation = "Urgent medical evaluation recommended. Monitor closely."
        elif sepsis_probability >= 20:
            severity = "Moderate"
            recommendation = "Schedule medical consultation. Watch for symptom progression."
        else:
            severity = "Low"
            recommendation = "Continue monitoring. Maintain healthy lifestyle."
        
        return jsonify({
            "sepsis_risk": sepsis_probability,
            "prediction": "Sepsis" if prediction == 1 else "No Sepsis",
            "severity": severity,
            "recommendation": recommendation,
            "confidence": float(max(probability)) * 100,
            "model_accuracy": sepsis_comprehensive_model['accuracy'],
            "model_auc": sepsis_comprehensive_model['roc_auc']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vitals-risk', methods=['POST'])
def predict_vitals_risk():
    """
    Use the trained HistGradientBoosting model to predict risk category.
    """
    try:
        if vitals_risk_model is None:
            return jsonify({"error": "Model not loaded"}), 500
        
        data = request.json
        
        # Extract features from request
        features = {
            'Heart Rate': float(data.get('heart_rate', 70)),
            'Respiratory Rate': float(data.get('respiratory_rate', 14)),
            'Body Temperature': float(data.get('temperature', 37.0)),
            'Oxygen Saturation': float(data.get('spo2', 98)),
            'Systolic Blood Pressure': float(data.get('sbp', 120)),
            'Diastolic Blood Pressure': float(data.get('dbp', 80)),
            'Age': float(data.get('age', 30)),
            'Weight (kg)': float(data.get('weight', 70)),
            'Height (m)': float(data.get('height', 1.7)),
            'Derived_HRV': float(data.get('hrv', 50)),
            'Derived_Pulse_Pressure': float(data.get('pulse_pressure', 40)),
            'Derived_BMI': float(data.get('bmi', 24)),
            'Derived_MAP': float(data.get('map', 93)),
        }
        
        # Gender encoding
        gender = data.get('gender', 'Male')
        gender_encoded = vitals_risk_model['gender_encoder'].transform([gender])[0]
        features['Gender_Encoded'] = gender_encoded
        
        # Create feature vector
        import pandas as pd
        feature_cols = vitals_risk_model['feature_cols']
        X = pd.DataFrame([features])[feature_cols]
        
        # Predict
        prediction = vitals_risk_model['model'].predict(X)[0]
        probability = vitals_risk_model['model'].predict_proba(X)[0]
        
        # Decode prediction
        predicted_risk = vitals_risk_model['target_encoder'].inverse_transform([prediction])[0]
        confidence = float(max(probability) * 100)
        
        return jsonify({
            "prediction": predicted_risk,
            "confidence": confidence,
            "risk_level": "High" if predicted_risk == "High Risk" else "Low",
            "features": features
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting MedFlow ML Python Backend on port 5000...")
    app.run(port=5000, debug=True, use_reloader=False)
