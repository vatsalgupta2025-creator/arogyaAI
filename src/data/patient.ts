// Patient data types and mock data

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  sex: string;
  conditions: string[];
  medications: Medication[];
  pastHospitalizations: Hospitalization[];
  emergencyContact: string;
  bloodType: string;
  weight: number;
  height: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  type: string;
}

export interface Hospitalization {
  condition: string;
  date: string;
  duration: string;
  outcome: string;
}

export interface MedicalReportData {
  diagnoses: string[];
  medications: Medication[];
  labResults: LabResult[];
  vitalsHistory: VitalSnapshot[];
  notes: string;
  reportDate: string;
  doctor: string;
  hospital: string;
}

export interface LabResult {
  test: string;
  value: string;
  unit: string;
  reference: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface VitalSnapshot {
  date: string;
  hr: number;
  spo2: number;
  temp: number;
  rr: number;
  sbp: number;
  dbp: number;
}

// ── Mock Patient ────────────────────────────────────────
export const PATIENT: PatientProfile = {
  id: 'PT-2024-0847',
  name: 'Sarah Mehta',
  age: 67,
  sex: 'Female',
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Asthma (mild)'],
  medications: [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', type: 'antidiabetic' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', type: 'ACE-inhibitor' },
    { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', type: 'antiplatelet' },
    { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', type: 'bronchodilator' },
  ],
  pastHospitalizations: [
    { condition: 'Sepsis', date: '2024-08-15', duration: '12 days', outcome: 'Resolved with IV antibiotics' },
    { condition: 'Diabetic Ketoacidosis', date: '2023-03-22', duration: '5 days', outcome: 'Stabilized' },
  ],
  emergencyContact: 'Priya Mehta (Daughter) — +91 98765 43210',
  bloodType: 'B+',
  weight: 68,
  height: 158,
};

// ── Mock Medical Report ─────────────────────────────────
export const MEDICAL_REPORT: MedicalReportData = {
  diagnoses: ['Type 2 Diabetes Mellitus', 'Essential Hypertension Stage 2', 'Mild Persistent Asthma'],
  medications: PATIENT.medications,
  labResults: [
    { test: 'HbA1c', value: '7.2', unit: '%', reference: '<6.5%', status: 'high' },
    { test: 'Fasting Glucose', value: '142', unit: 'mg/dL', reference: '70-100', status: 'high' },
    { test: 'Creatinine', value: '1.1', unit: 'mg/dL', reference: '0.6-1.2', status: 'normal' },
    { test: 'eGFR', value: '72', unit: 'mL/min', reference: '>60', status: 'normal' },
    { test: 'WBC', value: '8.2', unit: '×10³/µL', reference: '4.5-11.0', status: 'normal' },
    { test: 'Hemoglobin', value: '11.8', unit: 'g/dL', reference: '12-16', status: 'low' },
    { test: 'Lactate', value: '1.4', unit: 'mmol/L', reference: '<2.0', status: 'normal' },
    { test: 'CRP', value: '12', unit: 'mg/L', reference: '<5', status: 'high' },
    { test: 'Procalcitonin', value: '0.8', unit: 'ng/mL', reference: '<0.5', status: 'high' },
  ],
  vitalsHistory: [
    { date: '2025-01-15', hr: 78, spo2: 96, temp: 36.8, rr: 16, sbp: 138, dbp: 88 },
    { date: '2025-02-10', hr: 82, spo2: 95, temp: 37.0, rr: 17, sbp: 142, dbp: 90 },
    { date: '2025-03-01', hr: 76, spo2: 97, temp: 36.6, rr: 15, sbp: 136, dbp: 86 },
  ],
  notes: 'Patient has history of recurrent sepsis. CRP and Procalcitonin mildly elevated — recommend monitoring for early sepsis signs. SpO2 may read 2-3% higher due to darker skin pigmentation (Fitzpatrick V). Adjust thresholds accordingly.',
  reportDate: '2025-03-10',
  doctor: 'Dr. Anil Sharma',
  hospital: 'Fortis Memorial Research Institute, Gurugram',
};

// ── Timeline Events ─────────────────────────────────────
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'alert' | 'vital' | 'medication' | 'report' | 'prediction' | 'action';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  icon?: string;
}

export function generateTimelineEvents(): TimelineEvent[] {
  const now = new Date();
  const events: TimelineEvent[] = [
    { id: 'e1', timestamp: new Date(now.getTime() - 7200000), type: 'vital', severity: 'info', title: 'Vitals Stable', description: 'All vital signs within personal baseline ranges.' },
    { id: 'e2', timestamp: new Date(now.getTime() - 5400000), type: 'medication', severity: 'info', title: 'Metformin 500mg Administered', description: 'Morning dose taken on schedule.' },
    { id: 'e3', timestamp: new Date(now.getTime() - 3600000), type: 'alert', severity: 'warning', title: 'Heart Rate Trending Up', description: 'HR increased from 78 → 92 bpm over 45 minutes. Context: post-meal, resting.' },
    { id: 'e4', timestamp: new Date(now.getTime() - 2700000), type: 'prediction', severity: 'warning', title: 'Trajectory Alert', description: 'SpO₂ declining at -0.8%/hr. Projected to reach 92% in ~3.5 hours.' },
    { id: 'e5', timestamp: new Date(now.getTime() - 1800000), type: 'vital', severity: 'warning', title: 'Temperature Rising', description: 'Core temperature: 37.6°C (personal baseline: 36.8°C). Trend: +0.4°C/hr.' },
    { id: 'e6', timestamp: new Date(now.getTime() - 900000), type: 'alert', severity: 'critical', title: 'Sepsis Early Warning Triggered', description: 'Modified qSOFA score elevated (2/3). HRV complexity dropped 18%. Recommend blood cultures + lactate.' },
    { id: 'e7', timestamp: new Date(now.getTime() - 600000), type: 'action', severity: 'info', title: 'Dr. Sharma Notified', description: 'Automated alert sent to attending physician.' },
    { id: 'e8', timestamp: new Date(now.getTime() - 300000), type: 'report', severity: 'info', title: 'Medical Report Integrated', description: 'Previous sepsis history detected. Alert confidence increased by 15%.' },
  ];
  return events;
}
