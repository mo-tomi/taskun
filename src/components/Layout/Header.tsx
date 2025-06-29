import React from 'react';
import { Calendar, BarChart3, Menu } from 'lucide-react';
import { ViewMode } from '../../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface HeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onStatsClick: () => void;
  onMenuClick: () => void;
}

export function Header({ 
  currentDate, 
  viewMode, 
  onViewModeChange, 
  onStatsClick,
  onMenuClick 
}: HeaderProps) {
  const viewModes: { mode: ViewMode; label: string }[] = [
    { mode: 'day', label: '日' },
    { mode: 'week', label: '週' },
    { mode: 'month', label: '月' }
  ];

  return (
    <header className="px-4 py-3 border-b bg-card">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-accent md:hidden"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                Taskun
              </h1>
              <p className="text-xs text-muted-foreground">
                あなたの時間を最適化
              </p>
            </div>
          </div>
        </div>

        {/* Center Section (Date) - Hidden on small screens */}
        <div className="hidden lg:flex flex-col items-center">
            <h2 className="font-semibold text-foreground">
              {format(currentDate, 'EEEE', { locale: ja })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, 'yyyy年M月d日', { locale: ja })}
            </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-muted p-1 rounded-lg">
            {viewModes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onStatsClick}
            className="p-2 rounded-md hover:bg-accent group"
            title="統計を表示"
          >
            <BarChart3 className="w-5 h-5 text-muted-foreground group-hover:text-accent-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}