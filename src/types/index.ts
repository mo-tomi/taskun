export interface Task {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;
  date: string; // YYYY-MM-DD format - 開始日
  endDate?: string; // YYYY-MM-DD format - 終了日（省略時は開始日と同じ）
  color: TaskColor;
  completed: boolean;
  isHabit: boolean;
  description?: string;
  subtasks: SubTask[];
  emoji?: string;
  customColor?: string;
  progress?: number; // 0-100, タスクの進捗度
  isMultiDay?: boolean; // 複数日にわたるタスクかどうか
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

// 🌅 日付をまたぐタスク用のユーティリティ型
export interface MultiDayTaskSegment {
  task: Task;
  segmentDate: string; // この区間が表示される日付
  isFirstDay: boolean; // 開始日かどうか
  isLastDay: boolean; // 終了日かどうか
  segmentStartTime: string; // この日の区間開始時刻
  segmentEndTime: string; // この日の区間終了時刻
}

// 📝 Todoアイテム - まだスケジュールに配置されていないタスク
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  color: TaskColor;
  emoji?: string;
  customColor?: string;
  isHabit: boolean;
  subtasks: SubTask[];
  estimatedDuration?: number; // 予想時間（分）
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: string; // ISO string
}