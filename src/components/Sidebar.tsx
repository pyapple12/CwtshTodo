import React from 'react';
import { useStore } from '../store';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const { openSettings, openCategoryManage } = useStore();

  const handleItemClick = (itemId: string) => {
    if (itemId === 'settings') {
      openSettings();
    } else if (itemId === 'categories') {
      openCategoryManage();
    } else {
      onItemClick(itemId);
    }
  };

  const navItems = [
    { id: 'today', label: 'Today', icon: '☀️' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'focus', label: 'Focus', icon: '🎯' },
    { id: 'calendar', label: 'Calendar', icon: '📆' },
    { id: 'habits', label: 'Habits', icon: '✨' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'backup', label: 'Backup & Import', icon: '💾' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* App Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <span className="text-xl font-bold text-gray-800">CwtshTodo</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeItem === item.id
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
