import { useState, useCallback } from 'react';
import { UserSettings, AccessibilitySettings, ThemeSettings } from '../types';
import { useLocalStorage } from './useLocalStorage';

const defaultAccessibilitySettings: AccessibilitySettings = {
  mode: 'normal',
  font: 'default',
  blockSpacing: 'normal',
  colorPattern: 'default',
  reduceAnimations: false,
  increaseFontSize: false
};

const defaultThemeSettings: ThemeSettings = {
  mode: 'light',
  primaryColor: '#EC4899',
  secondaryColor: '#F472B6',
  accentColor: '#BE185D'
};

const defaultUserSettings: UserSettings = {
  theme: defaultThemeSettings,
  accessibility: defaultAccessibilitySettings,
  notifications: {
    defaultTriggers: [
      { id: '1', type: 'before', value: 5, enabled: true },
      { id: '2', type: 'start', value: 0, enabled: true }
    ],
    webPushEnabled: false
  },
  energy: {
    trackingEnabled: true,
    heartRateIntegration: false
  }
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('user-settings', defaultUserSettings);

  const updateAccessibilitySettings = useCallback((newSettings: AccessibilitySettings) => {
    setSettings(prev => ({
      ...prev,
      accessibility: newSettings
    }));
  }, [setSettings]);

  const updateThemeSettings = useCallback((newSettings: ThemeSettings) => {
    setSettings(prev => ({
      ...prev,
      theme: newSettings
    }));
  }, [setSettings]);

  const updateNotificationSettings = useCallback((newSettings: Partial<UserSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...newSettings
      }
    }));
  }, [setSettings]);

  const updateEnergySettings = useCallback((newSettings: Partial<UserSettings['energy']>) => {
    setSettings(prev => ({
      ...prev,
      energy: {
        ...prev.energy,
        ...newSettings
      }
    }));
  }, [setSettings]);

  // CSS変数を動的に適用
  const applyThemeToDOM = useCallback((theme: ThemeSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-secondary', theme.secondaryColor);
    root.style.setProperty('--color-accent', theme.accentColor);
    
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // アクセシビリティ設定をDOMに適用
  const applyAccessibilityToDOM = useCallback((accessibility: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // フォント設定
    root.setAttribute('data-font', accessibility.font);
    
    // ブロック間隔
    root.setAttribute('data-spacing', accessibility.blockSpacing);
    
    // カラーパターン
    root.setAttribute('data-color-pattern', accessibility.colorPattern);
    
    // アニメーション設定
    if (accessibility.reduceAnimations) {
      root.style.setProperty('--animation-duration', '0.01s');
    } else {
      root.style.removeProperty('--animation-duration');
    }
    
    // フォントサイズ
    if (accessibility.increaseFontSize) {
      root.style.setProperty('--font-scale', '1.2');
    } else {
      root.style.removeProperty('--font-scale');
    }
  }, []);

  return {
    settings,
    updateAccessibilitySettings,
    updateThemeSettings,
    updateNotificationSettings,
    updateEnergySettings,
    applyThemeToDOM,
    applyAccessibilityToDOM
  };
}