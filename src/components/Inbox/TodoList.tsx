import React, { useState } from 'react';
import {
    Plus, Calendar, Clock, AlertCircle,
    ChevronRight, Trash2, Edit3, ArrowRight,
    Tag, CheckCircle2, Circle
} from 'lucide-react';
import { TodoItem, TaskColor } from '../../types';
import { useTodos } from '../../hooks/useTodos';
import { useTasks } from '../../hooks/useTasks';
import { format, startOfDay } from 'date-fns';

interface TodoListProps {
    className?: string;
}

const TodoList: React.FC<TodoListProps> = ({ className = '' }) => {
    const { todos, addTodo, deleteTodo, updateTodo, getStats } = useTodos();
    const { addTask } = useTasks();
    const [isAddingTodo, setIsAddingTodo] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState<TodoItem['priority']>('medium');
    const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());

    const stats = getStats();

    // 🎨 優先度の色とアイコン
    const getPriorityConfig = (priority: TodoItem['priority']) => {
        switch (priority) {
            case 'urgent':
                return {
                    color: 'text-red-600 bg-red-50 border-red-200',
                    icon: '🔥',
                    label: '緊急'
                };
            case 'high':
                return {
                    color: 'text-orange-600 bg-orange-50 border-orange-200',
                    icon: '⚡',
                    label: '高'
                };
            case 'medium':
                return {
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    icon: '📝',
                    label: '中'
                };
            case 'low':
                return {
                    color: 'text-gray-600 bg-gray-50 border-gray-200',
                    icon: '📋',
                    label: '低'
                };
        }
    };

    // 📝 新しいTodoを追加
    const handleAddTodo = () => {
        if (newTodoTitle.trim()) {
            addTodo(newTodoTitle.trim(), '', 'blue', newTodoPriority);
            setNewTodoTitle('');
            setIsAddingTodo(false);
        }
    };

    // 📅 TodoをTimelineに変換して追加
    const scheduleSelectedTodos = () => {
        const todosToSchedule = todos.filter(todo => selectedTodos.has(todo.id));

        todosToSchedule.forEach((todo, index) => {
            // 現在時刻から順番に配置（30分間隔）
            const now = new Date();
            const startMinutes = now.getHours() * 60 + now.getMinutes() + (index * 30);
            const startHour = Math.floor(startMinutes / 60);
            const startMin = startMinutes % 60;

            const duration = todo.estimatedDuration || 60;
            const endMinutes = startMinutes + duration;
            const endHour = Math.floor(endMinutes / 60);
            const endMin = endMinutes % 60;

            const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

            addTask({
                title: todo.title,
                startTime,
                endTime,
                date: format(startOfDay(new Date()), 'yyyy-MM-dd'),
                color: todo.color,
                isHabit: todo.isHabit,
                description: todo.description,
                subtasks: todo.subtasks,
                emoji: todo.emoji,
                customColor: todo.customColor,
            });

            // 📝 スケジュールに追加したTodoを削除
            deleteTodo(todo.id);
        });

        setSelectedTodos(new Set());
    };

    // 🎯 Todoの選択切り替え
    const toggleTodoSelection = (todoId: string) => {
        setSelectedTodos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(todoId)) {
                newSet.delete(todoId);
            } else {
                newSet.add(todoId);
            }
            return newSet;
        });
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        📝 タスク待機リスト
                    </h3>
                    <button
                        onClick={() => setIsAddingTodo(true)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="新しいTodoを追加"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                {/* 統計 */}
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>総数: {stats.total}</span>
                    <span>予想時間: {Math.round(stats.totalEstimatedTime / 60)}h</span>
                </div>
            </div>

            {/* Todo追加フォーム */}
            {isAddingTodo && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newTodoTitle}
                            onChange={(e) => setNewTodoTitle(e.target.value)}
                            placeholder="新しいタスクを入力..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTodo();
                                if (e.key === 'Escape') setIsAddingTodo(false);
                            }}
                        />

                        <div className="flex items-center justify-between">
                            <select
                                value={newTodoPriority}
                                onChange={(e) => setNewTodoPriority(e.target.value as TodoItem['priority'])}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                                <option value="low">低優先度</option>
                                <option value="medium">中優先度</option>
                                <option value="high">高優先度</option>
                                <option value="urgent">緊急</option>
                            </select>

                            <div className="flex space-x-2">
                                <button
                                    onClick={handleAddTodo}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    追加
                                </button>
                                <button
                                    onClick={() => setIsAddingTodo(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Todoリスト */}
            <div className="max-h-96 overflow-y-auto">
                {todos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>まだタスクがありません</p>
                        <p className="text-sm">「+」ボタンで新しいタスクを追加</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {todos.map((todo) => {
                            const priorityConfig = getPriorityConfig(todo.priority);
                            const isSelected = selectedTodos.has(todo.id);

                            return (
                                <div
                                    key={todo.id}
                                    className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    onClick={() => toggleTodoSelection(todo.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* 選択チェックボックス */}
                                        <div className="mt-0.5">
                                            {isSelected ? (
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Todo内容 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900 truncate">
                                                    {todo.emoji && <span className="mr-1">{todo.emoji}</span>}
                                                    {todo.title}
                                                </h4>

                                                {/* 優先度バッジ */}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                                                    <span className="mr-1">{priorityConfig.icon}</span>
                                                    {priorityConfig.label}
                                                </span>
                                            </div>

                                            {/* 説明 */}
                                            {todo.description && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {todo.description}
                                                </p>
                                            )}

                                            {/* メタ情報 */}
                                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                                                {todo.estimatedDuration && (
                                                    <span className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {todo.estimatedDuration}分
                                                    </span>
                                                )}

                                                {todo.tags.length > 0 && (
                                                    <span className="flex items-center">
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {todo.tags.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* 削除ボタン */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTodo(todo.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="削除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* アクションボタン */}
            {selectedTodos.size > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={scheduleSelectedTodos}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>選択したタスクをスケジュールに追加 ({selectedTodos.size})</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default TodoList; 