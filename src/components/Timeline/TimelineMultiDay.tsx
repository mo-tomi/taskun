import React from 'react';
import { Task, MultiDayTaskSegment } from '../../types';
import { format } from 'date-fns';
import { Check, Clock, ArrowRight } from 'lucide-react';
import {
    generateMultiDayTaskLabel,
    getMultiDayTaskStyle,
    calculateMultiDayTaskProgress,
    isMultiDayTask
} from '../../utils/multiDayTaskUtils';

interface TimelineMultiDayProps {
    taskSegments: MultiDayTaskSegment[];
    currentDate: Date;
    onTaskComplete: (id: string) => void;
    onTaskUpdate: (id: string, updates: Partial<Task>) => void;
}

export function TimelineMultiDay({
    taskSegments,
    currentDate,
    onTaskComplete,
    onTaskUpdate
}: TimelineMultiDayProps) {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm');

    // セグメントを時間順にソート
    const sortedSegments = [...taskSegments].sort((a, b) => {
        const timeA = parseInt(a.segmentStartTime.replace(':', ''));
        const timeB = parseInt(b.segmentStartTime.replace(':', ''));
        return timeA - timeB;
    });

    // タスクの色を取得
    const getTaskColor = (task: Task) => {
        if (task.customColor) {
            return {
                bg: 'bg-white',
                border: 'border-gray-300',
                dot: task.customColor,
                accent: task.customColor
            };
        }

        const colorMap = {
            coral: { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', accent: 'text-orange-600' },
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', accent: 'text-blue-600' },
            green: { bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', accent: 'text-green-600' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', accent: 'text-purple-600' },
            orange: { bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500', accent: 'text-orange-600' },
            teal: { bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500', accent: 'text-teal-600' }
        };

        return colorMap[task.color] || colorMap.blue;
    };

    // セグメントがアクティブかどうかを判定
    const isSegmentActive = (segment: MultiDayTaskSegment) => {
        if (segment.segmentDate !== currentDateStr) return false;

        const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
        const startMinutes = parseInt(segment.segmentStartTime.split(':')[0]) * 60 + parseInt(segment.segmentStartTime.split(':')[1]);
        const endMinutes = parseInt(segment.segmentEndTime.split(':')[0]) * 60 + parseInt(segment.segmentEndTime.split(':')[1]);

        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    };

    return (
        <div className="space-y-1">
            {sortedSegments.map((segment) => {
                const colors = getTaskColor(segment.task);
                const isActive = isSegmentActive(segment);
                const isCompleted = segment.task.completed;
                const progress = calculateMultiDayTaskProgress(segment.task, segment.segmentDate);
                const label = generateMultiDayTaskLabel(segment);
                const multiDayStyle = getMultiDayTaskStyle(segment);

                return (
                    <div
                        key={`${segment.task.id}-${segment.segmentDate}`}
                        className={`flex items-center space-x-3 p-3 border rounded-lg transition-all hover:shadow-md ${multiDayStyle} ${isActive
                                ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                                : isCompleted
                                    ? 'bg-gray-50 border-gray-200 opacity-70'
                                    : `${colors.bg} ${colors.border}`
                            }`}
                    >
                        {/* 🎯 完了ボタン */}
                        <button
                            onClick={() => onTaskComplete(segment.task.id)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all transform hover:scale-110 ${isCompleted
                                    ? `${colors.dot} border-white text-white`
                                    : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50'
                                }`}
                            title={isCompleted ? 'タスク完了済み' : 'タスクを完了'}
                        >
                            {isCompleted ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-400" />
                            )}
                        </button>

                        {/* 🕐 時間表示 */}
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-600 min-w-0">
                            <Clock className="w-4 h-4" />
                            <span>
                                {segment.segmentStartTime} - {segment.segmentEndTime}
                            </span>
                            {isMultiDayTask(segment.task) && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    {segment.isFirstDay && !segment.isLastDay && (
                                        <>
                                            <span>開始</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </>
                                    )}
                                    {!segment.isFirstDay && !segment.isLastDay && (
                                        <>
                                            <span>継続</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </>
                                    )}
                                    {segment.isLastDay && !segment.isFirstDay && (
                                        <span>終了</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 📝 タスク内容 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                                <span className="text-lg">{segment.task.emoji}</span>
                                <span className="font-medium text-gray-900 truncate">
                                    {label}
                                </span>
                            </div>
                            {segment.task.description && (
                                <p className="text-sm text-gray-600 mt-1 truncate">
                                    {segment.task.description}
                                </p>
                            )}
                            {isMultiDayTask(segment.task) && (
                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                    <span>期間: {segment.task.date}</span>
                                    {segment.task.endDate && segment.task.endDate !== segment.task.date && (
                                        <>
                                            <ArrowRight className="w-3 h-3" />
                                            <span>{segment.task.endDate}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 📊 進捗表示 */}
                        <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${colors.dot.replace('bg-', 'bg-')}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-[2rem]">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        {/* 🎯 アクティブインジケーター */}
                        {isActive && (
                            <div className="flex items-center space-x-1 text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-medium">実行中</span>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* 📝 タスクなしの場合 */}
            {sortedSegments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">本日のタスクはありません</p>
                    <p className="text-sm">新しいタスクを追加してみましょう</p>
                </div>
            )}
        </div>
    );
}

export default TimelineMultiDay; 