import React, { useState, useEffect, useRef } from 'react';
import { Plus, Palette, Zap, Timer, RotateCcw, Calendar, ArrowRight } from 'lucide-react';
import { Task, TaskColor } from '../../types';
import { getTaskColorClasses } from '../../utils/colorUtils';
import { format, addDays } from 'date-fns';
import { isTimeSpanningNextDay } from '../../utils/multiDayTaskUtils';

interface QuickAddProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  currentDate: Date;
  isOpen: boolean;
  onToggle: () => void;
}

export function QuickAdd({ onAddTask, currentDate, isOpen, onToggle }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [taskDate, setTaskDate] = useState(format(currentDate, 'yyyy-MM-dd')); // 🗓️ タスクの開始日
  const [endDate, setEndDate] = useState(''); // 🌅 終了日（空なら開始日と同じ）
  const [color, setColor] = useState<TaskColor>('coral');
  const [isHabit, setIsHabit] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const colors: TaskColor[] = ['coral', 'blue', 'green', 'purple', 'orange', 'teal'];

  // 🕐 15分刻みの時間選択肢を生成（6:00～23:45）
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // 現在時刻を取得・設定する関数
  const getCurrentTime = () => {
    const now = new Date();
    return format(now, 'HH:mm');
  };

  const getCurrentEndTime = (startTime: string, duration: number = 60) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + duration);
    return format(endDate, 'HH:mm');
  };

  // 現在時刻をセットする関数（15分刻みに丸める）
  const setCurrentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 15分刻みに丸める
    const roundedMinute = Math.round(currentMinute / 15) * 15;
    const adjustedHour = roundedMinute >= 60 ? currentHour + 1 : currentHour;
    const finalMinute = roundedMinute >= 60 ? 0 : roundedMinute;

    // 時間範囲内（6:00-23:45）に制限
    const clampedHour = Math.max(6, Math.min(23, adjustedHour));
    const finalTime = `${clampedHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;

    setStartTime(finalTime);
    setEndTime(getCurrentEndTime(finalTime));
  };

  // 継続時間を計算して終了時刻を更新
  const updateEndTime = (start: string, durationMinutes: number = 60) => {
    const end = getCurrentEndTime(start, durationMinutes);
    setEndTime(end);

    // 🌅 時刻が翌日にまたがる場合は自動的に終了日を翌日に設定
    if (isTimeSpanningNextDay(start, end)) {
      const nextDay = format(addDays(new Date(taskDate), 1), 'yyyy-MM-dd');
      setEndDate(nextDay);
    } else if (endDate) {
      // 同じ日に戻った場合は終了日をクリア
      setEndDate('');
    }
  };

  // 🌅 終了時刻が変更された時の処理
  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);

    // 時刻が翌日にまたがる場合は自動的に終了日を設定
    if (isTimeSpanningNextDay(startTime, newEndTime)) {
      const nextDay = format(addDays(new Date(taskDate), 1), 'yyyy-MM-dd');
      setEndDate(nextDay);
    } else if (endDate) {
      // 同じ日に戻った場合は終了日をクリア
      setEndDate('');
    }
  };

  // コンポーネントが開かれた時に現在時刻と日付を自動設定
  useEffect(() => {
    if (isOpen) {
      setCurrentTime();
      setTaskDate(format(currentDate, 'yyyy-MM-dd'));
      // フォーカスを遅延させてアニメーション完了後に実行
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 🌅 終了日の決定ロジック
    let finalEndDate = endDate;
    if (!finalEndDate && isTimeSpanningNextDay(startTime, endTime)) {
      // 時刻が翌日にまたがる場合は自動的に翌日を設定
      finalEndDate = format(addDays(new Date(taskDate), 1), 'yyyy-MM-dd');
    }

    onAddTask({
      title: title.trim(),
      startTime,
      endTime,
      date: taskDate, // 🗓️ 設定された開始日を使用
      endDate: finalEndDate || undefined, // 🌅 終了日（空なら undefined）
      color,
      completed: false,
      isHabit,
      subtasks: []
    });

    // フォームをリセット
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setTaskDate(format(new Date(), 'yyyy-MM-dd')); // 🗓️ 開始日もリセット
    setEndDate(''); // 🌅 終了日もリセット
    setIsHabit(false);
    setShowAdvanced(false);
    onToggle();
  };

  if (!isOpen) {
    return (
      /* メインのクイック追加ボタンのみ */
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 gradient-primary text-white rounded-full p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 z-50 pulse-glow group animate-bounce"
        title="クイック追加"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="glass-card rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* ヘッダー */}
        <div className="gradient-primary px-6 py-4 current-time-indicator">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl micro-interaction">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">クイック追加</h2>
                <p className="text-white/80 text-sm">現在時刻: {getCurrentTime()}</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-white/80 hover:text-white text-2xl hover:bg-white/10 rounded-lg p-1 transition-all micro-interaction"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* タスク名入力 */}
          <div>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="何をしますか？"
              className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-800 placeholder-gray-500 text-lg transition-all enhanced-focus"
              autoFocus
            />
          </div>

          {/* 日時設定 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">日時設定</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setTaskDate(format(new Date(), 'yyyy-MM-dd'))}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium micro-interaction"
                >
                  <Calendar className="w-4 h-4" />
                  <span>今日</span>
                </button>
                <button
                  type="button"
                  onClick={setCurrentTime}
                  className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium micro-interaction quick-add-pulse"
                >
                  <Timer className="w-4 h-4" />
                  <span>現在時刻</span>
                </button>
              </div>
            </div>

            {/* 開始日時 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="time-input-enhanced">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all enhanced-focus"
                />
              </div>
              <div className="time-input-enhanced">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  開始時刻
                </label>
                <select
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    updateEndTime(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all enhanced-focus bg-white"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 終了時刻 */}
            <div className="time-input-enhanced">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                終了時刻
              </label>
              <select
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all enhanced-focus bg-white"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* 時間プリセット */}
            <div className="flex space-x-2">
              {[15, 30, 60, 120].map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => updateEndTime(startTime, duration)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors time-preset-button micro-interaction"
                >
                  {duration}分
                </button>
              ))}
            </div>
          </div>

          {/* リアルタイムプレビュー */}
          {title && (
            <div className="task-preview has-content">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${getTaskColorClasses(color).bg}`}></div>
                <span className="font-medium">{title}</span>
                <span className="text-gray-500">{startTime} - {endTime}</span>
                {/* 🌅 複数日タスクの表示 */}
                {(endDate || isTimeSpanningNextDay(startTime, endTime)) && (
                  <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded-full">
                    複数日
                  </span>
                )}
              </div>
              {(endDate || isTimeSpanningNextDay(startTime, endTime)) && (
                <div className="text-xs text-gray-500 mt-1">
                  期間: {taskDate} → {endDate || format(addDays(new Date(taskDate), 1), 'yyyy-MM-dd')}
                </div>
              )}
            </div>
          )}

          {/* 詳細設定トグル */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors micro-interaction"
          >
            <span>詳細設定</span>
            <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              <RotateCcw className="w-4 h-4" />
            </div>
          </button>

          {/* 詳細設定 */}
          <div className={`progressive-disclosure ${showAdvanced ? 'expanded' : ''}`}>
            <div className="space-y-4 pt-2">
              {/* 🌅 終了日設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  複数日タスク設定
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>開始日: {taskDate}</span>
                    {endDate && (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span>終了日: {endDate}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={taskDate}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all enhanced-focus"
                      placeholder="終了日を選択（省略可）"
                    />
                    {endDate && (
                      <button
                        type="button"
                        onClick={() => setEndDate('')}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                        title="終了日をクリア"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {/* 🌅 複数日タスクの自動検出通知 */}
                  {(endDate || isTimeSpanningNextDay(startTime, endTime)) && (
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {isTimeSpanningNextDay(startTime, endTime) && !endDate
                          ? '時刻が翌日にまたがるため、自動的に複数日タスクになります'
                          : '複数日にわたるタスクとして作成されます'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 色選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  色
                </label>
                <div className="flex space-x-2">
                  {colors.map((colorOption) => {
                    const colorClasses = getTaskColorClasses(colorOption);
                    return (
                      <button
                        key={colorOption}
                        type="button"
                        onClick={() => setColor(colorOption)}
                        className={`w-8 h-8 rounded-full ${colorClasses.bg} ${color === colorOption ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'
                          } transition-all micro-interaction`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* 習慣設定 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isHabit"
                  checked={isHabit}
                  onChange={(e) => setIsHabit(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isHabit" className="ml-2 text-sm text-gray-700">
                  毎日の習慣にする
                </label>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onToggle}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors micro-interaction"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 micro-interaction"
            >
              <Zap className="w-4 h-4" />
              <span>追加</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
