import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Task, EnergyLevel } from '../../types';
import { Timeline } from './Timeline';

interface InfiniteTimelineProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    tasks: Task[];
    energyLevels: EnergyLevel[];
    onTaskUpdate: (task: Task) => void;
    onTaskDelete: (taskId: string) => void;
    onTaskComplete: (taskId: string) => void;
}

interface TimelineData {
    date: Date;
    dateStr: string;
    tasks: Task[];
    energyLevels: EnergyLevel[];
}

const InfiniteTimeline: React.FC<InfiniteTimelineProps> = ({
    currentDate,
    onDateChange,
    tasks,
    energyLevels,
    onTaskUpdate,
    onTaskDelete,
    onTaskComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [centerDateIndex, setCenterDateIndex] = useState(1);
    const lastLoadTime = useRef<number>(0);
    const loadCooldown = 1000; // 1秒間のクールダウン

    // 指定した日付のデータを生成
    const generateTimelineData = useCallback((date: Date): TimelineData => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayTasks = tasks.filter(task => task.date === dateStr);
        const dayEnergyLevels = energyLevels.filter(level =>
            format(new Date(level.date), 'yyyy-MM-dd') === dateStr
        );

        return {
            date,
            dateStr,
            tasks: dayTasks,
            energyLevels: dayEnergyLevels
        };
    }, [tasks, energyLevels]);

    // 初期データの設定
    useEffect(() => {
        const initialData = [
            generateTimelineData(subDays(currentDate, 1)), // 前日
            generateTimelineData(currentDate),              // 今日
            generateTimelineData(addDays(currentDate, 1))   // 翌日
        ];

        setTimelineData(initialData);
        setCenterDateIndex(1);
    }, [currentDate, generateTimelineData]);

    // タスクやエネルギーデータが変更された時の更新
    useEffect(() => {
        setTimelineData(prevData =>
            prevData.map(data => generateTimelineData(data.date))
        );
    }, [tasks, energyLevels, generateTimelineData]);

    // スクロール監視とデータの追加
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container || isLoading) return;

        const now = Date.now();
        if (now - lastLoadTime.current < loadCooldown) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        // 上端近くまでスクロールした場合（前日を追加）
        if (scrollTop < 300 && timelineData.length > 0) {
            setIsLoading(true);
            lastLoadTime.current = now;

            const firstDate = timelineData[0].date;
            const prevDate = subDays(firstDate, 1);
            const newData = generateTimelineData(prevDate);

            // 現在見えている最初の要素を特定
            const visibleElements = container.querySelectorAll('[data-timeline-date]');
            let anchorElement: Element | null = null;
            let anchorOffset = 0;

            for (const element of visibleElements) {
                const rect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                if (rect.top <= containerRect.top + 100) {
                    anchorElement = element;
                    anchorOffset = rect.top - containerRect.top;
                }
            }

            setTimelineData(prev => [newData, ...prev]);
            setCenterDateIndex(prev => prev + 1);

            // DOM更新を待ってからスクロール位置を調整
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (anchorElement) {
                        const newRect = anchorElement.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const newOffset = newRect.top - containerRect.top;
                        const scrollAdjustment = newOffset - anchorOffset;
                        container.scrollTop = container.scrollTop - scrollAdjustment;
                    }
                    setIsLoading(false);
                });
            });
        }

        // 下端近くまでスクロールした場合（翌日を追加）
        else if (scrollTop > scrollHeight - clientHeight - 300 && timelineData.length > 0) {
            setIsLoading(true);
            lastLoadTime.current = now;

            const lastDate = timelineData[timelineData.length - 1].date;
            const nextDate = addDays(lastDate, 1);
            const newData = generateTimelineData(nextDate);

            setTimelineData(prev => [...prev, newData]);

            setTimeout(() => {
                setIsLoading(false);
            }, 100);
        }
    }, [timelineData, isLoading, generateTimelineData]);

    // スクロール位置から現在の中心日付を計算
    const updateCenterDate = useCallback(() => {
        const container = containerRef.current;
        if (!container || timelineData.length === 0) return;

        const { scrollTop, clientHeight } = container;
        const timelineElements = container.querySelectorAll('[data-timeline-date]');

        let closestIndex = 0;
        let minDistance = Infinity;

        timelineElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2 - containerRect.top;
            const containerCenter = clientHeight / 2;
            const distance = Math.abs(elementCenter - containerCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex < timelineData.length) {
            const centerDate = timelineData[closestIndex].date;
            if (!isSameDay(centerDate, currentDate)) {
                onDateChange(centerDate);
            }
        }
    }, [timelineData, currentDate, onDateChange]);

    // スクロールイベントのデバウンス処理
    const debouncedHandleScroll = useCallback(() => {
        let timeoutId: number;

        const debounced = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                handleScroll();
                updateCenterDate();
            }, 150);
        };

        return debounced;
    }, [handleScroll, updateCenterDate]);

    const debouncedScrollHandler = debouncedHandleScroll();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', debouncedScrollHandler);
        return () => {
            container.removeEventListener('scroll', debouncedScrollHandler);
        };
    }, [debouncedScrollHandler]);

    // 特定の日付にスクロール
    const scrollToDate = useCallback((targetDate: Date) => {
        const container = containerRef.current;
        if (!container) return;

        const targetIndex = timelineData.findIndex(data =>
            isSameDay(data.date, targetDate)
        );

        if (targetIndex !== -1) {
            const timelineElement = container.querySelector(
                `[data-timeline-date="${format(targetDate, 'yyyy-MM-dd')}"]`
            );

            if (timelineElement) {
                timelineElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [timelineData]);

    // currentDateが外部から変更された場合のスクロール
    useEffect(() => {
        scrollToDate(currentDate);
    }, [currentDate, scrollToDate]);

    return (
        <div className="h-full flex flex-col">
            {/* 現在の日付インジケーター */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {format(currentDate, 'yyyy年M月d日(E)', { locale: ja })}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        縦スクロールで日付を移動
                    </p>
                </div>
            </div>

            {/* スクロール可能なタイムライン */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                style={{
                    scrollBehavior: 'auto',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {timelineData.map((data, index) => (
                    <motion.div
                        key={data.dateStr}
                        data-timeline-date={data.dateStr}
                        className={`
              relative border-b border-gray-200 dark:border-gray-700
              ${isSameDay(data.date, currentDate) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
            `}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* 日付ヘッダー */}
                        <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {format(data.date, 'M月d日(E)', { locale: ja })}
                                {isSameDay(data.date, new Date()) && (
                                    <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                                        今日
                                    </span>
                                )}
                            </h3>
                        </div>

                        {/* タイムライン内容 */}
                        <div className="min-h-[800px]">
                            <Timeline
                                tasks={data.tasks}
                                currentDate={data.date}
                                onTaskUpdate={(id, updates) => {
                                    const task = data.tasks.find(t => t.id === id);
                                    if (task) {
                                        onTaskUpdate({ ...task, ...updates });
                                    }
                                }}
                                onTaskDelete={onTaskDelete}
                                onTaskComplete={onTaskComplete}
                                onDateChange={() => { }} // 無限スクロールでは日付変更は自動的に処理
                            />
                        </div>
                    </motion.div>
                ))}

                {/* ローディングインジケーター */}
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfiniteTimeline; 