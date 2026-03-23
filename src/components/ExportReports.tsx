import { useState } from 'react';
import { Download, Share2, FileText, FileJson, FileSpreadsheet, Mail, Printer, Check, X, Calendar, User, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportData {
    id: string;
    name: string;
    type: 'vitals' | 'diagnosis' | 'medication' | 'full';
    date: string;
    size: string;
}

interface ExportReportsProps {
    patientName?: string;
    patientId?: string;
}

const mockReports: ReportData[] = [
    { id: '1', name: 'Vitals Summary Report', type: 'vitals', date: '2024-03-20', size: '245 KB' },
    { id: '2', name: 'Diagnosis Report', type: 'diagnosis', date: '2024-03-18', size: '128 KB' },
    { id: '3', name: 'Medication List', type: 'medication', date: '2024-03-15', size: '89 KB' },
    { id: '4', name: 'Complete Health Record', type: 'full', date: '2024-03-10', size: '1.2 MB' },
];

export default function ExportReports({ patientName = 'John Doe', patientId = 'P-12345' }: ExportReportsProps) {
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState('');

    const toggleReport = (id: string) => {
        setSelectedReports(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedReports.length === mockReports.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(mockReports.map(r => r.id));
        }
    };

    const handleExport = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleShare = () => {
        if (shareEmail) {
            setShowShareModal(false);
            setShareEmail('');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'vitals': return <Activity size={16} />;
            case 'diagnosis': return <FileText size={16} />;
            case 'medication': return <FileText size={16} />;
            case 'full': return <FileText size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'vitals': return 'Vitals';
            case 'diagnosis': return 'Diagnosis';
            case 'medication': return 'Medication';
            case 'full': return 'Full Record';
            default: return type;
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Download size={28} color="var(--accent-cyan)" />
                    Export & Share Reports
                </h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Export your health records or share them with healthcare providers
                </p>
            </div>

            {/* Patient Info */}
            <div style={{
                background: 'rgba(6, 10, 20, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={24} color="var(--accent-cyan)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{patientName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>ID: {patientId}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                    <Calendar size={16} />
                    Generated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Export Format Selection */}
            <div style={{
                background: 'rgba(6, 10, 20, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
            }}>
                <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Export Format</h3>
                <div style={{ display: 'flex', gap: 12 }}>
                    {[
                        { value: 'pdf', label: 'PDF', icon: <FileText size={18} />, desc: 'Best for printing' },
                        { value: 'json', label: 'JSON', icon: <FileJson size={18} />, desc: 'Best for data' },
                        { value: 'csv', label: 'CSV', icon: <FileSpreadsheet size={18} />, desc: 'Best for spreadsheets' },
                    ].map(format => (
                        <button
                            key={format.value}
                            onClick={() => setExportFormat(format.value as 'pdf' | 'json' | 'csv')}
                            style={{
                                flex: 1,
                                padding: '16px 20px',
                                background: exportFormat === format.value ? 'rgba(34, 211, 238, 0.15)' : 'rgba(255,255,255,0.03)',
                                border: exportFormat === format.value ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                                borderRadius: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                cursor: 'pointer',
                                color: exportFormat === format.value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            }}
                        >
                            {format.icon}
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{format.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Report Selection */}
            <div style={{
                background: 'rgba(6, 10, 20, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontWeight: 600 }}>Select Reports</h3>
                    <button
                        onClick={selectAll}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-cyan)',
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        {selectedReports.length === mockReports.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mockReports.map(report => (
                        <motion.div
                            key={report.id}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => toggleReport(report.id)}
                            style={{
                                background: selectedReports.includes(report.id) ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${selectedReports.includes(report.id) ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                                borderRadius: 12,
                                padding: '14px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{
                                width: 20,
                                height: 20,
                                borderRadius: 6,
                                border: selectedReports.includes(report.id) ? 'none' : '2px solid var(--border-glass)',
                                background: selectedReports.includes(report.id) ? 'var(--accent-cyan)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {selectedReports.includes(report.id) && <Check size={14} color="black" />}
                            </div>
                            <div style={{ color: selectedReports.includes(report.id) ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                                {getTypeIcon(report.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 500, fontSize: 14 }}>{report.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {getTypeLabel(report.type)} • {report.date} • {report.size}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    onClick={handleExport}
                    disabled={selectedReports.length === 0}
                    style={{
                        flex: 1,
                        padding: '16px 24px',
                        background: selectedReports.length > 0
                            ? 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)'
                            : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 12,
                        color: selectedReports.length > 0 ? 'white' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: selectedReports.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    <Download size={20} />
                    Export {selectedReports.length > 0 && `(${selectedReports.length})`}
                </button>
                <button
                    onClick={() => setShowShareModal(true)}
                    disabled={selectedReports.length === 0}
                    style={{
                        flex: 1,
                        padding: '16px 24px',
                        background: selectedReports.length > 0
                            ? 'rgba(34, 211, 238, 0.15)'
                            : 'rgba(255,255,255,0.1)',
                        border: selectedReports.length > 0 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                        borderRadius: 12,
                        color: selectedReports.length > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: selectedReports.length > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    <Share2 size={20} />
                    Share with Doctor
                </button>
                <button
                    style={{
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 12,
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}
                >
                    <Printer size={20} />
                    Print
                </button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        style={{
                            position: 'fixed',
                            bottom: 24,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: 12,
                            padding: '16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            color: 'white',
                            fontWeight: 600,
                            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                            zIndex: 1000,
                        }}
                    >
                        <Check size={20} />
                        Report exported successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: 'rgba(6, 10, 20, 0.98)',
                                border: '1px solid var(--border-glass)',
                                borderRadius: 20,
                                padding: 24,
                                width: 420,
                                maxWidth: '90vw',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Share Reports</h2>
                                <button onClick={() => setShowShareModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Recipient Email</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10 }}>
                                    <Mail size={18} color="var(--text-muted)" />
                                    <input
                                        type="email"
                                        value={shareEmail}
                                        onChange={(e) => setShareEmail(e.target.value)}
                                        placeholder="doctor@hospital.com"
                                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: 14, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Message (optional)</label>
                                <textarea
                                    placeholder="Add a note for the recipient..."
                                    rows={3}
                                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'white', fontSize: 14, resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border-glass)', borderRadius: 10, color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleShare}
                                    style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Send Share Link
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
