import React from 'react';
import { useStore } from '../store';

export const Navigation: React.FC = () => {
  const { categories } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Back Button */}
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center: Today */}
        <span className="text-lg font-semibold text-gray-800">Today</span>

        {/* Right: Category Icons */}
        <div className="flex items-center gap-1">
          {categories.slice(0, 4).map((cat) => (
            <div
              key={cat.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: cat.color }}
              title={cat.name}
            >
              <span className="filter brightness-0 invert">{cat.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
