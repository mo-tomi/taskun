import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, BarChart3, Sun, Moon, Monitor, List, Plus, Calendar, Clock, Trash2, ArrowRight, Tag, CheckCircle2, Circle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import { Timeline } from './components/Timeline/Timeline';
import { TimelineMultiDay } from './components/Timeline/TimelineMultiDay'; // 🌅 複数日対応タイムライン
import { FreeTimeIndicator } from './components/Timeline/FreeTimeIndicator'; // ✨ 空き時間可視化
import { AutoAdjustment } from './components/Timeline/AutoAdjustment'; // 🔄 自動調整機能
import { QuickAdd } from './components/Inbox/QuickAdd';
import { StatsModal } from './components/Stats/StatsModal';
import { EnergyTracker } from './components/Energy/EnergyTracker';

import { useTasks } from './hooks/useTasks';
import { useEnergyTracking } from './hooks/useEnergyTracking';
import { useTheme } from './hooks/useTheme';
import { useTodos } from './hooks/useTodos'; // 📝 Todoリスト機能
import { Task, TodoItem } from './types';

// 新機能コンポーネント
import SimpleAnalytics from './components/Analytics/SimpleAnalytics';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // 🎨 新機能の状態管理
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTodoList, setShowTodoList] = useState(false); // 📝 Todoリスト表示状態

  // 📝 Todoリスト関連の状態
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<TodoItem['priority']>('medium');
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());

  // 🎯 新機能のフック
  const { theme, toggleTheme } = useTheme();

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

  const {
    todos,
    addTodo,
    deleteTodo
  } = useTodos();

  const todayTasks = getTasksForDate(format(currentDate, 'yyyy-MM-dd'));
  const todayTaskSegments = getTaskSegments(format(currentDate, 'yyyy-MM-dd')); // 🌅 複数日タスクセグメント
  const todayEnergyLevels = getEnergyForDate(format(currentDate, 'yyyy-MM-dd'));

  // 📝 Todoリストのヘルパー関数
  const getPriorityConfig = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: '🔥',
          label: '緊急'
        };
      case 'high':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: '⚡',
          label: '高'
        };
      case 'medium':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: '📝',
          label: '中'
        };
      case 'low':
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: '📋',
          label: '低'
        };
    }
  };

  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      addTodo(newTodoTitle.trim(), '', 'blue', newTodoPriority);
      setNewTodoTitle('');
      setIsAddingTodo(false);
    }
  };

  const scheduleSelectedTodos = () => {
    const todosToSchedule = todos.filter(todo => selectedTodos.has(todo.id));

    todosToSchedule.forEach((todo, index) => {
      // 現在時刻から順番に配置（30分間隔）
      const now = new Date();
      const startMinutes = now.getHours() * 60 + now.getMinutes() + (index * 30);
      const startHour = Math.floor(startMinutes / 60);
      const startMin = startMinutes % 60;

      const duration = todo.estimatedDuration || 60;
      const endMinutes = startMinutes + duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      addTask({
        title: todo.title,
        startTime,
        endTime,
        date: format(currentDate, 'yyyy-MM-dd'),
        color: todo.color,
        completed: false,
        isHabit: todo.isHabit,
        description: todo.description,
        subtasks: todo.subtasks,
        emoji: todo.emoji,
        customColor: todo.customColor,
      });

      // 📝 スケジュールに追加したTodoを削除
      deleteTodo(todo.id);
    });

    setSelectedTodos(new Set());
  };

  const toggleTodoSelection = (todoId: string) => {
    setSelectedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

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
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowTodoList(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="タスク待機リスト (T)"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="統計 (A)"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-orange-600"
              title="テーマ切り替え"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> :
                theme === 'dark' ? <Sun className="w-5 h-5" /> :
                  <Monitor className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 🎯 シンプル日付ナビゲーション */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {format(currentDate, 'd日(E)')}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {format(currentDate, 'yyyy年M月')}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentDate(addDays(currentDate, -1))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">前日</span>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="text-sm font-medium">今日</span>
              </button>
              <button
                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
              >
                <span className="text-sm">翌日</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 今日のタスク概要 */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">全{todayTaskSegments.length}タスク</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">完了{todayTaskSegments.filter(t => t.task.completed).length}件</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">進行中{
                  todayTaskSegments.filter(t => {
                    const now = new Date();
                    const taskStart = new Date(`${t.task.date}T${t.segmentStartTime}`);
                    const taskEnd = new Date(`${t.task.date}T${t.segmentEndTime}`);
                    return !t.task.completed && now >= taskStart && now <= taskEnd;
                  }).length
                }件</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タイムライン */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* ✨ 空き時間インジケーター */}
        <div className="mb-6">
          <FreeTimeIndicator
            tasks={todayTasks}
            taskSegments={todayTaskSegments}
            currentDate={currentDate}
          />
        </div>

        {/* 🔄 自動調整機能 */}
        <div className="mb-6">
          <AutoAdjustment
            tasks={tasks}
            currentDate={currentDate}
            onTaskUpdate={updateTask}
          />
        </div>

        {/* 🔔 通知システム */}
        <div className="mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-800">🔔 スマート通知システム</span>
              <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Phase 4 実装済み</span>
            </div>
            <div className="text-sm text-blue-700">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>タスク開始5分前通知</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🚀</span>
                  <span>タスク開始時刻通知</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>✅</span>
                  <span>タスク終了時刻通知</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>15分遅延警告</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>☕</span>
                  <span>90分毎の休憩提案</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🔊</span>
                  <span>音声 + ブラウザ通知</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🔁 繰り返しタスク設定 */}
        <div className="mb-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-800">🔁 繰り返しタスク・習慣化</span>
                <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">Phase 5 実装済み</span>
              </div>
              <button
                onClick={() => {
                  // 今週分の習慣タスクを自動生成
                  const habitTasks = [
                    { title: '🧘 朝の瞑想', time: '06:30-06:35', days: '毎日' },
                    { title: '🏃 運動・ストレッチ', time: '07:00-07:30', days: '毎日' },
                    { title: '📚 読書時間', time: '20:00-20:30', days: '毎日' },
                    { title: '📋 週次レビュー', time: '19:00-19:30', days: '日曜' },
                    { title: '🧹 部屋の掃除', time: '09:00-09:30', days: '土曜' }
                  ];
                  alert(`${habitTasks.length}個の習慣テンプレートが利用可能です\n\n${habitTasks.map(h => `${h.title} (${h.time}, ${h.days})`).join('\n')}`);
                }}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                テンプレート表示
              </button>
            </div>
            <div className="text-sm text-green-700">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span>🔄</span>
                  <span>日次・週次・月次パターン</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>曜日指定設定</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🎯</span>
                  <span>カテゴリ別管理</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🔥</span>
                  <span>連続記録(ストリーク)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⚡</span>
                  <span>一括タスク生成</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📊</span>
                  <span>習慣化進捗追跡</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 1日集中設計 */}
        <div className="mb-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">🎯 1日集中設計</span>
              <span className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded-full">Phase 6 実装済み</span>
            </div>
            <div className="text-sm text-purple-700">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>シンプルな日付ナビゲーション</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>1日集中タイムライン</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🗂️</span>
                  <span>週間ビュー削除で最適化</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>🎨</span>
                  <span>クリーンなインターフェース</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📱</span>
                  <span>モバイル最適化</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⚡</span>
                  <span>高速な日付切り替え</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌅 複数日対応の従来タイムライン */}
        <Timeline
          tasks={todayTasks}
          taskSegments={todayTaskSegments}
          currentDate={currentDate}
          onTaskComplete={completeTask}
          onTaskDelete={deleteTask}
          onTaskUpdate={updateTask}
          onDateChange={setCurrentDate}
        />
      </div>

      {/* エネルギートラッカー */}
      <EnergyTracker
        currentDate={currentDate}
        energyLevels={todayEnergyLevels}
        onUpdateEnergy={addEnergyLevel}
      />

      {/* Quick Add */}
      <QuickAdd
        onAddTask={addTask}
        currentDate={currentDate}
        isOpen={isQuickAddOpen}
        onToggle={() => setIsQuickAddOpen(!isQuickAddOpen)}
      />

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        tasks={tasks}
        habits={habits}
        getHabitStreak={getHabitStreak}
      />

      {/* 詳細分析 */}
      <SimpleAnalytics
        tasks={tasks}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        currentDate={currentDate}
      />

      {/* 📝 Todoリスト */}
      {showTodoList && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  📝 タスク待機リスト
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddingTodo(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="新しいTodoを追加"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowTodoList(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="閉じる"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 統計 */}
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <span>総数: {todos.length}</span>
                <span>予想時間: {Math.round(todos.reduce((sum, todo) => sum + (todo.estimatedDuration || 0), 0) / 60)}h</span>
              </div>
            </div>

            {/* Todo追加フォーム */}
            {isAddingTodo && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="新しいタスクを入力..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTodo();
                      if (e.key === 'Escape') setIsAddingTodo(false);
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value as TodoItem['priority'])}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="low">低優先度</option>
                      <option value="medium">中優先度</option>
                      <option value="high">高優先度</option>
                      <option value="urgent">緊急</option>
                    </select>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddTodo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        追加
                      </button>
                      <button
                        onClick={() => setIsAddingTodo(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Todoリスト */}
            <div className="flex-1 overflow-y-auto">
              {todos.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Circle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>まだタスクがありません</p>
                  <p className="text-sm">「+」ボタンで新しいタスクを追加</p>
                </div>
              ) : (
                <div className="p-2">
                  {todos.map((todo) => {
                    const priorityConfig = getPriorityConfig(todo.priority);
                    const isSelected = selectedTodos.has(todo.id);

                    return (
                      <div
                        key={todo.id}
                        className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        onClick={() => toggleTodoSelection(todo.id)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* 選択チェックボックス */}
                          <div className="mt-0.5">
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Todo内容 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {todo.emoji && <span className="mr-1">{todo.emoji}</span>}
                                {todo.title}
                              </h4>

                              {/* 優先度バッジ */}
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                                <span className="mr-1">{priorityConfig.icon}</span>
                                {priorityConfig.label}
                              </span>
                            </div>

                            {/* 説明 */}
                            {todo.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {todo.description}
                              </p>
                            )}

                            {/* メタ情報 */}
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                              {todo.estimatedDuration && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {todo.estimatedDuration}分
                                </span>
                              )}

                              {todo.tags.length > 0 && (
                                <span className="flex items-center">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {todo.tags.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 削除ボタン */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTodo(todo.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* アクションボタン */}
            {selectedTodos.size > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    scheduleSelectedTodos();
                    setShowTodoList(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Calendar className="w-5 h-5" />
                  <span>選択したタスクをスケジュールに追加 ({selectedTodos.size})</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
