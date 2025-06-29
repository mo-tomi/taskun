import React from 'react';
import { generateTimeSlots } from '../../utils/timeUtils';

export function TimelineGrid() {
  const timeSlots = generateTimeSlots();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {timeSlots.map((time, index) => (
        <div
          key={time}
          className="absolute left-0 right-0 border-t border-gray-100"
          style={{ top: `${(index / 24) * 100}%` }}
        >
          <div className="absolute -left-16 -top-2 text-xs text-gray-400 font-medium">
            {time}
          </div>
        </div>
      ))}
    </div>
  );
}