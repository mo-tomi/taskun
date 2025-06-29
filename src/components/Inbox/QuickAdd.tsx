import React, { useState } from 'react';
import { Plus, Clock, Palette } from 'lucide-react';
import { Task, TaskColor } from '../../types';
import { getTaskColorClasses } from '../../utils/colorUtils';
import { format } from 'date-fns';

interface QuickAddProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  currentDate: Date;
  isOpen: boolean;
  onToggle: () => void;
}

export function QuickAdd({ onAddTask, currentDate, isOpen, onToggle }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState<TaskColor>('coral');
  const [isHabit, setIsHabit] = useState(false);

  const colors: TaskColor[] = ['coral', 'blue', 'green', 'purple', 'orange', 'teal'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      startTime,
      endTime,
      date: format(currentDate, 'yyyy-MM-dd'),
      color,
      completed: false,
      isHabit,
      subtasks: []
    });

    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setIsHabit(false);
    onToggle();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 z-50"
        title="クイック追加"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">クイック追加</h2>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="何をしますか？"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始時刻
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時刻
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              色
            </label>
            <div className="flex space-x-2">
              {colors.map((colorOption) => {
                const colorClasses = getTaskColorClasses(colorOption);
                return (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-full ${colorClasses.bg} ${
                      color === colorOption ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHabit"
              checked={isHabit}
              onChange={(e) => setIsHabit(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="isHabit" className="ml-2 text-sm text-gray-700">
              毎日の習慣にする
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onToggle}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}