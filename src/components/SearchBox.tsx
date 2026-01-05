import React, { useState } from 'react';
import { useStore } from '../store';
import dayjs from 'dayjs';

export const SearchBox: React.FC = () => {
  const { tasks, categories, openAddTask } = useStore();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (!query.trim()) return false;
    return (
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description?.toLowerCase().includes(query.toLowerCase())
    );
  });

  const getCategory = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <div className="relative w-80">
      <svg
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
          isFocused ? 'text-primary-500' : 'text-gray-400'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search tasks..."
        className={`w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none ${
          isFocused ? 'bg-white' : ''
        }`}
      />

      {/* Search results dropdown */}
      {query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {filteredTasks.length > 0 ? (
            <ul className="py-2">
              {filteredTasks.slice(0, 5).map((task) => {
                const category = getCategory(task.categoryId);
                return (
                  <li key={task.id}>
                    <button
                      onClick={() => {
                        setQuery('');
                        openAddTask();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayjs(task.startTime).format('MMM D, h:mm A')}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500">No tasks found</p>
              <button
                onClick={() => {
                  setQuery('');
                  openAddTask();
                }}
                className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                Create a new task
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
