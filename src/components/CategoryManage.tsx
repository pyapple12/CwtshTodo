import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '../types';
import { useStore } from '../store';

interface CategoryManageProps {
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];

const ICON_OPTIONS = [
  '💼', '📚', '🏠', '🏃', '🎯', '💡', '🎨',
  '🎵', '🍽️', '🛒', '💊', '🚗', '✈️', '💻',
  '📱', '🎮', '🏋️', '🧘', '📝', '💰', '🎁',
];

export const CategoryManage: React.FC<CategoryManageProps> = ({ onClose }) => {
  const { categories, addCategory, updateCategory, removeCategory } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(COLOR_OPTIONS[0]);
  const [formIcon, setFormIcon] = useState(ICON_OPTIONS[0]);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormColor(COLOR_OPTIONS[0]);
    setFormIcon(ICON_OPTIONS[0]);
    setShowForm(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormColor(cat.color);
    setFormIcon(cat.icon);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingId) {
      await updateCategory({
        ...categories.find(c => c.id === editingId)!,
        name: formName.trim(),
        color: formColor,
        icon: formIcon,
      });
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName.trim(),
        color: formColor,
        icon: formIcon,
        createdAt: Date.now(),
      };
      await addCategory(newCat);
    }

    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此分类吗？关联的任务将保留但不再显示分类颜色。')) {
      await removeCategory(id);
    }
  };

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
          <h2 className="text-xl font-semibold text-gray-800">分类管理</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Form */}
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4 overflow-hidden"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="分类名称"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormColor(color)}
                        className={`w-8 h-8 rounded-full transition-transform ${
                          formColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormIcon(icon)}
                        className={`w-10 h-10 text-xl rounded-lg transition-colors ${
                          formIcon === icon ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600"
                  >
                    {editingId ? '保存' : '添加'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Category List */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.icon}
                </div>
                <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-gray-200 rounded-lg"
                    title="编辑"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-100 rounded-lg"
                    title="删除"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          {!showForm && (
            <button
              onClick={handleAdd}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加分类
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
