import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Theme = 'dark' | 'light' | 'system';

interface ThemeToggleProps {
    onThemeChange?: (theme: Theme) => void;
}

export default function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        if (newTheme === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', isDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', newTheme);
        }
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
        onThemeChange?.(newTheme);
    };

    const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
        { value: 'light', label: 'Light', icon: <Sun size={16} /> },
        { value: 'system', label: 'System', icon: <Monitor size={16} /> },
    ];

    if (!mounted) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 12,
            border: '1px solid var(--border-glass)',
        }}>
            {themes.map(t => (
                <motion.button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        background: theme === t.value ? 'rgba(34, 211, 238, 0.15)' : 'transparent',
                        border: theme === t.value ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                        borderRadius: 8,
                        color: theme === t.value ? 'var(--accent-cyan)' : 'var(--text-muted)',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {t.icon}
                    {t.label}
                    {theme === t.value && <Check size={12} />}
                </motion.button>
            ))}
        </div>
    );
}
