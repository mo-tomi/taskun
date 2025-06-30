import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

export const useTheme = (): ThemeConfig => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // localStorage から設定を読み込み、なければ 'system' をデフォルトに
        const saved = localStorage.getItem('taskun-theme');
        return (saved as Theme) || 'system';
    });

    const [isDark, setIsDark] = useState(false);

    // システムのダークモード設定を監視
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateIsDark = () => {
            if (theme === 'system') {
                setIsDark(mediaQuery.matches);
            } else {
                setIsDark(theme === 'dark');
            }
        };

        updateIsDark();
        mediaQuery.addEventListener('change', updateIsDark);

        return () => mediaQuery.removeEventListener('change', updateIsDark);
    }, [theme]);

    // DOM クラスの更新
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('taskun-theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
        setTheme(newTheme);
    };

    return {
        theme,
        setTheme,
        toggleTheme,
        isDark
    };
};

export default useTheme; 