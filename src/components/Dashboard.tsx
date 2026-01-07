import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProgressChart } from './ProgressChart';
import { CategoryList } from './CategoryList';
import { CalendarCard } from './CalendarCard';
import { RingTimer } from './RingTimer';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { SearchBox } from './SearchBox';
import { Task } from '../types';
import { useStore } from '../store';

export const Dashboard: React.FC = () => {
  const { isAddTaskOpen, isEditTaskOpen, openAddTask, openEditTask, closeAddTask, closeEditTask, tasks } = useStore();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    openAddTask();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    openEditTask(task.id);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    if (isEditTaskOpen) {
      closeEditTask();
    } else {
      closeAddTask();
    }
  };

  // Calculate stats for ring timer
  const totalTasks = tasks.filter(t => !t.isCompleted).length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const focusProgress = totalTasks > 0 ? Math.round((completedTasks / (totalTasks + completedTasks)) * 100) : 0;

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 lg:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-10 safe-area-pt">
        {/* Search Box */}
        <SearchBox />

        {/* Right Action Group */}
        <div className="flex items-center justify-between lg:gap-4">
          {/* Add Task Button - Full width on mobile */}
          <button
            onClick={handleAddTask}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md min-touch-target"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Add Task</span>
          </button>

          {/* Avatar - Hidden on mobile */}
          <div className="hidden lg:flex w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:shadow-md transition-shadow">
            U
          </div>
        </div>
      </div>

      {/* Dashboard Content - Grid Layout */}
      <div className="p-4 lg:p-8">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-4 lg:space-y-6">
            {/* Progress Chart */}
            <ProgressChart title="Focus Time" />

            {/* Task List */}
            <TaskList onEditTask={handleEditTask} />

            {/* Category List */}
            <CategoryList title="Categories" />
          </div>

          {/* Right Column - Side Modules */}
          <div className="col-span-12 lg:col-span-4 space-y-4 lg:space-y-6">
            {/* Calendar Card */}
            <CalendarCard title="Calendar" onAddTask={handleAddTask} />

            {/* Ring Timer */}
            <RingTimer title="Focus Timer" timeText={`${focusProgress}%`} progress={focusProgress} />
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {(isAddTaskOpen || isEditTaskOpen) && (
          <TaskForm
            taskToEdit={isEditTaskOpen ? editingTask : null}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
