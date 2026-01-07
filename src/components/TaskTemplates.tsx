import React, { useState } from 'react';
import { useStore } from '../store';
import { TaskTemplate } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskTemplatesProps {
  onClose: () => void;
}

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({ onClose }) => {
  const { taskTemplates, categories, addTaskTemplate, updateTaskTemplate, removeTaskTemplate, createTaskFromTemplate, currentDate } = useStore();
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<Partial<TaskTemplate>>({
    name: '',
    description: '',
    icon: '📝',
    defaultDuration: 60,
    isAllDay: false,
    reminderEnabled: true,
    reminderBeforeMinutes: [10],
  });

  const handleSave = async () => {
    if (!formData.name) return;

    const template: TaskTemplate = {
      id: editingTemplate?.id || `template-${Date.now()}`,
      name: formData.name!,
      description: formData.description,
      categoryId: formData.categoryId,
      defaultDuration: formData.defaultDuration || 60,
      isAllDay: formData.isAllDay || false,
      reminderEnabled: formData.reminderEnabled || false,
      reminderBeforeMinutes: formData.reminderBeforeMinutes || [10],
      icon: formData.icon || '📝',
      createdAt: editingTemplate?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (editingTemplate) {
      await updateTaskTemplate(template);
    } else {
      await addTaskTemplate(template);
    }

    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      icon: '📝',
      defaultDuration: 60,
      isAllDay: false,
      reminderEnabled: true,
      reminderBeforeMinutes: [10],
    });
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      categoryId: template.categoryId,
      icon: template.icon,
      defaultDuration: template.defaultDuration,
      isAllDay: template.isAllDay,
      reminderEnabled: template.reminderEnabled,
      reminderBeforeMinutes: template.reminderBeforeMinutes,
    });
    setShowForm(true);
  };

  const handleUseTemplate = async (template: TaskTemplate) => {
    await createTaskFromTemplate(template.id, currentDate);
    onClose();
  };

  const iconOptions = ['📝', '📋', '📊', '💼', '📚', '🏃', '💪', '🎯', '🎨', '🎵', '🍽️', '🛏️', '🚗', '✈️', '💻', '📱'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">任务模板</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="输入模板名称"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">图标</label>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                            formData.icon === icon
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      rows={2}
                      placeholder="输入模板描述（可选）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">关联分类</label>
                    <select
                      value={formData.categoryId || ''}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value || undefined })}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">默认时长（分钟）</label>
                    <select
                      value={formData.defaultDuration}
                      onChange={(e) => setFormData({ ...formData, defaultDuration: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value={15}>15 分钟</option>
                      <option value={30}>30 分钟</option>
                      <option value={45}>45 分钟</option>
                      <option value={60}>1 小时</option>
                      <option value={90}>1.5 小时</option>
                      <option value={120}>2 小时</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        checked={formData.isAllDay}
                        onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">全天任务</span>
                    </label>
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        checked={formData.reminderEnabled}
                        onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                        className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">启用提醒</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingTemplate(null);
                    }}
                    className="flex-1 py-2 px-4 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 px-4 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    保存模板
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Template List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {taskTemplates.map((template) => {
                    const category = categories.find((c) => c.id === template.categoryId);
                    return (
                      <div
                        key={template.id}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{template.icon}</span>
                            <div>
                              <h3 className="font-medium text-gray-800">{template.name}</h3>
                              {template.description && (
                                <p className="text-sm text-gray-500">{template.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(template)}
                              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeTaskTemplate(template.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>{template.defaultDuration} 分钟</span>
                          {template.isAllDay && <span>全天</span>}
                          {template.reminderEnabled && <span>🔔 有提醒</span>}
                          {category && <span>{category.icon} {category.name}</span>}
                        </div>

                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          使用此模板创建任务
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加新模板
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
