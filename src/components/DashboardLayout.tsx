import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useVitals } from '../hooks/useVitals';
import { FLOWER_VIDEO_URL } from './LoadingScreen';
import EmergencyAlert from './EmergencyAlert';
import QuickActions from './QuickActions';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const vitals = useVitals('sepsis', 2000);
  const navigate = useNavigate();

  const alertCount = vitals.anomalies.filter(a => a.severity !== 'normal').length;

  const handleEmergencyTrigger = () => {
    navigate('/dashboard/sepsis');
  };

  const handleOpenChatbot = () => {
    navigate('/dashboard/chatbot');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'var(--bg-primary)' }}>
      {/* Flower Video Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <video
          src={FLOWER_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
          onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(6, 10, 20, 0.92) 0%, rgba(12, 18, 34, 0.88) 100%)',
          }}
        />
      </div>

      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 280,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        <TopBar stabilityScore={vitals.stabilityScore} alertCount={alertCount} />
        <main style={{
          flex: 1,
          padding: 24,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <Outlet context={vitals} />
        </main>
        <EmergencyAlert onEmergencyTrigger={handleEmergencyTrigger} />
        <QuickActions onOpenChatbot={handleOpenChatbot} onOpenEmergency={handleEmergencyTrigger} />
      </div>
    </div>
  );
}
