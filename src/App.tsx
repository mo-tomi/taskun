import React, { useState } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Header } from './components/Layout/Header';
import { Timeline } from './components/Timeline/Timeline';
import { QuickAdd } from './components/Inbox/QuickAdd';
import { FocusMode } from './components/FocusMode/FocusMode';
import { StatsModal } from './components/Stats/StatsModal';
import { EnergyTracker } from './components/Energy/EnergyTracker';

import { useTasks } from './hooks/useTasks';
import { useEnergyTracking } from './hooks/useEnergyTracking';
import { Task, ViewMode } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
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
    habits
  } = useTasks();

  const {
    addEnergyLevel,
    getEnergyForDate
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
    setFocusTask(task);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/' && !isQuickAddOpen) {
      e.preventDefault();
      setIsQuickAddOpen(true);
    }
    else if (e.key === 'Escape' && isQuickAddOpen) {
      e.preventDefault();
      setIsQuickAddOpen(false);
    }
    else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      setCurrentDate(new Date());
    }
  };

  return (
    <div 
      className="h-screen flex flex-col bg-background font-sans antialiased"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Header
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onStatsClick={() => setIsStatsOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Date Navigation */}
        <div className="hidden md:flex flex-col items-center justify-center w-20 bg-card rounded-lg border p-2">
          <button
            onClick={handlePrevDay}
            className="p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
            title="前の日"
          >
            <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          </button>
          
          <div className="text-center my-6 flex-1 flex flex-col justify-center items-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {format(currentDate, 'd')}
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              {format(currentDate, 'MMM', { locale: ja })}
            </div>
            {isToday(currentDate) && (
              <div className="w-2 h-2 bg-primary rounded-full mx-auto mt-2"></div>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
            title="次の日"
          >
            <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card rounded-lg border flex flex-col">
          {viewMode === 'day' && (
            <>
              <div className="flex-1 relative">
                <Timeline
                  tasks={todayTasks}
                  currentDate={currentDate}
                  onTaskComplete={completeTask}
                  onTaskEdit={handleTaskEdit}
                  onTaskFocus={handleTaskFocus}
                  onTaskReplan={replanTask}
                  onTaskDelete={deleteTask}
                />
              </div>
              
              <div className="border-t p-4">
                <EnergyTracker
                  currentDate={currentDate}
                  energyLevels={todayEnergyLevels}
                  onUpdateEnergy={addEnergyLevel}
                  showHeartRate={false}
                />
              </div>
            </>
          )}
          
          {viewMode !== 'day' && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-4">{viewMode === 'week' ? '📅' : '🗓️'}</div>
                <p className="text-lg font-semibold mb-1">{viewMode === 'week' ? '週' : '月'}表示は開発中です</p>
                <p className="text-sm">今後のアップデートにご期待ください。</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-card border-t mx-4 mb-4 mt-0 rounded-b-lg px-4 py-2 flex items-center justify-between">
        <button onClick={handlePrevDay} className="p-3 rounded-md" title="前の日">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <div className="flex space-x-1">
          {[ 
            { mode: 'day' as ViewMode, label: '日' },
            { mode: 'week' as ViewMode, label: '週' },
            { mode: 'month' as ViewMode, label: '月' }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <button onClick={handleNextDay} className="p-3 rounded-md" title="次の日">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
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

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 left-4 bg-card border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hidden lg:flex items-center gap-2">
        <span className="font-mono bg-muted text-muted-foreground rounded px-1.5 py-0.5">/</span>
        <span>でクイック追加</span>
      </div>
    </div>
  );
}

export default App;
