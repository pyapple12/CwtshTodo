import React from 'react';
import { useStore } from '../store';

interface CategoryListProps {
  title: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ title }) => {
  const { categories, selectedCategoryId, setSelectedCategory, openCategoryManage } = useStore();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={openCategoryManage}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          title="管理分类"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <ul className="space-y-3">
        <li>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors group ${
              selectedCategoryId === null ? 'bg-primary-50' : 'hover:bg-gray-50'
            }`}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm bg-gray-400"
            >
              📋
            </div>
            <span className={`flex-1 text-left ${
              selectedCategoryId === null ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              全部
            </span>
            {selectedCategoryId === null && (
              <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => setSelectedCategory(cat.id === selectedCategoryId ? null : cat.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                selectedCategoryId === cat.id ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </div>
              <span className={`flex-1 text-left ${
                selectedCategoryId === cat.id ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {cat.name}
              </span>
              {selectedCategoryId === cat.id && (
                <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
