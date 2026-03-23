import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoadingScreen from './components/LoadingScreen';
import VitalsOverview from './pages/VitalsOverview';
import TrajectoryForecast from './pages/TrajectoryForecast';
import DifferentialDiagnosis from './pages/DifferentialDiagnosis';
import SepsisWarning from './pages/SepsisWarning';
import MedicalReports from './pages/MedicalReports';
import Timeline from './pages/Timeline';
import CaregiverView from './pages/CaregiverView';
import EquityAudit from './pages/EquityAudit';
import PersonalBaseline from './pages/PersonalBaseline';
import AIChatbot from './pages/AIChatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/landing" element={<LandingPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<VitalsOverview />} />
          <Route path="trajectory" element={<TrajectoryForecast />} />
          <Route path="diagnosis" element={<DifferentialDiagnosis />} />
          <Route path="sepsis" element={<SepsisWarning />} />
          <Route path="reports" element={<MedicalReports />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="caregiver" element={<CaregiverView />} />
          <Route path="equity" element={<EquityAudit />} />
          <Route path="baseline" element={<PersonalBaseline />} />
          <Route path="chatbot" element={<AIChatbot />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
