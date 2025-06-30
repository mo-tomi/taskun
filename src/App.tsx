import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Timeline } from './components/Timeline/Timeline';
import { QuickAdd } from './components/Inbox/QuickAdd';
import { FocusMode } from './components/FocusMode/FocusMode';
import { StatsModal } from './components/Stats/StatsModal';
import { EnergyTracker } from './components/Energy/EnergyTracker';

import { useTasks } from './hooks/useTasks';
import { useEnergyTracking } from './hooks/useEnergyTracking';
import { Task } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    replanTask,
    getTasksForDate,
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
    <div className="h-screen flex bg-gray-50 font-sans antialiased">
      {/* 左サイドバー - 受信トレイ */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">受信トレイ</h1>
        </div>

        {/* タスクリスト */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${task.color === 'coral' ? 'bg-red-400' :
                  task.color === 'blue' ? 'bg-blue-400' :
                    task.color === 'green' ? 'bg-green-400' :
                      task.color === 'purple' ? 'bg-purple-400' :
                        task.color === 'orange' ? 'bg-orange-400' :
                          'bg-teal-400'
                  }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.startTime} - {task.endTime}</div>
                </div>
              </div>
              <button
                onClick={() => addTask(task)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
              >
                +
              </button>
            </div>
          ))}

          {/* 新規タスク追加ボタン */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm"
          >
            + 新しいタスクを追加
          </button>
        </div>

        {/* タスク履歴リスト */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-2">タスク履歴</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {getTaskHistory().length === 0 && (
              <div className="text-xs text-gray-400">履歴はありません</div>
            )}
            {getTaskHistory().map((h, i) => (
              <button
                key={h.title + i}
                className="w-full flex items-center space-x-2 px-2 py-1 rounded hover:bg-blue-100 text-left"
                onClick={() => addTask({
                  ...h,
                  date: format(currentDate, 'yyyy-MM-dd'),
                  completed: false,
                  subtasks: [],
                  isHabit: h.isHabit || false
                })}
              >
                <span className={`w-2 h-2 rounded-full ${h.color ? `bg-${h.color}-400` : 'bg-gray-300'}`}></span>
                <span className="text-xs">{h.emoji} {h.title}</span>
                <span className="ml-auto text-[10px] text-gray-400">{h.startTime}~{h.endTime}</span>
              </button>
            ))}
          </div>
        </div>

        {/* エネルギートラッカー */}
        <EnergyTracker
          currentDate={currentDate}
          energyLevels={energyLevels}
          onUpdateEnergy={(level) => addEnergyLevel(level)}
          tasks={todayTasks}
          onTaskFocus={handleTaskFocus}
        />
      </div>

      {/* 右側メインエリア */}
      <div className="flex-1 flex flex-col">
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
          </div>

          {/* 週間カレンダー */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(subDays(currentDate, currentDate.getDay()), i);
              const isSelected = format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
              const dayTasks = getTasksForDate(format(date, 'yyyy-MM-dd'));

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
                  {dayTasks.length > 0 && (
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* タイムライン */}
        <div className="flex-1 overflow-y-auto p-6">
          <Timeline
            tasks={todayTasks}
            currentDate={currentDate}
            onTaskComplete={completeTask}
            onTaskEdit={handleTaskEdit}
            onTaskFocus={handleTaskFocus}
            onTaskReplan={replanTask}
            onTaskDelete={deleteTask}
            onTaskUpdate={updateTask}
          />
        </div>
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
    </div>
  );
}

export default App;
