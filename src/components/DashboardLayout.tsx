import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useVitals } from '../hooks/useVitals';

export default function DashboardLayout() {
  const vitals = useVitals('sepsis', 2000);

  const alertCount = vitals.anomalies.filter(a => a.severity !== 'normal').length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', background: 'var(--bg-primary)' }}>
      {/* Background */}
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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(6, 10, 20, 0.95) 0%, rgba(12, 18, 34, 0.9) 100%)',
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
      </div>
    </div>
  );
}
