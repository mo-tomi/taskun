import { useEffect } from 'react';

export type Theme = 'light';

interface ThemeConfig {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

export const useTheme = (): ThemeConfig => {
    useEffect(() => {
        // 常にライトテーマで表示するため、dark クラスを外す
        document.documentElement.classList.remove('dark');
    }, []);

    const setTheme = () => {
        // ダークモードを廃止したため何もしない
    };

    const toggleTheme = () => {
        // ダークモードを廃止したため何もしない
    };

    return {
        theme: 'light',
        setTheme,
        toggleTheme,
        isDark: false
    };
};

export default useTheme;
