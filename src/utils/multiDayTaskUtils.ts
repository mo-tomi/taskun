import { Task, MultiDayTaskSegment } from '../types';
import { format, addDays, parseISO, eachDayOfInterval, isAfter, isBefore, isSameDay } from 'date-fns';

// 🌅 日付をまたぐタスクかどうかを判定
export const isMultiDayTask = (task: Task): boolean => {
    if (!task.endDate) return false;

    const startDate = parseISO(task.date);
    const endDate = parseISO(task.endDate);

    // 異なる日付 または 同じ日でも時刻が逆転している場合（翌日にまたがる）
    return !isSameDay(startDate, endDate) ||
        (isSameDay(startDate, endDate) && task.startTime > task.endTime);
};

// 🕐 時刻が翌日にまたがるかどうかを判定（例：23:00-02:00）
export const isTimeSpanningNextDay = (startTime: string, endTime: string): boolean => {
    return startTime > endTime;
};

// 📅 複数日タスクを日別のセグメントに分割
export const splitMultiDayTask = (task: Task): MultiDayTaskSegment[] => {
    if (!isMultiDayTask(task)) {
        // 単日タスクの場合、そのまま返す
        return [{
            task,
            segmentDate: task.date,
            isFirstDay: true,
            isLastDay: true,
            segmentStartTime: task.startTime,
            segmentEndTime: task.endTime
        }];
    }

    const segments: MultiDayTaskSegment[] = [];
    const startDate = parseISO(task.date);
    const endDate = task.endDate ? parseISO(task.endDate) : startDate;

    // 同じ日で時刻が翌日にまたがる場合
    if (isSameDay(startDate, endDate) && isTimeSpanningNextDay(task.startTime, task.endTime)) {
        // 1日目: 開始時刻 → 23:59
        segments.push({
            task,
            segmentDate: task.date,
            isFirstDay: true,
            isLastDay: false,
            segmentStartTime: task.startTime,
            segmentEndTime: '23:59'
        });

        // 2日目: 00:00 → 終了時刻
        const nextDay = format(addDays(startDate, 1), 'yyyy-MM-dd');
        segments.push({
            task,
            segmentDate: nextDay,
            isFirstDay: false,
            isLastDay: true,
            segmentStartTime: '00:00',
            segmentEndTime: task.endTime
        });

        return segments;
    }

    // 複数日にわたる場合
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    days.forEach((day, index) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const isFirst = index === 0;
        const isLast = index === days.length - 1;

        let segmentStartTime: string;
        let segmentEndTime: string;

        if (isFirst && isLast) {
            // 開始日と終了日が同じ（通常はここには来ない）
            segmentStartTime = task.startTime;
            segmentEndTime = task.endTime;
        } else if (isFirst) {
            // 開始日
            segmentStartTime = task.startTime;
            segmentEndTime = '23:59';
        } else if (isLast) {
            // 終了日
            segmentStartTime = '00:00';
            segmentEndTime = task.endTime;
        } else {
            // 中間日（終日）
            segmentStartTime = '00:00';
            segmentEndTime = '23:59';
        }

        segments.push({
            task,
            segmentDate: dayStr,
            isFirstDay: isFirst,
            isLastDay: isLast,
            segmentStartTime,
            segmentEndTime
        });
    });

    return segments;
};

// 📅 特定の日に表示すべきタスクセグメントを取得
export const getTaskSegmentsForDate = (tasks: Task[], targetDate: string): MultiDayTaskSegment[] => {
    const segments: MultiDayTaskSegment[] = [];

    tasks.forEach(task => {
        const taskSegments = splitMultiDayTask(task);
        const segmentsForDate = taskSegments.filter(segment => segment.segmentDate === targetDate);
        segments.push(...segmentsForDate);
    });

    return segments;
};

// 🎨 複数日タスクの表示スタイルを決定
export const getMultiDayTaskStyle = (segment: MultiDayTaskSegment) => {
    const baseClasses = "relative";

    if (!segment.task.isMultiDay && !isMultiDayTask(segment.task)) {
        return baseClasses;
    }

    let styleClasses = baseClasses;

    // 開始日のスタイル
    if (segment.isFirstDay && !segment.isLastDay) {
        styleClasses += " rounded-l-lg border-r-2 border-dashed border-gray-300";
    }
    // 終了日のスタイル
    else if (segment.isLastDay && !segment.isFirstDay) {
        styleClasses += " rounded-r-lg border-l-2 border-dashed border-gray-300";
    }
    // 中間日のスタイル
    else if (!segment.isFirstDay && !segment.isLastDay) {
        styleClasses += " border-x-2 border-dashed border-gray-300";
    }

    return styleClasses;
};

// 📊 複数日タスクの進捗計算
export const calculateMultiDayTaskProgress = (task: Task, currentDate: string): number => {
    if (!isMultiDayTask(task)) {
        return task.completed ? 100 : 0;
    }

    const segments = splitMultiDayTask(task);
    const currentSegment = segments.find(s => s.segmentDate === currentDate);

    if (!currentSegment) return 0;

    // 現在の日付が終了日より前の場合は、その日の進捗のみ計算
    const currentDateObj = parseISO(currentDate);
    const endDateObj = parseISO(task.endDate || task.date);

    if (isBefore(currentDateObj, endDateObj)) {
        // まだ完了していない日の場合は部分進捗
        return task.progress || 0;
    } else {
        // 最終日の場合は完了状態に基づく
        return task.completed ? 100 : (task.progress || 0);
    }
};

// 🔧 複数日タスクのラベル生成
export const generateMultiDayTaskLabel = (segment: MultiDayTaskSegment): string => {
    const { task, isFirstDay, isLastDay } = segment;

    if (!isMultiDayTask(task)) {
        return task.title;
    }

    let label = task.title;

    if (isFirstDay && !isLastDay) {
        label += " 🚀"; // 開始
    } else if (isLastDay && !isFirstDay) {
        label += " 🏁"; // 終了
    } else if (!isFirstDay && !isLastDay) {
        label += " ⏳"; // 継続中
    }

    return label;
};

export default {
    isMultiDayTask,
    isTimeSpanningNextDay,
    splitMultiDayTask,
    getTaskSegmentsForDate,
    getMultiDayTaskStyle,
    calculateMultiDayTaskProgress,
    generateMultiDayTaskLabel
}; 