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
  
  const getProgressColor = (progress: number, completed: boolean) => {
    if (completed) return '#10b981'; // green-500
    if (progress >= 80) return '#3b82f6'; // blue-500
    if (progress >= 50) return '#f59e0b'; // amber-500
    if (progress >= 25) return '#f97316'; // orange-500
    return '#e5e7eb'; // gray-200
  };

  const progressColor = getProgressColor(progress, task.completed);
  const backgroundColor = '#f3f4f6'; // gray-100

  return (
    <div className={`relative ${config.container} ${className}`}>
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${(radius + parseInt(config.stroke)) * 2} ${(radius + parseInt(config.stroke)) * 2}`}
      >
        {/* 背景円 */}
        <circle
          cx={radius + parseInt(config.stroke)}
          cy={radius + parseInt(config.stroke)}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={config.stroke}
        />
        
        {/* 進捗円 */}
        <circle
          cx={radius + parseInt(config.stroke)}
          cy={radius + parseInt(config.stroke)}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
        
        {/* 完了時のチェックマーク */}
        {task.completed && (
          <g className="transform rotate-90">
            <path
              d={`M ${radius + parseInt(config.stroke) - 6} ${radius + parseInt(config.stroke)} 
                 L ${radius + parseInt(config.stroke) - 2} ${radius + parseInt(config.stroke) + 4} 
                 L ${radius + parseInt(config.stroke) + 6} ${radius + parseInt(config.stroke) - 4}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
      
      {/* パーセンテージ表示 */}
      {showPercentage && !task.completed && (
        <div className={`absolute inset-0 flex items-center justify-center ${config.text} font-bold text-gray-700`}>
          {Math.round(progress)}%
        </div>
      )}
      
      {/* 完了アイコン */}
      {task.completed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 text-white">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// リニアプログレスバー版も提供
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
    if (progress >= 80) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (progress >= 50) return 'bg-gradient-to-r from-amber-400 to-orange-500';
    if (progress >= 25) return 'bg-gradient-to-r from-orange-400 to-amber-500';
    return 'bg-gray-300';
  };

  const progressColorClass = getProgressColor(progress, task.completed);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">進捗</span>
          <span className="text-xs font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`${height} ${progressColorClass} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1`}
          style={{ width: `${progress}%` }}
        >
          {task.completed && (
            <div className="w-3 h-3 text-white">
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
    </div>
  );
} 