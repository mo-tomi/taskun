import React, { useState } from 'react';
import { Clock, CheckCircle2, MoreVertical, Focus } from 'lucide-react';
import { Task } from '../../types';
import { getTaskColorClasses } from '../../utils/colorUtils';
import { formatDuration, calculateDuration } from '../../utils/timeUtils';
import { motion } from 'framer-motion';

interface TaskBlockProps {
  task: Task;
  style: React.CSSProperties;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onFocus: (task: Task) => void;
  onReplan: (id: string) => void;
}

export function TaskBlock({ 
  task, 
  style, 
  onComplete, 
  onEdit, 
  onFocus,
  onReplan 
}: TaskBlockProps) {
  const [showMenu, setShowMenu] = useState(false);
  const colorClasses = getTaskColorClasses(task.color);
  const duration = calculateDuration(task.startTime, task.endTime);

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`
        absolute left-16 right-4 rounded-lg border-2 shadow-sm cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${colorClasses.bg} ${colorClasses.border}
        ${task.completed ? 'opacity-60' : ''}
      `}
      style={style}
      onClick={() => onEdit(task)}
    >
      <div className="p-3 h-full flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm ${colorClasses.text} truncate`}>
              {task.title}
            </h3>
            <div className={`flex items-center space-x-2 mt-1 ${colorClasses.text} opacity-90`}>
              <Clock className="w-3 h-3" />
              <span className="text-xs">
                {task.startTime} - {task.endTime}
              </span>
              <span className="text-xs">
                ({formatDuration(duration)})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFocus(task);
              }}
              className={`p-1 rounded hover:bg-black hover:bg-opacity-20 ${colorClasses.text}`}
              title="集中モード"
            >
              <Focus className="w-3 h-3" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className={`p-1 rounded hover:bg-black hover:bg-opacity-20 ${colorClasses.text}`}
              title="完了"
            >
              <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {totalSubtasks > 0 && (
          <div className={`mt-2 text-xs ${colorClasses.text} opacity-90`}>
            サブタスク {completedSubtasks}/{totalSubtasks} 完了
          </div>
        )}

        {task.isHabit && (
          <div className={`mt-1 text-xs ${colorClasses.text} opacity-75`}>
            📅 毎日の習慣
          </div>
        )}
      </div>

      {!task.completed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReplan(task.id);
          }}
          className="absolute -right-2 -top-2 bg-gray-600 text-white rounded-full p-1 text-xs hover:bg-gray-700 transition-colors"
          title="明日に再計画"
        >
          ↗
        </button>
      )}
    </motion.div>
  );
}