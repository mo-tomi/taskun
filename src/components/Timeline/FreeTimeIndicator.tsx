import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Timer, Zap, Coffee, BookOpen, Pause } from 'lucide-react';
import { Task } from '../../types';
import { timeToMinutes } from '../../utils/timeUtils';

interface FreeTimeIndicatorProps {
  tasks: Task[];
  taskSegments?: any[];
  currentDate: Date;
  className?: string;
}

interface FreeTimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isCurrentSlot: boolean;
  nextTaskTitle?: string;
  nextTaskEmoji?: string;
}

export function FreeTimeIndicator({
  tasks,
  taskSegments,
  currentDate,
  className = ''
}: FreeTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [freeTimeSlots, setFreeTimeSlots] = useState<FreeTimeSlot[]>([]);
  const [currentFreeSlot, setCurrentFreeSlot] = useState<FreeTimeSlot | null>(null);

  // リアルタイム時計の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 空き時間スロットの計算
  useEffect(() => {
    const activeTasks = taskSegments?.map(segment => segment.task) || tasks;
    const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    if (!activeTasks.length || !isToday) {
      setFreeTimeSlots([]);
      setCurrentFreeSlot(null);
      return;
    }

    // タスクを時間順にソート（未完了のみ）
    const sortedTasks = [...activeTasks]
      .filter(task => !task.completed)
      .sort((a, b) => {
        const startA = timeToMinutes(a.startTime);
        const startB = timeToMinutes(b.startTime);
        return startA - startB;
      });

    const slots: FreeTimeSlot[] = [];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // 現在時刻から最初のタスクまでの空き時間
    if (sortedTasks.length > 0) {
      const firstTaskStart = timeToMinutes(sortedTasks[0].startTime);
      if (currentMinutes < firstTaskStart) {
        const durationMinutes = firstTaskStart - currentMinutes;
        const currentTimeStr = format(currentTime, 'HH:mm');

        slots.push({
          startTime: currentTimeStr,
          endTime: sortedTasks[0].startTime,
          durationMinutes,
          isCurrentSlot: true,
          nextTaskTitle: sortedTasks[0].title,
          nextTaskEmoji: sortedTasks[0].emoji
        });
      }
    }

    // タスク間の空き時間を計算
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentTaskEnd = timeToMinutes(sortedTasks[i].endTime);
      const nextTaskStart = timeToMinutes(sortedTasks[i + 1].startTime);

      if (nextTaskStart > currentTaskEnd) {
        const durationMinutes = nextTaskStart - currentTaskEnd;
        const isCurrentSlot = currentMinutes >= currentTaskEnd && currentMinutes < nextTaskStart;

        slots.push({
          startTime: sortedTasks[i].endTime,
          endTime: sortedTasks[i + 1].startTime,
          durationMinutes,
          isCurrentSlot,
          nextTaskTitle: sortedTasks[i + 1].title,
          nextTaskEmoji: sortedTasks[i + 1].emoji
        });
      }
    }

    setFreeTimeSlots(slots);

    // 現在の空き時間スロットを設定
    const current = slots.find(slot => slot.isCurrentSlot);
    setCurrentFreeSlot(current || null);
  }, [tasks, taskSegments, currentTime, currentDate]);

  // 時間の表示形式を整形
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}時間${remainingMinutes}分` : `${hours}時間`;
  };

  // 空き時間に応じたアクション提案
  const getActionSuggestions = (minutes: number) => {
    const suggestions = [];
    if (minutes >= 120) {
      suggestions.push({ icon: <BookOpen className="w-4 h-4" />, text: "新しいプロジェクトを始める", color: "text-blue-600" });
    }
    if (minutes >= 60) {
      suggestions.push({ icon: <Zap className="w-4 h-4" />, text: "重要なタスクを1つ完了", color: "text-green-600" });
    }
    if (minutes >= 30) {
      suggestions.push({ icon: <BookOpen className="w-4 h-4" />, text: "短いタスクを片付ける", color: "text-orange-600" });
    }
    if (minutes >= 15) {
      suggestions.push({ icon: <Coffee className="w-4 h-4" />, text: "休憩・リフレッシュタイム", color: "text-purple-600" });
    }
    if (minutes >= 5) {
      suggestions.push({ icon: <Pause className="w-4 h-4" />, text: "深呼吸・軽いストレッチ", color: "text-gray-600" });
    }
    return suggestions;
  };

  if (freeTimeSlots.length === 0) {
    return (
      <div className={`p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Timer className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">✅ 集中タイム継続中</span>
          </div>
          <div className="text-xs text-green-600">隙間時間なく効率的にスケジューリングされています</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 現在の空き時間表示 */}
      {currentFreeSlot && (
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-300 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-800 mb-1">
                ✨ 空き時間中
              </div>
              <div className="text-xl font-bold text-blue-900 mb-1">
                次の予定まであと{formatDuration(
                  currentFreeSlot.durationMinutes -
                  (currentTime.getHours() * 60 + currentTime.getMinutes() - timeToMinutes(currentFreeSlot.startTime))
                )}
              </div>
              <div className="text-sm text-blue-700 flex items-center space-x-1">
                <span>次:</span>
                {currentFreeSlot.nextTaskEmoji && <span>{currentFreeSlot.nextTaskEmoji}</span>}
                <span className="font-medium">{currentFreeSlot.nextTaskTitle}</span>
                <span className="text-blue-600">({currentFreeSlot.endTime}開始)</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Timer className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>

          {/* 空き時間の活用提案 */}
          {currentFreeSlot.durationMinutes >= 5 && (
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1">
                <span>💡</span>
                <span>この{formatDuration(currentFreeSlot.durationMinutes)}でできること:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {getActionSuggestions(currentFreeSlot.durationMinutes).map((suggestion, index) => (
                  <div key={index} className={`flex items-center space-x-2 text-sm ${suggestion.color}`}>
                    {suggestion.icon}
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 今日の空き時間一覧 */}
      {freeTimeSlots.length > 1 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>今日の空き時間スケジュール</span>
          </h3>

          <div className="space-y-2">
            {freeTimeSlots.map((slot, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all duration-200 ${slot.isCurrentSlot
                    ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${slot.isCurrentSlot ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                      {slot.startTime} - {slot.endTime}
                    </span>
                    {slot.isCurrentSlot && (
                      <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full font-medium">
                        現在
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold ${slot.isCurrentSlot ? 'text-blue-800' : 'text-gray-700'
                      }`}>
                      {formatDuration(slot.durationMinutes)}
                    </span>
                    {slot.durationMinutes >= 30 && (
                      <Zap className={`w-4 h-4 ${slot.isCurrentSlot ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                    )}
                  </div>
                </div>
                {slot.nextTaskTitle && (
                  <div className={`text-xs mt-2 flex items-center space-x-1 ${slot.isCurrentSlot ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                    <span>次:</span>
                    {slot.nextTaskEmoji && <span>{slot.nextTaskEmoji}</span>}
                    <span className="font-medium">{slot.nextTaskTitle}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
