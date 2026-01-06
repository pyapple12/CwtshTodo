import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { Task } from '../types';
import dayjs from 'dayjs';

export const ScheduleView: React.FC = () => {
  const { tasks, currentDate, setCurrentDate, categories, selectedCategoryId, setSelectedCategory } = useStore();

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedCategoryId && task.categoryId !== selectedCategoryId) return false;
    return true;
  });

  // Get tasks for current day
  const dayTasks = useMemo(() => {
    const start = currentDate.startOf('day').toISOString();
    const end = currentDate.endOf('day').toISOString();
    return filteredTasks
      .filter(t => t.startTime >= start && t.startTime <= end && !t.isCompleted)
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
  }, [filteredTasks, currentDate]);

  // Generate time slots (6:00 - 22:00)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return { hour, label: `${hour}:00` };
  });

  // Get task position for a given time
  const getTaskStyle = (task: Task) => {
    const startHour = dayjs(task.startTime).hour();
    const startMinute = dayjs(task.startTime).minute();
    const startOffset = ((startHour - 6) * 60 + startMinute) / (17 * 60) * 100;

    const duration = dayjs(task.endTime).diff(dayjs(task.startTime), 'minute');
    const height = (duration / (17 * 60)) * 100;

    return {
      top: `${startOffset}%`,
      height: `${Math.max(height, 4)}%`,
    };
  };

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
            <p className="text-gray-500">{currentDate.format('YYYY年M月D日 dddd')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(currentDate.subtract(1, 'day'))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-4 py-2 text-sm font-medium text-primary-500 hover:bg-primary-50 rounded-lg"
            >
              今天
            </button>
            <button
              onClick={() => setCurrentDate(currentDate.add(1, 'day'))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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

      {/* Schedule Timeline */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Timeline Header */}
          <div className="grid grid-cols-[80px_1fr] border-b border-gray-100">
            <div className="p-4 text-center text-sm text-gray-400 font-medium">时间</div>
            <div className="p-4 text-center text-sm text-gray-400 font-medium">任务安排</div>
          </div>

          {/* Timeline Body */}
          <div className="relative">
            {/* Time Labels */}
            <div className="grid grid-cols-[80px_1fr]">
              <div className="border-r border-gray-100">
                {timeSlots.map(slot => (
                  <div
                    key={slot.hour}
                    className="h-16 flex items-start justify-center text-xs text-gray-400 py-1"
                  >
                    {slot.label}
                  </div>
                ))}
              </div>

              {/* Task Track */}
              <div className="relative h-[272px] border-l border-gray-100">
                {/* Grid lines */}
                {timeSlots.map(slot => (
                  <div
                    key={slot.hour}
                    className="h-16 border-b border-gray-50"
                  />
                ))}

                {/* Tasks */}
                {dayTasks.map(task => {
                  const cat = getCategory(task.categoryId);
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute left-2 right-2 rounded-lg p-2 cursor-pointer hover:ring-2 ring-primary-400"
                      style={{
                        ...getTaskStyle(task),
                        backgroundColor: cat?.color || '#6B7280',
                      }}
                    >
                      <div className="text-white text-sm font-medium truncate">
                        {cat?.icon} {task.title}
                      </div>
                      <div className="text-white/80 text-xs truncate">
                        {dayjs(task.startTime).format('HH:mm')} - {dayjs(task.endTime).format('HH:mm')}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Task Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">今日任务</p>
            <p className="text-2xl font-bold text-gray-800">{dayTasks.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">已完成</p>
            <p className="text-2xl font-bold text-green-500">
              {tasks.filter(t =>
                dayjs(t.startTime).isSame(currentDate, 'day') && t.isCompleted
              ).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">待完成</p>
            <p className="text-2xl font-bold text-primary-500">{dayTasks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
