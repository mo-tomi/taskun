import React, { useState } from 'react';
import { Palette, Sun, Moon, Paintbrush } from 'lucide-react';
import { ThemeSettings } from '../../types';

interface ThemeCustomizerProps {
  settings: ThemeSettings;
  onSettingsChange: (settings: ThemeSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ 
  settings, 
  onSettingsChange, 
  isOpen, 
  onClose 
}: ThemeCustomizerProps) {
  const [previewSettings, setPreviewSettings] = useState(settings);

  if (!isOpen) return null;

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    const newSettings = { ...previewSettings, [key]: value };
    setPreviewSettings(newSettings);
  };

  const handleCustomColorChange = (key: string, value: string) => {
    const newSettings = {
      ...previewSettings,
      customColors: {
        ...previewSettings.customColors,
        [key]: value
      }
    };
    setPreviewSettings(newSettings);
  };

  const applyTheme = () => {
    onSettingsChange(previewSettings);
    onClose();
  };

  const presetThemes = [
    {
      name: 'ピンクグラデーション',
      mode: 'light' as const,
      primaryColor: '#EC4899',
      secondaryColor: '#F472B6',
      accentColor: '#BE185D'
    },
    {
      name: 'ブルーオーシャン',
      mode: 'light' as const,
      primaryColor: '#3B82F6',
      secondaryColor: '#60A5FA',
      accentColor: '#1D4ED8'
    },
    {
      name: 'ダークモード',
      mode: 'dark' as const,
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      accentColor: '#4F46E5'
    },
    {
      name: 'ナチュラルグリーン',
      mode: 'light' as const,
      primaryColor: '#10B981',
      secondaryColor: '#34D399',
      accentColor: '#059669'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">テーマカスタマイザー</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* プリセットテーマ */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">プリセットテーマ</h3>
            <div className="grid grid-cols-2 gap-3">
              {presetThemes.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => setPreviewSettings(theme)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {theme.mode === 'dark' ? (
                      <Moon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="font-medium text-gray-900">{theme.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* カスタムカラー */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">カスタムカラー</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    プライマリ
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={previewSettings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={previewSettings.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    セカンダリ
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={previewSettings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={previewSettings.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    アクセント
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={previewSettings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={previewSettings.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* プレビュー */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">プレビュー</h4>
                <div className="space-y-2">
                  <div
                    className="h-8 rounded-md flex items-center px-3 text-white font-medium"
                    style={{ backgroundColor: previewSettings.primaryColor }}
                  >
                    プライマリボタン
                  </div>
                  <div
                    className="h-6 rounded-md flex items-center px-3 text-white text-sm"
                    style={{ backgroundColor: previewSettings.secondaryColor }}
                  >
                    セカンダリ要素
                  </div>
                  <div
                    className="h-4 rounded-md"
                    style={{ backgroundColor: previewSettings.accentColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 適用ボタン */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={applyTheme}
              className="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium"
            >
              テーマを適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}