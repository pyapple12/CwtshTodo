import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { useStore } from '../store';

interface ContextMenuProps {
  task: Task;
  children: React.ReactNode;
  onEdit: (task: Task) => void;
}

export const ContextMenuTaskCard: React.FC<ContextMenuProps> = ({
  task,
  children,
  onEdit,
}) => {
  const { toggleTaskComplete, removeTask } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);

  const LONG_PRESS_DURATION = 500; // milliseconds
  const MOVEMENT_THRESHOLD = 10; // pixels

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      // Check if finger hasn't moved much
      if (touchStartPos.current) {
        const touchCurrent = e.touches[0];
        const deltaX = Math.abs(touchCurrent.clientX - touchStartPos.current.x);
        const deltaY = Math.abs(touchCurrent.clientY - touchStartPos.current.y);

        if (deltaX < MOVEMENT_THRESHOLD && deltaY < MOVEMENT_THRESHOLD) {
          setMenuPosition({ x: touchCurrent.clientX, y: touchCurrent.clientY });
          setShowMenu(true);

          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current && touchStartPos.current) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

      // Cancel long press if finger moved too much
      if (deltaX > MOVEMENT_THRESHOLD || deltaY > MOVEMENT_THRESHOLD) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  }, []);

  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  const handleAction = async (action: 'complete' | 'edit' | 'delete') => {
    closeMenu();

    switch (action) {
      case 'complete':
        await toggleTaskComplete(task.id);
        break;
      case 'edit':
        onEdit(task);
        break;
      case 'delete':
        if (window.confirm('确定要删除这个任务吗？')) {
          await removeTask(task.id);
        }
        break;
    }
  };

  return (
    <div ref={cardRef} className="relative">
      <div
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="touch-manipulation"
      >
        {children}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={closeMenu}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px]"
              style={{
                left: Math.min(menuPosition.x, window.innerWidth - 170),
                top: Math.min(menuPosition.y, window.innerHeight - 200),
              }}
            >
              {/* Complete/Restore */}
              <button
                onClick={() => handleAction('complete')}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <span className={task.isCompleted ? 'text-amber-500' : 'text-green-500'}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-700">
                  {task.isCompleted ? '恢复任务' : '完成任务'}
                </span>
              </button>

              {/* Edit */}
              <button
                onClick={() => handleAction('edit')}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-blue-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                <span className="text-gray-700">编辑任务</span>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleAction('delete')}
                className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50 transition-colors"
              >
                <span className="text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </span>
                <span className="text-red-600">删除任务</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Standalone context menu for any element
interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface StandaloneContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

export const StandaloneContextMenu: React.FC<StandaloneContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (!(e.target as Element).closest('.context-menu')) {
          onClose();
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px] context-menu"
            style={{
              left: Math.min(position.x, window.innerWidth - 170),
              top: Math.min(position.y, window.innerHeight - items.length * 50 - 20),
            }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                  item.danger
                    ? 'hover:bg-red-50 text-red-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
