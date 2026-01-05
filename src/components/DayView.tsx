import React, { useMemo } from 'react';
import { useStore } from '../store';
import { TaskCard } from './TaskCard';
import dayjs from 'dayjs';

export const DayView: React.FC = () => {
  const { currentDate, getTasksForDate, categories, openEditTask } = useStore();

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const tasksForDate = useMemo(() => getTasksForDate(currentDate), [getTasksForDate, currentDate]);

  const getTasksForHour = (hour: number) => {
    return tasksForDate.filter((task) => {
      const taskHour = dayjs(task.startTime).hour();
      return taskHour === hour;
    });
  };

  const now = dayjs();
  const isCurrentHour = (hour: number) => now.hour() === hour;

  const formatTime = (hour: number) => {
    return dayjs().hour(hour).format('h:00 A');
  };

  return (
    <div className="flex-1 overflow-auto pb-16">
      {/* Current time indicator */}
      {now.isSame(currentDate, 'day') && (
        <div
          className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
          style={{
            top: `${now.hour() * 60 + now.minute()}px`,
          }}
        >
          <div className="w-4 h-4 bg-red-500 rounded-full -ml-2" />
          <div className="flex-1 h-0.5 bg-red-500" />
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {hours.map((hour) => {
          const hourTasks = getTasksForHour(hour);
          const isCurrent = isCurrentHour(hour);

          return (
            <div key={hour} className="flex min-h-[60px]">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 py-2 px-3 text-right">
                <span
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  {formatTime(hour)}
                </span>
              </div>

              {/* Dashed grid line */}
              <div className="flex-1 border-t border-dashed border-gray-200 relative">
                {/* Half-hour marker */}
                <div className="absolute top-0 left-0 w-full h-px border-t border-dashed border-gray-100" />

                {/* Hour slot content */}
                <div className="py-2 px-3">
                  {hourTasks.length > 0 && (
                    <div className="space-y-2">
                      {hourTasks.map((task) => {
                        const category = categories.find((c) => c.id === task.categoryId);
                        return (
                          <TaskCard
                            key={task.id}
                            task={task}
                            category={category}
                            onClick={() => openEditTask(task.id)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
