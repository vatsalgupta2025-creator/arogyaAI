import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useVitals } from '../hooks/useVitals';

export default function DashboardLayout() {
  const vitals = useVitals('sepsis', 2000);

  const alertCount = vitals.anomalies.filter(a => a.severity !== 'normal').length;

  return (
    <div className="flex min-h-screen relative flex-col md:flex-row">
      {/* Flower UI Background Video */}
      <div className="fixed inset-0 z-[-10] w-full h-full bg-black overflow-hidden pointer-events-none">
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover mix-blend-screen opacity-50"
          poster="/images/hero_bg.jpeg"
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-h-screen md:ml-[280px] transition-all duration-300">
        <TopBar stabilityScore={vitals.stabilityScore} alertCount={alertCount} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full pb-20 md:pb-6">
          <Outlet context={vitals} />
        </main>
      </div>
    </div>
  );
}
