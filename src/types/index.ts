export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;
  date: string; // YYYY-MM-DD format
  color: TaskColor;
  completed: boolean;
  isHabit: boolean;
  description?: string;
  subtasks: SubTask[];
  emoji?: string;
  customColor?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: SubTask[]; // 無制限階層対応
}

export type TaskColor = 'coral' | 'blue' | 'green' | 'purple' | 'orange' | 'teal';

export interface HabitData {
  taskId: string;
  date: string;
  completed: boolean;
}

export interface EnergyLevel {
  id: string;
  date: string;
  time: string; // HH:mm
  level: number; // 0-100
  userId: string;
}

export interface Stats {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  focusTime: number; // in minutes
  longestStreak: number;
  currentStreak: number;
  energyAverage: number;
  weeklyEnergyTrend: EnergyLevel[];
}

export type ViewMode = 'day' | 'week' | 'month';

export interface TimeSlot {
  hour: number;
  tasks: Task[];
}

export interface LiveTimelineState {
  currentTime: Date;
  isLive: boolean;
  showProgress: boolean;
}