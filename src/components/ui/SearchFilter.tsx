import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Calendar, Clock, Check, AlertCircle } from 'lucide-react';
import { Task } from '../../types';

// 🔍 検索・フィルター設定の型定義
export interface SearchFilterState {
    searchQuery: string;
    statusFilter: 'all' | 'completed' | 'pending' | 'overdue';
    dateFilter: 'all' | 'today' | 'tomorrow' | 'this-week' | 'custom';
    priorityFilter: 'all' | 'high' | 'medium' | 'low';
    sortBy: 'startTime' | 'title' | 'priority' | 'progress';
    sortOrder: 'asc' | 'desc';
}

// 🎨 検索・フィルターコンポーネントの Props
interface SearchFilterProps {
    tasks: Task[];
    onFilteredTasksChange: (filteredTasks: Task[]) => void;
    isOpen: boolean;
    onToggle: () => void;
    className?: string;
}

// 📅 日付関連のユーティリティ
const isToday = (date: string) => {
    const today = new Date();
    const taskDate = new Date(date);
    return taskDate.toDateString() === today.toDateString();
};

const isTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(date);
    return taskDate.toDateString() === tomorrow.toDateString();
};

const isThisWeek = (date: string) => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    const taskDate = new Date(date);
    return taskDate >= weekStart && taskDate <= weekEnd;
};

const isOverdue = (task: Task) => {
    const now = new Date();
    const taskEnd = new Date(`${task.date} ${task.endTime}`);
    return !task.completed && taskEnd < now;
};

// 🎯 メインの検索・フィルターコンポーネント
export const SearchFilter: React.FC<SearchFilterProps> = ({
    tasks,
    onFilteredTasksChange,
    isOpen,
    onToggle,
    className = ''
}) => {
    const [filterState, setFilterState] = useState<SearchFilterState>({
        searchQuery: '',
        statusFilter: 'all',
        dateFilter: 'all',
        priorityFilter: 'all',
        sortBy: 'startTime',
        sortOrder: 'asc'
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // 🔍 検索・フィルタリング・ソートロジック
    const filteredAndSortedTasks = useMemo(() => {
        let filtered = [...tasks];

        // テキスト検索
        if (filterState.searchQuery.trim()) {
            const query = filterState.searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.subtasks.some(subtask => subtask.title.toLowerCase().includes(query))
            );
        }

        // ステータスフィルター
        switch (filterState.statusFilter) {
            case 'completed':
                filtered = filtered.filter(task => task.completed);
                break;
            case 'pending':
                filtered = filtered.filter(task => !task.completed && !isOverdue(task));
                break;
            case 'overdue':
                filtered = filtered.filter(task => isOverdue(task));
                break;
        }

        // 日付フィルター
        switch (filterState.dateFilter) {
            case 'today':
                filtered = filtered.filter(task => isToday(task.date));
                break;
            case 'tomorrow':
                filtered = filtered.filter(task => isTomorrow(task.date));
                break;
            case 'this-week':
                filtered = filtered.filter(task => isThisWeek(task.date));
                break;
        }

        // ソート
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (filterState.sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'startTime':
                    aValue = `${a.date} ${a.startTime}`;
                    bValue = `${b.date} ${b.startTime}`;
                    break;
                case 'progress':
                    aValue = a.subtasks.length > 0
                        ? a.subtasks.filter(st => st.completed).length / a.subtasks.length
                        : a.completed ? 1 : 0;
                    bValue = b.subtasks.length > 0
                        ? b.subtasks.filter(st => st.completed).length / b.subtasks.length
                        : b.completed ? 1 : 0;
                    break;
                default:
                    aValue = a.startTime;
                    bValue = b.startTime;
            }

            if (aValue < bValue) return filterState.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filterState.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [tasks, filterState]);

    // フィルター結果の通知
    useEffect(() => {
        onFilteredTasksChange(filteredAndSortedTasks);
    }, [filteredAndSortedTasks, onFilteredTasksChange]);

    // フィルター状態の更新
    const updateFilter = (updates: Partial<SearchFilterState>) => {
        setFilterState(prev => ({ ...prev, ...updates }));
    };

    // フィルターのリセット
    const resetFilters = () => {
        setFilterState({
            searchQuery: '',
            statusFilter: 'all',
            dateFilter: 'all',
            priorityFilter: 'all',
            sortBy: 'startTime',
            sortOrder: 'asc'
        });
    };

    // アクティブなフィルター数の計算
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterState.searchQuery.trim()) count++;
        if (filterState.statusFilter !== 'all') count++;
        if (filterState.dateFilter !== 'all') count++;
        if (filterState.priorityFilter !== 'all') count++;
        return count;
    }, [filterState]);

    return (
        <div className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm ${className}`}>
            {/* 検索バー */}
            <div className="p-4">
                <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="タスクを検索..."
                            value={filterState.searchQuery}
                            onChange={(e) => updateFilter({ searchQuery: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                        />
                        {filterState.searchQuery && (
                            <button
                                onClick={() => updateFilter({ searchQuery: '' })}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded"
                            >
                                <X className="w-3 h-3 text-neutral-400" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors ${activeFilterCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
                            }`}
                        title="フィルターオプション"
                    >
                        <Filter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* 結果サマリー */}
                <div className="mt-3 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <span>
                        {filteredAndSortedTasks.length} / {tasks.length} 件のタスク
                    </span>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            フィルターをリセット
                        </button>
                    )}
                </div>
            </div>

            {/* 詳細フィルターオプション */}
            {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-4 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* ステータスフィルター */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                ステータス
                            </label>
                            <select
                                value={filterState.statusFilter}
                                onChange={(e) => updateFilter({ statusFilter: e.target.value as any })}
                                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            >
                                <option value="all">すべて</option>
                                <option value="pending">未完了</option>
                                <option value="completed">完了済み</option>
                                <option value="overdue">期限切れ</option>
                            </select>
                        </div>

                        {/* 日付フィルター */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                日付
                            </label>
                            <select
                                value={filterState.dateFilter}
                                onChange={(e) => updateFilter({ dateFilter: e.target.value as any })}
                                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            >
                                <option value="all">すべて</option>
                                <option value="today">今日</option>
                                <option value="tomorrow">明日</option>
                                <option value="this-week">今週</option>
                            </select>
                        </div>

                        {/* ソート方法 */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                並び順
                            </label>
                            <select
                                value={filterState.sortBy}
                                onChange={(e) => updateFilter({ sortBy: e.target.value as any })}
                                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            >
                                <option value="startTime">開始時刻</option>
                                <option value="title">タイトル</option>
                                <option value="progress">進捗</option>
                            </select>
                        </div>

                        {/* ソート順序 */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                順序
                            </label>
                            <select
                                value={filterState.sortOrder}
                                onChange={(e) => updateFilter({ sortOrder: e.target.value as any })}
                                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                            >
                                <option value="asc">昇順</option>
                                <option value="desc">降順</option>
                            </select>
                        </div>
                    </div>

                    {/* クイックフィルターボタン */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => updateFilter({ statusFilter: 'pending', dateFilter: 'today' })}
                            className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                        >
                            <Clock className="w-3 h-3 inline mr-1" />
                            今日の未完了
                        </button>
                        <button
                            onClick={() => updateFilter({ statusFilter: 'overdue' })}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                        >
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            期限切れ
                        </button>
                        <button
                            onClick={() => updateFilter({ statusFilter: 'completed', dateFilter: 'today' })}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
                        >
                            <Check className="w-3 h-3 inline mr-1" />
                            今日の完了済み
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchFilter; 