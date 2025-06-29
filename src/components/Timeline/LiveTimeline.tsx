import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Task, LiveTimelineState } from '../../types';
import { timeToMinutes, getTimeSlotPosition } from '../../utils/timeUtils';

interface LiveTimelineProps {
  tasks: Task[];
  currentDate: Date;
  isToday: boolean;
}

export function LiveTimeline({ tasks, currentDate, isToday }: LiveTimelineProps) {
  const [liveState, setLiveState] = useState<LiveTimelineState>({
    currentTime: new Date(),
    isLive: isToday,
    showProgress: true
  });

  useEffect(() => {
    if (!isToday) return;

    const interval = setInterval(() => {
      setLiveState(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isToday]);

  const currentTimePosition = React.useMemo(() => {
    if (!isToday) return 0;
    const now = liveState.currentTime;
    const timeString = format(now, 'HH:mm');
    return getTimeSlotPosition(timeString);
  }, [liveState.currentTime, isToday]);

  const getCurrentTaskProgress = (task: Task) => {
    if (!isToday || task.completed) return 0;
    
    const now = liveState.currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);
    
    if (currentMinutes < startMinutes) return 0;
    if (currentMinutes > endMinutes) return 100;
    
    return ((currentMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  if (!isToday) return null;

  return (
    <>
      {/* 現在時刻インジケータ */}
      <div
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{ top: `${currentTimePosition}%` }}
      >
        <div className="flex items-center">
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-l-md font-mono">
            {format(liveState.currentTime, 'HH:mm', { locale: ja })}
          </div>
          <div className="flex-1 h-0.5 bg-red-500 relative">
            <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-red-500 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
          </div>
        </div>
      </div>

      {/* タスク進捗バー */}
      {liveState.showProgress && tasks.map(task => {
        const progress = getCurrentTaskProgress(task);
        if (progress === 0) return null;

        const taskTop = getTimeSlotPosition(task.startTime);
        
        return (
          <div
            key={`progress-${task.id}`}
            className="absolute left-16 right-4 z-10 pointer-events-none"
            style={{ top: `${taskTop}%` }}
          >
            <div className="bg-black bg-opacity-10 rounded-lg overflow-hidden mt-1">
              <div
                className="h-1 bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1 px-2">
              {progress < 100 ? (
                <span>進行中 {Math.round(progress)}%</span>
              ) : (
                <span className="text-green-600 font-medium">時間終了</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}