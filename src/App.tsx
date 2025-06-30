import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Search, BarChart3, Keyboard, Sun, Moon, Monitor } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Timeline } from './components/Timeline/Timeline';
import { TimelineMultiDay } from './components/Timeline/TimelineMultiDay'; // 🌅 複数日対応タイムライン
import { QuickAdd } from './components/Inbox/QuickAdd';
import { FocusMode } from './components/FocusMode/FocusMode';
import { StatsModal } from './components/Stats/StatsModal';
import { EnergyTracker } from './components/Energy/EnergyTracker';

import { useTasks } from './hooks/useTasks';
import { useEnergyTracking } from './hooks/useEnergyTracking';
import { useKeyboardShortcuts, useShortcutHelp, createDefaultShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { Task } from './types';

// 新機能コンポーネント
import ShortcutHelp from './components/ui/ShortcutHelp';
import SearchFilter from './components/ui/SearchFilter';
import SimpleAnalytics from './components/Analytics/SimpleAnalytics';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // 🎨 新機能の状態管理
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // 🎯 新機能のフック
  const { theme, toggleTheme } = useTheme();
  const { isVisible: showShortcutHelp, showHelp, hideHelp, toggleHelp } = useShortcutHelp();

  // ⌨️ キーボードショートカット設定
  const shortcuts = createDefaultShortcuts({
    onQuickAdd: () => setIsQuickAddOpen(true),
    onSearch: () => setShowSearch(true),
    onToggleTheme: toggleTheme,
    onShowStats: () => setShowAnalytics(true),
    onShowHelp: showHelp,
    onFocusToday: () => setCurrentDate(new Date()),
    onNextDay: () => setCurrentDate(prev => addDays(prev, 1)),
    onPrevDay: () => setCurrentDate(prev => subDays(prev, 1)),
    onSelectAll: () => console.log('Select all tasks'),
    onDeleteSelected: () => console.log('Delete selected tasks'),
  });

  useKeyboardShortcuts(shortcuts);

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    replanTask,
    getTasksForDate,
    getTaskSegments, // 🌅 複数日タスクセグメント取得
    getHabitStreak,
    habits,
    getTaskHistory // 追加
  } = useTasks();

  const {
    addEnergyLevel,
    getEnergyForDate,
    energyLevels
  } = useEnergyTracking();

  const todayTasks = getTasksForDate(format(currentDate, 'yyyy-MM-dd'));
  const todayTaskSegments = getTaskSegments(format(currentDate, 'yyyy-MM-dd')); // 🌅 複数日タスクセグメント
  const todayEnergyLevels = getEnergyForDate(format(currentDate, 'yyyy-MM-dd'));

  const handlePrevDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleTaskEdit = (task: Task) => {
    // タスク編集機能は将来実装予定
    console.log('Edit task:', task);
  };

  const handleTaskFocus = (task: Task) => {
    // ポモドーロタイマー機能を無効化
    // setFocusTask(task);
  };

  const handleUpdateSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updateSubtaskRecursive = (subtasks: any[]): any[] => {
      return subtasks.map(st => {
        if (st.id === subtaskId) {
          return { ...st, completed };
        }
        if (st.subtasks) {
          return { ...st, subtasks: updateSubtaskRecursive(st.subtasks) };
        }
        return st;
      });
    };

    const updatedSubtasks = updateSubtaskRecursive(task.subtasks);
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans antialiased">
      {/* カレンダーヘッダー */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'yyyy年M月')}
            </h2>
            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 🎨 新機能ツールバー */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600"
              title="検索・フィルター (Ctrl+F)"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-purple-600"
              title="詳細分析 (Ctrl+Shift+S)"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={showHelp}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-600"
              title="ショートカットヘルプ (?)"
            >
              <Keyboard className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-orange-600"
              title="テーマ切り替え (Ctrl+D)"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> :
                theme === 'dark' ? <Sun className="w-5 h-5" /> :
                  <Monitor className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 週間カレンダー */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(subDays(currentDate, currentDate.getDay()), i);
            const isSelected = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
            const dayTasks = getTasksForDate(format(date, 'yyyy-MM-dd'));
            const dayTaskSegments = getTaskSegments(format(date, 'yyyy-MM-dd')); // 🌅 複数日タスクも含む

            return (
              <div
                key={i}
                className={`p-3 text-center rounded-lg cursor-pointer ${isSelected ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                  }`}
                onClick={() => setCurrentDate(date)}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {format(date, 'E')}
                </div>
                <div className={`text-lg font-semibold ${isSelected ? 'text-red-600' : 'text-gray-900'
                  }`}>
                  {format(date, 'd')}
                </div>
                <div className="text-xs text-gray-400">
                  {format(date, 'M/d')}
                </div>
                {dayTaskSegments.length > 0 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* タイムライン */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 🌅 複数日対応の従来タイムライン */}
        <Timeline
          tasks={todayTasks}
          taskSegments={todayTaskSegments}
          currentDate={currentDate}
          onTaskComplete={completeTask}
          onTaskEdit={handleTaskEdit}
          onTaskFocus={handleTaskFocus}
          onTaskReplan={replanTask}
          onTaskDelete={deleteTask}
          onTaskUpdate={updateTask}
        />
      </div>

      {/* Quick Add */}
      <QuickAdd
        onAddTask={addTask}
        currentDate={currentDate}
        isOpen={isQuickAddOpen}
        onToggle={() => setIsQuickAddOpen(!isQuickAddOpen)}
      />

      {/* Focus Mode */}
      <AnimatePresence>
        {focusTask && (
          <FocusMode
            task={focusTask}
            onClose={() => setFocusTask(null)}
            onComplete={completeTask}
            onUpdateSubtask={handleUpdateSubtask}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        tasks={tasks}
        habits={habits}
        getHabitStreak={getHabitStreak}
      />

      {/* 🎨 新機能コンポーネント */}
      {/* ショートカットヘルプ */}
      <ShortcutHelp
        isOpen={showShortcutHelp}
        shortcuts={shortcuts}
        onClose={hideHelp}
      />

      {/* 検索・フィルター */}
      {showSearch && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-start justify-center pt-20">
          <div className="w-full max-w-2xl mx-4">
            <SearchFilter
              tasks={tasks}
              onFilteredTasksChange={setFilteredTasks}
              isOpen={showSearch}
              onToggle={() => setShowSearch(!showSearch)}
            />
          </div>
        </div>
      )}

      {/* 詳細分析 */}
      <SimpleAnalytics
        tasks={tasks}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        currentDate={currentDate}
      />
    </div>
  );
}

export default App;
