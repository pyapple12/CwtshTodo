import React from 'react';
import { useStore } from '../store';

interface CategoryListProps {
  title: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ title }) => {
  const { categories } = useStore();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <ul className="space-y-3">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </div>
              <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900">
                {cat.name}
              </span>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
