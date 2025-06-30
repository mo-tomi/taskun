import { useState, useEffect } from 'react';
import { TodoItem, TaskColor } from '../types';
import { useLocalStorage } from './useLocalStorage';

export const useTodos = () => {
    const [todos, setTodos] = useLocalStorage<TodoItem[]>('taskun-todos', []);

    // 📝 新しいTodoアイテムを追加
    const addTodo = (
        title: string,
        description?: string,
        color: TaskColor = 'blue',
        priority: TodoItem['priority'] = 'medium',
        estimatedDuration: number = 60,
        isHabit: boolean = false,
        emoji?: string,
        tags: string[] = []
    ) => {
        const newTodo: TodoItem = {
            id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            color,
            emoji,
            isHabit,
            subtasks: [],
            estimatedDuration,
            priority,
            tags,
            createdAt: new Date().toISOString(),
        };

        setTodos(prev => [newTodo, ...prev]);
        return newTodo;
    };

    // 🗑️ Todoアイテムを削除
    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    // ✏️ Todoアイテムを更新
    const updateTodo = (id: string, updates: Partial<TodoItem>) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, ...updates } : todo
        ));
    };

    // 🔍 優先度でフィルタリング
    const getTodosByPriority = (priority: TodoItem['priority']) => {
        return todos.filter(todo => todo.priority === priority);
    };

    // 🏷️ タグでフィルタリング
    const getTodosByTag = (tag: string) => {
        return todos.filter(todo => todo.tags.includes(tag));
    };

    // 📊 統計情報
    const getStats = () => {
        const total = todos.length;
        const byPriority = {
            urgent: todos.filter(t => t.priority === 'urgent').length,
            high: todos.filter(t => t.priority === 'high').length,
            medium: todos.filter(t => t.priority === 'medium').length,
            low: todos.filter(t => t.priority === 'low').length,
        };
        const totalEstimatedTime = todos.reduce((sum, todo) => sum + (todo.estimatedDuration || 0), 0);

        return {
            total,
            byPriority,
            totalEstimatedTime,
        };
    };

    // 🔄 並び替え（優先度順、作成日順など）
    const sortedTodos = [...todos].sort((a, b) => {
        // まず優先度でソート
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

        if (priorityDiff !== 0) return priorityDiff;

        // 優先度が同じ場合は作成日時の新しい順
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return {
        todos: sortedTodos,
        addTodo,
        deleteTodo,
        updateTodo,
        getTodosByPriority,
        getTodosByTag,
        getStats,
    };
}; 