import { Task } from '../../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, Clock, MoreHorizontal } from 'lucide-react';

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
  // タスクを開始時間順にソート
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = parseInt(a.startTime.replace(':', ''));
    const timeB = parseInt(b.startTime.replace(':', ''));
    return timeA - timeB;
  });

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
      {/* 縦のタイムライン */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {sortedTasks.map((task, index) => {
          const colors = getTaskColor(task);
          
          return (
            <div key={task.id} className="relative flex items-start space-x-4">
              {/* タイムライン上の点 */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${colors.dot} border-2 border-white shadow-sm`} />
              </div>
              
              {/* タスクカード */}
              <div className={`flex-1 min-w-0 ${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                   onClick={() => onTaskFocus(task)}>
                
                {/* 時間表示 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-gray-600">
                    {task.startTime} - {task.endTime}
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
