import { useState, useCallback } from 'react';
import { EnergyLevel } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { format } from 'date-fns';

// 互換性のあるIDジェネレーター
const generateId = () => {
  return `energy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export function useEnergyTracking() {
  const [energyLevels, setEnergyLevels] = useLocalStorage<EnergyLevel[]>('energy-levels', []);

  const addEnergyLevel = useCallback((level: number) => {
    console.log('📊 エネルギーレベル記録開始:', level);

    const now = new Date();
    const newLevel: EnergyLevel = {
      id: generateId(), // より互換性のあるID生成
      date: format(now, 'yyyy-MM-dd'),
      time: format(now, 'HH:mm'),
      level,
      userId: 'current-user' // 実際の実装では認証されたユーザーIDを使用
    };

    console.log('📊 新しいエネルギーレベル:', newLevel);

    setEnergyLevels(prev => {
      const updated = [...prev, newLevel];
      console.log('📊 更新されたエネルギーレベル配列:', updated);
      return updated;
    });

    return newLevel;
  }, [setEnergyLevels]);

  const getEnergyForDate = useCallback((date: string) => {
    const filtered = energyLevels.filter(level => level.date === date);
    console.log(`📊 ${date}のエネルギーレベル:`, filtered);
    return filtered;
  }, [energyLevels]);

  const getAverageEnergyForDate = useCallback((date: string) => {
    const dayLevels = getEnergyForDate(date);
    if (dayLevels.length === 0) return 0;

    return dayLevels.reduce((sum, level) => sum + level.level, 0) / dayLevels.length;
  }, [getEnergyForDate]);

  const getWeeklyEnergyTrend = useCallback(() => {
    // 過去7日間のエネルギー平均を計算
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const average = getAverageEnergyForDate(dateStr);

      weekData.push({
        date: dateStr,
        average,
        levels: getEnergyForDate(dateStr)
      });
    }

    return weekData;
  }, [getEnergyForDate, getAverageEnergyForDate]);

  // デバッグ用：すべてのエネルギーレベルをログ出力
  console.log('📊 現在のエネルギーレベル配列:', energyLevels);

  return {
    energyLevels,
    addEnergyLevel,
    getEnergyForDate,
    getAverageEnergyForDate,
    getWeeklyEnergyTrend
  };
}