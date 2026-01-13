import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Task } from '../types';
import dayjs from 'dayjs';

type CalendarViewMode = 'month' | 'week';

export const FullCalendar: React.FC = () => {
  const {
    tasks,
    currentDate,
    setCurrentDate,
    setViewMode,
    categories,
    selectedCategoryId,
    setSelectedCategory,
    updateTask,
    settings,
  } = useStore();

  const [viewMode, setLocalViewMode] = React.useState<CalendarViewMode>('month');

  // Drag state
  const [draggingTask, setDraggingTask] = useState<{
    task: Task;
    startY: number;
    startTop: number;
    dayDate: dayjs.Dayjs;
  } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    dayDate: dayjs.Dayjs;
    top: number;
    height: number;
  } | null>(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedCategoryId && task.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [tasks, selectedCategoryId]);

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: dayjs.Dayjs): Task[] => {
    const start = date.startOf('day').toISOString();
    const end = date.endOf('day').toISOString();
    return filteredTasks.filter(
      t => t.startTime >= start && t.startTime <= end && !t.isCompleted
    );
  };

  // Get tasks for a week
  const getTasksForWeek = (weekStart: dayjs.Dayjs): Map<string, Task[]> => {
    const taskMap = new Map<string, Task[]>();
    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, 'day');
      taskMap.set(date.format('YYYY-MM-DD'), getTasksForDate(date));
    }
    return taskMap;
  };

  // Generate month calendar days
  const monthDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const days: dayjs.Dayjs[] = [];
    let day = startDate;
    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  }, [currentDate]);

  // Generate week calendar days
  const weekDays = useMemo(() => {
    // Use user's preferred week start day (0 = Sunday, 1 = Monday)
    const startOfWeek = currentDate.startOf('week').day(settings.startOfWeek);
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  }, [currentDate, settings.startOfWeek]);

  const weekTaskMap = useMemo(() => {
    return getTasksForWeek(currentDate.startOf('week'));
  }, [currentDate, filteredTasks]);

  // Week hours for week view
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateClick = (date: dayjs.Dayjs) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  // Drag handlers
  const handleTaskMouseDown = useCallback((e: React.MouseEvent, task: Task, dayDate: dayjs.Dayjs) => {
    if (task.isAllDay) return; // Don't drag all-day tasks

    const taskElement = (e.target as HTMLElement).closest('.calendar-task') as HTMLElement;
    if (!taskElement) return;

    const startTop = parseFloat(taskElement.style.top || '0');

    setDraggingTask({
      task,
      startY: e.clientY,
      startTop,
      dayDate,
    });

    // Prevent text selection during drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingTask) return;

    const deltaY = e.clientY - draggingTask.startY;
    const newTop = Math.max(0, Math.min(draggingTask.startTop + deltaY, 92)); // Constrain to 0-92%

    // Calculate time from position
    const totalMinutes = Math.round((newTop / 100) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round((totalMinutes % 60) / 15) * 15; // Snap to 15 min intervals

    // Calculate task duration
    const duration = dayjs(draggingTask.task.endTime).diff(
      dayjs(draggingTask.task.startTime),
      'minute'
    );

    // Update drop indicator
    const topPercent = ((hours * 60 + minutes) / (24 * 60)) * 100;
    const heightPercent = (duration / (24 * 60)) * 100;

    setDropIndicator({
      dayDate: draggingTask.dayDate,
      top: topPercent,
      height: heightPercent,
    });
  }, [draggingTask]);

  const handleMouseUp = useCallback(async () => {
    if (!draggingTask || !dropIndicator) {
      setDraggingTask(null);
      setDropIndicator(null);
      return;
    }

    // Calculate new time
    const duration = dayjs(draggingTask.task.endTime).diff(
      dayjs(draggingTask.task.startTime),
      'minute'
    );

    const totalMinutes = Math.round((dropIndicator.top / 100) * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round((totalMinutes % 60) / 15) * 15;

    const newStartTime = dropIndicator.dayDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .toISOString();

    const newEndTime = dayjs(newStartTime).add(duration, 'minute').toISOString();

    // Update task
    await updateTask({
      ...draggingTask.task,
      startTime: newStartTime,
      endTime: newEndTime,
      updatedAt: Date.now(),
    });

    setDraggingTask(null);
    setDropIndicator(null);
  }, [draggingTask, dropIndicator, updateTask]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (draggingTask) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingTask, handleMouseMove, handleMouseUp]);

  const renderMonthView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((day, idx) => {
          const dayTasks = getTasksForDate(day);
          const isToday = day.isSame(dayjs(), 'day');
          const isCurrentMonth = day.month() === currentDate.month();
          const isSelected = day.isSame(currentDate, 'day');

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`min-h-[100px] p-2 border-b border-r border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                    isToday
                      ? 'bg-primary-500 text-white font-medium'
                      : isSelected
                      ? 'bg-primary-100 text-primary-600 font-medium'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {day.date()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-xs text-gray-400">{dayTasks.length}</span>
                )}
              </div>

              {/* Task Indicators */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => {
                  const cat = getCategory(task.categoryId);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: `${cat?.color}20`,
                        color: cat?.color,
                      }}
                      title={task.title}
                    >
                      {cat?.icon} {task.title}
                    </motion.div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-400 pl-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-[60px_1fr] border-b border-gray-100">
        <div className="p-3"></div>
        <div className="grid grid-cols-7">
          {weekDays.map(day => {
            const isToday = day.isSame(dayjs(), 'day');
            return (
              <div
                key={day.format('YYYY-MM-DD')}
                onClick={() => handleDateClick(day)}
                className={`p-3 text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                  isToday ? 'bg-primary-50' : ''
                }`}
              >
                <div className="text-xs text-gray-500">{day.format('ddd')}</div>
                <div
                  className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium ${
                    isToday
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {day.date()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Body */}
      <div className="grid grid-cols-[60px_1fr] max-h-[600px] overflow-y-auto">
        {/* Time Labels */}
        <div className="border-r border-gray-100">
          {hours.map(hour => (
            <div
              key={hour}
              className="h-12 flex items-start justify-center text-xs text-gray-400 border-b border-gray-50"
            >
              {hour === 0 ? '' : `${hour}:00`}
            </div>
          ))}
        </div>

        {/* Day Columns */}
        <div className="grid grid-cols-7 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {weekDays.map(day => (
              <div key={day.format('YYYY-MM-DD')} className="flex-1 border-r border-gray-50" />
            ))}
          </div>

          {/* Tasks */}
          {weekDays.map(day => {
            const dateKey = day.format('YYYY-MM-DD');
            const dayTasks = weekTaskMap.get(dateKey) || [];
            const isToday = day.isSame(dayjs(), 'day');

            return (
              <div key={dateKey} className="relative h-[1152px]">
                {/* Today highlight */}
                {isToday && (
                  <div className="absolute inset-0 bg-primary-50/30 pointer-events-none" />
                )}

                {/* Drop indicator */}
                {dropIndicator && dropIndicator.dayDate.format('YYYY-MM-DD') === dateKey && (
                  <div
                    className="absolute left-1 right-1 rounded border-2 border-dashed border-primary-500 bg-primary-500/20"
                    style={{
                      top: `${dropIndicator.top}%`,
                      height: `${dropIndicator.height}%`,
                    }}
                  />
                )}

                {/* Tasks positioned by time */}
                {dayTasks.map(task => {
                  const startHour = dayjs(task.startTime).hour();
                  const startMinute = dayjs(task.startTime).minute();
                  const endHour = dayjs(task.endTime).hour();
                  const endMinute = dayjs(task.endTime).minute();

                  const top = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
                  const height =
                    (((endHour * 60 + endMinute - startHour * 60 - startMinute) / 60) /
                      24) *
                    100;

                  const cat = getCategory(task.categoryId);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`calendar-task absolute left-1 right-1 rounded p-1 cursor-move hover:ring-2 ring-primary-400 transition-shadow ${
                        draggingTask?.task.id === task.id ? 'ring-2 ring-white scale-105 z-10 shadow-lg' : ''
                      }`}
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 2)}%`,
                        backgroundColor: cat?.color || '#6B7280',
                        cursor: task.isAllDay ? 'default' : 'grab',
                      }}
                      onMouseDown={(e) => handleTaskMouseDown(e, task, day)}
                      title={`${task.title} (${dayjs(task.startTime).format('HH:mm')} - ${dayjs(task.endTime).format('HH:mm')})`}
                    >
                      <div className="text-white text-xs font-medium truncate">
                        {dayjs(task.startTime).format('HH:mm')} {task.title}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
            <p className="text-gray-500">
              {viewMode === 'month'
                ? currentDate.format('YYYY年M月')
                : `${currentDate.startOf('week').format('M月D日')} - ${currentDate.endOf('week').format('M月D日')}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setLocalViewMode('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'month'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                月视图
              </button>
              <button
                onClick={() => setLocalViewMode('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                周视图
              </button>
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentDate(
                    viewMode === 'month'
                      ? currentDate.subtract(1, 'month')
                      : currentDate.subtract(1, 'week')
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(dayjs())}
                className="px-4 py-2 text-sm font-medium text-primary-500 hover:bg-primary-50 rounded-lg"
              >
                今天
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    viewMode === 'month'
                      ? currentDate.add(1, 'month')
                      : currentDate.add(1, 'week')
                  )
                }
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedCategoryId === null
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategoryId ? null : cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategoryId === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedCategoryId === cat.id ? { backgroundColor: cat.color } : {}}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">{viewMode === 'month' ? renderMonthView() : renderWeekView()}</div>
    </div>
  );
};
