import React from 'react';
import { X, Keyboard, Search, Plus, Calendar, Settings } from 'lucide-react';
import { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

// 🎨 ショートカットヘルプモーダルの Props
interface ShortcutHelpProps {
    isOpen: boolean;
    shortcuts: KeyboardShortcut[];
    onClose: () => void;
}

// ⌨️ キーボードキーの表示コンポーネント
const KeyDisplay: React.FC<{ keys: string[] }> = ({ keys }) => (
    <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
            <React.Fragment key={key}>
                {index > 0 && <span className="text-neutral-400 text-sm">+</span>}
                <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 shadow-sm">
                    {key}
                </kbd>
            </React.Fragment>
        ))}
    </div>
);

// 🎯 カテゴリーアイコンの取得
const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'タスク':
            return <Plus className="w-4 h-4 text-blue-500" />;
        case 'ナビゲーション':
            return <Calendar className="w-4 h-4 text-green-500" />;
        case '表示':
            return <Search className="w-4 h-4 text-purple-500" />;
        case '編集':
            return <Settings className="w-4 h-4 text-orange-500" />;
        default:
            return <Keyboard className="w-4 h-4 text-neutral-500" />;
    }
};

// 🔧 ショートカットキーの表示形式を整形
const formatShortcutKeys = (shortcut: KeyboardShortcut): string[] => {
    const keys: string[] = [];

    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.metaKey) keys.push('Cmd');

    // 特殊キーの表示名を調整
    let keyDisplay = shortcut.key;
    switch (shortcut.key) {
        case 'ArrowLeft':
            keyDisplay = '←';
            break;
        case 'ArrowRight':
            keyDisplay = '→';
            break;
        case 'ArrowUp':
            keyDisplay = '↑';
            break;
        case 'ArrowDown':
            keyDisplay = '↓';
            break;
        case ' ':
            keyDisplay = 'Space';
            break;
        case 'Delete':
            keyDisplay = 'Del';
            break;
        case '?':
            keyDisplay = '?';
            break;
        default:
            keyDisplay = shortcut.key.toUpperCase();
    }

    keys.push(keyDisplay);
    return keys;
};

// 🎨 メインのショートカットヘルプモーダル
export const ShortcutHelp: React.FC<ShortcutHelpProps> = ({
    isOpen,
    shortcuts,
    onClose
}) => {
    if (!isOpen) return null;

    // カテゴリー別にショートカットをグループ化
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* バックドロップ */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* モーダルコンテンツ */}
            <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden animate-scale-in">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-primary">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Keyboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">キーボードショートカット</h2>
                            <p className="text-white/80 text-sm">効率的にタスクを管理しましょう</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        aria-label="ヘルプを閉じる"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* コンテンツ */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                            <div key={category} className="space-y-4">
                                {/* カテゴリーヘッダー */}
                                <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                                    {getCategoryIcon(category)}
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        {category}
                                    </h3>
                                </div>

                                {/* ショートカット一覧 */}
                                <div className="space-y-3">
                                    {categoryShortcuts.map((shortcut, index) => (
                                        <div
                                            key={`${category}-${index}`}
                                            className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                                                    {shortcut.description}
                                                </p>
                                            </div>
                                            <KeyDisplay keys={formatShortcutKeys(shortcut)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* フッター情報 */}
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                            <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded">
                                <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                    ヒント
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• 入力フィールド内ではショートカットは無効になります</li>
                                    <li>• 一部のショートカットはブラウザの機能と重複する場合があります</li>
                                    <li>• <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">?</kbd> キーでいつでもこのヘルプを表示できます</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortcutHelp; 