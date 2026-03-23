from __future__ import annotations

import pandas as pd


def heuristic_condition(row: pd.Series) -> str:
    """Derive a condition label from vital thresholds."""
    if float(row["spo2"]) < 92:
        return "Hypoxemia Risk"
    if float(row["temperature"]) >= 38.0:
        return "Fever Risk"
    if float(row["heart_rate"]) > 110:
        return "Tachycardia Risk"
    return "Normal"


def generate_alerts(vitals_df: pd.DataFrame) -> list[str]:
    """Generate human-readable alerts from recent vitals."""
    if vitals_df.empty:
        return ["No vitals available."]

    alerts: list[str] = []
    latest = vitals_df.iloc[-1]

    if latest["spo2"] < 92:
        alerts.append(f"Critical: Low SpO2 ({latest['spo2']:.1f}%).")
    elif latest["spo2"] < 95:
        alerts.append(f"Warning: Borderline SpO2 ({latest['spo2']:.1f}%).")

    if latest["temperature"] >= 38.0:
        alerts.append(f"Warning: High temperature ({latest['temperature']:.1f} C).")

    if latest["heart_rate"] > 120:
        alerts.append(f"Warning: Elevated heart rate ({latest['heart_rate']:.0f} bpm).")
    elif latest["heart_rate"] < 50:
        alerts.append(f"Warning: Low heart rate ({latest['heart_rate']:.0f} bpm).")

    tail = vitals_df.tail(5)
    if len(tail) >= 5:
        temp_trend = tail["temperature"].iloc[-1] - tail["temperature"].iloc[0]
        hr_trend = tail["heart_rate"].iloc[-1] - tail["heart_rate"].iloc[0]

        if temp_trend > 0.7:
            alerts.append("Trend: Temperature is rising quickly.")
        if hr_trend > 15:
            alerts.append("Trend: Heart rate is increasing quickly.")

    if not alerts:
        alerts.append("All monitored vitals are in the expected range.")

    return alerts
