import React, { useState, useRef, useCallback } from 'react';
import { Task } from '../types';
import { useStore } from '../store';

interface SwipeableTaskCardProps {
  task: Task;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 80; // pixels to trigger action

export const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  children,
}) => {
  const { toggleTaskComplete, removeTask } = useStore();
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;
    setSwipeX(deltaX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;

    if (swipeX < -SWIPE_THRESHOLD) {
      // Swipe left - delete
      if (window.confirm('确定要删除这个任务吗？')) {
        removeTask(task.id);
      }
    } else if (swipeX > SWIPE_THRESHOLD) {
      // Swipe right - complete
      toggleTaskComplete(task.id);
    }

    // Reset
    setSwipeX(0);
    touchStartX.current = null;
    setIsDragging(false);
  }, [swipeX, task.id, removeTask, toggleTaskComplete]);

  const getSwipeActions = () => {
    if (swipeX < -SWIPE_THRESHOLD) {
      return { show: 'delete', opacity: Math.min(Math.abs(swipeX) / 100, 1) };
    } else if (swipeX > SWIPE_THRESHOLD) {
      return { show: 'complete', opacity: Math.min(swipeX / 100, 1) };
    }
    return { show: null, opacity: 0 };
  };

  const actions = getSwipeActions();

  return (
    <div className="relative overflow-hidden touch-manipulation">
      {/* Delete action background */}
      <div
        className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center transition-opacity"
        style={{ opacity: actions.show === 'delete' ? actions.opacity : 0 }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>

      {/* Complete action background */}
      <div
        className="absolute inset-y-0 left-0 w-20 bg-green-500 flex items-center justify-center transition-opacity"
        style={{ opacity: actions.show === 'complete' ? actions.opacity : 0 }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Card content */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-transform bg-white"
        style={{
          transform: `translateX(${swipeX}px)`,
        }}
      >
        {children}
      </div>

      {/* Action hints on mobile */}
      {isDragging && Math.abs(swipeX) > 20 && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          <span className={`text-sm font-medium transition-opacity ${swipeX > 20 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-green-500">右滑完成</span>
          </span>
          <span className={`text-sm font-medium transition-opacity ${swipeX < -20 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-red-500">左滑删除</span>
          </span>
        </div>
      )}
    </div>
  );
};
