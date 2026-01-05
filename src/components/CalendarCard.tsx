import React, { useState } from 'react';
import dayjs from 'dayjs';

interface CalendarCardProps {
  title: string;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({ title }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs().date());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());

  const monthName = dayjs().month(currentMonth).format('MMMM YYYY');
  const today = dayjs();

  const daysInMonth = dayjs().month(currentMonth).daysInMonth();
  const firstDayOfMonth = dayjs().month(currentMonth).startOf('month').day();

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(m => m - 1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-gray-600">{monthName}</span>
        <button
          onClick={() => setCurrentMonth(m => m + 1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before first of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          {/* Date cells */}
          {dates.map((date) => {
            const isToday = date === today.date() && currentMonth === today.month();
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white font-medium'
                    : isToday
                    ? 'bg-primary-100 text-primary-600 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {date}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button className="flex-1 px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Today
        </button>
        <button className="flex-1 px-3 py-2 text-sm text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors">
          Add Event
        </button>
      </div>
    </div>
  );
};
