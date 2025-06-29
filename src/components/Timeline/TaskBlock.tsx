import React from 'react';
import { Clock, CheckCircle2, Focus, Repeat, Trash2 } from 'lucide-react';
import { Task } from '../../types';
import { formatDuration, calculateDuration } from '../../utils/timeUtils';
import { motion } from 'framer-motion';

interface TaskBlockProps {
  task: Task;
  style: React.CSSProperties;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onFocus: (task: Task) => void;
  onReplan: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskBlock({ 
  task, 
  style, 
  onComplete, 
  onEdit, 
  onFocus,
  onReplan,
  onDelete
}: TaskBlockProps) {
  const duration = calculateDuration(task.startTime, task.endTime);
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const isCompleted = task.completed;

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    hover: { 
      scale: 1.02, 
      zIndex: 50,  // 重なったタスクの上に表示するために高い値に設定
      transition: { duration: 0.2 } 
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      layout
      style={style}
      className={`absolute left-16 right-4 rounded-lg p-3 flex flex-col cursor-pointer transition-all duration-200 group shadow-md hover:shadow-lg ${
        isCompleted
          ? 'bg-muted/50 border-transparent'
          : 'bg-primary/10 border-primary/20 hover:border-primary/50 border hover:bg-primary/15'
      }`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm truncate ${
            isCompleted ? 'text-muted-foreground line-through' : 'text-primary'
          }`}>
            {task.emoji && <span className="mr-2">{task.emoji}</span>}
            {task.title}
          </h3>
          <div className={`flex items-center gap-2 text-xs mt-1 ${
            isCompleted ? 'text-muted-foreground/80' : 'text-primary/80'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{task.startTime} - {task.endTime}</span>
            <span className="px-1.5 py-0.5 bg-primary/10 rounded-full">
              {formatDuration(duration)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onFocus(task); }}
            className="p-1.5 rounded-md hover:bg-primary/20 text-primary/80 transition-colors"
            title="集中モード"
          >
            <Focus className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
            className="p-1.5 rounded-md hover:bg-green-500/20 text-green-600 transition-colors"
            title="完了"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (window.confirm('このタスクを削除しますか？')) {
                onDelete(task.id);
              }
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition-colors"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {totalSubtasks > 0 && (
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className={`${isCompleted ? 'text-muted-foreground/80' : 'text-primary/80'}`}>サブタスク</span>
            <span className={`${isCompleted ? 'text-muted-foreground/80' : 'text-primary/80'}`}>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full bg-primary/20 rounded-full h-1 mt-1">
            <motion.div 
              className="bg-primary h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {task.isHabit && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isCompleted ? 'bg-muted text-muted-foreground' : 'bg-secondary/20 text-secondary'}`}>
          <Repeat className="w-3 h-3" />
          <span>習慣</span>
        </div>
      )}
    </motion.div>
  );
}