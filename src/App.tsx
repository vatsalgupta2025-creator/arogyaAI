import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import PatientInput from './pages/PatientInput';
import { PatientProvider } from './hooks/PatientContext';
import VitalsOverview from './pages/VitalsOverview';
import TrajectoryForecast from './pages/TrajectoryForecast';
import DifferentialDiagnosis from './pages/DifferentialDiagnosis';
import SepsisWarning from './pages/SepsisWarning';
import SimplePrediction from './pages/SimplePrediction';
import DataImporter from './pages/DataImporter';
import MedicalReports from './pages/MedicalReports';
import Timeline from './pages/Timeline';
import CaregiverView from './pages/CaregiverView';
import EquityAudit from './pages/EquityAudit';
import PersonalBaseline from './pages/PersonalBaseline';
import AIChatbot from './pages/AIChatbot';
import MedicationReminder from './pages/MedicationReminder';
import HealthScore from './pages/HealthScore';
import ExportReports from './components/ExportReports';
import FetalMonitoring from './pages/FetalMonitoring';

function App() {
  return (
    <PatientProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoadingScreen />} />
          <Route path="/patient-input" element={<PatientInput />} />
          <Route path="/landing" element={<LandingPage />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<VitalsOverview />} />
            <Route path="trajectory" element={<TrajectoryForecast />} />
            <Route path="diagnosis" element={<DifferentialDiagnosis />} />
            <Route path="sepsis" element={<SepsisWarning />} />
            <Route path="simple-predict" element={<SimplePrediction />} />
            <Route path="data-importer" element={<DataImporter />} />
            <Route path="reports" element={<MedicalReports />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="caregiver" element={<CaregiverView />} />
            <Route path="equity" element={<EquityAudit />} />
            <Route path="baseline" element={<PersonalBaseline />} />
            <Route path="chatbot" element={<AIChatbot />} />
            <Route path="fetal-monitoring" element={<FetalMonitoring />} />
            <Route path="medications" element={<MedicationReminder />} />
            <Route path="health-score" element={<HealthScore />} />
            <Route path="export" element={<ExportReports />} />
          </Route>

          {/* Standalone route for Data Importer */}
          <Route path="/data-importer" element={<DataImporter />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </PatientProvider>
  );
}

export default App;
