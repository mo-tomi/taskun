import React, { useState, useEffect } from 'react';
import { format, addMinutes } from 'date-fns';
import { Clock, Zap, ArrowRight, CheckCircle2, AlertTriangle, Settings, RotateCw } from 'lucide-react';
import { Task } from '../../types';
import { timeToMinutes } from '../../utils/timeUtils';

interface AutoAdjustmentProps {
    tasks: Task[];
    currentDate: Date;
    onTaskUpdate: (id: string, updates: Partial<Task>) => void;
    className?: string;
}

interface AdjustmentSuggestion {
    id: string;
    type: 'delay' | 'early_completion' | 'time_conflict' | 'buffer_optimization';
    priority: 'high' | 'medium' | 'low';
    message: string;
    originalTask: Task;
    suggestedChanges: {
        taskId: string;
        newStartTime?: string;
        newEndTime?: string;
        newDuration?: number;
    }[];
    estimatedImpact: string;
    autoApplicable: boolean;
}

export function AutoAdjustment({
    tasks,
    currentDate,
    onTaskUpdate,
    className = ''
}: AutoAdjustmentProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [suggestions, setSuggestions] = useState<AdjustmentSuggestion[]>([]);
    const [autoMode, setAutoMode] = useState(false);
    const [appliedAdjustments, setAppliedAdjustments] = useState<Set<string>>(new Set());

    // リアルタイム時計の更新
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // 30秒間隔で更新
        return () => clearInterval(interval);
    }, []);

    // 調整提案の生成
    useEffect(() => {
        const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        if (!isToday || tasks.length === 0) {
            setSuggestions([]);
            return;
        }

        const newSuggestions: AdjustmentSuggestion[] = [];
        const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

        // 今日のタスクを時間順にソート
        const todayTasks = tasks
            .filter(task => task.date === format(currentDate, 'yyyy-MM-dd'))
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        // 1. 遅延検出と調整提案
        todayTasks.forEach((task, index) => {
            const taskStartMinutes = timeToMinutes(task.startTime);
            const taskEndMinutes = timeToMinutes(task.endTime);

            // 現在時刻がタスク開始時刻を過ぎているが、まだ完了していない
            if (currentMinutes > taskStartMinutes && !task.completed) {
                const delayMinutes = currentMinutes - taskStartMinutes;

                if (delayMinutes > 15) { // 15分以上の遅延
                    const remainingTasks = todayTasks.slice(index + 1);
                    const adjustmentChain = calculateDelayAdjustment(task, remainingTasks, delayMinutes);

                    newSuggestions.push({
                        id: `delay-${task.id}`,
                        type: 'delay',
                        priority: delayMinutes > 60 ? 'high' : 'medium',
                        message: `「${task.title}」が${Math.round(delayMinutes)}分遅延中。後続タスクの調整が必要です。`,
                        originalTask: task,
                        suggestedChanges: adjustmentChain,
                        estimatedImpact: `${remainingTasks.length}個のタスクに影響`,
                        autoApplicable: delayMinutes < 30 && remainingTasks.length <= 3
                    });
                }
            }

            // 2. 早期完了の検出と最適化提案
            if (task.completed && currentMinutes < taskEndMinutes) {
                const savedMinutes = taskEndMinutes - currentMinutes;

                if (savedMinutes > 10) { // 10分以上早期完了
                    const nextTask = todayTasks[index + 1];
                    if (nextTask) {
                        newSuggestions.push({
                            id: `early-${task.id}`,
                            type: 'early_completion',
                            priority: 'low',
                            message: `「${task.title}」が${Math.round(savedMinutes)}分早く完了。次のタスクを前倒しできます。`,
                            originalTask: task,
                            suggestedChanges: [{
                                taskId: nextTask.id,
                                newStartTime: format(currentTime, 'HH:mm')
                            }],
                            estimatedImpact: `${Math.round(savedMinutes)}分のバッファ時間を獲得`,
                            autoApplicable: savedMinutes < 60
                        });
                    }
                }
            }
        });

        // 3. 時間競合の検出
        for (let i = 0; i < todayTasks.length - 1; i++) {
            const currentTask = todayTasks[i];
            const nextTask = todayTasks[i + 1];

            const currentEndMinutes = timeToMinutes(currentTask.endTime);
            const nextStartMinutes = timeToMinutes(nextTask.startTime);

            if (currentEndMinutes > nextStartMinutes) {
                const conflictMinutes = currentEndMinutes - nextStartMinutes;

                newSuggestions.push({
                    id: `conflict-${currentTask.id}-${nextTask.id}`,
                    type: 'time_conflict',
                    priority: 'high',
                    message: `「${currentTask.title}」と「${nextTask.title}」が${conflictMinutes}分重複しています。`,
                    originalTask: currentTask,
                    suggestedChanges: [{
                        taskId: nextTask.id,
                        newStartTime: currentTask.endTime
                    }],
                    estimatedImpact: '時間競合を解消',
                    autoApplicable: conflictMinutes < 30
                });
            }
        }

        // 4. バッファ時間の最適化提案
        const bufferOptimizations = analyzeBufferOptimization(todayTasks, currentMinutes);
        newSuggestions.push(...bufferOptimizations);

        setSuggestions(newSuggestions);
    }, [tasks, currentTime, currentDate]);

    // 遅延調整チェーンの計算
    const calculateDelayAdjustment = (
        delayedTask: Task,
        remainingTasks: Task[],
        delayMinutes: number
    ) => {
        const adjustments: AdjustmentSuggestion['suggestedChanges'] = [];
        let cumulativeDelay = delayMinutes;

        remainingTasks.forEach((task, index) => {
            const originalStartMinutes = timeToMinutes(task.startTime);
            const originalEndMinutes = timeToMinutes(task.endTime);
            const taskDuration = originalEndMinutes - originalStartMinutes;

            // バッファ時間を考慮した調整
            const bufferTime = index === 0 ? 15 : 5; // 最初のタスクには15分、その他は5分のバッファ
            const newStartMinutes = originalStartMinutes + cumulativeDelay + bufferTime;
            const newEndMinutes = newStartMinutes + taskDuration;

            adjustments.push({
                taskId: task.id,
                newStartTime: formatMinutesToTime(newStartMinutes),
                newEndTime: formatMinutesToTime(newEndMinutes)
            });

            // 次のタスクへの累積遅延を更新
            cumulativeDelay = Math.max(0, cumulativeDelay - bufferTime);
        });

        return adjustments;
    };

    // バッファ時間最適化の分析
    const analyzeBufferOptimization = (
        todayTasks: Task[],
        currentMinutes: number
    ): AdjustmentSuggestion[] => {
        const optimizations: AdjustmentSuggestion[] = [];

        // 未来のタスク間の隙間時間を分析
        for (let i = 0; i < todayTasks.length - 1; i++) {
            const currentTask = todayTasks[i];
            const nextTask = todayTasks[i + 1];

            const currentEndMinutes = timeToMinutes(currentTask.endTime);
            const nextStartMinutes = timeToMinutes(nextTask.startTime);
            const gapMinutes = nextStartMinutes - currentEndMinutes;

            // 30分以上の長い隙間時間があり、まだ到達していない場合
            if (gapMinutes > 30 && currentEndMinutes > currentMinutes) {
                optimizations.push({
                    id: `buffer-${currentTask.id}-${nextTask.id}`,
                    type: 'buffer_optimization',
                    priority: 'low',
                    message: `「${currentTask.title}」と「${nextTask.title}」の間に${gapMinutes}分の空き時間があります。`,
                    originalTask: currentTask,
                    suggestedChanges: [{
                        taskId: nextTask.id,
                        newStartTime: formatMinutesToTime(currentEndMinutes + 15) // 15分のバッファを残して前倒し
                    }],
                    estimatedImpact: `${gapMinutes - 15}分の時間を有効活用`,
                    autoApplicable: false // バッファ最適化は手動確認を推奨
                });
            }
        }

        return optimizations;
    };

    // 分を時間文字列に変換
    const formatMinutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // 調整の適用
    const applySuggestion = async (suggestion: AdjustmentSuggestion) => {
        try {
            for (const change of suggestion.suggestedChanges) {
                const updates: Partial<Task> = {};
                if (change.newStartTime) updates.startTime = change.newStartTime;
                if (change.newEndTime) updates.endTime = change.newEndTime;

                onTaskUpdate(change.taskId, updates);
            }

            setAppliedAdjustments(prev => new Set([...prev, suggestion.id]));
        } catch (error) {
            console.error('調整の適用に失敗しました:', error);
        }
    };

    // 自動調整の実行
    useEffect(() => {
        if (autoMode) {
            const autoApplicableSuggestions = suggestions.filter(
                s => s.autoApplicable && !appliedAdjustments.has(s.id)
            );

            autoApplicableSuggestions.forEach(suggestion => {
                applySuggestion(suggestion);
            });
        }
    }, [suggestions, autoMode, appliedAdjustments]);

    const getPriorityColor = (priority: AdjustmentSuggestion['priority']) => {
        switch (priority) {
            case 'high': return 'border-red-300 bg-red-50';
            case 'medium': return 'border-orange-300 bg-orange-50';
            case 'low': return 'border-blue-300 bg-blue-50';
        }
    };

    const getTypeIcon = (type: AdjustmentSuggestion['type']) => {
        switch (type) {
            case 'delay': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'early_completion': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'time_conflict': return <Clock className="w-5 h-5 text-orange-600" />;
            case 'buffer_optimization': return <Zap className="w-5 h-5 text-blue-600" />;
        }
    };

    if (suggestions.length === 0) {
        return (
            <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">✅ スケジュール最適化済み</span>
                    </div>
                    <div className="text-xs text-green-600">現在のスケジュールに調整の必要はありません</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* 自動調整設定 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">自動調整</span>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={autoMode}
                        onChange={(e) => setAutoMode(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                        {autoMode ? '有効' : '無効'}
                    </span>
                </label>
            </div>

            {/* 調整提案一覧 */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <RotateCw className="w-4 h-4" />
                    <span>スケジュール調整提案 ({suggestions.length}件)</span>
                </h3>

                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)} transition-all duration-200`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                {getTypeIcon(suggestion.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${suggestion.priority === 'high'
                                            ? 'bg-red-200 text-red-800'
                                            : suggestion.priority === 'medium'
                                                ? 'bg-orange-200 text-orange-800'
                                                : 'bg-blue-200 text-blue-800'
                                        }`}>
                                        {suggestion.priority === 'high' ? '緊急' :
                                            suggestion.priority === 'medium' ? '中' : '低'}
                                    </span>
                                    {suggestion.autoApplicable && (
                                        <span className="px-2 py-1 text-xs bg-purple-200 text-purple-800 rounded-full font-medium">
                                            自動適用可能
                                        </span>
                                    )}
                                    {appliedAdjustments.has(suggestion.id) && (
                                        <span className="px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full font-medium">
                                            適用済み
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-800 font-medium mb-2">
                                    {suggestion.message}
                                </p>

                                <div className="text-xs text-gray-600 mb-3">
                                    影響: {suggestion.estimatedImpact}
                                </div>

                                {/* 提案される変更の詳細 */}
                                {suggestion.suggestedChanges.length > 0 && (
                                    <div className="bg-white/60 rounded-md p-3 mb-3">
                                        <div className="text-xs font-medium text-gray-700 mb-2">提案される調整:</div>
                                        <div className="space-y-1">
                                            {suggestion.suggestedChanges.map((change, index) => {
                                                const task = tasks.find(t => t.id === change.taskId);
                                                return (
                                                    <div key={index} className="flex items-center space-x-2 text-xs">
                                                        <span className="text-gray-600">{task?.title || 'タスク'}:</span>
                                                        {change.newStartTime && (
                                                            <span className="text-blue-600">
                                                                {task?.startTime} → {change.newStartTime}
                                                            </span>
                                                        )}
                                                        {change.newEndTime && (
                                                            <span className="text-blue-600">
                                                                〜{change.newEndTime}
                                                            </span>
                                                        )}
                                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* アクションボタン */}
                                {!appliedAdjustments.has(suggestion.id) && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => applySuggestion(suggestion)}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            適用する
                                        </button>
                                        <button
                                            onClick={() => {
                                                // 提案を却下（一時的に非表示）
                                                setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                                            }}
                                            className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                        >
                                            却下
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 