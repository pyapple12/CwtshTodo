import React, { useState } from 'react';
import { useStore, ThemeMode } from '../store';
import { ViewMode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, setTheme, updateSettings, clearAllData, tasks, categories, openShortcutsModal } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: '浅色', icon: '☀️' },
    { value: 'dark', label: '深色', icon: '🌙' },
    { value: 'system', label: '跟随系统', icon: '💻' },
  ];

  const languageOptions: { value: 'zh' | 'en'; label: string }[] = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ];

  const viewOptions: { value: ViewMode; label: string }[] = [
    { value: 'day', label: '日视图' },
    { value: 'week', label: '周视图' },
    { value: 'month', label: '月视图' },
  ];

  const startOfWeekOptions: { value: number; label: string }[] = [
    { value: 0, label: '周日' },
    { value: 1, label: '周一' },
  ];

  const backupFrequencyOptions: { value: 'daily' | 'weekly'; label: string }[] = [
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
  ];

  const handleClearData = async () => {
    await clearAllData();
    setShowClearConfirm(false);
  };

  const taskCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">设置</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">主题</label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    settings.theme === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{option.icon}</span>
                  <span className={`text-sm ${
                    settings.theme === option.value ? 'text-primary-600 font-medium' : 'text-gray-600'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">语言</label>
            <div className="flex gap-3">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ language: option.value })}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    settings.language === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">默认视图</label>
            <select
              value={settings.defaultView}
              onChange={(e) => updateSettings({ defaultView: e.target.value as ViewMode })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              {viewOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Start of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">每周起始日</label>
            <div className="flex gap-3">
              {startOfWeekOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ startOfWeek: option.value })}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                    settings.startOfWeek === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <span className="text-gray-700">启用提醒</span>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Notification Enhancements */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">通知增强</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⏰</span>
                  <span className="text-gray-700">任务中提醒</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reminderMidway}
                  onChange={(e) => updateSettings({ reminderMidway: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <span className="text-gray-700">即将过期提醒</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reminderBeforeEnd}
                  onChange={(e) => updateSettings({ reminderBeforeEnd: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <span className="text-gray-700">专注时段提醒</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reminderFocusSession}
                  onChange={(e) => updateSettings({ reminderFocusSession: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Sound Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">🔊</span>
                <span className="text-gray-700">启用提示音</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Compact Mode */}
          <div>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">📦</span>
                <span className="text-gray-700">紧凑模式</span>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => updateSettings({ compactMode: e.target.checked })}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-lg">⌨️</span>
                <div>
                  <span className="text-gray-700 block">启用快捷键</span>
                  <span className="text-xs text-gray-400">按 ? 查看快捷键</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.shortcutsEnabled}
                onChange={(e) => updateSettings({ shortcutsEnabled: e.target.checked })}
                className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
              />
            </label>
            <button
              onClick={openShortcutsModal}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              查看所有快捷键 →
            </button>
          </div>

          {/* Auto Backup */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">自动备份</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💾</span>
                  <span className="text-gray-700">启用自动备份</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoBackup.enabled}
                  onChange={(e) => updateSettings({
                    autoBackup: { ...settings.autoBackup, enabled: e.target.checked }
                  })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>

              {settings.autoBackup.enabled && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">备份频率</label>
                    <div className="flex gap-3">
                      {backupFrequencyOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateSettings({
                            autoBackup: { ...settings.autoBackup, frequency: option.value }
                          })}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                            settings.autoBackup.frequency === option.value
                              ? 'border-primary-500 bg-primary-50 text-primary-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">备份时间</label>
                    <input
                      type="time"
                      value={settings.autoBackup.time}
                      onChange={(e) => updateSettings({
                        autoBackup: { ...settings.autoBackup, time: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">保留备份数量</label>
                    <select
                      value={settings.autoBackup.maxBackups}
                      onChange={(e) => updateSettings({
                        autoBackup: { ...settings.autoBackup, maxBackups: Number(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value={3}>3 个</option>
                      <option value={5}>5 个</option>
                      <option value={7}>7 个</option>
                      <option value={14}>14 个</option>
                    </select>
                  </div>

                  {settings.autoBackup.lastBackupAt && (
                    <p className="text-sm text-gray-500">
                      上次备份: {new Date(settings.autoBackup.lastBackupAt).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Default Task Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">默认任务设置</h3>

            {/* Default Category */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">默认分类</label>
              <select
                value={settings.defaultCategoryId}
                onChange={(e) => updateSettings({ defaultCategoryId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">无</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Default Duration */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">默认任务时长</label>
              <select
                value={settings.defaultDuration}
                onChange={(e) => updateSettings({ defaultDuration: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value={30}>30 分钟</option>
                <option value={45}>45 分钟</option>
                <option value={60}>1 小时</option>
                <option value={90}>1.5 小时</option>
                <option value={120}>2 小时</option>
              </select>
            </div>

            {/* Default All-day */}
            <div className="mb-4">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <span className="text-gray-700">默认全天任务</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.defaultIsAllDay}
                  onChange={(e) => updateSettings({ defaultIsAllDay: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>

            {/* Default Reminder */}
            <div>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  <span className="text-gray-700">默认开启提醒</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.defaultReminder}
                  onChange={(e) => updateSettings({ defaultReminder: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Data Stats */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-600 mb-2">数据统计</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-semibold text-gray-800">{taskCount}</p>
                <p className="text-xs text-gray-500">总任务</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
                <p className="text-xs text-gray-500">已完成</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-red-500 mb-3">危险操作</h4>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清除所有数据
            </button>
          </div>

          {/* About */}
          <div className="text-center text-sm text-gray-400">
            <p>CwtshTodo v0.01 Tech Preview</p>
            <p className="mt-1">Designed for ADHD</p>
          </div>
        </div>
      </motion.div>

      {/* Clear Data Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">确认清除所有数据？</h3>
                <p className="text-gray-500 text-sm mb-6">此操作不可恢复，所有任务和分类将被删除。</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2 px-4 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex-1 py-2 px-4 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    确认清除
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
