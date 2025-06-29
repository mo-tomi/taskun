import React from 'react';
import { Calendar, BarChart3, Settings, Menu } from 'lucide-react';
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
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-pink-500" />
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              構造化プランナー
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <div className="text-center mr-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'EEEE', { locale: ja })}
            </h2>
            <p className="text-sm text-gray-600">
              {format(currentDate, 'yyyy年M月d日', { locale: ja })}
            </p>
          </div>

          <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
            {viewModes.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onStatsClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="統計を表示"
          >
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}