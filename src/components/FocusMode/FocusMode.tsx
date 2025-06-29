import React, { useState, useEffect } from 'react';
import { X, Play, Pause, SkipForward, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';
import { calculateDuration, formatDuration } from '../../utils/timeUtils';
import { getTaskColorClasses } from '../../utils/colorUtils';
import { motion } from 'framer-motion';

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onComplete: (id: string) => void;
  onUpdateSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
}

export function FocusMode({ task, onClose, onComplete, onUpdateSubtask }: FocusModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => 
    calculateDuration(task.startTime, task.endTime) * 60 // Convert to seconds
  );

  const colorClasses = getTaskColorClasses(task.color);
  const totalDuration = calculateDuration(task.startTime, task.endTime) * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50"
    >
      <div className="w-full max-w-2xl mx-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          title="閉じる"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {task.title}
          </h1>
          <p className="text-gray-300 text-lg">
            {task.startTime} - {task.endTime} • {formatDuration(calculateDuration(task.startTime, task.endTime))}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#FF7F9C"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.827} 282.7`}
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-mono font-bold text-white mb-2">
                {formatTime(timeLeft)}
              </div>
              <div className="text-gray-400 text-sm">
                {timeLeft === 0 ? '完了！' : '残り時間'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={timeLeft === 0}
            className={`
              p-4 rounded-full text-white transition-all duration-200 hover:scale-105
              ${timeLeft === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600'}
            `}
            title={isActive ? '一時停止' : '開始'}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
          
          <button
            onClick={() => {
              setTimeLeft(0);
              setIsActive(false);
            }}
            className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 hover:scale-105"
            title="スキップ"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="bg-white bg-opacity-10 rounded-2xl p-6 mb-6">
            <h3 className="text-white text-lg font-semibold mb-4">
              サブタスク ({completedSubtasks}/{task.subtasks.length})
            </h3>
            <div className="space-y-3">
              {task.subtasks.map(subtask => (
                <label
                  key={subtask.id}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={(e) => onUpdateSubtask(task.id, subtask.id, e.target.checked)}
                    className="rounded border-gray-400 text-pink-500 focus:ring-pink-500"
                  />
                  <span className={`
                    text-left flex-1 transition-colors
                    ${subtask.completed 
                      ? 'text-gray-400 line-through' 
                      : 'text-white group-hover:text-pink-200'
                    }
                  `}>
                    {subtask.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Complete Button */}
        <button
          onClick={() => onComplete(task.id)}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 flex items-center space-x-2 mx-auto"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>完了にする</span>
        </button>
      </div>
    </motion.div>
  );
}