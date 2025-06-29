import { TaskColor } from '../types';

export const taskColors: Record<TaskColor, { bg: string; border: string; text: string; light: string }> = {
  coral: {
    bg: 'bg-pink-500',
    border: 'border-pink-600',
    text: 'text-white',
    light: 'bg-pink-100'
  },
  blue: {
    bg: 'bg-blue-500',
    border: 'border-blue-600',
    text: 'text-white',
    light: 'bg-blue-100'
  },
  green: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    text: 'text-white',
    light: 'bg-green-100'
  },
  purple: {
    bg: 'bg-purple-500',
    border: 'border-purple-600',
    text: 'text-white',
    light: 'bg-purple-100'
  },
  orange: {
    bg: 'bg-orange-500',
    border: 'border-orange-600',
    text: 'text-white',
    light: 'bg-orange-100'
  },
  teal: {
    bg: 'bg-teal-500',
    border: 'border-teal-600',
    text: 'text-white',
    light: 'bg-teal-100'
  }
};

export function getTaskColorClasses(color: TaskColor) {
  return taskColors[color];
}