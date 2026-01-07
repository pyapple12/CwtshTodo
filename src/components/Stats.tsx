import React, { useMemo } from 'react';
import { useStore } from '../store';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

export const Stats: React.FC = () => {
  const { tasks, focusSessions, categories } = useStore();

  // Week statistics
  const weekStats = useMemo(() => {
    const today = dayjs();
    const weekStart = today.startOf('week');
    const weekEnd = today.endOf('week');

    const weekTasks = tasks.filter((task) => {
      const taskDate = dayjs(task.startTime);
      return taskDate.isAfter(weekStart) && taskDate.isBefore(weekEnd);
    });

    const completed = weekTasks.filter((t) => t.isCompleted).length;
    const total = weekTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, completionRate };
  }, [tasks]);

  // Month statistics
  const monthStats = useMemo(() => {
    const today = dayjs();
    const monthStart = today.startOf('month');
    const monthEnd = today.endOf('month');

    const monthTasks = tasks.filter((task) => {
      const taskDate = dayjs(task.startTime);
      return taskDate.isAfter(monthStart) && taskDate.isBefore(monthEnd);
    });

    const completed = monthTasks.filter((t) => t.isCompleted).length;
    const total = monthTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Daily completion for the last 7 days
    const dailyCompletions: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const dayStart = date.startOf('day').valueOf();
      const dayEnd = date.endOf('day').valueOf();

      const dayCompleted = tasks.filter(
        (t) =>
          t.isCompleted &&
          dayjs(t.updatedAt).valueOf() >= dayStart &&
          dayjs(t.updatedAt).valueOf() <= dayEnd
      ).length;

      dailyCompletions.push({
        date: date.format('ddd'),
        count: dayCompleted,
      });
    }

    return { completed, total, completionRate, dailyCompletions };
  }, [tasks]);

  // Focus time statistics
  const focusStats = useMemo(() => {
    const today = dayjs();
    const weekStart = today.startOf('week');

    // Weekly focus time by day
    const dailyFocus: { day: string; minutes: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, 'day');
      const dayStart = date.startOf('day').valueOf();
      const dayEnd = date.endOf('day').valueOf();

      // All focus sessions are considered completed when saved
      const dayMinutes = focusSessions
        .filter((s) => s.completedAt >= dayStart && s.completedAt <= dayEnd)
        .reduce((acc, s) => acc + Math.round(s.duration / 60), 0);

      dailyFocus.push({
        day: date.format('ddd'),
        minutes: dayMinutes,
      });
    }

    const totalMinutes = dailyFocus.reduce((acc, d) => acc + d.minutes, 0);
    const averageMinutes = Math.round(totalMinutes / 7);

    return { dailyFocus, totalMinutes, averageMinutes };
  }, [focusSessions]);

  // Category distribution
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id);
      const completed = catTasks.filter((t) => t.isCompleted).length;
      return {
        ...cat,
        total: catTasks.length,
        completed,
        rate: catTasks.length > 0 ? Math.round((completed / catTasks.length) * 100) : 0,
      };
    });
  }, [tasks, categories]);

  // Overall stats
  const overallStats = useMemo(() => {
    const completed = tasks.filter((t) => t.isCompleted).length;
    const overdue = tasks.filter(
      (t) => !t.isCompleted && dayjs(t.startTime).isBefore(dayjs(), 'day')
    ).length;
    const pending = tasks.filter(
      (t) => !t.isCompleted && dayjs(t.startTime).isAfter(dayjs(), 'day')
    ).length;

    return { completed, overdue, pending, total: tasks.length };
  }, [tasks]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">数据统计</h1>
        <p className="text-gray-500">了解你的任务完成情况</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">总任务</p>
          <p className="text-2xl font-semibold text-gray-800">{overallStats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">已完成</p>
          <p className="text-2xl font-semibold text-green-600">{overallStats.completed}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">待完成</p>
          <p className="text-2xl font-semibold text-blue-600">{overallStats.pending}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <p className="text-sm text-gray-500 mb-1">已过期</p>
          <p className="text-2xl font-semibold text-red-600">{overallStats.overdue}</p>
        </motion.div>
      </div>

      {/* Week & Month Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Week Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本周完成率</h3>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeDasharray={`${weekStats.completionRate * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{weekStats.completionRate}%</span>
                <span className="text-xs text-gray-500">完成率</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-xl font-semibold text-gray-800">{weekStats.completed}</p>
              <p className="text-xs text-gray-500">已完成</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-400">{weekStats.total - weekStats.completed}</p>
              <p className="text-xs text-gray-500">未完成</p>
            </div>
          </div>
        </motion.div>

        {/* Month Completion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本月完成情况</h3>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="12"
                  strokeDasharray={`${monthStats.completionRate * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-800">{monthStats.completionRate}%</span>
                <span className="text-xs text-gray-500">完成率</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-xl font-semibold text-gray-800">{monthStats.completed}</p>
              <p className="text-xs text-gray-500">已完成</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-400">{monthStats.total - monthStats.completed}</p>
              <p className="text-xs text-gray-500">待完成</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Daily Completions Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">近7天完成情况</h3>

        <div className="flex items-end justify-between gap-2 h-32">
          {monthStats.dailyCompletions.map((day, index) => {
            const maxCount = Math.max(...monthStats.dailyCompletions.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className={`w-full rounded-t-lg ${
                      day.count > 0 ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.date}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Focus Time Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">本周专注时间</h3>

        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-800">{Math.round(focusStats.totalMinutes / 60)}h</p>
            <p className="text-sm text-gray-500">总专注时长</p>
            <p className="text-lg text-primary-600 mt-2">
              平均每天 {focusStats.averageMinutes} 分钟
            </p>
          </div>
        </div>

        {/* Daily focus time chart */}
        <div className="flex items-end justify-between gap-2 h-24">
          {focusStats.dailyFocus.map((day, index) => {
            const maxMinutes = Math.max(...focusStats.dailyFocus.map((d) => d.minutes), 1);
            const height = (day.minutes / maxMinutes) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center justify-end h-16">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                    className={`w-full rounded-t-lg ${
                      day.minutes > 0 ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">分类完成情况</h3>

        <div className="space-y-4">
          {categoryStats
            .filter((cat) => cat.total > 0)
            .map((cat) => (
              <div key={cat.id} className="flex items-center gap-4">
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{cat.name}</span>
                    <span className="text-sm text-gray-500">
                      {cat.completed}/{cat.total} ({cat.rate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.rate}%` }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};
