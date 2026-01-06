import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Habit } from '../types';
import dayjs from 'dayjs';

export const Habits: React.FC = () => {
  const {
    habits,
    addHabit,
    updateHabit,
    removeHabit,
    toggleHabitLog,
    getHabitLogsForWeek,
    getHabitStats,
  } = useStore();

  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('✨');
  const [newHabitColor] = useState('#6366f1');
  const [targetDays, setTargetDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const weekStart = dayjs().startOf('week');
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const iconOptions = ['✨', '📚', '🏃', '💪', '🧘', '🎯', '💧', '🌅', '🎨', '🎵', '✍️', '🏃'];

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      icon: newHabitIcon,
      color: newHabitColor,
      targetDays,
      createdAt: Date.now(),
    };

    await addHabit(newHabit);
    setNewHabitName('');
    setNewHabitIcon('✨');
    setTargetDays([1, 2, 3, 4, 5]);
    setIsAddingHabit(false);
  };

  const handleToggleDay = (day: number) => {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter(d => d !== day));
    } else {
      setTargetDays([...targetDays, day]);
    }
  };

  const handleEditHabit = async () => {
    if (!editingHabit) return;
    await updateHabit(editingHabit);
    setEditingHabit(null);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (window.confirm('确定要删除这个习惯吗？相关的打卡记录也会被删除。')) {
      await removeHabit(habitId);
    }
  };

  // Unused handlers - can be used for edit modal in the future
  void handleEditHabit;

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">习惯追踪</h1>
            <p className="text-gray-500">培养好习惯 · 持续成长</p>
          </div>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加习惯
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Add New Habit Form */}
        <AnimatePresence>
          {isAddingHabit && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">添加新习惯</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">习惯名称</label>
                    <input
                      type="text"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="例如：早起、阅读、运动"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">选择图标</label>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewHabitIcon(icon)}
                          className={`w-10 h-10 rounded-lg text-xl transition-colors ${
                            newHabitIcon === icon
                              ? 'bg-primary-100 ring-2 ring-primary-500'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择目标日期</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <button
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`w-12 h-12 rounded-xl font-medium transition-colors ${
                          targetDays.includes(day)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {['日', '一', '二', '三', '四', '五', '六'][day]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddingHabit(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAddHabit}
                    disabled={!newHabitName.trim()}
                    className="flex-1 px-4 py-2 text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    添加
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habits List */}
        <div className="space-y-4">
          {habits.map((habit) => {
            const stats = getHabitStats(habit.id);
            const weekLogs = getHabitLogsForWeek(habit.id, weekStart);

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{habit.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>连续 {stats.streak} 天</span>
                        <span>·</span>
                        <span>完成率 {stats.completionRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Week Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    {weekDays.map((label, i) => {
                      const date = weekStart.add(i, 'day').format('YYYY-MM-DD');
                      const log = weekLogs.find((l) => l.date === date);
                      const isToday = dayjs().format('YYYY-MM-DD') === date;
                      const shouldDo = habit.targetDays.includes(i);

                      return (
                        <div key={i} className="flex flex-col items-center">
                          <span className="text-xs text-gray-500 mb-1">{label}</span>
                          <button
                            onClick={() => shouldDo && toggleHabitLog(habit.id, date)}
                            disabled={!shouldDo}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              log?.completed
                                ? 'bg-green-500 text-white'
                                : shouldDo
                                ? isToday
                                  ? 'bg-primary-100 ring-2 ring-primary-300'
                                  : 'bg-gray-100 hover:bg-gray-200'
                                : 'bg-gray-50 text-gray-300'
                            }`}
                          >
                            {log?.completed ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : shouldDo ? (
                              <span className="text-lg">{habit.icon}</span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-800">{stats.totalCompleted}</p>
                      <p className="text-xs text-gray-500">总完成次数</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-500">{stats.streak}</p>
                      <p className="text-xs text-gray-500">连续天数</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stats.completionRate}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{stats.completionRate}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {habits.length === 0 && !isAddingHabit && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <p className="text-gray-500 font-medium">还没有习惯</p>
              <p className="text-sm text-gray-400 mt-1">点击右上角按钮添加你的第一个习惯</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
