import React, { useState, useEffect } from 'react';
import { Battery, TrendingUp, Heart } from 'lucide-react';
import { EnergyLevel } from '../../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface EnergyTrackerProps {
  currentDate: Date;
  energyLevels: EnergyLevel[];
  onUpdateEnergy: (level: number) => void;
  showHeartRate?: boolean;
}

export function EnergyTracker({ 
  currentDate, 
  energyLevels, 
  onUpdateEnergy,
  showHeartRate = false 
}: EnergyTrackerProps) {
  const [currentEnergy, setCurrentEnergy] = useState(70);
  const [isTracking, setIsTracking] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);

  const todayLevels = energyLevels.filter(
    level => level.date === format(currentDate, 'yyyy-MM-dd')
  );

  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'from-green-400 to-green-600';
    if (level >= 60) return 'from-yellow-400 to-yellow-600';
    if (level >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getEnergyEmoji = (level: number) => {
    if (level >= 80) return '⚡';
    if (level >= 60) return '🔋';
    if (level >= 40) return '🟡';
    return '🔴';
  };

  const handleEnergyUpdate = () => {
    onUpdateEnergy(currentEnergy);
    setIsTracking(false);
  };

  // ヒートマップデータの生成
  const generateHeatmapData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const hourLevels = todayLevels.filter(level => {
        const levelHour = parseInt(level.time.split(':')[0]);
        return levelHour === hour;
      });
      
      const avgLevel = hourLevels.length > 0 
        ? hourLevels.reduce((sum, level) => sum + level.level, 0) / hourLevels.length
        : 0;
      
      return { hour, level: avgLevel };
    });
  };

  const heatmapData = generateHeatmapData();

  return (
    <div className="bg-white border-t border-gray-200">
      {/* エネルギーレベル入力 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Battery className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">エネルギーレベル</span>
            {showHeartRate && heartRate && (
              <div className="flex items-center space-x-1 text-xs text-red-500">
                <Heart className="w-3 h-3" />
                <span>{heartRate} bpm</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getEnergyEmoji(currentEnergy)}</span>
            <span className="text-sm font-bold text-gray-900">{currentEnergy}%</span>
          </div>
        </div>

        {isTracking ? (
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={currentEnergy}
              onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #10b981 100%)`
              }}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setIsTracking(false)}
                className="flex-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleEnergyUpdate}
                className="flex-1 px-3 py-1 text-xs bg-pink-500 text-white rounded-md hover:bg-pink-600"
              >
                記録
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsTracking(true)}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
          >
            現在のエネルギーを記録
          </button>
        )}
      </div>

      {/* エネルギーヒートマップ */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">今日のエネルギー推移</span>
          <TrendingUp className="w-3 h-3 text-gray-400" />
        </div>
        <div className="grid grid-cols-24 gap-0.5 h-3">
          {heatmapData.map(({ hour, level }) => (
            <div
              key={hour}
              className={`rounded-sm ${
                level === 0 
                  ? 'bg-gray-100' 
                  : `bg-gradient-to-t ${getEnergyColor(level)} opacity-${Math.max(20, Math.round(level / 10) * 10)}`
              }`}
              title={`${hour}:00 - ${level > 0 ? Math.round(level) + '%' : '未記録'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0時</span>
          <span>12時</span>
          <span>24時</span>
        </div>
      </div>
    </div>
  );
}