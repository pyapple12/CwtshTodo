import { create } from 'zustand';
import { Task, Category, ViewMode, FocusSession, Habit, HabitLog } from '../types';
import {
  getAllTasks,
  getAllCategories,
  saveTask,
  deleteTask,
  saveCategory,
  deleteCategory,
  getAllFocusSessions,
  saveFocusSession,
  getAllHabits,
  saveHabit,
  deleteHabit,
  getAllHabitLogs,
  saveHabitLog,
  clearAllData,
} from '../utils/db';
import { notificationService } from '../services/notifications';
import dayjs from 'dayjs';

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'system';

// 应用设置
export interface AppSettings {
  theme: ThemeMode;
  language: 'zh' | 'en';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  notificationPermission: 'default' | 'granted' | 'denied';
  reminderBeforeMinutes: number;
  defaultView: ViewMode;
  startOfWeek: number; // 0=周日, 1=周一
  compactMode: boolean; // 紧凑模式
  // 默认任务设置
  defaultCategoryId: string; // 默认分类
  defaultIsAllDay: boolean; // 默认全天任务
  defaultReminder: boolean; // 默认开启提醒
  defaultDuration: number; // 默认任务时长（分钟）
}

// Theme utility functions
export function getEffectiveTheme(userTheme: ThemeMode): 'light' | 'dark' {
  if (userTheme === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return userTheme;
}

export function applyTheme(theme: ThemeMode): void {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  localStorage.setItem('cwtshtodo-theme', theme);
}

// Listen for system theme changes
export function initThemeListener(): void {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const savedTheme = localStorage.getItem('cwtshtodo-theme') as ThemeMode | null;
    if (savedTheme === 'system' || !savedTheme) {
      applyTheme('system');
    }
  });
}

interface AppState {
  // Data
  tasks: Task[];
  categories: Category[];
  focusSessions: FocusSession[];
  habits: Habit[];
  habitLogs: HabitLog[];

  // UI State
  isLoading: boolean;
  currentDate: dayjs.Dayjs;
  viewMode: ViewMode;
  selectedTaskId: string | null;
  isAddTaskOpen: boolean;
  isEditTaskOpen: boolean;
  isDataManagementOpen: boolean;
  isSettingsOpen: boolean;
  isCategoryManageOpen: boolean;

  // Filter
  selectedCategoryId: string | null;

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
  openCategoryManage: () => void;
  closeCategoryManage: () => void;

  // Filter Actions
  setSelectedCategory: (categoryId: string | null) => void;

  // Settings Actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setTheme: (theme: ThemeMode) => void;
  requestNotificationPermission: () => Promise<void>;
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

  // Focus Session Actions
  addFocusSession: (session: FocusSession) => Promise<void>;
  getTodayFocusTime: () => number;
  getWeekFocusStats: () => { total: number; daily: number[] };

  // Habit Actions
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;
  getHabitLogsForWeek: (habitId: string, weekStart: dayjs.Dayjs) => HabitLog[];
  getHabitStats: (habitId: string) => { streak: number; completionRate: number; totalCompleted: number };

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

const DEFAULT_HABITS: Habit[] = [
  { id: 'habit-1', name: '早起', icon: '🌅', color: '#F59E0B', targetDays: [1, 2, 3, 4, 5], createdAt: Date.now() },
  { id: 'habit-2', name: '运动', icon: '🏃', color: '#10B981', targetDays: [1, 3, 5], createdAt: Date.now() },
  { id: 'habit-3', name: '阅读', icon: '📚', color: '#3B82F6', targetDays: [2, 4, 6], createdAt: Date.now() },
];

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  tasks: [],
  categories: DEFAULT_CATEGORIES,
  focusSessions: [],
  habits: [],
  habitLogs: [],

  // Initial UI state
  isLoading: true,
  currentDate: dayjs(),
  viewMode: 'day',
  selectedTaskId: null,
  isAddTaskOpen: false,
  isEditTaskOpen: false,
  isDataManagementOpen: false,
  isSettingsOpen: false,
  isCategoryManageOpen: false,

  // Filter
  selectedCategoryId: null,

  // Initial settings
  settings: {
    theme: 'system',
    language: 'zh',
    notificationsEnabled: true,
    soundEnabled: true,
    notificationPermission: notificationService.getPermissionStatus(),
    reminderBeforeMinutes: 10,
    defaultView: 'day',
    startOfWeek: 1, // 周一开始
    compactMode: false,
    // 默认任务设置
    defaultCategoryId: '',
    defaultIsAllDay: false,
    defaultReminder: false,
    defaultDuration: 60,
  },

  // Actions
  loadData: async () => {
    // Load saved theme or use default
    const savedTheme = localStorage.getItem('cwtshtodo-theme') as ThemeMode | null;
    const initialTheme: ThemeMode = savedTheme || 'system';
    applyTheme(initialTheme);
    initThemeListener();

    const [tasks, categories, focusSessions, habits, habitLogs] = await Promise.all([
      getAllTasks(),
      getAllCategories(),
      getAllFocusSessions(),
      getAllHabits(),
      getAllHabitLogs(),
    ]);
    set({
      isLoading: false,
      tasks: tasks.length > 0 ? tasks : [],
      categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
      focusSessions: focusSessions.length > 0 ? focusSessions : [],
      habits: habits.length > 0 ? habits : DEFAULT_HABITS,
      habitLogs: habitLogs.length > 0 ? habitLogs : [],
      settings: {
        theme: initialTheme,
        language: 'zh',
        notificationsEnabled: true,
        soundEnabled: true,
        notificationPermission: notificationService.getPermissionStatus(),
        reminderBeforeMinutes: 10,
        defaultView: 'day',
        startOfWeek: 1,
        compactMode: false,
        defaultCategoryId: '',
        defaultIsAllDay: false,
        defaultReminder: false,
        defaultDuration: 60,
      },
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
  openCategoryManage: () => set({ isCategoryManageOpen: true }),
  closeCategoryManage: () => set({ isCategoryManageOpen: false }),

  // Filter Actions
  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

  // Settings Actions
  updateSettings: (newSettings) =>
    set((state) => {
      const newState = {
        settings: { ...state.settings, ...newSettings },
      };

      // Apply theme if it was changed
      if (newSettings.theme !== undefined) {
        applyTheme(newSettings.theme);
      }

      return newState;
    }),

  setTheme: (theme: ThemeMode) => {
    set((state) => {
      const newSettings = { ...state.settings, theme };
      applyTheme(theme);
      return { settings: newSettings };
    });
  },

  requestNotificationPermission: async () => {
    const permission = await notificationService.requestPermission();
    set((state) => ({
      settings: { ...state.settings, notificationPermission: permission },
    }));
  },

  clearAllData: async () => {
    await clearAllData();
    set({
      tasks: [],
      categories: DEFAULT_CATEGORIES,
      focusSessions: [],
      habits: DEFAULT_HABITS,
      habitLogs: [],
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

  // Focus Session Actions
  addFocusSession: async (session) => {
    await saveFocusSession(session);
    set((state) => ({ focusSessions: [...state.focusSessions, session] }));
  },

  getTodayFocusTime: () => {
    const state = get();
    const today = dayjs().startOf('day').valueOf();
    const tomorrow = dayjs().endOf('day').valueOf();
    return state.focusSessions
      .filter((s) => s.completedAt >= today && s.completedAt <= tomorrow)
      .reduce((acc, s) => acc + s.duration, 0);
  },

  getWeekFocusStats: () => {
    const state = get();
    const weekStart = dayjs().startOf('week');
    const daily: number[] = [];

    for (let i = 0; i < 7; i++) {
      const day = weekStart.add(i, 'day');
      const dayStart = day.startOf('day').valueOf();
      const dayEnd = day.endOf('day').valueOf();
      const dayTotal = state.focusSessions
        .filter((s) => s.completedAt >= dayStart && s.completedAt <= dayEnd)
        .reduce((acc, s) => acc + s.duration, 0);
      daily.push(dayTotal);
    }

    return {
      total: daily.reduce((acc, d) => acc + d, 0),
      daily,
    };
  },

  // Habit Actions
  addHabit: async (habit) => {
    await saveHabit(habit);
    set((state) => ({ habits: [...state.habits, habit] }));
  },

  updateHabit: async (habit) => {
    await saveHabit(habit);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
    }));
  },

  removeHabit: async (habitId) => {
    await deleteHabit(habitId);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== habitId),
      habitLogs: state.habitLogs.filter((l) => l.habitId !== habitId),
    }));
  },

  toggleHabitLog: async (habitId, date) => {
    const state = get();
    const existingLog = state.habitLogs.find(
      (l) => l.habitId === habitId && l.date === date
    );

    if (existingLog) {
      // Toggle off
      await import('../utils/db').then((db) => db.deleteHabitLog(existingLog.id));
      set((state) => ({
        habitLogs: state.habitLogs.filter((l) => l.id !== existingLog.id),
      }));
    } else {
      // Toggle on
      const newLog: HabitLog = {
        id: `log-${habitId}-${date}`,
        habitId,
        date,
        completed: true,
        completedAt: Date.now(),
      };
      await saveHabitLog(newLog);
      set((state) => ({ habitLogs: [...state.habitLogs, newLog] }));
    }
  },

  getHabitLogsForWeek: (habitId, weekStart) => {
    const state = get();
    const logs: HabitLog[] = [];

    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, 'day').format('YYYY-MM-DD');
      const log = state.habitLogs.find((l) => l.habitId === habitId && l.date === date);
      if (log) logs.push(log);
    }

    return logs;
  },

  getHabitStats: (habitId) => {
    const state = get();
    const habit = state.habits.find((h) => h.id === habitId);
    if (!habit) return { streak: 0, completionRate: 0, totalCompleted: 0 };

    const habitLogs = state.habitLogs.filter((l) => l.habitId === habitId && l.completed);

    // Calculate streak
    let streak = 0;
    const today = dayjs();
    for (let i = 0; i < 365; i++) {
      const date = today.subtract(i, 'day').format('YYYY-MM-DD');
      const log = habitLogs.find((l) => l.date === date);
      if (log) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate completion rate (last 30 days)
    const targetDays = habit.targetDays;
    let targetCount = 0;
    let completedCount = 0;

    for (let i = 0; i < 30; i++) {
      const date = today.subtract(i, 'day');
      const dayOfWeek = dayjs(date).day();
      if (targetDays.includes(dayOfWeek)) {
        targetCount++;
        const log = habitLogs.find((l) => l.date === date.format('YYYY-MM-DD'));
        if (log) completedCount++;
      }
    }

    const completionRate = targetCount > 0 ? Math.round((completedCount / targetCount) * 100) : 0;

    return {
      streak,
      completionRate,
      totalCompleted: habitLogs.length,
    };
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
