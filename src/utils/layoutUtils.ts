import { Task } from '../types';
import { timeToMinutes } from './timeUtils';

export type TaskWithLayout<T> = T & {
    layout: {
        left: number; // 0-1 percentage
        width: number; // 0-1 percentage
    };
};

// Helper to check for time overlap.
const tasksOverlap = <T extends Task>(taskA: T, taskB: T): boolean => {
    const startA = timeToMinutes(taskA.startTime);
    const endA = timeToMinutes(taskA.endTime);
    const startB = timeToMinutes(taskB.startTime);
    const endB = timeToMinutes(taskB.endTime);

    // Handle overnight tasks
    const effectiveEndA = endA < startA ? endA + 24 * 60 : endA;
    const effectiveEndB = endB < startB ? endB + 24 * 60 : endB;

    return startA < effectiveEndB && effectiveEndA > startB;
};

export function calculateOverlappingLayout<T extends Task>(
    tasks: T[]
): TaskWithLayout<T>[] {
    const laidOutTasks: TaskWithLayout<T>[] = tasks.map((task) => ({
        ...task,
        layout: { left: 0, width: 1 },
    }));

    // 1. Find groups of overlapping tasks
    const groups: TaskWithLayout<T>[][] = [];
    if (laidOutTasks.length > 0) {
        let currentGroup = [laidOutTasks[0]];
        let maxEnd = timeToMinutes(laidOutTasks[0].endTime);
        if (maxEnd < timeToMinutes(laidOutTasks[0].startTime)) {
            maxEnd += 24 * 60;
        }


        for (let i = 1; i < laidOutTasks.length; i++) {
            const task = laidOutTasks[i];
            const taskStart = timeToMinutes(task.startTime);

            if (taskStart < maxEnd) {
                currentGroup.push(task);
                let taskEnd = timeToMinutes(task.endTime);
                if (taskEnd < taskStart) {
                    taskEnd += 24 * 60;
                }
                maxEnd = Math.max(maxEnd, taskEnd);
            } else {
                groups.push(currentGroup);
                currentGroup = [task];
                maxEnd = timeToMinutes(task.endTime);
                if (maxEnd < timeToMinutes(task.startTime)) {
                    maxEnd += 24 * 60;
                }
            }
        }
        groups.push(currentGroup);
    }

    // 2. For each group, calculate the layout
    for (const group of groups) {
        const columns: TaskWithLayout<T>[][] = [];
        group.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        for (const task of group) {
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
                const col = columns[i];
                if (!col.some((colTask) => tasksOverlap(task, colTask))) {
                    col.push(task);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([task]);
            }
        }

        const numCols = columns.length;
        for (let i = 0; i < numCols; i++) {
            for (const task of columns[i]) {
                task.layout.width = 1 / numCols;
                task.layout.left = i / numCols;
            }
        }
    }

    return laidOutTasks;
} 