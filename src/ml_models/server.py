from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import threading
import time

# Import the ML models from medflow_ml.py
from medflow_ml import SepsisEarlyWarningModel, AnomalyDetector, HRVAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for the React frontend

# Initialize models
sepsis_model = SepsisEarlyWarningModel()
anomaly_detector = AnomalyDetector()
hrv_analyzer = HRVAnalyzer()

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

if __name__ == '__main__':
    print("Starting MedFlow ML Python Backend on port 5000...")
    app.run(port=5000, debug=True, use_reloader=False)
