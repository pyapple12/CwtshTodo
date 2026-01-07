import React, { useRef, forwardRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Task, TaskPriority } from '../types';
import { useStore } from '../store';
import { exportAndDownloadTask } from '../utils/exportImage';
import dayjs from 'dayjs';

interface DraggableTaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

// Priority colors
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
  none: '#6B7280',
};

// Priority icons
const PRIORITY_ICONS: Record<TaskPriority, string> = {
  high: '⬆️',
  medium: '▬',
  low: '⬇️',
  none: '',
};

export const DraggableTaskCard = forwardRef<HTMLLIElement, DraggableTaskCardProps>(({
  task,
  index,
  onEdit,
  moveTask,
}, ref) => {
  const { categories, toggleTaskComplete, removeTask, settings } = useStore();
  const { compactMode } = settings;
  const innerRef = useRef<HTMLLIElement>(null);

  const category = categories.find((c) => c.id === task.categoryId);
  const startTime = dayjs(task.startTime);
  const endTime = dayjs(task.endTime);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { index, id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item: DragItem) {
      if (!innerRef.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      if (dragIndex !== hoverIndex) {
        moveTask(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
  });

  // Connect drag and drop to the ref
  drag(drop(innerRef));

  // Merge the forwarded ref with our inner ref
  const setRefs = (node: HTMLLIElement | null) => {
    (innerRef as React.MutableRefObject<HTMLLIElement | null>).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskComplete(task.id);
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeTask(task.id);
  };

  const handleExport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await exportAndDownloadTask(task, category);
  };

  return (
    <motion.li
      ref={setRefs}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 ${compactMode ? 'p-1.5' : 'p-2.5 lg:p-3'} rounded-lg lg:rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-grab active:cursor-grabbing touch-manipulation ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={handleEdit}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* Drag handle - hidden on mobile */}
      <div className="hidden lg:block text-gray-300 hover:text-gray-400 cursor-grab">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        className={`${compactMode ? 'w-5 h-5' : 'w-7 h-7 lg:w-6 lg:h-6'} rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all touch-manipulation ${
          task.isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400 hover:scale-110'
        }`}
      >
        {task.isCompleted && (
          <svg className={`${compactMode ? 'w-3 h-3' : 'w-4 h-4'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Category color bar */}
      <div
        className={`${compactMode ? 'h-6 w-0.5' : 'w-1 h-10 lg:h-12'} rounded-full flex-shrink-0`}
        style={{ backgroundColor: category?.color || '#6B7280' }}
      />

      {/* Priority indicator */}
      {task.priority && task.priority !== 'none' && (
        <div
          className={`${compactMode ? 'w-4 h-4 text-xs' : 'w-5 h-5'} rounded flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: `${PRIORITY_COLORS[task.priority]}20` }}
          title={task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
        >
          <span
            className={compactMode ? 'text-[10px]' : 'text-xs'}
            style={{ color: PRIORITY_COLORS[task.priority] }}
          >
            {PRIORITY_ICONS[task.priority]}
          </span>
        </div>
      )}

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-gray-800 truncate ${compactMode ? 'text-xs' : 'text-sm lg:text-base'}`}>
          {category?.icon} {task.title}
        </h4>
        {!compactMode && (
          <p className="text-xs text-gray-500">
            {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
          </p>
        )}
      </div>

      {/* Quick actions - hidden in compact mode on desktop, show on hover */}
      <div className={`${compactMode ? 'hidden' : 'flex'} gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
        <button
          onClick={handleEdit}
          className="p-1.5 hover:bg-white rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={handleExport}
          className="p-1.5 hover:bg-white rounded-lg transition-colors"
          title="Export as Image"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 hover:bg-white rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.li>
  );
});

DraggableTaskCard.displayName = 'DraggableTaskCard';
