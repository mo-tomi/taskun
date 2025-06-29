import React from 'react';
import { X, TrendingUp, Target, Flame, Clock } from 'lucide-react';
import { Task, HabitData } from '../../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  habits: HabitData[];
  getHabitStreak: (taskId: string) => number;
}

export function StatsModal({ isOpen, onClose, tasks, habits, getHabitStreak }: StatsModalProps) {
  if (!isOpen) return null;

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const habitTasks = tasks.filter(t => t.isHabit);
  const currentStreaks = habitTasks.map(task => ({
    name: task.title,
    streak: getHabitStreak(task.id)
  }));
  const longestStreak = Math.max(...currentStreaks.map(h => h.streak), 0);

  // Weekly completion data
  const weekStart = startOfWeek(new Date(), { locale: ja });
  const weekEnd = endOfWeek(new Date(), { locale: ja });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const weeklyData = weekDays.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dayStr);
    const completed = dayTasks.filter(t => t.completed).length;
    
    return {
      day: format(day, 'E', { locale: ja }),
      completed,
      total: dayTasks.length,
      rate: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0
    };
  });

  // Color distribution
  const colorData = tasks.reduce((acc, task) => {
    acc[task.color] = (acc[task.color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colorNames = {
    coral: 'コーラル',
    blue: 'ブルー',
    green: 'グリーン',
    purple: 'パープル',
    orange: 'オレンジ',
    teal: 'ティール'
  };

  const pieData = Object.entries(colorData).map(([color, count]) => ({
    name: colorNames[color as keyof typeof colorNames] || color,
    value: count,
    color: {
      coral: '#64748B',  // スレートグレー
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#6366F1',  // インディゴ
      orange: '#78716C', // ストーン
      teal: '#14B8A6'
    }[color] || '#6B7280'
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">統計</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="閉じる"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">完了率</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {completionRate}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">完了済み</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {completedTasks}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">最長連続</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {longestStreak}日
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">総タスク</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {totalTasks}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">今週の進捗</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Task Distribution */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">タスク分布</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habit Streaks */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">現在の習慣連続記録</h3>
              <div className="space-y-3">
                {currentStreaks.length > 0 ? (
                  currentStreaks.map((habit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <span className="font-medium text-gray-900 truncate">{habit.name}</span>
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-orange-600">{habit.streak}日</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">まだ習慣が記録されていません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}