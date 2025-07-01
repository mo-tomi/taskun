import { Task } from '../../types';
import { calculateTaskProgress } from '../../utils/timeUtils';

interface ProgressGaugeProps {
  task: Task;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressGauge({
  task,
  size = 'md',
  showPercentage = true,
  className = ''
}: ProgressGaugeProps) {
  const progress = calculateTaskProgress(task);

  const sizeClasses = {
    sm: { container: 'w-8 h-8', stroke: '2', text: 'text-xs' },
    md: { container: 'w-12 h-12', stroke: '3', text: 'text-sm' },
    lg: { container: 'w-16 h-16', stroke: '4', text: 'text-base' }
  };

  const config = sizeClasses[size];
  const radius = size === 'sm' ? 14 : size === 'md' ? 20 : 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 🎨 改良されたプログレス色とエフェクト
  const getProgressStyle = (progress: number, completed: boolean) => {
    if (completed) {
      return {
        stroke: 'url(#successGradient)',
        glowColor: '#10b981',
        animation: 'animate-bounce-gentle'
      };
    }

    if (progress >= 80) {
      return {
        stroke: 'url(#nearCompleteGradient)',
        glowColor: '#3b82f6',
        animation: 'animate-pulse'
      };
    }

    if (progress >= 50) {
      return {
        stroke: 'url(#progressGradient)',
        glowColor: '#f59e0b',
        animation: ''
      };
    }

    if (progress >= 25) {
      return {
        stroke: 'url(#warningGradient)',
        glowColor: '#f97316',
        animation: ''
      };
    }

    return {
      stroke: 'url(#lowProgressGradient)',
      glowColor: '#e5e7eb',
      animation: ''
    };
  };

  const progressStyle = getProgressStyle(progress, task.completed);
  const backgroundColor = '#f3f4f6'; // gray-100

  return (
    <div className={`relative ${config.container} ${className}`}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${(radius + parseInt(config.stroke)) * 2} ${(radius + parseInt(config.stroke)) * 2}`}
      >
        {/* 🎨 グラデーション定義 */}
        <defs>
          {/* 成功グラデーション */}
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* 完了間近グラデーション */}
          <linearGradient id="nearCompleteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* 進行中グラデーション */}
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* 警告グラデーション */}
          <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* 低進捗グラデーション */}
          <linearGradient id="lowProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>

          {/* グロー効果フィルター */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* パルス効果フィルター */}
          <filter id="pulse">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景円 */}
        <circle
          cx={radius + parseInt(config.stroke)}
          cy={radius + parseInt(config.stroke)}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={config.stroke}
        />

        {/* 🌟 進捗円 - 強化されたエフェクト */}
        <circle
          cx={radius + parseInt(config.stroke)}
          cy={radius + parseInt(config.stroke)}
          r={radius}
          fill="none"
          stroke={progressStyle.stroke}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-700 ease-out ${progressStyle.animation}`}
          filter="url(#glow)"
          style={{
            filter: `drop-shadow(0 0 6px ${progressStyle.glowColor})`,
            animationDuration: task.completed ? '0.6s' : '2s'
          }}
        />

        {/* 🎯 進捗インジケーター点 */}
        {progress > 10 && (
          <circle
            cx={radius + parseInt(config.stroke) + Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2) * radius}
            cy={radius + parseInt(config.stroke) + Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2) * radius}
            r="2"
            fill={progressStyle.glowColor}
            className="animate-pulse"
          />
        )}

        {/* 完了時のチェックマーク - 改良版 */}
        {task.completed && (
          <g className="transform rotate-90 animate-scale-in">
            <circle
              cx={radius + parseInt(config.stroke)}
              cy={radius + parseInt(config.stroke)}
              r={radius * 0.7}
              fill="rgba(16, 185, 129, 0.1)"
              className="animate-pulse"
            />
            <path
              d={`M ${radius + parseInt(config.stroke) - 6} ${radius + parseInt(config.stroke)} 
                 L ${radius + parseInt(config.stroke) - 2} ${radius + parseInt(config.stroke) + 4} 
                 L ${radius + parseInt(config.stroke) + 6} ${radius + parseInt(config.stroke) - 4}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce-gentle"
            />
          </g>
        )}
      </svg>

      {/* パーセンテージ表示 - 改良版 */}
      {showPercentage && !task.completed && (
        <div className={`absolute inset-0 flex items-center justify-center ${config.text} font-bold text-gray-700`}>
          <span className="animate-fade-in" key={Math.round(progress)}>
            {Math.round(progress)}%
          </span>
        </div>
      )}

      {/* 完了アイコン - 改良版 */}
      {task.completed && (
        <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
          <div className="relative">
            {/* 背景グロー */}
            <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full blur-sm opacity-50 animate-pulse"></div>

            {/* チェックアイコン */}
            <div className="relative w-4 h-4 text-white">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 プログレスレベル表示 */}
      {progress > 0 && !task.completed && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-medium">
          <span className={`px-1 py-0.5 rounded-full text-white text-xs ${progress >= 80 ? 'bg-blue-500' :
            progress >= 50 ? 'bg-amber-500' :
              progress >= 25 ? 'bg-orange-500' : 'bg-gray-400'
            }`}>
            {progress >= 80 ? '🔥' : progress >= 50 ? '⚡' : progress >= 25 ? '📈' : '📊'}
          </span>
        </div>
      )}
    </div>
  );
}

// リニアプログレスバー版も強化
interface LinearProgressProps {
  task: Task;
  height?: string;
  showLabel?: boolean;
  className?: string;
}

export function LinearProgress({
  task,
  height = 'h-3',
  showLabel = false,
  className = ''
}: LinearProgressProps) {
  const progress = calculateTaskProgress(task);

  const getProgressColor = (progress: number, completed: boolean) => {
    if (completed) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-amber-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  const progressColorClass = getProgressClass(progress, task.completed);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600 font-medium">進捗</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
            <span className="text-xs">
              {progress >= 80 ? '🔥' : progress >= 50 ? '⚡' : progress >= 25 ? '📈' : '📊'}
            </span>
          </div>
        </div>
      )}

      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden relative`}>
        {/* 背景アニメーション */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>

        {/* プログレスバー */}
        <div
          className={`${height} ${progressColorClass} rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 relative overflow-hidden`}
          style={{ width: `${progress}%` }}
        >
          {/* 🌟 内部グロー効果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20 animate-pulse"></div>

          {/* 進捗パーティクル */}
          {progress > 10 && (
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-bounce-gentle"
                  style={{
                    left: `${20 + i * 25}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          )}

          {/* 完了アイコン */}
          {task.completed && (
            <div className="relative w-4 h-4 text-white animate-bounce-gentle">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* プログレスマイルストーン */}
      {!task.completed && progress > 0 && (
        <div className="mt-1 flex justify-between text-xs text-gray-400">
          <span className={progress >= 25 ? 'text-orange-500 font-medium' : ''}>25%</span>
          <span className={progress >= 50 ? 'text-amber-500 font-medium' : ''}>50%</span>
          <span className={progress >= 75 ? 'text-blue-500 font-medium' : ''}>75%</span>
          <span className={progress >= 100 ? 'text-green-500 font-medium' : ''}>100%</span>
        </div>
      )}
    </div>
  );
} 