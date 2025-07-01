import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, User, Eye, Volume2, Clock,
    Save, RotateCcw, Zap,
    Type, Contrast, MousePointer
} from 'lucide-react';

export interface PersonalizationSettings {
    // 表示設定
    showCompletedTasks: boolean;
    showEnergyLevels: boolean;
    compactMode: boolean;
    showAnimations: boolean;

    // 通知設定
    soundEnabled: boolean;
    taskReminders: boolean;
    energyReminders: boolean;

    // 作業設定
    defaultTaskDuration: number;
    workingHours: {
        start: string;
        end: string;
    };

    // アクセシビリティ
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
}

interface PersonalizationSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: PersonalizationSettings;
    onSave: (settings: PersonalizationSettings) => void;
}

const PersonalizationSettingsComponent: React.FC<PersonalizationSettingsProps> = ({
    isOpen,
    onClose,
    currentSettings,
    onSave
}) => {
    const [settings, setSettings] = useState<PersonalizationSettings>(currentSettings);
    const [hasChanges, setHasChanges] = useState(false);

    const handleSettingChange = <K extends keyof PersonalizationSettings>(
        key: K,
        value: PersonalizationSettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };



    const handleSave = () => {
        onSave(settings);
        setHasChanges(false);
    };

    const handleReset = () => {
        setSettings(currentSettings);
        setHasChanges(false);
    };





    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            パーソナライゼーション設定
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">表示設定</h4>

                            {[
                                { key: 'showCompletedTasks', label: '完了したタスクを表示', description: '完了済みタスクも表示します' },
                                { key: 'showEnergyLevels', label: 'エネルギーレベルを表示', description: 'エネルギー追跡を表示します' },
                                { key: 'compactMode', label: 'コンパクトモード', description: '情報を密に表示します' },
                                { key: 'showAnimations', label: 'アニメーションを有効', description: 'スムーズなアニメーション効果' }
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {setting.label}
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange(setting.key as any, !settings[setting.key as keyof PersonalizationSettings])}
                                        className={`
                                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                            ${settings[setting.key as keyof PersonalizationSettings] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                                        `}
                                    >
                                        <span
                                            className={`
                                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${settings[setting.key as keyof PersonalizationSettings] ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 dark:text-white">アクセシビリティ</h4>

                            {[
                                { key: 'reducedMotion', label: 'モーション軽減', description: 'アニメーションを最小限に' },
                                { key: 'screenReaderOptimized', label: 'スクリーンリーダー最適化', description: 'スクリーンリーダー対応を強化' },
                                { key: 'keyboardNavigation', label: 'キーボードナビゲーション', description: 'キーボード操作を強化' }
                            ].map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {setting.label}
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleSettingChange(setting.key as any, !settings[setting.key as keyof PersonalizationSettings])}
                                        className={`
                                            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                            ${settings[setting.key as keyof PersonalizationSettings] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                                        `}
                                    >
                                        <span
                                            className={`
                                                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${settings[setting.key as keyof PersonalizationSettings] ? 'translate-x-6' : 'translate-x-1'}
                                            `}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                        onClick={handleReset}
                        disabled={!hasChanges}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>リセット</span>
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            <span>保存</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PersonalizationSettingsComponent; 