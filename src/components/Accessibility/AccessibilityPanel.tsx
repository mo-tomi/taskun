import React from 'react';
import { Eye, Type, Palette, Zap, Volume2 } from 'lucide-react';
import { AccessibilitySettings } from '../../types';

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ 
  settings, 
  onSettingsChange, 
  isOpen, 
  onClose 
}: AccessibilityPanelProps) {
  if (!isOpen) return null;

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">アクセシビリティ設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 表示モード */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">表示モード</h3>
            </div>
            <div className="space-y-2">
              {[
                { value: 'normal', label: '標準', desc: 'デフォルトの表示' },
                { value: 'focus', label: '集中', desc: '余白を拡大、要素を大きく' },
                { value: 'low-stimulation', label: '低刺激', desc: 'アニメーション最小化' }
              ].map(({ value, label, desc }) => (
                <label key={value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value={value}
                    checked={settings.mode === value}
                    onChange={(e) => handleSettingChange('mode', e.target.value)}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* フォント設定 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Type className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">フォント</h3>
            </div>
            <select
              value={settings.font}
              onChange={(e) => handleSettingChange('font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">標準フォント</option>
              <option value="opendyslexic">OpenDyslexic（読字障害対応）</option>
              <option value="wide-gothic">幅広ゴシック</option>
            </select>
          </div>

          {/* ブロック間隔 */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">ブロック間隔</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'compact', label: 'コンパクト' },
                { value: 'normal', label: '標準' },
                { value: 'wide', label: '広い' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('blockSpacing', value)}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    settings.blockSpacing === value
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* カラーパターン */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">カラーパターン</h3>
            </div>
            <div className="space-y-2">
              {[
                { value: 'default', label: '標準', colors: ['#EC4899', '#3B82F6', '#10B981'] },
                { value: 'colorblind-safe', label: '色覚多様性対応', colors: ['#E69F00', '#56B4E9', '#009E73'] },
                { value: 'high-contrast', label: 'ハイコントラスト', colors: ['#000000', '#FFFFFF', '#FF0000'] }
              ].map(({ value, label, colors }) => (
                <label key={value} className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="colorPattern"
                      value={value}
                      checked={settings.colorPattern === value}
                      onChange={(e) => handleSettingChange('colorPattern', e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-gray-900">{label}</span>
                  </div>
                  <div className="flex space-x-1">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* その他の設定 */}
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="font-medium text-gray-900">アニメーションを減らす</span>
              <input
                type="checkbox"
                checked={settings.reduceAnimations}
                onChange={(e) => handleSettingChange('reduceAnimations', e.target.checked)}
                className="rounded text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="font-medium text-gray-900">フォントサイズを大きくする</span>
              <input
                type="checkbox"
                checked={settings.increaseFontSize}
                onChange={(e) => handleSettingChange('increaseFontSize', e.target.checked)}
                className="rounded text-blue-600"
              />
            </label>
          </div>

          {/* 適用ボタン */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              設定を適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}