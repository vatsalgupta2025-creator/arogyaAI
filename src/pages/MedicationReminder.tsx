import { useState } from 'react';
import { Pill, Clock, CheckCircle, AlertCircle, Plus, X, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    startDate: string;
    endDate?: string;
    color: string;
    takenToday: boolean[];
    notes?: string;
}

const defaultMedications: Medication[] = [
    {
        id: '1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        times: ['08:00'],
        startDate: '2024-01-15',
        color: '#3b82f6',
        takenToday: [false],
        notes: 'Take with food'
    },
    {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times: ['08:00', '20:00'],
        startDate: '2024-01-15',
        color: '#10b981',
        takenToday: [false, false],
        notes: 'Take after meals'
    },
    {
        id: '3',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        times: ['08:00'],
        startDate: '2024-01-15',
        color: '#f59e0b',
        takenToday: [true],
    },
    {
        id: '4',
        name: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily',
        times: ['22:00'],
        startDate: '2024-01-15',
        color: '#8b5cf6',
        takenToday: [false],
        notes: 'Take at bedtime'
    }
];

export default function MedicationReminder() {
    const [medications, setMedications] = useState<Medication[]>(defaultMedications);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date().toTimeString().slice(0, 5));
    const [activeTab, setActiveTab] = useState<'today' | 'schedule' | 'history'>('today');

    const today = new Date();
    const currentTime = today.toTimeString().slice(0, 5);

    // Get upcoming medications
    const upcomingMeds = medications
        .map(med => {
            const nextDose = med.times.find(time => time > currentTime);
            return { ...med, nextDose };
        })
        .filter(med => med.nextDose)
        .sort((a, b) => a.nextDose!.localeCompare(b.nextDose!));

    // Get overdue medications
    const overdueMeds = medications
        .map(med => {
            const missedDoses = med.times.filter(time => time < currentTime && !med.takenToday[med.times.indexOf(time)]);
            return { ...med, missedDoses };
        })
        .filter(med => med.missedDoses.length > 0);

    const markAsTaken = (medicationId: string, doseIndex: number) => {
        setMedications(prev => prev.map(med => {
            if (med.id === medicationId) {
                const newTakenToday = [...med.takenToday];
                newTakenToday[doseIndex] = true;
                return { ...med, takenToday: newTakenToday };
            }
            return med;
        }));
    };

    const markAsSkipped = (medicationId: string, doseIndex: number) => {
        setMedications(prev => prev.map(med => {
            if (med.id === medicationId) {
                const newTakenToday = [...med.takenToday];
                newTakenToday[doseIndex] = true; // Mark as skipped (we could add a separate skipped array)
                return { ...med, takenToday: newTakenToday };
            }
            return med;
        }));
    };

    const adherenceRate = medications.length > 0
        ? Math.round((medications.reduce((acc, med) => acc + med.takenToday.filter(t => t).length, 0) /
            medications.reduce((acc, med) => acc + med.times.length, 0)) * 100)
        : 0;

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Pill size={28} color="var(--accent-cyan)" />
                        Medication Reminder
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        Track your medications and stay on top of your treatment plan
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                        border: 'none',
                        borderRadius: 10,
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    <Plus size={18} /> Add Medication
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} color="var(--accent-cyan)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Adherence Rate</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: adherenceRate >= 80 ? '#10b981' : adherenceRate >= 60 ? '#f59e0b' : '#ef4444' }}>
                        {adherenceRate}%
                    </div>
                </div>

                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={20} color="#ef4444" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Overdue</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: overdueMeds.length > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                        {overdueMeds.reduce((acc, med) => acc + med.missedDoses.length, 0)}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={20} color="#fbbf24" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Upcoming</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {upcomingMeds.length}
                    </div>
                </div>

                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Pill size={20} color="#8b5cf6" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Medications</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {medications.length}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border-glass)', paddingBottom: 12 }}>
                {(['today', 'schedule', 'history'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '10px 20px',
                            background: activeTab === tab ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                            border: activeTab === tab ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                            borderRadius: 8,
                            color: activeTab === tab ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                        }}
                    >
                        {tab === 'today' ? "Today's Schedule" : tab === 'schedule' ? 'Full Schedule' : 'History'}
                    </button>
                ))}
            </div>

            {/* Overdue Alert */}
            {overdueMeds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}
                >
                    <AlertCircle size={24} color="#ef4444" />
                    <div>
                        <span style={{ fontWeight: 600, color: '#ef4444' }}>You have {overdueMeds.reduce((acc, med) => acc + med.missedDoses.length, 0)} overdue dose(s)! </span>
                        <span style={{ color: 'var(--text-secondary)' }}>Please take your medication as soon as possible.</span>
                    </div>
                </motion.div>
            )}

            {/* Medication List */}
            <div style={{ display: 'grid', gap: 12 }}>
                {activeTab === 'today' && medications.map(med => (
                    <div key={med.id} style={{
                        background: 'rgba(6, 10, 20, 0.6)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 16,
                        padding: 20,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: med.color }} />
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{med.name}</h3>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>{med.dosage} • {med.frequency}</p>
                                </div>
                            </div>
                            {med.notes && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 6 }}>
                                    {med.notes}
                                </span>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {med.times.map((time, index) => {
                                const isOverdue = time < currentTime && !med.takenToday[index];
                                const isTaken = med.takenToday[index];

                                return (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '10px 16px',
                                        background: isTaken
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : isOverdue
                                                ? 'rgba(239, 68, 68, 0.15)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${isTaken ? 'rgba(16, 185, 129, 0.3)' : isOverdue ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass)'}`,
                                        borderRadius: 10,
                                    }}>
                                        <Clock size={16} color={isTaken ? '#10b981' : isOverdue ? '#ef4444' : 'var(--text-muted)'} />
                                        <span style={{ fontWeight: 600, color: isTaken ? '#10b981' : isOverdue ? '#ef4444' : 'var(--text-primary)' }}>
                                            {time}
                                        </span>
                                        {isTaken ? (
                                            <CheckCircle size={16} color="#10b981" />
                                        ) : isOverdue ? (
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    onClick={() => markAsTaken(med.id, index)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: '#10b981',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        color: 'white',
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Take Now
                                                </button>
                                                <button
                                                    onClick={() => markAsSkipped(med.id, index)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: 'transparent',
                                                        border: '1px solid var(--border-glass)',
                                                        borderRadius: 6,
                                                        color: 'var(--text-muted)',
                                                        fontSize: 12,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Skip
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Upcoming</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {activeTab === 'schedule' && (
                    <div style={{
                        background: 'rgba(6, 10, 20, 0.6)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 16,
                        padding: 20,
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Weekly Schedule</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} style={{
                                    textAlign: 'center',
                                    padding: 12,
                                    background: day === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][today.getDay() - 1]
                                        ? 'rgba(34, 211, 238, 0.15)'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    border: day === ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][today.getDay() - 1]
                                        ? '1px solid var(--accent-cyan)'
                                        : '1px solid var(--border-glass)',
                                    borderRadius: 8,
                                }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{day}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                        {medications.filter(m => m.frequency.includes('daily')).length} meds
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div style={{
                        background: 'rgba(6, 10, 20, 0.6)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 16,
                        padding: 20,
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Last 7 Days</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Array.from({ length: 7 }, (_, i) => {
                                const date = new Date(today);
                                date.setDate(date.getDate() - i);
                                const dayAdherence = Math.floor(70 + Math.random() * 30);

                                return (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        borderRadius: 10,
                                    }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ width: `${dayAdherence}%`, height: '100%', background: dayAdherence >= 80 ? '#10b981' : dayAdherence >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: dayAdherence >= 80 ? '#10b981' : dayAdherence >= 60 ? '#f59e0b' : '#ef4444', width: 40, textAlign: 'right' }}>
                                                {dayAdherence}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Medication Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: 'rgba(6, 10, 20, 0.98)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: 20,
                            padding: 24,
                            width: 450,
                            maxWidth: '90vw',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add Medication</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Medication Name</label>
                                <input type="text" placeholder="e.g., Lisinopril" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14 }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Dosage</label>
                                    <input type="text" placeholder="e.g., 10mg" style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14 }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Frequency</label>
                                    <select style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14 }}>
                                        <option>Once daily</option>
                                        <option>Twice daily</option>
                                        <option>Three times daily</option>
                                        <option>As needed</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Time(s)</label>
                                <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Notes (optional)</label>
                                <textarea placeholder="e.g., Take with food" rows={2} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14, resize: 'none' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Add Medication
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
