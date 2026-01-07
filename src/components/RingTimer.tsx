import React, { useMemo } from 'react';
import { useStore } from '../store';
import dayjs from 'dayjs';

interface RingTimerProps {
  title: string;
  timeText?: string;
  progress?: number;
}

export const RingTimer: React.FC<RingTimerProps> = ({ title }) => {
  const { tasks, focusSessions } = useStore();

  // Calculate real stats
  const stats = useMemo(() => {
    const today = dayjs();
    const todayStart = today.startOf('day').valueOf();
    const todayEnd = today.endOf('day').valueOf();

    // Today's tasks
    const todayTasks = tasks.filter(t => {
      const taskDate = dayjs(t.startTime).valueOf();
      return taskDate >= todayStart && taskDate <= todayEnd;
    });

    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Today's focus time
    const todayFocusMinutes = focusSessions
      .filter(s => s.completedAt >= todayStart && s.completedAt <= todayEnd)
      .reduce((acc, s) => acc + Math.round(s.duration / 60), 0);

    // Today's focus sessions count
    const todayFocusSessions = focusSessions.filter(s =>
      s.completedAt >= todayStart && s.completedAt <= todayEnd
    ).length;

    // Focus goal (e.g., 2 hours = 120 minutes per day)
    const focusGoal = 120;
    const focusProgress = Math.min(Math.round((todayFocusMinutes / focusGoal) * 100), 100);

    return {
      completionRate,
      totalTasks,
      completedTasks,
      pendingTasks,
      todayFocusMinutes,
      todayFocusSessions,
      focusProgress,
    };
  }, [tasks, focusSessions]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.completionRate / 100) * circumference;

  const colors = ['#10B981', '#14B8A6', '#EAB308', '#F97316', '#EF4444', '#8B5CF6'];

  // Format focus time
  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      {/* Ring progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40">
          {/* Background rings */}
          <svg className="w-full h-full transform -rotate-90">
            {colors.map((color, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius - i * 8}
                fill="none"
                stroke={color}
                strokeWidth="8"
                opacity="0.15"
              />
            ))}
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="20%" stopColor="#14B8A6" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="60%" stopColor="#F97316" />
                <stop offset="80%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{stats.completionRate}%</span>
            <span className="text-xs text-gray-500">完成率</span>
          </div>
        </div>
      </div>

      {/* Real stats labels */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">已完成</p>
          <p className="text-sm font-semibold text-green-600">{stats.completedTasks}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">待完成</p>
          <p className="text-sm font-semibold text-amber-600">{stats.pendingTasks}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">专注时长</p>
          <p className="text-sm font-semibold text-primary-600">{formatFocusTime(stats.todayFocusMinutes)}</p>
        </div>
      </div>
    </div>
  );
};
