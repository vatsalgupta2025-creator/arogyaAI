import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePatient } from '../hooks/PatientContext';

export default function PatientInput() {
    const navigate = useNavigate();
    const { setPatient } = usePatient();
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        age: '',
        disease: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPatient({
            name: formData.name,
            gender: formData.gender,
            age: parseInt(formData.age) || 0,
            disease: formData.disease
        });
        navigate('/dashboard');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 24,
                    padding: 40,
                    maxWidth: 450,
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: 30, height: 30 }}>
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </motion.div>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#fff',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fbbf24, #fff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Enter Patient Details
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 14 }}>
                        This information will personalize your health dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: 16,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                            Gender
                        </label>
                        <select
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: 16,
                                outline: 'none',
                                boxSizing: 'border-box',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: '#1e1b4b' }}>Select gender</option>
                            <option value="Male" style={{ background: '#1e1b4b' }}>Male</option>
                            <option value="Female" style={{ background: '#1e1b4b' }}>Female</option>
                            <option value="Other" style={{ background: '#1e1b4b' }}>Other</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                            Age
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="150"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            placeholder="Enter your age"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: 16,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                            Medical Condition / Disease
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.disease}
                            onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                            placeholder="e.g., Diabetes, Hypertension, None"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#fff',
                                fontSize: 16,
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        style={{
                            padding: '16px 32px',
                            borderRadius: 12,
                            border: 'none',
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            color: '#0f172a',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginTop: 8
                        }}
                    >
                        Continue to Dashboard
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}