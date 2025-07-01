import { Task, MultiDayTaskSegment } from '../../types';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, Clock, MoreHorizontal, Play, Pause, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { ProgressGauge, LinearProgress } from './ProgressGauge';
import { calculateTaskProgress } from '../../utils/timeUtils';
import {
  generateMultiDayTaskLabel,
  isMultiDayTask,
  getMultiDayTaskStyle,
  isTimeSpanningNextDay
} from '../../utils/multiDayTaskUtils';
import { timeToMinutes } from '../../utils/timeUtils';
import {
  calculateOverlappingLayout,
  TaskWithLayout,
} from '../../utils/layoutUtils';

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
  onTaskDelete: (id: string) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onDateChange: (date: Date) => void; // 📅 日付変更コールバックを追加
}

// 拡張されたタスク型（セグメント情報を含む）
type TaskWithSegment = Task & {
  _segmentId?: string;
  _isSegment?: boolean;
  _segment?: MultiDayTaskSegment;
};

type ExtendedTask = TaskWithSegment & TaskWithLayout<TaskWithSegment>;

export function Timeline({
  tasks,
  taskSegments,
  currentDate,
  onTaskComplete,
  onTaskDelete,
  onTaskUpdate,
  onDateChange, // 📅 日付変更コールバックを追加
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

  // ♾️ 無限スクロールのための参照
  const lastTimeSlotRef = useRef<HTMLDivElement | null>(null);

  // at top of Timeline component, after state definitions or before useEffects, insert refs and state
  const timeHeaderRef = useRef<HTMLDivElement | null>(null);
  const statusCardRef = useRef<HTMLDivElement | null>(null);
  const [offsetCompensation, setOffsetCompensation] = useState(0);

  useEffect(() => {
    const updateOffset = () => {
      if (timeHeaderRef.current && statusCardRef.current) {
        const headerBottom = timeHeaderRef.current.getBoundingClientRect().bottom;
        const statusBottom = statusCardRef.current.getBoundingClientRect().bottom;
        setOffsetCompensation(headerBottom - statusBottom);
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  // リアルタイム時計の更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ♾️ 日付自動更新（無限スクロール）
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onDateChange(addDays(currentDate, 1));
        }
      },
      {
        root: null, // ビューポートをルートとする
        rootMargin: '0px',
        threshold: 1.0, // 要素が100%表示されたらトリガー
      }
    );

    if (lastTimeSlotRef.current) {
      observer.observe(lastTimeSlotRef.current);
    }

    return () => {
      if (lastTimeSlotRef.current) {
        observer.unobserve(lastTimeSlotRef.current);
      }
    };
  }, [currentDate, onDateChange]);

  // タスクを開始時間順にソート（複数日タスク対応）
  const laidOutTasks = useMemo(() => {
    // taskSegmentsが提供されている場合はそれを使用、そうでなければtasksを使用
    const baseItems: TaskWithSegment[] = taskSegments
      ? taskSegments.map((segment) => ({
        ...segment.task,
        // セグメント情報で時間を上書き
        startTime: segment.segmentStartTime,
        endTime: segment.segmentEndTime,
        // セグメント識別用プロパティを追加
        _segmentId: `${segment.task.id}-${segment.segmentDate}`,
        _isSegment: true,
        _segment: segment,
      }))
      : tasks;

    const sorted = baseItems.sort((a, b) => {
      const timeA = parseInt(a.startTime.replace(':', ''));
      const timeB = parseInt(b.startTime.replace(':', ''));
      return timeA - timeB;
    });

    // 重なりレイアウトを計算
    return calculateOverlappingLayout(sorted);
  }, [tasks, taskSegments]);

  const sortedTasks = laidOutTasks;
  // 現在時刻がタスクの時間範囲内かどうかを判定
  const isTaskActive = (task: ExtendedTask) => {
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

    return sortedTasks.find((task: ExtendedTask) => {
      const startMinutes = parseInt(task.startTime.split(':')[0]) * 60 + parseInt(task.startTime.split(':')[1]);
      return startMinutes > currentMinutes && !task.completed;
    });
  };

  // 現在実行中のタスクを取得
  const getCurrentTask = () => {
    return sortedTasks.find((task: ExtendedTask) => isTaskActive(task) && !task.completed);
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
  const handleDragStart = (e: React.DragEvent, task: ExtendedTask) => {
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

  const PIXELS_PER_HOUR = 64;
  const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60;

  return (
    <div className="relative min-h-screen">
      {/* メインコンテナ */}
      <div className="flex">
        {/* 左側：時間軸 */}
        <div className="w-20 flex-shrink-0 relative">
          <div className="sticky top-0 bg-white border-r border-gray-200 h-screen">
            {/* 時間軸ヘッダー */}
            <div ref={timeHeaderRef} className="h-24 border-b border-gray-200 flex items-center justify-center bg-gray-50">
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

                  {/* 最後の要素にrefを設定 */}
                  {hour === 23 && (
                    <div ref={lastTimeSlotRef} style={{ height: '1px', position: 'absolute', bottom: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側：メインコンテンツ */}
        <div className="flex-1 p-4">
          {/* リアルタイム状況表示 */}
          <div ref={statusCardRef} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
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
            className={`relative pb-48 timeline-task-container ${draggedTask ? 'timeline-dragging' : ''}`}
            style={{ height: `${18 * 64 + 192}px` }}
            onDragOver={handleDragOver}
            onDrop={(e) => e.preventDefault()}
          >
            {sortedTasks.map((task: ExtendedTask) => {
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
              const startMinutes = timeToMinutes(displayStartTime);
              const endMinutes = timeToMinutes(displayEndTime);

              // 6時からの相対位置を計算
              const topPosition = (startMinutes - timeToMinutes('06:00')) * PIXELS_PER_MINUTE;

              // 🌅 複数日タスクの場合、適切な高さを計算
              let taskHeight = (endMinutes - startMinutes) * PIXELS_PER_MINUTE;
              if (endMinutes < startMinutes) {
                // 翌日にまたがる場合
                taskHeight = (timeToMinutes('24:00') - startMinutes + endMinutes) * PIXELS_PER_MINUTE;
              }

              // 🎯 最小高さを60pxに保証（約2行のテキストが表示可能）
              const guaranteedHeight = Math.max(taskHeight, 60);

              const isNarrow = task.layout.width < 0.45;

              return (
                <div
                  key={task._segmentId || task.id}
                  className={`absolute flex ${isNarrow ? 'items-stretch' : 'items-start'} space-x-${isNarrow ? '0' : '2'} pr-1 cursor-move transition-all duration-300 group timeline-task-card ${draggedTask?.id === task.id
                    ? 'opacity-50 transform rotate-1 scale-95 dragging'
                    : isActive
                      ? 'active'
                      : task.completed
                        ? 'completed'
                        : ''
                    }`}
                  style={{
                    top: `${topPosition + offsetCompensation}px`,
                    height: `${guaranteedHeight}px`,
                    left: `${task.layout.left * 100}%`,
                    width: `${task.layout.width * 100}%`,
                    paddingLeft: '0.25rem',
                    paddingRight: '0.25rem',
                    marginBottom: '8px', // カード間の間隔を拡大
                    zIndex: task.completed ? 1 : isActive ? 10 : isPast ? 2 : 5, // 明確なz-index指定
                  }}
                  draggable={!editingTaskId && !editingTimeTaskId}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                >
                  {/* 達成度ゲージ（幅が十分ある時のみ表示） */}
                  {!isNarrow && (
                    <div className="relative z-10 flex-shrink-0 flex flex-col items-center space-y-1 pt-2 w-10">
                      <ProgressGauge task={task} size="md" showPercentage={true} />
                      <div className="text-xs text-center text-gray-500 font-medium">
                        {Math.round(calculateTaskProgress(task))}%
                      </div>
                    </div>
                  )}

                  {/* メッセージカード風タスクカード */}
                  <div
                    className={`flex-1 min-w-0 rounded-lg shadow-sm group-hover:shadow-lg transition-all cursor-pointer relative task-card timeline-task-content ${isActive
                      ? 'bg-orange-50 border-2 border-orange-300'
                      : task.completed
                        ? 'bg-blue-50 border-2 border-blue-300 opacity-90'
                        : isPast
                          ? 'bg-purple-50 border-2 border-purple-300 opacity-75'
                          : 'bg-gray-50 border-2 border-gray-300'
                      }`}
                    style={{
                      height: `100%`,
                      fontSize: isNarrow ? '0.65rem' : '0.75rem',
                      padding: '0px',
                    }}
                  >
                    {/* 時刻バッジ（独立表示） */}
                    <div className={`timeline-time-badge px-2 py-1 rounded-full text-xs font-bold shadow-sm ${isActive
                      ? 'bg-orange-200 text-orange-800 border border-orange-300'
                      : task.completed
                        ? 'bg-blue-200 text-blue-800 border border-blue-300'
                        : isPast
                          ? 'bg-purple-200 text-purple-800 border border-purple-300'
                          : 'bg-gray-200 text-gray-700 border border-gray-300'
                      }`}>
                      {displayStartTime}
                    </div>

                    {/* メインコンテンツエリア */}
                    <div className="flex items-center h-full p-3 pt-4">
                      {/* ステータスアイコン */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isActive
                        ? 'bg-orange-500'
                        : task.completed
                          ? 'bg-blue-500'
                          : isPast
                            ? 'bg-purple-500'
                            : 'bg-gray-400'
                        }`}>
                        {isActive ? (
                          // Play icon for active
                          <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                        ) : task.completed ? (
                          // Check icon for completed
                          <Check className="w-4 h-4 text-white" />
                        ) : isPast ? (
                          // Pause icon for past
                          <div className="flex space-x-1">
                            <div className="w-1 h-3 bg-white"></div>
                            <div className="w-1 h-3 bg-white"></div>
                          </div>
                        ) : (
                          // Circle icon for pending
                          <div className="w-3 h-3 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      {/* タスク内容 */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold leading-tight ${isNarrow ? 'text-xs' : 'text-sm'} ${isActive
                            ? 'text-orange-900'
                            : task.completed
                              ? 'text-blue-900'
                              : isPast
                                ? 'text-purple-900'
                                : 'text-gray-800'
                            }`}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                          }}
                          title={task.title}
                        >
                          {task.emoji && <span className="mr-1">{task.emoji}</span>}
                          {task.title}
                        </div>
                        <div className={`text-xs mt-1 ${isActive
                          ? 'text-orange-700'
                          : task.completed
                            ? 'text-blue-700'
                            : isPast
                              ? 'text-purple-700'
                              : 'text-gray-600'
                          }`}>
                          {Math.round((timeToMinutes(displayEndTime) - timeToMinutes(displayStartTime)))}分 • {
                            isActive
                              ? '進行中'
                              : task.completed
                                ? '完了済み'
                                : isPast
                                  ? '時間経過'
                                  : '待機中'
                          }
                        </div>
                      </div>

                      {/* チェックボタン */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (loadingStates[task.id] === 'loading') return;
                          setTaskLoading(task.id, 'loading');
                          try {
                            await new Promise((res) => setTimeout(res, 300));
                            onTaskComplete(task.id);
                            setTaskLoading(task.id, 'success');
                            showToast('success', `「${task.title}」を${task.completed ? '未完了' : '完了'}にしました`);
                            setTimeout(() => setTaskLoading(task.id, 'idle'), 800);
                          } catch {
                            setTaskLoading(task.id, 'error');
                            showToast('error', 'タスクの更新に失敗しました');
                            setTimeout(() => setTaskLoading(task.id, 'idle'), 1500);
                          }
                        }}
                        disabled={loadingStates[task.id] === 'loading'}
                        className={`flex-shrink-0 ml-3 ${isNarrow ? 'w-6 h-6' : 'w-8 h-8'} rounded-full border-2 flex items-center justify-center shadow transition-all timeline-task-button ${loadingStates[task.id] === 'loading'
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : task.completed
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : isActive
                              ? 'bg-white border-orange-300 hover:border-orange-500 hover:bg-orange-50'
                              : isPast
                                ? 'bg-white border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                                : 'bg-white border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {loadingStates[task.id] === 'loading' ? (
                          <div className={`${isNarrow ? 'w-3 h-3' : 'w-4 h-4'} border-2 border-current border-t-transparent rounded-full animate-spin`} />
                        ) : task.completed ? (
                          <Check className={`${isNarrow ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        ) : (
                          <div className={`${isNarrow ? 'w-2 h-2' : 'w-3 h-3'} rounded-full border-2 border-current`} />
                        )}
                      </button>
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
              const yPosition = ((hour - 6) * 64) + (minute / 60 * 64) + offsetCompensation;

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
