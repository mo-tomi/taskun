import React, { useMemo, useState } from 'react';
import { BarChart3, Clock, Target, Award, X } from 'lucide-react';
import { Task } from '../../types';
import { subDays } from 'date-fns';

export interface AnalyticsData {
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
    averageTaskDuration: number;
    productivityScore: number;
}

interface SimpleAnalyticsProps {
    tasks: Task[];
    isOpen: boolean;
    onClose: () => void;
    currentDate: Date;
}

const calculateTaskDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
};

const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'orange' | 'purple';
}> = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200'
    };

    return (
        <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
            <div className="flex items-center space-x-2 mb-2">
                {icon}
                <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    {title}
                </h3>
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {value}
            </div>
            {subtitle && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export const SimpleAnalytics: React.FC<SimpleAnalyticsProps> = ({
    tasks,
    isOpen,
    onClose,
    currentDate
}) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    const analyticsData = useMemo((): AnalyticsData => {
        const now = new Date();
        const daysBack = timeRange === 'week' ? 7 : 30;
        const rangeStart = subDays(now, daysBack);
        const rangeTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= rangeStart && taskDate <= now;
        });

        const totalTasks = rangeTasks.length;
        const completedTasks = rangeTasks.filter(t => t.completed).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const totalMinutes = rangeTasks.reduce((sum, task) =>
            sum + calculateTaskDuration(task.startTime, task.endTime), 0);
        const averageTaskDuration = totalTasks > 0 ? totalMinutes / totalTasks : 0;

        const productivityScore = Math.min(100, completionRate + (averageTaskDuration < 60 ? 20 : 0));

        return {
            completionRate,
            totalTasks,
            completedTasks,
            averageTaskDuration,
            productivityScore
        };
    }, [tasks, timeRange]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
                {/* ヘッダー */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-purple-600 to-blue-600">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">詳細分析</h2>
                            <p className="text-white/80 text-sm">タスクの進捗と生産性を分析</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="px-3 py-1 bg-white/20 text-white rounded-lg border border-white/30 text-sm"
                        >
                            <option value="week" className="text-black">過去7日</option>
                            <option value="month" className="text-black">過去30日</option>
                        </select>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* コンテンツ */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="完了率"
                            value={`${analyticsData.completionRate.toFixed(1)}%`}
                            subtitle={`${analyticsData.completedTasks}/${analyticsData.totalTasks} タスク`}
                            icon={<Target className="w-5 h-5 text-green-600" />}
                            color="green"
                        />
                        <StatCard
                            title="平均タスク時間"
                            value={`${analyticsData.averageTaskDuration.toFixed(0)}分`}
                            subtitle="1タスクあたり"
                            icon={<Clock className="w-5 h-5 text-blue-600" />}
                            color="blue"
                        />
                        <StatCard
                            title="生産性スコア"
                            value={analyticsData.productivityScore.toFixed(0)}
                            subtitle="100点満点"
                            icon={<Award className="w-5 h-5 text-purple-600" />}
                            color="purple"
                        />
                    </div>

                    <div className="mt-8 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                            📊 詳細分析
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">傾向</h4>
                                <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                                    <li>• 完了率: {analyticsData.completionRate > 80 ? '優秀' : analyticsData.completionRate > 60 ? '良好' : '要改善'}</li>
                                    <li>• タスク時間: {analyticsData.averageTaskDuration < 60 ? '効率的' : '長時間'}</li>
                                    <li>• 総タスク数: {analyticsData.totalTasks}件</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">推奨事項</h4>
                                <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                                    {analyticsData.completionRate < 70 && <li>• より小さなタスクに分割してみましょう</li>}
                                    {analyticsData.averageTaskDuration > 90 && <li>• 長時間タスクは休憩を挟みましょう</li>}
                                    <li>• 定期的な振り返りで改善点を見つけましょう</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleAnalytics; 