import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

interface BottomNavProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeItem, onItemClick }) => {
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
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'habits', label: 'Habits', icon: '✨' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-30">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`flex flex-col items-center justify-center px-3 py-2 min-w-[64px] min-h-[48px] rounded-xl transition-all duration-200 touch-manipulation ${
              activeItem === item.id
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={item.label}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
            {activeItem === item.id && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute bottom-0 w-8 h-1 bg-primary-500 rounded-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
