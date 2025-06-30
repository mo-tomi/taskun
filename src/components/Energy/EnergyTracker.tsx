import { useState, useEffect } from 'react';
import { Battery, TrendingUp, Heart, Clock, Play, Sliders } from 'lucide-react';
import { EnergyLevel, Task } from '../../types';
import { format } from 'date-fns';
import { EnergyChart } from './EnergyChart';

interface EnergyTrackerProps {
  currentDate: Date;
  energyLevels: EnergyLevel[];
  onUpdateEnergy: (level: number) => void;
  showHeartRate?: boolean;
  tasks?: Task[]; // タスク情報を追加
  onTaskFocus?: (task: Task) => void; // タスクフォーカス機能を追加
}

export function EnergyTracker({ 
  currentDate, 
  energyLevels, 
  onUpdateEnergy,
  showHeartRate = false,
  tasks = [],
  onTaskFocus
}: EnergyTrackerProps) {
  const [currentEnergy, setCurrentEnergy] = useState(70);
  const [isTracking, setIsTracking] = useState(false);
  const [heartRate] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // リアルタイム時計の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayLevels = energyLevels.filter(
    level => level.date === format(currentDate, 'yyyy-MM-dd')
  );

  // 今日のタスクを時間順にソート
  const todayTasks = tasks
    .filter(task => format(new Date(task.date), 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd'))
    .sort((a, b) => {
      const timeA = parseInt(a.startTime.replace(':', ''));
      const timeB = parseInt(b.startTime.replace(':', ''));
      return timeA - timeB;
    });

  // 現在実行中のタスクを取得
  const getCurrentTask = () => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    
    return todayTasks.find(task => {
      const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
      const endMinutes = parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1]);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes && !task.completed;
    });
  };

  // 次のタスクを取得
  const getNextTask = () => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    
    return todayTasks.find(task => {
      const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
      return startMinutes > currentMinutes && !task.completed;
    });
  };

  const currentTask = getCurrentTask();
  const nextTask = getNextTask();

  const getEnergyColor = (level: number) => {
    if (level >= 80) return 'from-green-400 to-green-600';
    if (level >= 60) return 'from-green-400 to-green-600';
    if (level >= 40) return 'from-blue-400 to-blue-600';
    return 'from-red-400 to-red-600';
  };

  const getEnergyEmoji = (level: number) => {
    if (level >= 80) return '⚡';
    if (level >= 60) return '🔋';
    if (level >= 40) return '�';
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
      {/* リアルタイム進捗表示 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
            <span className="text-base font-bold text-blue-700">現在時刻</span>
          </div>
          <span className="text-2xl font-extrabold text-blue-700 tracking-widest font-mono drop-shadow">
            {format(currentTime, 'HH:mm:ss')}
          </span>
        </div>

        {/* 現在のタスク表示 */}
        {currentTask && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-green-700 mb-1">🟢 実行中</div>
                <div className="text-sm font-semibold text-green-800">
                  {currentTask.emoji} {currentTask.title}
                </div>
                <div className="text-xs text-green-600">
                  {currentTask.startTime} - {currentTask.endTime}
                </div>
              </div>
              {onTaskFocus && (
                <button
                  onClick={() => onTaskFocus(currentTask)}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 次のタスク表示 */}
        {!currentTask && nextTask && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-blue-700 mb-1">⏳ 次のタスク</div>
                <div className="text-sm font-semibold text-blue-800">
                  {nextTask.emoji} {nextTask.title}
                </div>
                <div className="text-xs text-blue-600">
                  {nextTask.startTime} 開始予定
                </div>
              </div>
              {onTaskFocus && (
                <button
                  onClick={() => onTaskFocus(nextTask)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  準備
                </button>
              )}
            </div>
          </div>
        )}

        {/* タスクがない場合 */}
        {!currentTask && !nextTask && (
          <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
            <div className="text-xs font-medium text-gray-600 mb-1">✅ お疲れ様</div>
            <div className="text-sm text-gray-700">今日のタスクは完了です</div>
          </div>
        )}
      </div>
      {/* 常時表示エネルギースライダー */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">エネルギーレベル</span>
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
        
        {/* エネルギースライダー */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max="100"
            value={currentEnergy}
            onChange={(e) => setCurrentEnergy(parseInt(e.target.value))}
            onMouseUp={() => onUpdateEnergy(currentEnergy)}
            onTouchEnd={() => onUpdateEnergy(currentEnergy)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
            style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #f97316 25%, 
                #f59e0b 50%, 
                #3b82f6 75%, 
                #10b981 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>低</span>
            <span>普通</span>
            <span>高</span>
          </div>
        </div>
        
        {/* 簡単記録ボタン */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setCurrentEnergy(25);
                onUpdateEnergy(25);
              }}
              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
            >
              😴 低
            </button>
            <button
              onClick={() => {
                setCurrentEnergy(50);
                onUpdateEnergy(50);
              }}
              className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
            >
              😐 普通
            </button>
            <button
              onClick={() => {
                setCurrentEnergy(75);
                onUpdateEnergy(75);
              }}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
            >
              😊 良い
            </button>
            <button
              onClick={() => {
                setCurrentEnergy(90);
                onUpdateEnergy(90);
              }}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
            >
              ⚡ 最高
            </button>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            📝 自動記録
          </div>
        </div>
      </div>

      {/* エネルギー推移グラフ */}
      <div className="p-2">
        <EnergyChart 
          energyLevels={energyLevels}
          currentDate={currentDate}
          height={100}
        />
        
        {/* 記録履歴リスト */}
        <div className="mt-3 px-2">
          <div className="text-xs text-gray-500 mb-2">今日の記録</div>
          <div className="flex flex-wrap gap-1">
            {todayLevels.length === 0 && (
              <span className="text-xs text-gray-400">記録がありません</span>
            )}
            {todayLevels.slice(-5).map((l) => (
              <span 
                key={l.id} 
                className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
              >
                {l.time} {l.level}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}