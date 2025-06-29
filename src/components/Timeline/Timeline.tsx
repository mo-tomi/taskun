import { Task } from '../../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, Clock, MoreHorizontal, Play, Pause } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimelineProps {
  tasks: Task[];
  currentDate: Date;
  onTaskComplete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskFocus: (task: Task) => void;
  onTaskReplan: (id: string) => void;
  onTaskDelete: (id: string) => void;
}

export function Timeline({ 
  tasks, 
  currentDate,
  onTaskComplete, 
  onTaskFocus
}: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // リアルタイム時計の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // タスクを開始時間順にソート
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = parseInt(a.startTime.replace(':', ''));
    const timeB = parseInt(b.startTime.replace(':', ''));
    return timeA - timeB;
  });

  // 現在時刻がタスクの時間範囲内かどうかを判定
  const isTaskActive = (task: Task) => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
    const endMinutes = parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1]);
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // 次に実行すべきタスクを取得
  const getNextTask = () => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    
    return sortedTasks.find(task => {
      const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
      return startMinutes > currentMinutes && !task.completed;
    });
  };

  // 現在実行中のタスクを取得
  const getCurrentTask = () => {
    return sortedTasks.find(task => isTaskActive(task) && !task.completed);
  };

  const currentTask = getCurrentTask();
  const nextTask = getNextTask();

  const getTaskColor = (task: Task) => {
    const colors = {
      coral: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-400' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-400' },
      green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-400' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-400' },
      orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-400' },
      teal: { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', dot: 'bg-teal-400' }
    };
    return colors[task.color] || colors.coral;
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">今日のタスクはありません</p>
          <p className="text-sm">新しいタスクを追加して始めましょう</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* リアルタイム状況表示 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">現在時刻</span>
            <span className="text-lg font-bold text-blue-600">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {format(currentTime, 'yyyy年M月d日(E)', { locale: ja })}
          </div>
        </div>
        
        {/* 現在のタスク表示 */}
        {currentTask ? (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-green-800">🟢 実行中</div>
                <div className="text-lg font-semibold text-green-900">
                  {currentTask.emoji} {currentTask.title}
                </div>
                <div className="text-sm text-green-700">
                  {currentTask.startTime} - {currentTask.endTime}
                </div>
              </div>
              <button
                onClick={() => onTaskComplete(currentTask.id)}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                完了
              </button>
            </div>
          </div>
        ) : nextTask ? (
          <div className="p-3 bg-orange-100 border border-orange-300 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-800">⏳ 次のタスク</div>
                <div className="text-lg font-semibold text-orange-900">
                  {nextTask.emoji} {nextTask.title}
                </div>
                <div className="text-sm text-orange-700">
                  {nextTask.startTime} 開始予定
                </div>
              </div>
              <div className="text-xs text-orange-600">
                あと {Math.ceil((parseInt(nextTask.startTime.split(':')[0]) * 60 + parseInt(nextTask.startTime.split(':')[1]) - 
                         (parseInt(format(currentTime, 'HH').split(':')[0]) * 60 + parseInt(format(currentTime, 'mm')))) / 60)} 時間
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">✅ 本日のタスクは完了です</div>
              <div className="text-xs text-gray-500 mt-1">お疲れ様でした！</div>
            </div>
          </div>
        )}
      </div>

      {/* 縦のタイムライン */}
      <div className="absolute left-6 top-32 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {sortedTasks.map((task) => {
          const colors = getTaskColor(task);
          const isActive = isTaskActive(task);
          const isPast = (() => {
            const now = format(currentTime, 'HH:mm');
            const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
            const endMinutes = parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1]);
            return currentMinutes > endMinutes;
          })();
          
          return (
            <div key={task.id} className="relative flex items-start space-x-4">
              {/* タイムライン上の点 */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  isActive ? 'bg-green-500 animate-pulse' :
                  task.completed ? colors.dot :
                  isPast ? 'bg-gray-400' :
                  colors.dot
                }`} />
              </div>
              
              {/* タスクカード */}
              <div className={`flex-1 min-w-0 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                isActive ? 'bg-green-50 border-green-300 ring-2 ring-green-200' :
                task.completed ? 'bg-gray-50 border-gray-200 opacity-60' :
                isPast ? 'bg-red-50 border-red-200' :
                `${colors.bg} ${colors.border}`
              }`}
                   onClick={() => onTaskFocus(task)}>
                
                {/* 時間表示と状態 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-green-700' :
                      task.completed ? 'text-gray-500' :
                      isPast ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {task.startTime} - {task.endTime}
                    </div>
                    {isActive && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium animate-pulse">
                        実行中
                      </span>
                    )}
                    {isPast && !task.completed && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
                        期限切れ
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskComplete(task.id);
                    }}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.completed 
                        ? `${colors.dot} border-transparent text-white` 
                        : `border-gray-300 hover:border-gray-400`
                    } transition-colors`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </button>
                </div>
                
                {/* タスクタイトル */}
                <h3 className={`text-lg font-semibold ${colors.text} mb-2 ${
                  task.completed ? 'line-through opacity-60' : ''
                }`}>
                  {task.emoji && <span className="mr-2">{task.emoji}</span>}
                  {task.title}
                </h3>
                
                {/* タスク説明 */}
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                {/* サブタスク */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      サブタスク
                    </div>
                    <div className="space-y-1">
                      {task.subtasks.slice(0, 3).map((subtask) => (
                        <div key={subtask.id} className="flex items-center space-x-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            subtask.completed ? colors.dot : 'bg-gray-300'
                          }`} />
                          <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                      {task.subtasks.length > 3 && (
                        <div className="text-xs text-gray-500 ml-3.5">
                          他 {task.subtasks.length - 3} 件
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* プログレスバー */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>進捗</span>
                      <span>{Math.round((task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${colors.dot.replace('bg-', 'bg-').replace('-400', '-500')} transition-all duration-300`}
                        style={{ 
                          width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
