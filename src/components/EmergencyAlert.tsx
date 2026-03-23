import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Bell, X, Shield, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired?: boolean;
}

interface EmergencyAlertSystemProps {
  patientName?: string;
  onEmergencyTrigger?: () => void;
}

export default function EmergencyAlertSystem({ onEmergencyTrigger }: EmergencyAlertSystemProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Simulate incoming alerts
  useEffect(() => {
    const mockAlerts: EmergencyAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Abnormal Heart Rate',
        message: 'Heart rate elevated above 110 bpm for more than 10 minutes',
        timestamp: new Date(Date.now() - 5 * 60000),
        acknowledged: false,
        actionRequired: true,
      },
      {
        id: '2',
        type: 'info',
        title: 'Medication Reminder',
        message: 'Blood pressure medication due in 30 minutes',
        timestamp: new Date(Date.now() - 2 * 60000),
        acknowledged: false,
      },
      {
        id: '3',
        type: 'critical',
        title: 'Sepsis Risk Detected',
        message: 'High probability of sepsis based on vital signs and lab indicators',
        timestamp: new Date(Date.now() - 1 * 60000),
        acknowledged: false,
        actionRequired: true,
      },
    ];
    setAlerts(mockAlerts);
  }, []);

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  return (
    <>
      {/* Emergency Mode Toggle */}
      <motion.button
        onClick={() => {
          setIsEmergencyMode(!isEmergencyMode);
          if (!isEmergencyMode && onEmergencyTrigger) {
            onEmergencyTrigger();
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: isEmergencyMode
            ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          border: 'none',
          boxShadow: isEmergencyMode
            ? '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.4)'
            : '0 4px 20px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
        }}
      >
        <Shield size={28} color="white" />
      </motion.button>

      {/* Alert Notification Badge */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        whileHover={{ scale: 1.1 }}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(6, 10, 20, 0.9)',
          border: `2px solid ${criticalCount > 0 ? '#ef4444' : '#3b82f6'}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
        }}
      >
        <Bell size={22} color={criticalCount > 0 ? '#ef4444' : '#22d3ee'} />
        {unacknowledgedCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: criticalCount > 0 ? '#ef4444' : '#3b82f6',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unacknowledgedCount}
          </span>
        )}
      </motion.button>

      {/* Alert Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 160,
              right: 24,
              width: 380,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              zIndex: 998,
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)'
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="#fbbf24" />
                Active Alerts
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 12, maxHeight: 400, overflowY: 'auto' }}>
              {alerts.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  No active alerts at this time.
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} style={{
                    padding: 16,
                    marginBottom: 12,
                    borderRadius: 12,
                    background: alert.type === 'critical' ? 'rgba(239, 68, 68, 0.1)'
                      : alert.type === 'warning' ? 'rgba(245, 158, 11, 0.1)'
                        : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${alert.type === 'critical' ? 'rgba(239, 68, 68, 0.3)'
                      : alert.type === 'warning' ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(59, 130, 246, 0.3)'
                      }`,
                    opacity: alert.acknowledged ? 0.6 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {alert.type === 'critical' && <AlertTriangle size={16} color="#ef4444" />}
                          {alert.type === 'warning' && <AlertTriangle size={16} color="#f59e0b" />}
                          {alert.type === 'info' && <Bell size={16} color="#3b82f6" />}
                          <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: alert.type === 'critical' ? '#fca5a5'
                              : alert.type === 'warning' ? '#fcd34d'
                                : '#93c5fd'
                          }}>
                            {alert.title}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                          {alert.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                          <Clock size={12} />
                          {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.acknowledged && (
                        <CheckCircle size={18} color="#10b981" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
