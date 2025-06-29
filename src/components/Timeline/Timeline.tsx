import { Task } from '../../types';
import { TimelineGrid } from './TimelineGrid';
import { TaskBlock } from './TaskBlock';
import { LiveTimeline } from './LiveTimeline';
import { getTimeSlotPosition, getTaskHeight } from '../../utils/timeUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { isToday } from 'date-fns';
import { PlusCircle } from 'lucide-react';

interface TimelineProps {
  tasks: Task[];
  currentDate: Date;
  onTaskComplete: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskFocus: (task: Task) => void;
  onTaskReplan: (id: string) => void;
  onTaskDelete: (id: string) => void;
}

export function Timeline({ 
  tasks, 
  currentDate,
  onTaskComplete, 
  onTaskEdit, 
  onTaskFocus,
  onTaskReplan,
  onTaskDelete
}: TimelineProps) {
  const isTodayView = isToday(currentDate);

  return (
    <div className="relative h-full overflow-auto timeline-container p-4">
      <div className="relative" style={{ height: '2400px' }}>
        <TimelineGrid />
        
        {isTodayView && <LiveTimeline tasks={tasks} currentDate={currentDate} isToday={isTodayView} />}
        
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
                  height: `${Math.max(height, 2.5)}%`, // min-height of 15mins
                  minHeight: '40px'
                }}
                onComplete={onTaskComplete}
                onEdit={onTaskEdit}
                onFocus={onTaskFocus}
                onReplan={onTaskReplan}
                onDelete={onTaskDelete}
              />
            );
          })}
        </AnimatePresence>

        {tasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <div className="p-6 bg-muted/50 rounded-full">
              <PlusCircle className="w-16 h-16 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">本日の予定はありません</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              「/」キーを押して最初のタスクを追加しましょう。
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}