import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Clock, Calendar, Zap, Target, TrendingUp, Coffee } from 'lucide-react';
import { Task, EnergyLevel } from '../../types';
import { format, isToday, addDays, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Suggestion {
    id: string;
    type: 'time' | 'energy' | 'productivity' | 'habit' | 'break' | 'planning';
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
    priority: 'low' | 'medium' | 'high';
    icon: React.ReactNode;
}

interface SmartSuggestionsProps {
    tasks: Task[];
    energyLevels: EnergyLevel[];
    currentDate: Date;
    onAddTask?: (task: Partial<Task>) => void;
    onScheduleBreak?: (startTime: string, duration: number) => void;
    isVisible?: boolean;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
    tasks,
    energyLevels,
    currentDate,
    onAddTask,
    onScheduleBreak,
    isVisible = true
}) => {
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

    // 今日のタスクを取得
    const todayTasks = useMemo(() => {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        return tasks.filter(task => task.date === dateStr);
    }, [tasks, currentDate]);

    // 完了したタスクと未完了タスクを分析
    const taskAnalysis = useMemo(() => {
        const completed = todayTasks.filter(task => task.completed);
        const pending = todayTasks.filter(task => !task.completed);
        const overdue = todayTasks.filter(task => {
            const taskEndTime = new Date(`${task.date}T${task.endTime}`);
            return !task.completed && taskEndTime < new Date();
        });

        return {
            total: todayTasks.length,
            completed: completed.length,
            pending: pending.length,
            overdue: overdue.length,
            completionRate: todayTasks.length > 0 ? (completed.length / todayTasks.length) * 100 : 0
        };
    }, [todayTasks]);

    // エネルギーレベル分析
    const energyAnalysis = useMemo(() => {
        const todayEnergy = energyLevels.filter(level =>
            format(parseISO(level.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        );

        if (todayEnergy.length === 0) return null;

        const avgEnergy = todayEnergy.reduce((sum, level) => sum + level.level, 0) / todayEnergy.length;
        const highEnergyPeriods = todayEnergy.filter(level => level.level > 70);
        const lowEnergyPeriods = todayEnergy.filter(level => level.level < 40);

        return {
            average: avgEnergy,
            highPeriods: highEnergyPeriods,
            lowPeriods: lowEnergyPeriods,
            trend: todayEnergy.length > 1 ?
                (todayEnergy[todayEnergy.length - 1].level - todayEnergy[0].level) : 0
        };
    }, [energyLevels, currentDate]);

    // スマート提案を生成
    const suggestions = useMemo(() => {
        const suggestions: Suggestion[] = [];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // 時間帯に基づく提案
        if (currentHour >= 9 && currentHour < 12 && taskAnalysis.pending > 0) {
            suggestions.push({
                id: 'morning-focus',
                type: 'productivity',
                title: '朝の集中時間を活用',
                description: '午前中は集中力が高い時間帯です。重要なタスクから始めませんか？',
                priority: 'high',
                icon: <Zap className="w-5 h-5 text-yellow-500" />,
                actionLabel: '重要タスクを優先',
                action: () => {
                    // 未完了タスクを優先度順に並び替える提案
                }
            });
        }

        // 午後の疲労を考慮した提案
        if (currentHour >= 14 && currentHour < 16) {
            suggestions.push({
                id: 'afternoon-break',
                type: 'break',
                title: '午後の休憩をお勧めします',
                description: '午後2時〜4時は集中力が低下しがちです。15分の休憩でリフレッシュしましょう。',
                priority: 'medium',
                icon: <Coffee className="w-5 h-5 text-orange-500" />,
                actionLabel: '15分休憩を追加',
                action: () => {
                    onScheduleBreak?.(`${currentHour}:${currentMinutes.toString().padStart(2, '0')}`, 15);
                }
            });
        }

        // エネルギーレベルに基づく提案
        if (energyAnalysis && energyAnalysis.average < 50) {
            suggestions.push({
                id: 'energy-boost',
                type: 'energy',
                title: 'エネルギーレベルが低下しています',
                description: '軽い運動や深呼吸でエネルギーを回復させませんか？',
                priority: 'medium',
                icon: <TrendingUp className="w-5 h-5 text-green-500" />,
                actionLabel: 'エネルギー回復タスクを追加',
                action: () => {
                    onAddTask?.({
                        title: '5分間の深呼吸・ストレッチ',
                        startTime: `${currentHour}:${currentMinutes.toString().padStart(2, '0')}`,
                        endTime: `${currentHour}:${(currentMinutes + 5).toString().padStart(2, '0')}`,
                        color: 'green',
                        isHabit: false,
                        emoji: '🧘'
                    });
                }
            });
        }

        // 作業効率の提案
        if (taskAnalysis.completionRate > 80) {
            suggestions.push({
                id: 'productivity-high',
                type: 'productivity',
                title: '素晴らしい進捗です！',
                description: `今日は${taskAnalysis.completionRate.toFixed(0)}%のタスクを完了しています。この調子で新しいチャレンジはいかがですか？`,
                priority: 'low',
                icon: <Target className="w-5 h-5 text-purple-500" />,
                actionLabel: 'ボーナスタスクを追加',
                action: () => {
                    onAddTask?.({
                        title: '自己改善・学習時間',
                        startTime: `${currentHour + 1}:00`,
                        endTime: `${currentHour + 2}:00`,
                        color: 'purple',
                        isHabit: false,
                        emoji: '📚'
                    });
                }
            });
        } else if (taskAnalysis.completionRate < 30 && taskAnalysis.total > 0) {
            suggestions.push({
                id: 'productivity-low',
                type: 'planning',
                title: 'タスクの見直しをお勧めします',
                description: 'タスクが予定通り進んでいないようです。優先順位を見直してみませんか？',
                priority: 'high',
                icon: <Calendar className="w-5 h-5 text-red-500" />,
                actionLabel: 'タスクを整理する'
            });
        }

        // 習慣化の提案
        const habitTasks = tasks.filter(task => task.isHabit);
        if (habitTasks.length === 0) {
            suggestions.push({
                id: 'habit-suggestion',
                type: 'habit',
                title: '良い習慣を作りませんか？',
                description: '毎日続けられる小さな習慣から始めてみましょう。継続は力なりです。',
                priority: 'low',
                icon: <Clock className="w-5 h-5 text-blue-500" />,
                actionLabel: '習慣タスクを作成',
                action: () => {
                    onAddTask?.({
                        title: '朝の読書（10分）',
                        startTime: '07:00',
                        endTime: '07:10',
                        color: 'blue',
                        isHabit: true,
                        emoji: '📖'
                    });
                }
            });
        }

        // 過去1週間のデータに基づく提案
        if (isToday(currentDate)) {
            const weekStart = startOfWeek(currentDate, { locale: ja });
            const weekEnd = endOfWeek(currentDate, { locale: ja });
            const weekTasks = tasks.filter(task => {
                const taskDate = parseISO(task.date);
                return taskDate >= weekStart && taskDate <= weekEnd;
            });

            const weekCompletionRate = weekTasks.length > 0 ?
                (weekTasks.filter(task => task.completed).length / weekTasks.length) * 100 : 0;

            if (weekCompletionRate > 70) {
                suggestions.push({
                    id: 'week-review',
                    type: 'planning',
                    title: '今週は好調です！',
                    description: `今週の完了率は${weekCompletionRate.toFixed(0)}%です。来週の計画を立ててみませんか？`,
                    priority: 'low',
                    icon: <TrendingUp className="w-5 h-5 text-green-500" />,
                    actionLabel: '来週の計画を立てる'
                });
            }
        }

        return suggestions.filter(s => !dismissedSuggestions.has(s.id));
    }, [taskAnalysis, energyAnalysis, currentDate, tasks, onAddTask, onScheduleBreak, dismissedSuggestions]);

    const handleDismissSuggestion = (id: string) => {
        setDismissedSuggestions(prev => new Set(prev).add(id));
    };

    const handleApplySuggestion = (suggestion: Suggestion) => {
        if (suggestion.action) {
            suggestion.action();
            setSelectedSuggestions(prev => [...prev, suggestion.id]);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/10';
            case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
            case 'low': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10';
            default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10';
        }
    };

    if (!isVisible || suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    スマート提案
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({suggestions.length}件)
                </span>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {suggestions.slice(0, 3).map((suggestion) => (
                        <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`
                ${getPriorityColor(suggestion.priority)}
                border-l-4 rounded-r-lg p-3 transition-all duration-200
                hover:shadow-md
              `}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {suggestion.icon}
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            {suggestion.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-3">
                                    {suggestion.actionLabel && (
                                        <button
                                            onClick={() => handleApplySuggestion(suggestion)}
                                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30"
                                        >
                                            {suggestion.actionLabel}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDismissSuggestion(suggestion.id)}
                                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {suggestions.length > 3 && (
                <div className="mt-3 text-center">
                    <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        他{suggestions.length - 3}件の提案を表示
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default SmartSuggestions; 