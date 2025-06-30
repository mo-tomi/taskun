import { useMemo } from 'react';
import { EnergyLevel } from '../../types';
import { format } from 'date-fns';

interface EnergyChartProps {
  energyLevels: EnergyLevel[];
  currentDate: Date;
  height?: number;
}

export function EnergyChart({ energyLevels, currentDate, height = 120 }: EnergyChartProps) {
  const chartData = useMemo(() => {
    const todayLevels = energyLevels.filter(
      level => level.date === format(currentDate, 'yyyy-MM-dd')
    ).sort((a, b) => a.time.localeCompare(b.time));

    if (todayLevels.length === 0) {
      return [];
    }

    // 24時間のグリッドを作成
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, '0');
      const hourLevels = todayLevels.filter(level => 
        level.time.startsWith(hourStr)
      );
      
      const avgLevel = hourLevels.length > 0 
        ? hourLevels.reduce((sum, level) => sum + level.level, 0) / hourLevels.length
        : null;
      
      return {
        hour,
        level: avgLevel,
        count: hourLevels.length
      };
    });

    return hourlyData;
  }, [energyLevels, currentDate]);

  const pathData = useMemo(() => {
    const validPoints = chartData.filter(d => d.level !== null);
    if (validPoints.length === 0) return { line: '', gradient: '' };

    const width = 280; // グラフの幅
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - 40;

    let path = '';
    let gradientPath = '';

    validPoints.forEach((point, index) => {
      const x = padding + (point.hour / 23) * chartWidth;
      const y = padding + chartHeight - (point.level! / 100) * chartHeight;

      if (index === 0) {
        path += `M ${x} ${y}`;
        gradientPath += `M ${x} ${padding + chartHeight} L ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
        gradientPath += ` L ${x} ${y}`;
      }
    });

    // グラデーション用のパスを閉じる
    if (validPoints.length > 0) {
      const lastPoint = validPoints[validPoints.length - 1];
      const lastX = padding + (lastPoint.hour / 23) * chartWidth;
      gradientPath += ` L ${lastX} ${padding + chartHeight} Z`;
    }

    return { line: path, gradient: gradientPath };
  }, [chartData, height]);

  const getEnergyColor = (level: number) => {
    if (level >= 80) return '#10b981'; // green-500
    if (level >= 60) return '#3b82f6'; // blue-500
    if (level >= 40) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const currentHour = new Date().getHours();
  const currentLevel = chartData.find(d => d.hour === currentHour)?.level;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">エネルギー推移</h3>
        {currentLevel && (
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getEnergyColor(currentLevel) }}
            />
            <span className="text-sm font-bold text-gray-700">
              {Math.round(currentLevel)}%
            </span>
          </div>
        )}
      </div>

      {chartData.filter(d => d.level !== null).length === 0 ? (
        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
          エネルギーレベルの記録がありません
        </div>
      ) : (
        <div className="relative">
          <svg width="280" height={height} className="w-full">
            {/* グリッドライン */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
              </linearGradient>
            </defs>

            {/* バックグラウンドグリッド */}
            <rect width="280" height={height} fill="url(#grid)" />

            {/* Y軸ラベル */}
            {[0, 25, 50, 75, 100].map(value => {
              const y = 20 + (height - 40) - (value / 100) * (height - 40);
              return (
                <g key={value}>
                  <line x1="20" y1={y} x2="260" y2={y} stroke="#e5e7eb" strokeWidth="1" />
                  <text x="15" y={y + 3} textAnchor="end" className="text-xs fill-gray-400">
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X軸ラベル（時間） */}
            {[0, 6, 12, 18, 24].map(hour => {
              const x = 20 + (hour / 23) * 220;
              return (
                <text key={hour} x={x} y={height - 5} textAnchor="middle" className="text-xs fill-gray-400">
                  {hour}:00
                </text>
              );
            })}

            {/* エネルギーレベルエリア */}
            {pathData.gradient && (
              <path
                d={pathData.gradient}
                fill="url(#energyGradient)"
                opacity="0.6"
              />
            )}

            {/* エネルギーレベルライン */}
            {pathData.line && (
              <path
                d={pathData.line}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* データポイント */}
            {chartData
              .filter(d => d.level !== null)
              .map((point, index) => {
                const x = 20 + (point.hour / 23) * 220;
                const y = 20 + (height - 40) - (point.level! / 100) * (height - 40);
                const isCurrentHour = point.hour === currentHour;
                
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrentHour ? 4 : 3}
                      fill={getEnergyColor(point.level!)}
                      stroke="white"
                      strokeWidth="2"
                      className={isCurrentHour ? 'animate-pulse' : ''}
                    />
                    {point.count > 1 && (
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-medium"
                      >
                        {point.count}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* 現在時刻の縦線 */}
            {(() => {
              const now = new Date();
              const currentPosition = 20 + (now.getHours() / 23) * 220;
              return (
                <line
                  x1={currentPosition}
                  y1="20"
                  x2={currentPosition}
                  y2={height - 20}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
} 