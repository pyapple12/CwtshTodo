import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useStore } from '../store';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarCardProps {
  title: string;
  onAddTask?: () => void;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({ title, onAddTask }) => {
  const { tasks, categories } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const getTasksForDate = (date: dayjs.Dayjs) => {
    const start = date.startOf('day').toISOString();
    const end = date.endOf('day').toISOString();
    return tasks.filter(
      (t) => t.startTime >= start && t.startTime <= end && !t.isCompleted
    );
  };

  // Week view
  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf('week');
    const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    const today = dayjs();

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-400">{day.format('ddd')}</div>
              <div
                className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                  day.isSame(today, 'day')
                    ? 'bg-primary-500 text-white font-medium'
                    : day.isSame(selectedDate, 'day')
                    ? 'bg-primary-100 text-primary-600 font-medium'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedDate(day)}
              >
                {day.date()}
              </div>
            </div>
          ))}
        </div>
        {/* Tasks for selected date */}
        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-gray-500 mb-2">
            {selectedDate.format('dddd, MMMM D')}
          </p>
          <div className="space-y-1">
            {getTasksForDate(selectedDate).slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="text-xs p-1.5 rounded bg-gray-100 truncate"
              >
                {task.title}
              </div>
            ))}
            {getTasksForDate(selectedDate).length === 0 && (
              <p className="text-xs text-gray-400">No tasks</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Month view
  const renderMonthView = () => {
    const monthStart = currentDate.startOf('month');
    const monthEnd = currentDate.endOf('month');
    const startDate = monthStart.startOf('week');
    const endDate = monthEnd.endOf('week');

    const today = dayjs();
    const weeks: dayjs.Dayjs[][] = [];
    let currentWeek: dayjs.Dayjs[] = [];
    let day = startDate;

    while (day.isBefore(endDate) || day.isSame(endDate)) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      day = day.add(1, 'day');
    }

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                const isCurrentMonth = day.month() === currentDate.month();
                const isToday = day.isSame(today, 'day');
                const isSelected = day.isSame(selectedDate, 'day');
                const dayTasks = getTasksForDate(day);

                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => {
                      setSelectedDate(day);
                      setViewMode('day');
                    }}
                    className={`h-8 w-8 rounded-full flex flex-col items-center justify-center text-xs transition-all ${
                      !isCurrentMonth ? 'text-gray-300' : ''
                    } ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : isToday
                        ? 'bg-primary-100 text-primary-600 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{day.date()}</span>
                    {isCurrentMonth && dayTasks.length > 0 && (
                      <span className="w-1 h-1 rounded-full bg-primary-400 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day view
  const renderDayView = () => {
    const dayTasks = getTasksForDate(selectedDate);

    return (
      <div>
        <p className="text-sm text-gray-600 mb-3">{selectedDate.format('dddd, MMMM D')}</p>
        <div className="space-y-2 max-h-48 overflow-auto">
          {dayTasks.length > 0 ? (
            dayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      categories.find((c) => c.id === task.categoryId)?.color || '#6B7280',
                  }}
                />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {task.title}
                </span>
                <span className="text-xs text-gray-400">
                  {dayjs(task.startTime).format('h:mm A')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No tasks for this day</p>
          )}
        </div>
      </div>
    );
  };

  const handlePrev = () => {
    setCurrentDate((prev) =>
      prev.subtract(1, viewMode === 'week' ? 'week' : viewMode === 'day' ? 'day' : 'month')
    );
  };

  const handleNext = () => {
    setCurrentDate((prev) =>
      prev.add(1, viewMode === 'week' ? 'week' : viewMode === 'day' ? 'day' : 'month')
    );
  };

  const handleToday = () => {
    const today = dayjs();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {/* View mode tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                viewMode === mode
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handlePrev}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-600">
          {viewMode === 'month'
            ? currentDate.format('MMMM YYYY')
            : viewMode === 'week'
            ? `${currentDate.startOf('week').format('MMM D')} - ${currentDate.endOf('week').format('MMM D')}`
            : currentDate.format('MMMM D, YYYY')}
        </span>
        <button
          onClick={handleNext}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar content */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleToday}
          className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onAddTask?.()}
          className="flex-1 px-3 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          Add Event
        </button>
      </div>
    </div>
  );
};
