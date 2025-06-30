import { useCallback } from 'react';
import { Task, HabitData } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { format, startOfDay, addDays } from 'date-fns';

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('structured-tasks', []);
  const [habits, setHabits] = useLocalStorage<HabitData[]>('structured-habits', []);
  // タスク履歴のlocalStorage管理
  const [taskHistory, setTaskHistory] = useLocalStorage<Omit<Task, 'id' | 'date' | 'completed' | 'subtasks'>[]>('structured-task-history', []);

  // タスク履歴に追加（重複タイトルは最新で上書き）
  const addTaskToHistory = useCallback((task: Omit<Task, 'id'>) => {
    setTaskHistory(prev => {
      // タイトル・色・emoji・時間帯・説明・カスタム色のみ保存
      const newEntry = {
        title: task.title,
        startTime: task.startTime,
        endTime: task.endTime,
        color: task.color,
        isHabit: task.isHabit,
        description: task.description,
        emoji: task.emoji,
        customColor: task.customColor
      };
      // タイトル重複は上書き
      const filtered = prev.filter(h => h.title !== newEntry.title);
      return [newEntry, ...filtered].slice(0, 20); // 最大20件まで
    });
  }, [setTaskHistory]);

  // 履歴から取得
  const getTaskHistory = useCallback(() => taskHistory, [taskHistory]);

  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      subtasks: task.subtasks.map(st => ({ ...st, id: crypto.randomUUID() }))
    };
    setTasks(prev => [...prev, newTask]);
    addTaskToHistory(task);
    return newTask;
  }, [setTasks, addTaskToHistory]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const completeTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    updateTask(id, { completed: true });

    if (task.isHabit) {
      const today = format(new Date(), 'yyyy-MM-dd');
      setHabits(prev => {
        const existing = prev.find(h => h.taskId === id && h.date === today);
        if (existing) {
          return prev.map(h => 
            h.taskId === id && h.date === today 
              ? { ...h, completed: true } 
              : h
          );
        }
        return [...prev, { taskId: id, date: today, completed: true }];
      });
    }
  }, [tasks, updateTask, setHabits]);

  const replanTask = useCallback((id: string, newDate?: string, newStartTime?: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const targetDate = newDate || format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const targetTime = newStartTime || '09:00';
    
    updateTask(id, {
      date: targetDate,
      startTime: targetTime,
      completed: false
    });
  }, [tasks, updateTask]);

  const getTasksForDate = useCallback((date: string) => {
    return tasks.filter(task => task.date === date);
  }, [tasks]);

  const getHabitStreak = useCallback((taskId: string) => {
    const habitEntries = habits
      .filter(h => h.taskId === taskId && h.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = startOfDay(new Date());

    for (let i = 0; i < habitEntries.length; i++) {
      const entryDate = startOfDay(new Date(habitEntries[i].date));
      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate = addDays(currentDate, -1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }, [habits]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    replanTask,
    getTasksForDate,
    getHabitStreak,
    habits,
    getTaskHistory // 追加
  };
}