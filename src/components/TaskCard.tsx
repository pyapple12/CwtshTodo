import React from 'react';
import { motion } from 'framer-motion';
import { Task, Category } from '../types';
import { useStore } from '../store';
import dayjs from 'dayjs';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, category, onClick }) => {
  const { toggleTaskComplete } = useStore();

  const startTime = dayjs(task.startTime);
  const endTime = dayjs(task.endTime);
  const categoryColor = category?.color || '#6B7280';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className="flex items-center gap-3 py-2 cursor-pointer"
    >
      {/* Task Info */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Category color dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: categoryColor }}
        />

        {/* Task details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate text-sm">
            {category?.icon} {task.title}
          </h3>
          <p className="text-xs text-gray-500">
            {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
          </p>
        </div>
      </div>

      {/* Complete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskComplete(task.id);
        }}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          task.isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {task.isCompleted && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </motion.div>
  );
};
