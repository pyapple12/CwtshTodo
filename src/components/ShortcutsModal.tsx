import React from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, closeShortcutsModal, settings } = useStore();

  const shortcuts = [
    { key: 'n / a', description: '新建任务', action: '打开新建任务表单' },
    { key: 's', description: '打开设置', action: '打开设置页面' },
    { key: '/', description: '数据管理', action: '打开数据管理页面' },
    { key: 'ESC', description: '关闭弹窗', action: '关闭当前打开的弹窗' },
    { key: '← / →', description: '日期导航', action: '前一天/后一天' },
    { key: '↑ / ↓', description: '视图切换', action: '日/周/月视图切换' },
  ];

  return (
    <AnimatePresence>
      {isShortcutsModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeShortcutsModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">键盘快捷键</h2>
              <button
                onClick={closeShortcutsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Toggle */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⌨️</span>
                  <span className="text-gray-700">启用键盘快捷键</span>
                </div>
                <button
                  onClick={() => useStore.getState().updateSettings({ shortcutsEnabled: !settings.shortcutsEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.shortcutsEnabled ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.shortcutsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <kbd className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-700 min-w-[80px] text-center">
                        {shortcut.key}
                      </kbd>
                      <span className="text-gray-600">{shortcut.description}</span>
                    </div>
                    <span className="text-sm text-gray-400">{shortcut.action}</span>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-700">
                  💡 提示：在输入框中快捷键将被禁用，以免影响输入。
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 text-center">
              <button
                onClick={closeShortcutsModal}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                知道了
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
