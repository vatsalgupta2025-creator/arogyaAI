import { useState } from 'react';
import {
    Plus, Phone, Calendar, FileText, MessageSquare,
    Pill, Activity, Mic, X, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    action: () => void;
}

interface QuickActionsPanelProps {
    onOpenChatbot?: () => void;
    onOpenEmergency?: () => void;
}

export default function QuickActionsPanel({ onOpenChatbot, onOpenEmergency }: QuickActionsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const quickActions: QuickAction[] = [
        {
            id: 'emergency',
            label: 'Emergency',
            icon: <Phone size={20} />,
            color: '#ef4444',
            action: () => onOpenEmergency?.()
        },
        {
            id: 'appointment',
            label: 'Book Appointment',
            icon: <Calendar size={20} />,
            color: '#3b82f6',
            action: () => console.log('Open appointment booking')
        },
        {
            id: 'report',
            label: 'View Reports',
            icon: <FileText size={20} />,
            color: '#8b5cf6',
            action: () => console.log('Open reports')
        },
        {
            id: 'chat',
            label: 'AI Copilot',
            icon: <MessageSquare size={20} />,
            color: '#22d3ee',
            action: () => onOpenChatbot?.()
        },
        {
            id: 'medication',
            label: 'Medications',
            icon: <Pill size={20} />,
            color: '#10b981',
            action: () => console.log('Open medications')
        },
        {
            id: 'vitals',
            label: 'Log Vitals',
            icon: <Activity size={20} />,
            color: '#f59e0b',
            action: () => console.log('Open vitals logging')
        },
    ];

    const handleVoiceToggle = () => {
        if (!isListening) {
            setIsListening(true);
            setShowVoiceInput(true);
            // Simulate voice recognition
            setTimeout(() => {
                setIsListening(false);
            }, 3000);
        } else {
            setIsListening(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 100 }}>
            {/* Main Quick Actions Button */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isExpanded
                        ? 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)'
                        : 'rgba(6, 10, 20, 0.9)',
                    border: '1px solid var(--border-glass)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                }}
            >
                <motion.div
                    animate={{ rotate: isExpanded ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Plus size={24} color="white" />
                </motion.div>
            </motion.button>

            {/* Quick Actions List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25 }}
                        style={{
                            position: 'absolute',
                            top: 56,
                            right: 0,
                            width: 200,
                            background: 'rgba(6, 10, 20, 0.98)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 16,
                            padding: 8,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <div style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            padding: '8px 12px 4px',
                        }}>
                            Quick Actions
                        </div>
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                    action.action();
                                    setIsExpanded(false);
                                }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '10px 12px',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: 10,
                                    color: 'var(--text-secondary)',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = action.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                }}
                            >
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: `${action.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: action.color,
                                }}>
                                    {action.icon}
                                </div>
                                {action.label}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Input Button */}
            <motion.button
                onClick={handleVoiceToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: isListening
                        ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                        : 'rgba(6, 10, 20, 0.9)',
                    border: `1px solid ${isListening ? '#ef4444' : 'var(--border-glass)'}`,
                    boxShadow: isListening
                        ? '0 0 20px rgba(239, 68, 68, 0.5)'
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                    marginTop: 8,
                }}
            >
                <motion.div
                    animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                >
                    <Mic size={22} color={isListening ? 'white' : 'var(--text-secondary)'} />
                </motion.div>
            </motion.button>

            {/* Voice Input Panel */}
            <AnimatePresence>
                {showVoiceInput && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: 120,
                            right: 0,
                            width: 280,
                            background: 'rgba(6, 10, 20, 0.98)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 16,
                            padding: 16,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>Voice Command</span>
                            <button
                                onClick={() => setShowVoiceInput(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 20,
                            background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 12,
                            marginBottom: 12,
                        }}>
                            <motion.div
                                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 8,
                                }}
                            >
                                <Mic size={24} color="white" />
                            </motion.div>
                            <span style={{ fontSize: 13, color: isListening ? '#ef4444' : 'var(--text-muted)' }}>
                                {isListening ? 'Listening...' : 'Tap to speak'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: 8,
                                    color: 'var(--text-secondary)',
                                    fontSize: 13,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                                    border: 'none',
                                    borderRadius: 8,
                                    color: 'white',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                }}
                            >
                                <Send size={14} /> Send
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
