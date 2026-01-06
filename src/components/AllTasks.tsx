import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import dayjs from 'dayjs';

type FilterStatus = 'all' | 'pending' | 'completed' | 'overdue';

export const AllTasks: React.FC = () => {
  const { tasks, categories, toggleTaskComplete, removeTask, selectedCategoryId, setSelectedCategory } = useStore();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Category filter
      if (selectedCategoryId && task.categoryId !== selectedCategoryId) {
        return false;
      }

      // Status filter
      const isOverdue = !task.isCompleted && dayjs(task.startTime).isBefore(dayjs(), 'day');

      switch (filterStatus) {
        case 'pending':
          return !task.isCompleted && !isOverdue;
        case 'completed':
          return task.isCompleted;
        case 'overdue':
          return isOverdue;
        default:
          return true;
      }
    });
  }, [tasks, filterStatus, selectedCategoryId]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    if (sortBy === 'date') {
      sorted.sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());
    } else {
      sorted.sort((a, b) => {
        const catA = a.categoryId || '';
        const catB = b.categoryId || '';
        return catA.localeCompare(catB);
      });
    }
    return sorted;
  }, [filteredTasks, sortBy]);

  const getCategory = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const toggleSelectTask = (taskId: string) => {
    const newSet = new Set(selectedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTasks(newSet);
  };

  const selectAll = () => {
    if (selectedTasks.size === sortedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(sortedTasks.map(t => t.id)));
    }
  };

  const bulkComplete = async () => {
    for (const taskId of selectedTasks) {
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.isCompleted) {
        await toggleTaskComplete(taskId);
      }
    }
    setSelectedTasks(new Set());
  };

  const bulkDelete = async () => {
    if (window.confirm(`确定要删除选中的 ${selectedTasks.size} 个任务吗？`)) {
      for (const taskId of selectedTasks) {
        await removeTask(taskId);
      }
      setSelectedTasks(new Set());
    }
  };

  const pendingCount = tasks.filter(t => !t.isCompleted && dayjs(t.startTime).isAfter(dayjs(), 'day')).length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const overdueCount = tasks.filter(t => !t.isCompleted && dayjs(t.startTime).isBefore(dayjs(), 'day')).length;

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
            <p className="text-gray-500">{tasks.length} 个任务</p>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="date">按时间排序</option>
              <option value="category">按分类排序</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {([
            { value: 'all', label: '全部', count: tasks.length },
            { value: 'pending', label: '待完成', count: pendingCount },
            { value: 'overdue', label: '已过期', count: overdueCount },
            { value: 'completed', label: '已完成', count: completedCount },
          ] as const).map(filter => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filterStatus === filter.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedCategoryId === null
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部分类
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

      {/* Task List */}
      <div className="p-6">
        {/* Bulk Actions */}
        {selectedTasks.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-primary-50 rounded-xl flex items-center justify-between"
          >
            <span className="text-primary-700 font-medium">
              已选择 {selectedTasks.size} 个任务
            </span>
            <div className="flex gap-2">
              <button
                onClick={bulkComplete}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
              >
                批量完成
              </button>
              <button
                onClick={bulkDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                批量删除
              </button>
            </div>
          </motion.div>
        )}

        {sortedTasks.length > 0 ? (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedTasks.size === sortedTasks.length && sortedTasks.length > 0}
                onChange={selectAll}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">全选</span>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {sortedTasks.map((task) => {
                  const cat = getCategory(task.categoryId);
                  const isOverdue = !task.isCompleted && dayjs(task.startTime).isBefore(dayjs(), 'day');

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`bg-white rounded-xl p-4 shadow-sm border transition-colors ${
                        task.isCompleted
                          ? 'border-gray-100 opacity-60'
                          : isOverdue
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-100 hover:border-primary-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedTasks.has(task.id)}
                          onChange={() => toggleSelectTask(task.id)}
                          className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500 flex-shrink-0"
                        />

                        {/* Category Color */}
                        <div
                          className="w-1 h-12 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat?.color || '#6B7280' }}
                        />

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${
                            task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}>
                            {cat?.icon} {task.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {dayjs(task.startTime).format('M月D日 HH:mm')} -
                            {dayjs(task.endTime).format('HH:mm')}
                            {isOverdue && <span className="text-red-500 ml-2">已过期</span>}
                          </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              task.isCompleted
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-100 text-gray-400 hover:text-green-500'
                            }`}
                            title={task.isCompleted ? '恢复' : '完成'}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeTask(task.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">暂无任务</p>
            <p className="text-sm text-gray-400 mt-1">调整筛选条件或添加新任务</p>
          </div>
        )}
      </div>
    </div>
  );
};
