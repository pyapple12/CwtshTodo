import React, { useState, useEffect } from 'react';
import { Task, RecurringRule, Reminder } from '../types';
import { useStore } from '../store';
import dayjs from 'dayjs';

interface TaskFormProps {
  taskToEdit?: Task | null;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ taskToEdit, onClose }) => {
  const { addTask, updateTask, categories, currentDate } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isAllDay, setIsAllDay] = useState(false);

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringEndDate, setRecurringEndDate] = useState('');

  // Reminder state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId || '');
      setStartTime(dayjs(taskToEdit.startTime).format('HH:mm'));
      setEndTime(dayjs(taskToEdit.endTime).format('HH:mm'));
      setIsAllDay(taskToEdit.isAllDay);
      setIsRecurring(taskToEdit.isRecurring);
      if (taskToEdit.recurringRule) {
        setRecurringFrequency(taskToEdit.recurringRule.frequency);
        setRecurringInterval(taskToEdit.recurringRule.interval || 1);
        setRecurringEndDate(taskToEdit.recurringRule.endDate || '');
      }
      if (taskToEdit.reminder) {
        setReminderEnabled(taskToEdit.reminder.enabled);
        setReminderMinutes(taskToEdit.reminder.beforeMinutes?.[0] || 10);
      }
    }
  }, [taskToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateStr = currentDate.format('YYYY-MM-DD');
    const now = Date.now();

    // Build recurring rule
    let recurringRule: RecurringRule | undefined;
    if (isRecurring) {
      recurringRule = {
        frequency: recurringFrequency,
        interval: recurringInterval,
        endDate: recurringEndDate || undefined,
      };
    }

    // Build reminder
    let reminder: Reminder | undefined;
    if (reminderEnabled) {
      reminder = {
        enabled: true,
        beforeMinutes: [reminderMinutes],
      };
    }

    const task: Task = {
      id: taskToEdit?.id || `task-${now}`,
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      startTime: isAllDay
        ? dayjs(`${dateStr} 00:00`).toISOString()
        : dayjs(`${dateStr} ${startTime}`).toISOString(),
      endTime: isAllDay
        ? dayjs(`${dateStr} 23:59`).toISOString()
        : dayjs(`${dateStr} ${endTime}`).toISOString(),
      isAllDay,
      isCompleted: false,
      isRecurring,
      recurringRule,
      reminder,
      createdAt: taskToEdit?.createdAt || now,
      updatedAt: now,
    };

    if (taskToEdit) {
      await updateTask(task);
    } else {
      await addTask(task);
    }

    onClose();
  };

  const handleDelete = async () => {
    if (taskToEdit && window.confirm('确定要删除这个任务吗？')) {
      await updateTask({ ...taskToEdit, isCompleted: true }); // Soft delete
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold">
            {taskToEdit ? '编辑任务' : '新建任务'}
          </h2>
          <div className="w-10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务名称"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isAllDay}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isAllDay}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* All day toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700">全天任务</span>
          </label>

          {/* Recurring Toggle */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔁</span>
                <span className="text-gray-700">重复任务</span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>

            {isRecurring && (
              <div className="mt-3 pl-8 space-y-3">
                {/* Frequency */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">重复频率</label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value as typeof recurringFrequency)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value="daily">每天</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="yearly">每年</option>
                  </select>
                </div>

                {/* Interval */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">重复间隔</label>
                  <select
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <option value={1}>每 {recurringFrequency === 'daily' ? '天' : recurringFrequency === 'weekly' ? '周' : recurringFrequency === 'monthly' ? '月' : '年'}</option>
                    <option value={2}>每 2 {recurringFrequency === 'daily' ? '天' : recurringFrequency === 'weekly' ? '周' : recurringFrequency === 'monthly' ? '月' : '年'}</option>
                    <option value={3}>每 3 {recurringFrequency === 'daily' ? '天' : recurringFrequency === 'weekly' ? '周' : recurringFrequency === 'monthly' ? '月' : '年'}</option>
                    <option value={4}>每 4 {recurringFrequency === 'daily' ? '天' : recurringFrequency === 'weekly' ? '周' : recurringFrequency === 'monthly' ? '月' : '年'}</option>
                  </select>
                </div>

                {/* End date */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">结束日期（可选）</label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reminder Toggle */}
          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <span className="text-gray-700">提醒</span>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>

            {reminderEnabled && (
              <div className="mt-3 pl-8">
                <label className="block text-sm text-gray-600 mb-1">提前提醒</label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value={5}>5 分钟</option>
                  <option value={10}>10 分钟</option>
                  <option value={15}>15 分钟</option>
                  <option value={30}>30 分钟</option>
                  <option value={60}>1 小时</option>
                  <option value={1440}>1 天</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="添加备注（可选）"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {taskToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                删除
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {taskToEdit ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
