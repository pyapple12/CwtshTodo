import React from 'react';
import { useStore } from '../store';
import { ViewMode } from '../types';

export const Header: React.FC = () => {
  const { currentDate, viewMode, setViewMode, openAddTask } = useStore();

  const formatDate = () => {
    return currentDate.format('dddd, MMMM D');
  };

  return (
    <header className="bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Hamburger Menu */}
        <button className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: Date */}
        <h1 className="text-lg font-semibold text-gray-800">
          {formatDate()}
        </h1>

        {/* Right: View Tabs + Search + Add */}
        <div className="flex items-center gap-2">
          {/* View Tabs */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-2">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode === 'day' ? 'Day' : mode === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>

          {/* Search Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Add Button */}
          <button
            onClick={openAddTask}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
