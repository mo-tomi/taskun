import React from 'react';
import { Task } from '../../types';
import { TimelineGrid } from './TimelineGrid';
import { TaskBlock } from './TaskBlock';
import { LiveTimeline } from './LiveTimeline';
import { getTimeSlotPosition, getTaskHeight } from '../../utils/timeUtils';
import { AnimatePresence } from 'framer-motion';
import { isToday } from 'date-fns';

interface TimelineProps {
  tasks: Task[];
  currentDate: Date;
  onTaskComplete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskFocus: (task: Task) => void;
  onTaskReplan: (id: string) => void;
}

export function Timeline({ 
  tasks, 
  currentDate,
  onTaskComplete, 
  onTaskEdit, 
  onTaskFocus,
  onTaskReplan 
}: TimelineProps) {
  const isTodayView = isToday(currentDate);

  return (
    <div className="relative h-full overflow-auto timeline-container">
      <div className="relative" style={{ height: '2400px' }}>
        <TimelineGrid />
        
        {/* ライブタイムライン（今日のみ） */}
        {isTodayView && (
          <LiveTimeline 
            tasks={tasks} 
            currentDate={currentDate} 
            isToday={isTodayView} 
          />
        )}
        
        <AnimatePresence>
          {tasks.map(task => {
            const top = getTimeSlotPosition(task.startTime);
            const height = getTaskHeight(task.startTime, task.endTime);
            
            return (
              <TaskBlock
                key={task.id}
                task={task}
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 3)}%`,
                  minHeight: '60px'
                }}
                onComplete={onTaskComplete}
                onEdit={onTaskEdit}
                onFocus={onTaskFocus}
                onReplan={onTaskReplan}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}