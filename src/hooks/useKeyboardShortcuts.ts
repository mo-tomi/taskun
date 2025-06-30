import { useEffect, useCallback, useState } from 'react';

// ⌨️ キーボードショートカットの型定義
export interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    action: () => void;
    description: string;
    category: 'タスク' | 'ナビゲーション' | '表示' | '編集';
}

// 🎯 ショートカット管理フック
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled: boolean = true) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        // 入力要素内ではショートカットを無効化
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
            return;
        }

        const matchingShortcut = shortcuts.find(shortcut => {
            return (
                shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                !!shortcut.ctrlKey === event.ctrlKey &&
                !!shortcut.shiftKey === event.shiftKey &&
                !!shortcut.altKey === event.altKey &&
                !!shortcut.metaKey === event.metaKey
            );
        });

        if (matchingShortcut) {
            event.preventDefault();
            event.stopPropagation();
            matchingShortcut.action();
        }
    }, [shortcuts, enabled]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return { shortcuts };
};

// 🎨 ショートカットヘルプ表示フック
export const useShortcutHelp = () => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const showHelp = () => setIsVisible(true);
    const hideHelp = () => setIsVisible(false);
    const toggleHelp = () => setIsVisible((prev: boolean) => !prev);

    return {
        isVisible,
        showHelp,
        hideHelp,
        toggleHelp
    };
};

// 📱 デフォルトショートカット定義
export const createDefaultShortcuts = (callbacks: {
    onQuickAdd: () => void;
    onSearch: () => void;
    onToggleTheme: () => void;
    onShowStats: () => void;
    onShowHelp: () => void;
    onFocusToday: () => void;
    onNextDay: () => void;
    onPrevDay: () => void;
    onSelectAll: () => void;
    onDeleteSelected: () => void;
}): KeyboardShortcut[] => [
        // タスク管理
        {
            key: 'n',
            ctrlKey: true,
            action: callbacks.onQuickAdd,
            description: '新しいタスクを追加',
            category: 'タスク'
        },
        {
            key: 'f',
            ctrlKey: true,
            action: callbacks.onSearch,
            description: 'タスクを検索',
            category: 'タスク'
        },
        {
            key: 'a',
            ctrlKey: true,
            action: callbacks.onSelectAll,
            description: 'すべてのタスクを選択',
            category: 'タスク'
        },
        {
            key: 'Delete',
            action: callbacks.onDeleteSelected,
            description: '選択されたタスクを削除',
            category: 'タスク'
        },

        // ナビゲーション
        {
            key: 't',
            ctrlKey: true,
            action: callbacks.onFocusToday,
            description: '今日にフォーカス',
            category: 'ナビゲーション'
        },
        {
            key: 'ArrowLeft',
            altKey: true,
            action: callbacks.onPrevDay,
            description: '前の日',
            category: 'ナビゲーション'
        },
        {
            key: 'ArrowRight',
            altKey: true,
            action: callbacks.onNextDay,
            description: '次の日',
            category: 'ナビゲーション'
        },

        // 表示・設定
        {
            key: 'd',
            ctrlKey: true,
            action: callbacks.onToggleTheme,
            description: 'ダーク/ライトモード切り替え',
            category: '表示'
        },
        {
            key: 's',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onShowStats,
            description: '統計画面を表示',
            category: '表示'
        },
        {
            key: '?',
            action: callbacks.onShowHelp,
            description: 'ショートカットヘルプを表示',
            category: '表示'
        },
        {
            key: 'h',
            ctrlKey: true,
            action: callbacks.onShowHelp,
            description: 'ショートカットヘルプを表示',
            category: '表示'
        }
    ];

export default useKeyboardShortcuts; 