import { Task, SubTask } from '../types';

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end > start ? end - start : (24 * 60) - start + end;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

// 詳細な時間軸を生成（30分間隔）
export function generateDetailedTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute of [0, 30]) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
}

export function getTimeSlotPosition(time: string): number {
  const minutes = timeToMinutes(time);
  return (minutes / (24 * 60)) * 100;
}

export function getTaskHeight(startTime: string, endTime: string): number {
  const duration = calculateDuration(startTime, endTime);
  return (duration / (24 * 60)) * 100;
}

// タスクの達成度を計算（サブタスクベース）
export function calculateTaskProgress(task: Task): number {
  if (task.completed) return 100;
  if (task.subtasks.length === 0) return task.progress || 0;
  
  const calculateSubtaskProgress = (subtasks: SubTask[]): number => {
    if (subtasks.length === 0) return 0;
    
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    const countSubtasks = (subs: SubTask[]) => {
      for (const sub of subs) {
        totalSubtasks++;
        if (sub.completed) completedSubtasks++;
        if (sub.subtasks && sub.subtasks.length > 0) {
          countSubtasks(sub.subtasks);
        }
      }
    };
    
    countSubtasks(subtasks);
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  };
  
  return calculateSubtaskProgress(task.subtasks);
}

// 時間をピクセル位置に変換
export function timeToPixels(time: string, containerHeight: number, startHour: number = 0, endHour: number = 24): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const timeRange = endMinutes - startMinutes;
  
  return ((totalMinutes - startMinutes) / timeRange) * containerHeight;
}

// 現在時刻のライン位置を計算
export function getCurrentTimePosition(containerHeight: number, startHour: number = 0, endHour: number = 24): number {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return timeToPixels(currentTime, containerHeight, startHour, endHour);
}