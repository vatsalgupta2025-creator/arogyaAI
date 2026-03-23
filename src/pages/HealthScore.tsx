import { useState, useEffect } from 'react';
import { Heart, Activity, Brain, Moon, Droplets, Apple, Scale, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface HealthScoreData {
    category: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
    icon: React.ReactNode;
    color: string;
    details: string;
}

const generateWeeklyData = () => {
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            score: Math.floor(65 + Math.random() * 30),
        };
    });
};

const healthCategories: HealthScoreData[] = [
    { category: 'Cardiovascular', score: 85, trend: 'up', icon: <Heart size={20} />, color: '#ef4444', details: 'Heart rate & blood pressure optimal' },
    { category: 'Respiratory', score: 92, trend: 'stable', icon: <Activity size={20} />, color: '#22d3ee', details: 'Oxygen saturation stable' },
    { category: 'Neurological', score: 78, trend: 'up', icon: <Brain size={20} />, color: '#8b5cf6', details: 'Cognitive function improving' },
    { category: 'Sleep Quality', score: 72, trend: 'down', icon: <Moon size={20} />, color: '#6366f1', details: 'Sleep duration below target' },
    { category: 'Hydration', score: 88, trend: 'stable', icon: <Droplets size={20} />, color: '#3b82f6', details: 'Water intake adequate' },
    { category: 'Nutrition', score: 81, trend: 'up', icon: <Apple size={20} />, color: '#10b981', details: 'Balanced diet maintained' },
    { category: 'Weight', score: 75, trend: 'stable', icon: <Scale size={20} />, color: '#f59e0b', details: 'BMI within healthy range' },
];

export default function HealthScore() {
    const [weeklyData] = useState(generateWeeklyData());
    const [overallScore, setOverallScore] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<HealthScoreData | null>(null);

    useEffect(() => {
        // Calculate overall score
        const total = healthCategories.reduce((acc, cat) => acc + cat.score, 0);
        setOverallScore(Math.round(total / healthCategories.length));
    }, []);

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp size={16} color="#10b981" />;
            case 'down': return <TrendingDown size={16} color="#ef4444" />;
            default: return <Minus size={16} color="#6b7280" />;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const radarData = healthCategories.map(cat => ({
        category: cat.category,
        score: cat.score,
        fullMark: 100,
    }));

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Shield size={28} color="var(--accent-cyan)" />
                    Health Score
                </h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Composite health metrics based on your vitals, lifestyle, and medical data
                </p>
            </div>

            {/* Overall Score Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(6, 10, 20, 0.9) 0%, rgba(20, 30, 50, 0.9) 100%)',
                border: '1px solid var(--border-glass)',
                borderRadius: 24,
                padding: 32,
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 40,
            }}>
                <div style={{ position: 'relative', width: 180, height: 180 }}>
                    <svg width="180" height="180" viewBox="0 0 180 180">
                        {/* Background circle */}
                        <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                        {/* Progress circle */}
                        <motion.circle
                            cx="90"
                            cy="90"
                            r="80"
                            fill="none"
                            stroke={getScoreColor(overallScore)}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${overallScore * 5.02} 502`}
                            transform="rotate(-90 90 90)"
                            initial={{ strokeDasharray: '0 502' }}
                            animate={{ strokeDasharray: `${overallScore * 5.02} 502` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{ filter: `drop-shadow(0 0 10px ${getScoreColor(overallScore)}50)` }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ fontSize: 48, fontWeight: 700, color: getScoreColor(overallScore) }}
                        >
                            {overallScore}
                        </motion.span>
                        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>out of 100</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>Your Overall Health Score</h2>
                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Based on 7 key health dimensions including cardiovascular, respiratory, neurological,
                        sleep, hydration, nutrition, and weight metrics.
                    </p>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                background: `${getScoreColor(overallScore)}20`,
                                borderRadius: 20,
                                color: getScoreColor(overallScore),
                                fontWeight: 600,
                                fontSize: 14,
                            }}>
                                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Attention'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Trend (7 days)</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#10b981' }}>
                                <TrendingUp size={18} /> +5 points
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Weekly Trend Chart */}
                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Weekly Trend</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'rgba(6, 10, 20, 0.95)', border: '1px solid var(--border-glass)', borderRadius: 8 }}
                                labelStyle={{ color: 'white' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} fill="url(#scoreGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar Chart */}
                <div style={{
                    background: 'rgba(6, 10, 20, 0.6)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 16,
                    padding: 20,
                }}>
                    <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Health Dimensions</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Health Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Cards */}
            <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Health Categories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {healthCategories.map((category, index) => (
                    <motion.div
                        key={category.category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedCategory(category)}
                        style={{
                            background: selectedCategory?.category === category.category
                                ? 'rgba(34, 211, 238, 0.1)'
                                : 'rgba(6, 10, 20, 0.6)',
                            border: `1px solid ${selectedCategory?.category === category.category ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                            borderRadius: 16,
                            padding: 20,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 10,
                                    background: `${category.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: category.color,
                                }}>
                                    {category.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{category.category}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{category.details}</div>
                                </div>
                            </div>
                            {getTrendIcon(category.trend)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${category.score}%` }}
                                    transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
                                    style={{ height: '100%', background: category.color, borderRadius: 3 }}
                                />
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 18, color: getScoreColor(category.score), minWidth: 40, textAlign: 'right' }}>
                                {category.score}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recommendations */}
            <div style={{
                background: 'rgba(6, 10, 20, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: 16,
                padding: 20,
                marginTop: 24,
            }}>
                <h3 style={{ margin: '0 0 16px 0', fontWeight: 600 }}>Recommendations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                    {[
                        { title: 'Improve Sleep', desc: 'Aim for 7-8 hours of sleep. Consider reducing screen time before bed.', priority: 'high' },
                        { title: 'Increase Activity', desc: 'Add 30 minutes of moderate exercise to your daily routine.', priority: 'medium' },
                        { title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water today.', priority: 'low' },
                    ].map((rec, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 12,
                            padding: 16,
                            borderLeft: `3px solid ${rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981'}`,
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{rec.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rec.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
