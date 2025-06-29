import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Settings, Palette, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Header } from './components/Layout/Header';
import { Timeline } from './components/Timeline/Timeline';
import { QuickAdd } from './components/Inbox/QuickAdd';
import { FocusMode } from './components/FocusMode/FocusMode';
import { StatsModal } from './components/Stats/StatsModal';
import { EnergyTracker } from './components/Energy/EnergyTracker';
import { AccessibilityPanel } from './components/Accessibility/AccessibilityPanel';
import { ThemeCustomizer } from './components/Theme/ThemeCustomizer';
import { NotificationManager } from './components/Notifications/NotificationManager';

import { useTasks } from './hooks/useTasks';
import { useEnergyTracking } from './hooks/useEnergyTracking';
import { useSettings } from './hooks/useSettings';
import { Task, ViewMode } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    addTask,
    updateTask,
    completeTask,
    replanTask,
    getTasksForDate,
    getHabitStreak,
    habits
  } = useTasks();

  const {
    energyLevels,
    addEnergyLevel,
    getEnergyForDate
  } = useEnergyTracking();

  const {
    settings,
    updateAccessibilitySettings,
    updateThemeSettings,
    updateNotificationSettings,
    applyThemeToDOM,
    applyAccessibilityToDOM
  } = useSettings();

  // 設定をDOMに適用
  useEffect(() => {
    applyThemeToDOM(settings.theme);
    applyAccessibilityToDOM(settings.accessibility);
  }, [settings, applyThemeToDOM, applyAccessibilityToDOM]);

  const todayTasks = getTasksForDate(format(currentDate, 'yyyy-MM-dd'));
  const todayEnergyLevels = getEnergyForDate(format(currentDate, 'yyyy-MM-dd'));

  const handlePrevDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
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
    if (e.key === '/') {
      e.preventDefault();
      setIsQuickAddOpen(true);
    }
  };

  return (
    <div 
      className={`h-screen flex flex-col bg-gray-50 ${
        settings.accessibility.mode === 'focus' ? 'spacing-wide' : ''
      } ${
        settings.accessibility.mode === 'low-stimulation' ? 'reduce-motion' : ''
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        fontSize: settings.accessibility.increaseFontSize ? '1.1em' : undefined
      }}
    >
      <Header
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onStatsClick={() => setIsStatsOpen(true)}
        onMenuClick={() => {}}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Date Navigation */}
        <div className="hidden md:flex flex-col items-center justify-center w-16 bg-white border-r border-gray-200">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-2"
            title="前の日"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center py-4">
            <div className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'd')}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {format(currentDate, 'MMM', { locale: ja })}
            </div>
            {isToday(currentDate) && (
              <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-2"
            title="次の日"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white flex flex-col">
          {viewMode === 'day' && (
            <>
              <div className="flex-1">
                <Timeline
                  tasks={todayTasks}
                  currentDate={currentDate}
                  onTaskComplete={completeTask}
                  onTaskEdit={handleTaskEdit}
                  onTaskFocus={handleTaskFocus}
                  onTaskReplan={replanTask}
                />
              </div>
              
              {/* エネルギートラッカー */}
              {settings.energy.trackingEnabled && (
                <EnergyTracker
                  currentDate={currentDate}
                  energyLevels={todayEnergyLevels}
                  onUpdateEnergy={addEnergyLevel}
                  showHeartRate={settings.energy.heartRateIntegration}
                />
              )}
            </>
          )}
          
          {viewMode === 'week' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📅</div>
                <p>週表示は近日公開予定です！</p>
              </div>
            </div>
          )}
          
          {viewMode === 'month' && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🗓️</div>
                <p>月表示は近日公開予定です！</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between">
        <button onClick={handlePrevDay} className="p-2" title="前の日">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
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
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                viewMode === mode
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <button onClick={handleNextDay} className="p-2" title="次の日">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Settings Panel */}
      <div className="fixed top-20 right-4 flex flex-col space-y-2 z-40">
        <button
          onClick={() => setIsAccessibilityOpen(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="アクセシビリティ設定"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          onClick={() => setIsThemeOpen(true)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="テーマ設定"
        >
          <Palette className="w-5 h-5 text-gray-600" />
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

      <AccessibilityPanel
        settings={settings.accessibility}
        onSettingsChange={updateAccessibilitySettings}
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />

      <ThemeCustomizer
        settings={settings.theme}
        onSettingsChange={updateThemeSettings}
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
      />

      <NotificationManager
        triggers={settings.notifications.defaultTriggers}
        onTriggersChange={(triggers) => updateNotificationSettings({ defaultTriggers: triggers })}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-400 hidden lg:block">
        「/」でクイック追加
      </div>
    </div>
  );
}

export default App;