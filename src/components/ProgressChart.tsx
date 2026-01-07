import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import dayjs from 'dayjs';

interface ProgressChartProps {
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ title }) => {
  const [hovered, setHovered] = useState(false);
  const { tasks, focusSessions } = useStore();

  // Calculate real stats
  const stats = useMemo(() => {
    const today = dayjs();
    const weekStart = today.startOf('week');
    const weekEnd = today.endOf('week');

    // Week tasks
    const weekTasks = tasks.filter(task => {
      const taskDate = dayjs(task.startTime);
      return taskDate.isAfter(weekStart) && taskDate.isBefore(weekEnd);
    });

    const completed = weekTasks.filter(t => t.isCompleted).length;
    const total = weekTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Week focus time
    const weekFocusMinutes = focusSessions
      .filter(s => s.completedAt >= weekStart.valueOf() && s.completedAt <= weekEnd.valueOf())
      .reduce((acc, s) => acc + Math.round(s.duration / 60), 0);

    // Focus goal (e.g., 5 hours = 300 minutes per week)
    const focusGoal = 300;
    const focusRate = Math.min(Math.round((weekFocusMinutes / focusGoal) * 100), 100);

    return {
      completionRate,
      weekFocusMinutes,
      focusRate,
      totalTasks: total,
      completedTasks: completed,
    };
  }, [tasks, focusSessions]);

  // Segments based on real data
  const segments = [
    { color: '#10B981', width: stats.focusRate }, // green - focus progress
    { color: '#14B8A6', width: 100 - stats.focusRate }, // teal - remaining
  ];

  // Calculate marker position
  const completionMarker = Math.min(stats.completionRate, 100);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-500">
          {stats.completedTasks}/{stats.totalTasks} 任务
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-gray-50 rounded-lg" style={{
          backgroundImage: `
            linear-gradient(to right, #E5E7EB 1px, transparent 1px),
            linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Progress bar */}
        <div className="relative h-12 rounded-lg overflow-hidden flex">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="h-full flex items-center justify-center transition-all duration-500"
              style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
            />
          ))}
        </div>

        {/* Data markers */}
        {completionMarker > 0 && (
          <div
            className="absolute top-0 transform -translate-x-1/2"
            style={{ left: `${completionMarker}%` }}
          >
            <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-md" />
          </div>
        )}

        {/* Hover tooltip */}
        {hovered && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg whitespace-nowrap z-10">
            完成率: {stats.completionRate}% | 专注: {stats.weekFocusMinutes}分钟
          </div>
        )}
      </div>

      {/* Stats below */}
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">任务完成率: {stats.completionRate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-gray-600">本周专注: {stats.weekFocusMinutes}分钟</span>
        </div>
      </div>
    </div>
  );
};
