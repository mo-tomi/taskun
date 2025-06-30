import { Task, MultiDayTaskSegment } from '../../types';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, Clock, MoreHorizontal, Play, Pause, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProgressGauge, LinearProgress } from './ProgressGauge';
import { calculateTaskProgress } from '../../utils/timeUtils';
import {
  generateMultiDayTaskLabel,
  isMultiDayTask,
  getMultiDayTaskStyle,
  isTimeSpanningNextDay
} from '../../utils/multiDayTaskUtils';

// 🎯 ローディング状態とドラッグ体験のコンポーネントをインポート
import { TaskLoadingOverlay, ToastNotification, LoadingState } from '../ui/LoadingState';
import {
  DragGuideline,
  DragIndicator,
  TimeSnapGuide,
  DragHelpMessage,
  useDragState
} from '../ui/DragHelpers';

interface TimelineProps {
  tasks: Task[];
  taskSegments?: MultiDayTaskSegment[]; // 🌅 複数日タスクセグメント（オプション）
  currentDate: Date;
  onTaskComplete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskFocus: (task: Task) => void;
  onTaskReplan: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
}

export function Timeline({
  tasks,
  taskSegments,
  currentDate,
  onTaskComplete,
  onTaskFocus,
  onTaskUpdate
}: TimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTimeTaskId, setEditingTimeTaskId] = useState<string | null>(null);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingEndTime, setEditingEndTime] = useState('');

  // 🎯 ローディング状態管理
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
  const [toastState, setToastState] = useState<{ visible: boolean; state: LoadingState; message: string }>({
    visible: false,
    state: 'idle',
    message: ''
  });

  // 🎭 ドラッグ状態管理（改良版）
  const { dragState, startDrag, updateDrag, endDrag } = useDragState();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showDragHelp, setShowDragHelp] = useState(false);
  const [snapTargetTime, setSnapTargetTime] = useState<string | null>(null);

  // リアルタイム時計の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);



  // タスクを開始時間順にソート
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = parseInt(a.startTime.replace(':', ''));
    const timeB = parseInt(b.startTime.replace(':', ''));
    return timeA - timeB;
  });

  // 現在時刻がタスクの時間範囲内かどうかを判定
  const isTaskActive = (task: Task) => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
    const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
    const endMinutes = parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1]);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // 次に実行すべきタスクを取得
  const getNextTask = () => {
    const now = format(currentTime, 'HH:mm');
    const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);

    return sortedTasks.find(task => {
      const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
      return startMinutes > currentMinutes && !task.completed;
    });
  };

  // 現在実行中のタスクを取得
  const getCurrentTask = () => {
    return sortedTasks.find(task => isTaskActive(task) && !task.completed);
  };

  const currentTask = getCurrentTask();
  const nextTask = getNextTask();

  // タスク編集機能
  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  const saveEdit = () => {
    if (editingTaskId && editingTitle.trim() && onTaskUpdate) {
      onTaskUpdate(editingTaskId, { title: editingTitle.trim() });
      cancelEditing();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 時間編集機能
  const startTimeEditing = (task: Task) => {
    setEditingTimeTaskId(task.id);
    setEditingStartTime(task.startTime);
    setEditingEndTime(task.endTime);
  };

  const cancelTimeEditing = () => {
    setEditingTimeTaskId(null);
    setEditingStartTime('');
    setEditingEndTime('');
  };

  const saveTimeEdit = () => {
    if (editingTimeTaskId && editingStartTime && editingEndTime && onTaskUpdate) {
      // 時間の妥当性チェック
      const startMinutes = parseInt(editingStartTime.split(':')[0]) * 60 + parseInt(editingStartTime.split(':')[1]);
      const endMinutes = parseInt(editingEndTime.split(':')[0]) * 60 + parseInt(editingEndTime.split(':')[1]);

      // 日をまたぐタスクかどうかをチェック
      const isSpanningNextDay = isTimeSpanningNextDay(editingStartTime, editingEndTime);

      // 通常のタスク（同日内）または日をまたぐタスクの場合は有効
      if (startMinutes < endMinutes || isSpanningNextDay) {
        const currentTask = tasks.find(t => t.id === editingTimeTaskId);
        const updates: Partial<Task> = {
          startTime: editingStartTime,
          endTime: editingEndTime
        };

        // 日をまたぐタスクの場合は複数日タスクとして設定
        if (isSpanningNextDay) {
          updates.isMultiDay = true;
          // 明示的なendDateが設定されていない場合は翌日を設定
          if (!currentTask?.endDate) {
            const nextDay = addDays(currentDate, 1);
            updates.endDate = format(nextDay, 'yyyy-MM-dd');
          }
        } else {
          // 同日タスクの場合はendDateをクリア
          updates.isMultiDay = false;
          updates.endDate = undefined;
        }

        onTaskUpdate(editingTimeTaskId, updates);
        cancelTimeEditing();
      } else {
        alert('無効な時間設定です。開始時間と終了時間を確認してください。');
      }
    }
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTimeEdit();
    } else if (e.key === 'Escape') {
      cancelTimeEditing();
    }
  };

  // 🎯 ローディング状態のヘルパー関数
  const setTaskLoading = (taskId: string, state: LoadingState) => {
    setLoadingStates(prev => ({ ...prev, [taskId]: state }));
  };

  const showToast = (state: LoadingState, message: string) => {
    setToastState({ visible: true, state, message });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  // 🎭 改良されたドラッグアンドドロップ機能
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    startDrag(task.id, e.clientY);
    setShowDragHelp(true);

    // ドラッグ中の視覚効果
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);

    // カスタムドラッグイメージ
    const dragImage = document.createElement('div');
    dragImage.style.opacity = '0';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientY > 0) {
      updateDrag(e.clientY);

      // スナップターゲットを計算
      const deltaY = e.clientY - dragState.dragStartY;
      const timeShiftMinutes = Math.round(deltaY / 64 * 60); // 64px = 1時間

      if (draggedTask && Math.abs(timeShiftMinutes) >= 15) {
        const currentStartMinutes = parseInt(draggedTask.startTime.split(':')[0]) * 60 + parseInt(draggedTask.startTime.split(':')[1]);
        const newStartMinutes = Math.round((currentStartMinutes + timeShiftMinutes) / 15) * 15;
        const newStartTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, '0')}:${(newStartMinutes % 60).toString().padStart(2, '0')}`;
        setSnapTargetTime(newStartTime);
      } else {
        setSnapTargetTime(null);
      }
    }
  };

  const handleDragEnd = async (e: React.DragEvent) => {
    if (!draggedTask || !onTaskUpdate) {
      endDrag();
      setDraggedTask(null);
      setShowDragHelp(false);
      setSnapTargetTime(null);
      return;
    }

    // ローディング開始
    setTaskLoading(draggedTask.id, 'loading');

    const deltaY = dragState.dragCurrentY - dragState.dragStartY;
    const timeShiftMinutes = Math.round(deltaY / 64 * 60); // 64px = 1時間, 60分

    if (Math.abs(timeShiftMinutes) < 15) {
      // 15分未満の移動は無視
      setTaskLoading(draggedTask.id, 'idle');
      endDrag();
      setDraggedTask(null);
      setShowDragHelp(false);
      setSnapTargetTime(null);
      return;
    }

    try {
      // 現在の時間を分に変換
      const currentStartMinutes = parseInt(draggedTask.startTime.split(':')[0]) * 60 + parseInt(draggedTask.startTime.split(':')[1]);
      const currentEndMinutes = parseInt(draggedTask.endTime.split(':')[0]) * 60 + parseInt(draggedTask.endTime.split(':')[1]);
      const duration = currentEndMinutes - currentStartMinutes;

      // 新しい開始時間を計算（15分単位で丸める）
      const newStartMinutes = Math.max(6 * 60, Math.min(22 * 60,
        Math.round((currentStartMinutes + timeShiftMinutes) / 15) * 15
      ));
      const newEndMinutes = newStartMinutes + duration;

      // 終了時間が23:00を超えないようにチェック
      if (newEndMinutes > 23 * 60) {
        setTaskLoading(draggedTask.id, 'error');
        showToast('error', '時間範囲を超えています');
        setTimeout(() => setTaskLoading(draggedTask.id, 'idle'), 2000);
        return;
      }

      // 時間を文字列形式に変換
      const newStartTime = `${Math.floor(newStartMinutes / 60).toString().padStart(2, '0')}:${(newStartMinutes % 60).toString().padStart(2, '0')}`;
      const newEndTime = `${Math.floor(newEndMinutes / 60).toString().padStart(2, '0')}:${(newEndMinutes % 60).toString().padStart(2, '0')}`;

      // タスクの時間を更新（非同期シミュレーション）
      await new Promise(resolve => setTimeout(resolve, 800));

      onTaskUpdate(draggedTask.id, {
        startTime: newStartTime,
        endTime: newEndTime
      });

      // 成功状態
      setTaskLoading(draggedTask.id, 'success');
      showToast('success', `「${draggedTask.title}」の時間を更新しました`);

      setTimeout(() => setTaskLoading(draggedTask.id, 'idle'), 1500);

    } catch (error) {
      // エラー状態
      setTaskLoading(draggedTask.id, 'error');
      showToast('error', 'タスクの更新に失敗しました');
      setTimeout(() => setTaskLoading(draggedTask.id, 'idle'), 2000);
    } finally {
      endDrag();
      setDraggedTask(null);
      setShowDragHelp(false);
      setSnapTargetTime(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const getTaskColor = (task: Task) => {
    const colors = {
      coral: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', dot: 'bg-red-400' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', dot: 'bg-blue-400' },
      green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', dot: 'bg-green-400' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', dot: 'bg-purple-400' },
      orange: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-400' },
      teal: { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', dot: 'bg-teal-400' }
    };
    return colors[task.color] || colors.coral;
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">今日のタスクはありません</p>
          <p className="text-sm">新しいタスクを追加して始めましょう</p>
        </div>
      </div>
    );
  }

  // 🕐 時間軸の設定（6時〜23時）
  const timeSlots = Array.from({ length: 18 }, (_, i) => 6 + i);

  return (
    <div className="relative min-h-screen">
      {/* メインコンテナ */}
      <div className="flex">
        {/* 左側：時間軸 */}
        <div className="w-20 flex-shrink-0 relative">
          <div className="sticky top-0 bg-white border-r border-gray-200 h-screen">
            {/* 時間軸ヘッダー */}
            <div className="h-24 border-b border-gray-200 flex items-center justify-center bg-gray-50">
              <span className="text-sm font-medium text-gray-600">時間</span>
            </div>

            {/* 時間軸 */}
            <div className="relative">
              {timeSlots.map((hour) => (
                <div key={hour} className="relative h-16 border-b border-gray-100">
                  <div className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-1">
                    <span className="text-sm font-medium text-gray-700 bg-white px-1 rounded">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>

                  {/* 30分マーク */}
                  <div className="absolute top-8 left-0 w-full flex items-center justify-center">
                    <span className="text-xs text-gray-400 bg-white px-1">
                      {hour.toString().padStart(2, '0')}:30
                    </span>
                  </div>

                  {/* 現在時刻インジケーター */}
                  {(() => {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinutes = now.getMinutes();

                    if (currentHour === hour) {
                      const position = (currentMinutes / 60) * 64; // 64px = h-16
                      return (
                        <div
                          className="absolute left-0 w-full z-10"
                          style={{ top: `${position}px` }}
                        >
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md animate-pulse" />
                            <div className="flex-1 h-0.5 bg-red-500 shadow-sm" />
                          </div>
                          <div className="absolute left-4 -top-5 text-xs font-medium text-red-600 bg-white px-1 rounded shadow">
                            {format(now, 'HH:mm')}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側：メインコンテンツ */}
        <div className="flex-1 p-4">
          {/* リアルタイム状況表示 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-lg font-extrabold text-blue-700 tracking-widest drop-shadow">現在時刻</span>
                <span className="text-2xl font-extrabold text-blue-700 font-mono drop-shadow animate-pulse">
                  {format(currentTime, 'HH:mm:ss')}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {format(currentTime, 'yyyy年M月d日(E)', { locale: ja })}
              </div>
            </div>

            {/* 現在のタスク表示 */}
            {currentTask ? (
              <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-800">🟢 実行中</div>
                    <div className="text-lg font-semibold text-green-900">
                      {currentTask.emoji} {currentTask.title}
                    </div>
                    <div className="text-sm text-green-700">
                      {currentTask.startTime} - {currentTask.endTime}
                    </div>
                  </div>
                  <button
                    onClick={() => onTaskComplete(currentTask.id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    完了
                  </button>
                </div>
              </div>
            ) : nextTask ? (
              <div className="p-3 bg-orange-100 border border-orange-300 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-orange-800">⏳ 次のタスク</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {nextTask.emoji} {nextTask.title}
                    </div>
                    <div className="text-sm text-orange-700">
                      {nextTask.startTime} 開始予定
                    </div>
                  </div>
                  <div className="text-xs text-orange-600">
                    あと {Math.ceil((parseInt(nextTask.startTime.split(':')[0]) * 60 + parseInt(nextTask.startTime.split(':')[1]) -
                      (parseInt(format(currentTime, 'HH').split(':')[0]) * 60 + parseInt(format(currentTime, 'mm')))) / 60)} 時間
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">✅ 本日のタスクは完了です</div>
                  <div className="text-xs text-gray-500 mt-1">お疲れ様でした！</div>
                </div>
              </div>
            )}
          </div>

          {/* タスク一覧 - 時間軸に沿って配置 */}
          <div
            className="relative pb-48"
            style={{ height: `${18 * 64 + 192}px` }}
            onDragOver={handleDragOver}
            onDrop={(e) => e.preventDefault()}
          >
            {sortedTasks.map((task) => {
              const colors = getTaskColor(task);
              const isActive = isTaskActive(task);
              const isPast = (() => {
                const now = format(currentTime, 'HH:mm');
                const currentMinutes = parseInt(now.split(':')[0]) * 60 + parseInt(now.split(':')[1]);
                const endMinutes = parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1]);
                return currentMinutes > endMinutes;
              })();

              // 🌅 複数日タスクのセグメント時間を取得
              let displayStartTime = task.startTime;
              let displayEndTime = task.endTime;

              if (taskSegments) {
                const segment = taskSegments.find(s => s.task.id === task.id);
                if (segment) {
                  displayStartTime = segment.segmentStartTime;
                  displayEndTime = segment.segmentEndTime;
                }
              }

              // タスクの時間位置を計算（セグメント時間を使用）
              const startHour = parseInt(displayStartTime.split(':')[0]);
              const startMinute = parseInt(displayStartTime.split(':')[1]);
              const endHour = parseInt(displayEndTime.split(':')[0]);
              const endMinute = parseInt(displayEndTime.split(':')[1]);

              // 6時からの相対位置を計算
              const topPosition = ((startHour - 6) * 64) + (startMinute / 60 * 64);

              // 🌅 複数日タスクの場合、適切な高さを計算
              let taskHeight;
              if (endHour < startHour) {
                // 翌日にまたがる場合（例：23:00-02:00の場合）
                taskHeight = ((24 - startHour + endHour) * 64) + ((endMinute - startMinute) / 60 * 64);
              } else {
                // 通常の場合
                taskHeight = ((endHour - startHour) * 64) + ((endMinute - startMinute) / 60 * 64);
              }

              return (
                <div
                  key={task.id}
                  className={`absolute left-0 right-0 flex items-start space-x-4 pr-4 cursor-move ${draggedTask?.id === task.id ? 'opacity-50 transform rotate-2' : ''
                    }`}
                  style={{
                    top: `${topPosition + 24}px`, // ヘッダー分のオフセット
                    minHeight: `${Math.max(taskHeight, 40)}px`
                  }}
                  draggable={!editingTaskId && !editingTimeTaskId}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                >
                  {/* 達成度ゲージ */}
                  <div className="relative z-10 flex-shrink-0 flex flex-col items-center space-y-2">
                    <ProgressGauge
                      task={task}
                      size="md"
                      showPercentage={true}
                    />
                    <div className="text-xs text-center text-gray-500 font-medium">
                      {Math.round(calculateTaskProgress(task))}%
                    </div>
                  </div>

                  {/* タスクカード */}
                  <div
                    className={`flex-1 min-w-0 border rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative task-card ${isActive ? 'bg-green-50 border-green-300 ring-2 ring-green-200' :
                      task.completed ? 'bg-gray-50 border-gray-200 opacity-60' :
                        isPast ? 'bg-red-50 border-red-200' :
                          `${colors.bg} ${colors.border}`
                      }`}
                    style={{
                      height: `${Math.max(taskHeight - 8, 80)}px`,
                      minHeight: '80px'
                    }}
                  // ポモドーロタイマー機能を無効化
                  // onClick={() => onTaskFocus(task)}
                  >
                    {/* 🎯 改良されたドラッグインジケーター */}
                    <DragIndicator
                      visible={!dragState.isDragging || dragState.draggedItemId !== task.id}
                      position="top-right"
                      pulse={dragState.isDragging && dragState.draggedItemId === task.id}
                    />

                    {/* 🔄 ローディングオーバーレイ */}
                    <TaskLoadingOverlay
                      state={loadingStates[task.id] || 'idle'}
                      taskTitle={task.title}
                    />

                    {/* 🎯 完了ボタン（左上に配置）+ ローディング対応 */}
                    <div className="absolute top-2 left-2 z-20">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (loadingStates[task.id] === 'loading') return;

                          // ローディング開始
                          setTaskLoading(task.id, 'loading');

                          try {
                            // 完了処理のシミュレーション
                            await new Promise(resolve => setTimeout(resolve, 600));
                            onTaskComplete(task.id);

                            // 成功状態
                            setTaskLoading(task.id, 'success');
                            showToast('success', `「${task.title}」を${task.completed ? '未完了' : '完了'}にしました`);
                            setTimeout(() => setTaskLoading(task.id, 'idle'), 1000);

                          } catch (error) {
                            // エラー状態
                            setTaskLoading(task.id, 'error');
                            showToast('error', 'タスクの更新に失敗しました');
                            setTimeout(() => setTaskLoading(task.id, 'idle'), 2000);
                          }
                        }}
                        disabled={loadingStates[task.id] === 'loading'}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-110 touch-target task-completion-button ${loadingStates[task.id] === 'loading'
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : task.completed
                            ? `${colors.dot} border-white text-white`
                            : `bg-white border-gray-300 hover:border-green-400 hover:bg-green-50`
                          }`}
                        title={
                          loadingStates[task.id] === 'loading'
                            ? '更新中...'
                            : task.completed
                              ? 'タスク完了済み'
                              : 'タスクを完了'
                        }
                      >
                        {loadingStates[task.id] === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        ) : task.completed ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-400" />
                        )}
                      </button>
                    </div>

                    {/* 時間表示と状態 */}
                    <div className="flex items-center justify-between mb-3 ml-10">
                      <div className="flex items-center space-x-3">
                        {editingTimeTaskId === task.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="time"
                              value={editingStartTime}
                              onChange={(e) => setEditingStartTime(e.target.value)}
                              onKeyDown={handleTimeKeyDown}
                              className="text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">-</span>
                            <input
                              type="time"
                              value={editingEndTime}
                              onChange={(e) => setEditingEndTime(e.target.value)}
                              onKeyDown={handleTimeKeyDown}
                              className="text-sm font-medium bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={saveTimeEdit}
                              className="text-green-600 hover:text-green-700 p-1"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelTimeEditing}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors group ${isActive ? 'text-green-700' :
                              task.completed ? 'text-gray-500' :
                                isPast ? 'text-red-600' :
                                  'text-gray-600'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              startTimeEditing(task);
                            }}
                          >
                            {displayStartTime} - {displayEndTime}
                            <span className="ml-2 opacity-0 group-hover:opacity-100 text-xs text-gray-400 transition-opacity">
                              ⏰
                            </span>
                          </div>
                        )}
                        {isActive && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full font-medium animate-pulse">
                            実行中
                          </span>
                        )}
                        {isPast && !task.completed && (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
                            期限切れ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* タスクタイトル */}
                    <div className="mb-2">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center space-x-2">
                          {task.emoji && <span className="text-lg">{task.emoji}</span>}
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={saveEdit}
                            className="flex-1 text-lg font-semibold bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3
                          className={`text-lg font-semibold ${colors.text} cursor-pointer hover:text-blue-600 ${task.completed ? 'line-through opacity-60' : ''
                            } transition-colors group`}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task);
                          }}
                        >
                          {task.emoji && <span className="mr-2">{task.emoji}</span>}
                          {/* 🌅 複数日タスクのラベル表示 */}
                          {taskSegments ? (() => {
                            const segment = taskSegments.find(s => s.task.id === task.id);
                            return segment ? generateMultiDayTaskLabel(segment) : task.title;
                          })() : task.title}
                          <span className="ml-2 opacity-0 group-hover:opacity-100 text-sm text-gray-400 transition-opacity">
                            ✏️
                          </span>
                          {/* 🌅 複数日タスクのインジケーター */}
                          {isMultiDayTask(task) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              複数日
                            </span>
                          )}
                        </h3>
                      )}
                    </div>

                    {/* タスク説明 */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* 🌅 複数日タスクの期間情報 */}
                    {isMultiDayTask(task) && (
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                        <span>期間: {task.date}</span>
                        {task.endDate && task.endDate !== task.date && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span>{task.endDate}</span>
                          </>
                        )}
                        {taskSegments && (() => {
                          const segment = taskSegments.find(s => s.task.id === task.id);
                          if (segment) {
                            if (segment.isFirstDay && !segment.isLastDay) {
                              return <span className="text-blue-700 font-medium">開始日</span>;
                            } else if (segment.isLastDay && !segment.isFirstDay) {
                              return <span className="text-blue-700 font-medium">終了日</span>;
                            } else if (!segment.isFirstDay && !segment.isLastDay) {
                              return <span className="text-blue-700 font-medium">継続中</span>;
                            }
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* サブタスク */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          サブタスク
                        </div>
                        <div className="space-y-1">
                          {task.subtasks.slice(0, 3).map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-2 text-sm">
                              <div className={`w-1.5 h-1.5 rounded-full ${subtask.completed ? colors.dot : 'bg-gray-300'
                                }`} />
                              <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                          {task.subtasks.length > 3 && (
                            <div className="text-xs text-gray-500 ml-3.5">
                              他 {task.subtasks.length - 3} 件
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 詳細プログレスバー */}
                    <div className="mt-4">
                      <LinearProgress
                        task={task}
                        height="h-2"
                        showLabel={true}
                        className="mb-2"
                      />

                      {/* 達成度メトリクス */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} サブタスク完了</span>
                          <span className="font-medium">{Math.round(calculateTaskProgress(task))}% 達成</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🎭 ドラッグガイドライン（15分間隔） */}
      {dragState.isDragging && snapTargetTime && (
        <>
          {Array.from({ length: 18 }, (_, i) => 6 + i).map(hour =>
            [0, 15, 30, 45].map(minute => {
              const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const yPosition = ((hour - 6) * 64) + (minute / 60 * 64) + 24;

              return (
                <DragGuideline
                  key={timeSlot}
                  visible={true}
                  timeSlot={timeSlot}
                  yPosition={yPosition}
                  isDragTarget={timeSlot === snapTargetTime}
                />
              );
            })
          ).flat()}
        </>
      )}

      {/* ⏰ 時間スナップガイド */}
      {dragState.isDragging && snapTargetTime && draggedTask && (
        <TimeSnapGuide
          visible={true}
          deltaMinutes={Math.round((dragState.dragCurrentY - dragState.dragStartY) / 64 * 60)}
          originalTime={`${draggedTask.startTime} - ${draggedTask.endTime}`}
          newTime={snapTargetTime}
        />
      )}

      {/* 📱 ドラッグヘルプメッセージ */}
      <DragHelpMessage
        visible={showDragHelp}
        message="📅 縦にドラッグして時間を変更（15分単位で自動調整）"
        icon="time"
      />

      {/* 🎯 トースト通知 */}
      <ToastNotification
        state={toastState.state}
        message={toastState.message}
        onDismiss={hideToast}
        autoHideDuration={3000}
      />
    </div>
  );
}
