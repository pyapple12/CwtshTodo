import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Task } from '../types';
import { useStore } from '../store';
import dayjs from 'dayjs';
import { DraggableTaskCard } from './DraggableTaskCard';

interface TaskListProps {
  onEditTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask }) => {
  const { tasks, updateTask, toggleTaskComplete } = useStore();

  // Get tasks sorted by time
  const sortedTasks = tasks
    .filter((task) => {
      const taskDate = dayjs(task.startTime);
      const today = dayjs().startOf('day');
      return taskDate.isAfter(today) && !task.isCompleted;
    })
    .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

  // Get completed tasks
  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Move task callback
  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragTask = sortedTasks[dragIndex];
    const hoverTask = sortedTasks[hoverIndex];

    if (dragTask && hoverTask) {
      // Calculate duration
      const duration = dayjs(dragTask.endTime).diff(dayjs(dragTask.startTime), 'minute');

      // New start time is hover task's start time
      const newStartTime = dayjs(hoverTask.startTime);
      const newEndTime = newStartTime.add(duration, 'minute');

      // Update task with new time
      const updatedTask = {
        ...dragTask,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
        updatedAt: Date.now(),
      };

      updateTask(updatedTask);
    }
  }, [sortedTasks, updateTask]);

  const hasTasks = sortedTasks.length > 0;
  const hasCompleted = completedTasks.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
        {hasTasks && (
          <span className="text-sm text-gray-500">{sortedTasks.length} pending</span>
        )}
      </div>

      {hasTasks || hasCompleted ? (
        <>
          {/* Draggable tasks */}
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task, index) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                moveTask={moveTask}
              />
            ))}
          </AnimatePresence>

          {/* Completed tasks section */}
          {hasCompleted && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Completed</p>
              <AnimatePresence>
                {completedTasks.slice(0, 5).map((task) => (
                  <motion.li
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg line-through"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500 truncate flex-1">{task.title}</span>
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-xs text-gray-400 hover:text-primary-500"
                    >
                      Restore
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No tasks yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Task" to create your first task</p>
        </div>
      )}
    </div>
  );
};
