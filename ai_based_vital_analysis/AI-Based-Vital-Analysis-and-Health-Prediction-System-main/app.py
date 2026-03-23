from __future__ import annotations

import plotly.express as px
import streamlit as st

from src.data_utils import (
    generate_sample_reports,
    generate_sample_vitals,
    load_reports,
    load_vitals,
)
from src.health_rules import generate_alerts
from src.modeling import predict_conditions, train_model

st.set_page_config(page_title="AI Vital Analysis Dashboard", layout="wide")
st.title("AI-Based Vital Analysis and Health Prediction")
st.caption("Track 5 - VIT Internship Special Track")


@st.cache_data
def get_default_data():
    vitals = generate_sample_vitals()
    reports = generate_sample_reports(vitals)
    return vitals, reports


def status_color(condition: str) -> str:
    if condition == "Normal":
        return "green"
    if condition in {"Tachycardia Risk", "Fever Risk"}:
        return "orange"
    return "red"


with st.sidebar:
    st.header("Input Data")
    vital_file = st.file_uploader("Upload vitals CSV", type=["csv"])
    report_file = st.file_uploader("Upload medical report CSV", type=["csv"])

    st.markdown("Expected vitals columns:")
    st.code("patient_id,timestamp,heart_rate,spo2,ecg_index,temperature,label(optional)")

    st.markdown("Expected report columns:")
    st.code("patient_id,timestamp,reported_condition")

if vital_file is not None:
    vitals_df = load_vitals(vital_file)
else:
    vitals_df, default_reports = get_default_data()

if report_file is not None:
    report_df = load_reports(report_file)
else:
    if "default_reports" not in locals():
        _, default_reports = get_default_data()
    report_df = default_reports

model_bundle, metrics = train_model(vitals_df)
vitals_df = vitals_df.copy()
vitals_df["predicted_condition"] = predict_conditions(model_bundle, vitals_df)

latest = vitals_df.iloc[-1]
latest_condition = latest["predicted_condition"]

st.subheader("Model Summary")
col_a, col_b, col_c, col_d = st.columns(4)
col_a.metric("Model Accuracy", f"{metrics['accuracy'] * 100:.1f}%")
col_b.metric("Samples", len(vitals_df))
col_c.metric("Training Rows", metrics["train_size"])
col_d.metric("Latest Prediction", latest_condition)

st.markdown("### Current Patient Snapshot")
status = status_color(latest_condition)
st.markdown(
    f"<span style='font-size:20px;'>Predicted Condition: <b style='color:{status};'>{latest_condition}</b></span>",
    unsafe_allow_html=True,
)

snapshot_col1, snapshot_col2, snapshot_col3, snapshot_col4 = st.columns(4)
snapshot_col1.metric("Heart Rate (bpm)", f"{latest['heart_rate']:.0f}")
snapshot_col2.metric("SpO2 (%)", f"{latest['spo2']:.1f}")
snapshot_col3.metric("Temperature (C)", f"{latest['temperature']:.1f}")
snapshot_col4.metric("ECG Index", f"{latest['ecg_index']:.2f}")

st.markdown("### Alerts and Trends")
for item in generate_alerts(vitals_df):
    if item.startswith("Critical"):
        st.error(item)
    elif item.startswith("Warning"):
        st.warning(item)
    else:
        st.info(item)

chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    st.markdown("### Vital Trends")
    trend_df = vitals_df[["timestamp", "heart_rate", "spo2", "temperature"]].copy()
    trend_long = trend_df.melt(id_vars=["timestamp"], var_name="metric", value_name="value")
    trend_fig = px.line(
        trend_long,
        x="timestamp",
        y="value",
        color="metric",
        title="Heart Rate, SpO2, and Temperature Over Time",
    )
    trend_fig.update_layout(legend_title="Metric")
    st.plotly_chart(trend_fig, use_container_width=True)

with chart_col2:
    st.markdown("### Prediction Distribution")
    dist_fig = px.histogram(
        vitals_df,
        x="predicted_condition",
        color="predicted_condition",
        title="Predicted Condition Counts",
    )
    dist_fig.update_layout(showlegend=False, xaxis_title="Condition", yaxis_title="Count")
    st.plotly_chart(dist_fig, use_container_width=True)

st.markdown("### Compare Predictions with Medical Reports")
comparison = vitals_df[["patient_id", "timestamp", "predicted_condition"]].merge(
    report_df[["patient_id", "timestamp", "reported_condition"]],
    on=["patient_id", "timestamp"],
    how="inner",
)

if comparison.empty:
    st.warning("No matching timestamps between vitals and medical reports.")
else:
    comparison["match"] = comparison["predicted_condition"] == comparison["reported_condition"]
    agreement = comparison["match"].mean() * 100

    c1, c2 = st.columns(2)
    c1.metric("Compared Rows", len(comparison))
    c2.metric("Agreement with Reports", f"{agreement:.1f}%")

    st.dataframe(comparison.tail(20), use_container_width=True)

st.markdown("### Data Preview")
st.dataframe(vitals_df.tail(25), use_container_width=True)
