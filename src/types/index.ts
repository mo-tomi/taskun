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
  progress?: number; // 0-100, タスクの進捗度
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

// エネルギーグラフ用の新しい型
export interface EnergyGraphData {
  hour: string;
  level: number;
  timestamp: string;
}