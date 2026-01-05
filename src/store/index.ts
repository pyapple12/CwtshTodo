import { create } from 'zustand';
import { Task, Category, ViewMode } from '../types';
import {
  getAllTasks,
  getAllCategories,
  saveTask,
  deleteTask,
  saveCategory,
  deleteCategory,
  clearAllData,
} from '../utils/db';
import dayjs from 'dayjs';

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system';

// 应用设置
export interface AppSettings {
  theme: ThemeMode;
  language: 'zh' | 'en';
  notificationsEnabled: boolean;
  reminderBeforeMinutes: number;
  defaultView: ViewMode;
  startOfWeek: number; // 0=周日, 1=周一
}

interface AppState {
  // Data
  tasks: Task[];
  categories: Category[];

  // UI State
  currentDate: dayjs.Dayjs;
  viewMode: ViewMode;
  selectedTaskId: string | null;
  isAddTaskOpen: boolean;
  isEditTaskOpen: boolean;
  isDataManagementOpen: boolean;
  isSettingsOpen: boolean;

  // Settings
  settings: AppSettings;

  // Actions
  loadData: () => Promise<void>;
  setCurrentDate: (date: dayjs.Dayjs) => void;
  setViewMode: (mode: ViewMode) => void;
  selectTask: (taskId: string | null) => void;
  openAddTask: () => void;
  closeAddTask: () => void;
  openEditTask: (taskId: string) => void;
  closeEditTask: () => void;
  openDataManagement: () => void;
  closeDataManagement: () => void;
  openSettings: () => void;
  closeSettings: () => void;

  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  clearAllData: () => Promise<void>;

  // Task CRUD
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;

  // Category CRUD
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;

  // Filtered data helpers
  getTasksForDate: (date: dayjs.Dayjs) => Task[];
  getFilteredTasks: () => Task[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: '工作', color: '#3B82F6', icon: '💼', createdAt: Date.now() },
  { id: 'cat-2', name: '学习', color: '#10B981', icon: '📚', createdAt: Date.now() },
  { id: 'cat-3', name: '生活', color: '#F59E0B', icon: '🏠', createdAt: Date.now() },
  { id: 'cat-4', name: '运动', color: '#EF4444', icon: '🏃', createdAt: Date.now() },
];

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  tasks: [],
  categories: DEFAULT_CATEGORIES,

  // Initial UI state
  currentDate: dayjs(),
  viewMode: 'day',
  selectedTaskId: null,
  isAddTaskOpen: false,
  isEditTaskOpen: false,
  isDataManagementOpen: false,
  isSettingsOpen: false,

  // Initial settings
  settings: {
    theme: 'system',
    language: 'zh',
    notificationsEnabled: true,
    reminderBeforeMinutes: 10,
    defaultView: 'day',
    startOfWeek: 1, // 周一开始
  },

  // Actions
  loadData: async () => {
    const [tasks, categories] = await Promise.all([
      getAllTasks(),
      getAllCategories(),
    ]);
    set({
      tasks: tasks.length > 0 ? tasks : [],
      categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
    });
  },

  setCurrentDate: (date) => set({ currentDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  selectTask: (taskId) => set({ selectedTaskId: taskId }),
  openAddTask: () => set({ isAddTaskOpen: true }),
  closeAddTask: () => set({ isAddTaskOpen: false }),
  openEditTask: (taskId) => set({ isEditTaskOpen: true, selectedTaskId: taskId }),
  closeEditTask: () => set({ isEditTaskOpen: false, selectedTaskId: null }),
  openDataManagement: () => set({ isDataManagementOpen: true }),
  closeDataManagement: () => set({ isDataManagementOpen: false }),
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  // Settings Actions
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  clearAllData: async () => {
    await clearAllData();
    set({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
    });
  },

  // Task CRUD
  addTask: async (task) => {
    await saveTask(task);
    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  updateTask: async (task) => {
    await saveTask(task);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },

  removeTask: async (taskId) => {
    await deleteTask(taskId);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    }));
  },

  toggleTaskComplete: async (taskId) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      const updated = { ...task, isCompleted: !task.isCompleted, updatedAt: Date.now() };
      await saveTask(updated);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
      }));
    }
  },

  // Category CRUD
  addCategory: async (category) => {
    await saveCategory(category);
    set((state) => ({ categories: [...state.categories, category] }));
  },

  updateCategory: async (category) => {
    await saveCategory(category);
    set((state) => ({
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
    }));
  },

  removeCategory: async (categoryId) => {
    await deleteCategory(categoryId);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
    }));
  },

  // Helper functions
  getTasksForDate: (date) => {
    const state = get();
    const start = date.startOf('day').toISOString();
    const end = date.endOf('day').toISOString();
    return state.tasks.filter(
      (t) => t.startTime >= start && t.startTime <= end && !t.isCompleted
    );
  },

  getFilteredTasks: () => {
    const state = get();
    const { currentDate, viewMode } = state;

    if (viewMode === 'day') {
      return state.getTasksForDate(currentDate);
    }

    // Week/Month view - return tasks in range
    const start = currentDate.startOf(viewMode === 'week' ? 'week' : 'month').toISOString();
    const end = currentDate.endOf(viewMode === 'week' ? 'week' : 'month').toISOString();
    return state.tasks.filter(
      (t) => t.startTime >= start && t.startTime <= end && !t.isCompleted
    );
  },
}));
