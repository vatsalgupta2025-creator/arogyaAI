import streamlit as st
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# Load dataset
data = pd.read_csv("health_data.csv")

X = data[["heart_rate", "spo2", "temperature"]]
y = data["condition"]

# Train simple ML model
model = DecisionTreeClassifier()
model.fit(X, y)

# UI
st.set_page_config(page_title="AI Health App", layout="centered")

st.title("💙 AI-Based Health Prediction System")

st.markdown("Enter your vital details:")

col1, col2 = st.columns(2)

with col1:
    heart_rate = st.number_input("Heart Rate (bpm)", 60, 150)
    temperature = st.number_input("Temperature (°C)", 35.0, 42.0)

with col2:
    spo2 = st.number_input("SpO2 (%)", 80, 100)

if st.button("🔍 Predict"):
    prediction = model.predict([[heart_rate, spo2, temperature]])[0]

    st.subheader("🩺 Result")
    
    if prediction == "Risk":
        st.error("⚠️ High Risk - Consult Doctor")
    else:
        st.success("✅ Normal")

    # Chart
    chart_data = pd.DataFrame({
        "Vitals": ["Heart Rate", "SpO2", "Temperature"],
        "Values": [heart_rate, spo2, temperature]
    })

    st.bar_chart(chart_data.set_index("Vitals"))
