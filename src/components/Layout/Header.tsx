import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export function Header() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <Icon name="KanbanSquare" color="primary" size="lg" />
        <h1 className="text-xl font-bold text-foreground">
          Taskun
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-surface-variant transition-colors"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'light' ? 'Moon' : 'Sun'} color="secondary" />
        </button>
        <button className="p-2 rounded-full hover:bg-surface-variant transition-colors">
          <Icon name="Bell" color="neutral" badge />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-primary" />
      </div>
    </header>
  );
}