import { useCallback, useMemo } from 'react';
import { useKeyboardShortcuts, KeyboardShortcut } from './useKeyboardShortcuts';

interface EnhancedShortcutCallbacks {
    // 基本操作
    onQuickAdd: () => void;
    onSearch: () => void;
    onToggleTheme: () => void;
    onShowStats: () => void;
    onShowHelp: () => void;

    // ナビゲーション
    onFocusToday: () => void;
    onNextDay: () => void;
    onPrevDay: () => void;
    onNextWeek: () => void;
    onPrevWeek: () => void;
    onGoToDate: () => void;

    // タスク操作
    onSelectAll: () => void;
    onDeleteSelected: () => void;
    onCompleteSelected: () => void;
    onDuplicateSelected: () => void;
    onEditSelected: () => void;

    // 表示・フィルタリング
    onToggleCompletedTasks: () => void;
    onToggleHabits: () => void;
    onToggleEnergyView: () => void;
    onToggleTodoList: () => void;
    onToggleAnalytics: () => void;

    // クイックアクション
    onQuickSchedule: () => void;
    onAddBreak: () => void;
    onStartFocus: () => void;
    onToggleTimeline: () => void;

    // 編集・操作
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onExport: () => void;

    // エネルギー管理
    onLogEnergy: () => void;
    onEnergyBreak: () => void;

    // アクセシビリティ
    onToggleHighContrast: () => void;
    onIncreaseFontSize: () => void;
    onDecreaseFontSize: () => void;
}

export const useEnhancedKeyboardShortcuts = (
    callbacks: EnhancedShortcutCallbacks,
    enabled: boolean = true
) => {
    // 拡張ショートカット定義
    const enhancedShortcuts: KeyboardShortcut[] = useMemo(() => [
        // === タスク管理 ===
        {
            key: 'n',
            ctrlKey: true,
            action: callbacks.onQuickAdd,
            description: '新しいタスクを追加',
            category: 'タスク'
        },
        {
            key: 'n',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onQuickSchedule,
            description: 'クイックスケジュール',
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
        {
            key: 'Enter',
            action: callbacks.onCompleteSelected,
            description: '選択されたタスクを完了',
            category: 'タスク'
        },
        {
            key: 'd',
            ctrlKey: true,
            action: callbacks.onDuplicateSelected,
            description: '選択されたタスクを複製',
            category: 'タスク'
        },
        {
            key: 'e',
            ctrlKey: true,
            action: callbacks.onEditSelected,
            description: '選択されたタスクを編集',
            category: 'タスク'
        },

        // === ナビゲーション ===
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
        {
            key: 'ArrowLeft',
            ctrlKey: true,
            altKey: true,
            action: callbacks.onPrevWeek,
            description: '前の週',
            category: 'ナビゲーション'
        },
        {
            key: 'ArrowRight',
            ctrlKey: true,
            altKey: true,
            action: callbacks.onNextWeek,
            description: '次の週',
            category: 'ナビゲーション'
        },
        {
            key: 'g',
            ctrlKey: true,
            action: callbacks.onGoToDate,
            description: '日付に移動',
            category: 'ナビゲーション'
        },

        // === 表示・フィルタリング ===
        {
            key: 'd',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onToggleTheme,
            description: 'ダーク/ライトモード切り替え',
            category: '表示'
        },
        {
            key: '1',
            ctrlKey: true,
            action: callbacks.onToggleCompletedTasks,
            description: '完了タスクの表示切り替え',
            category: '表示'
        },
        {
            key: '2',
            ctrlKey: true,
            action: callbacks.onToggleHabits,
            description: '習慣タスクの表示切り替え',
            category: '表示'
        },
        {
            key: '3',
            ctrlKey: true,
            action: callbacks.onToggleEnergyView,
            description: 'エネルギービューの切り替え',
            category: '表示'
        },
        {
            key: '4',
            ctrlKey: true,
            action: callbacks.onToggleTodoList,
            description: 'Todoリストの表示切り替え',
            category: '表示'
        },
        {
            key: '5',
            ctrlKey: true,
            action: callbacks.onToggleAnalytics,
            description: '分析画面の表示切り替え',
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

        // === クイックアクション ===
        {
            key: 'b',
            ctrlKey: true,
            action: callbacks.onAddBreak,
            description: '休憩時間を追加',
            category: 'タスク'
        },
        {
            key: 'r',
            ctrlKey: true,
            action: callbacks.onStartFocus,
            description: 'フォーカスモードを開始',
            category: 'タスク'
        },
        {
            key: 'Tab',
            action: callbacks.onToggleTimeline,
            description: 'タイムライン表示切り替え',
            category: '表示'
        },

        // === 編集・操作 ===
        {
            key: 'z',
            ctrlKey: true,
            action: callbacks.onUndo,
            description: '元に戻す',
            category: '編集'
        },
        {
            key: 'y',
            ctrlKey: true,
            action: callbacks.onRedo,
            description: 'やり直し',
            category: '編集'
        },
        {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onRedo,
            description: 'やり直し (Shift+Ctrl+Z)',
            category: '編集'
        },
        {
            key: 's',
            ctrlKey: true,
            action: callbacks.onSave,
            description: '保存',
            category: '編集'
        },
        {
            key: 'e',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onExport,
            description: 'データをエクスポート',
            category: '編集'
        },

        // === エネルギー管理 ===
        {
            key: 'l',
            ctrlKey: true,
            action: callbacks.onLogEnergy,
            description: 'エネルギーレベルを記録',
            category: 'エネルギー'
        },
        {
            key: 'p',
            ctrlKey: true,
            action: callbacks.onEnergyBreak,
            description: 'エネルギー回復休憩',
            category: 'エネルギー'
        },

        // === ヘルプ・アクセシビリティ ===
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
        },
        {
            key: '=',
            ctrlKey: true,
            action: callbacks.onIncreaseFontSize,
            description: 'フォントサイズを大きく',
            category: 'アクセシビリティ'
        },
        {
            key: '-',
            ctrlKey: true,
            action: callbacks.onDecreaseFontSize,
            description: 'フォントサイズを小さく',
            category: 'アクセシビリティ'
        },
        {
            key: 'c',
            ctrlKey: true,
            shiftKey: true,
            action: callbacks.onToggleHighContrast,
            description: 'ハイコントラストモード切り替え',
            category: 'アクセシビリティ'
        }
    ], [callbacks]);

    // 既存のキーボードショートカットフックを使用
    const { shortcuts } = useKeyboardShortcuts(enhancedShortcuts, enabled);

    // ショートカットをカテゴリ別に分類
    const categorizedShortcuts = useMemo(() => {
        const categories: Record<string, KeyboardShortcut[]> = {};

        shortcuts.forEach(shortcut => {
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            categories[shortcut.category].push(shortcut);
        });

        return categories;
    }, [shortcuts]);

    // キーの組み合わせを文字列として表示
    const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
        const keys: string[] = [];

        if (shortcut.ctrlKey) keys.push('Ctrl');
        if (shortcut.shiftKey) keys.push('Shift');
        if (shortcut.altKey) keys.push('Alt');
        if (shortcut.metaKey) keys.push('⌘');

        keys.push(shortcut.key);

        return keys.join(' + ');
    }, []);

    // 検索機能
    const searchShortcuts = useCallback((query: string): KeyboardShortcut[] => {
        if (!query) return shortcuts;

        const lowercaseQuery = query.toLowerCase();
        return shortcuts.filter(shortcut =>
            shortcut.description.toLowerCase().includes(lowercaseQuery) ||
            shortcut.category.toLowerCase().includes(lowercaseQuery) ||
            formatShortcut(shortcut).toLowerCase().includes(lowercaseQuery)
        );
    }, [shortcuts, formatShortcut]);

    return {
        shortcuts,
        categorizedShortcuts,
        formatShortcut,
        searchShortcuts,
        totalShortcuts: shortcuts.length
    };
}; 