import React from 'react';
import { generateDetailedTimeSlots, getCurrentTimePosition } from '../../utils/timeUtils';

interface TimelineGridProps {
  containerHeight?: number;
  showCurrentTime?: boolean;
  startHour?: number;
  endHour?: number;
}

export function TimelineGrid({ 
  containerHeight = 800, 
  showCurrentTime = true,
  startHour = 0,
  endHour = 24 
}: TimelineGridProps) {
  const timeSlots = generateDetailedTimeSlots();
  const relevantSlots = timeSlots.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= startHour && hour <= endHour;
  });

  const totalHours = endHour - startHour;
  const currentTimePosition = showCurrentTime ? getCurrentTimePosition(containerHeight, startHour, endHour) : null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 時間グリッドライン */}
      {relevantSlots.map((time, index) => {
        const hour = parseInt(time.split(':')[0]);
        const minute = parseInt(time.split(':')[1]);
        const isFullHour = minute === 0;
        const relativeHour = hour - startHour;
        const top = (relativeHour * 60 + minute) / (totalHours * 60) * containerHeight;
        
        return (
          <div
            key={time}
            className="absolute left-0 right-0"
            style={{ top: `${top}px` }}
          >
            {/* グリッドライン */}
            <div 
              className={`w-full ${
                isFullHour 
                  ? 'border-t border-gray-300' 
                  : 'border-t border-gray-100'
              }`}
            />
            
            {/* 時間ラベル */}
            {isFullHour && (
              <div className="absolute -left-16 -top-2">
                <div className="text-sm font-medium text-gray-600 bg-white px-1 rounded">
                  {time}
                </div>
              </div>
            )}
            
            {/* 30分マーカー */}
            {!isFullHour && (
              <div className="absolute -left-12 -top-1">
                <div className="text-xs text-gray-400 bg-white px-1">
                  :{time.split(':')[1]}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* 現在時刻ライン */}
      {currentTimePosition !== null && (
        <div
          className="absolute left-0 right-0 z-10"
          style={{ top: `${currentTimePosition}px` }}
        >
          {/* メインライン */}
          <div className="w-full h-0.5 bg-red-500 shadow-lg" />
          
          {/* 時刻ドット */}
          <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          
          {/* 現在時刻表示 */}
          <div className="absolute -left-20 -top-6">
            <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded shadow-lg">
              {new Date().toLocaleTimeString('ja-JP', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      )}

      {/* 背景時間ゾーン */}
      <div className="absolute inset-0">
        {/* 朝 (6-12) */}
        <div 
          className="absolute left-0 right-0 bg-yellow-50 opacity-30"
          style={{ 
            top: `${(6 - startHour) / totalHours * 100}%`,
            height: `${6 / totalHours * 100}%`
          }}
        />
        
        {/* 昼 (12-18) */}
        <div 
          className="absolute left-0 right-0 bg-blue-50 opacity-30"
          style={{ 
            top: `${(12 - startHour) / totalHours * 100}%`,
            height: `${6 / totalHours * 100}%`
          }}
        />
        
        {/* 夜 (18-22) */}
        <div 
          className="absolute left-0 right-0 bg-purple-50 opacity-30"
          style={{ 
            top: `${(18 - startHour) / totalHours * 100}%`,
            height: `${4 / totalHours * 100}%`
          }}
        />
        
        {/* 深夜 (22-6) */}
        <div 
          className="absolute left-0 right-0 bg-gray-100 opacity-30"
          style={{ 
            top: `${(22 - startHour) / totalHours * 100}%`,
            height: `${(totalHours - (22 - startHour)) / totalHours * 100}%`
          }}
        />
      </div>
    </div>
  );
}