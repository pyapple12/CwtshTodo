import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Category, FocusSession, Habit, HabitLog } from '../types';

interface CwtshTodoDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-date': string; 'by-category': string };
  };
  categories: {
    key: string;
    value: Category;
  };
  focusSessions: {
    key: string;
    value: FocusSession;
    indexes: { 'by-date': number; 'by-task': string };
  };
  habits: {
    key: string;
    value: Habit;
  };
  habitLogs: {
    key: string;
    value: HabitLog;
    indexes: { 'by-habit': string; 'by-date': string };
  };
}

const DB_NAME = 'cwtshtodo-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<CwtshTodoDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<CwtshTodoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CwtshTodoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-date', 'startTime');
          taskStore.createIndex('by-category', 'categoryId');
        }
        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        // Focus sessions store (v2)
        if (!db.objectStoreNames.contains('focusSessions')) {
          const sessionStore = db.createObjectStore('focusSessions', { keyPath: 'id' });
          sessionStore.createIndex('by-date', 'completedAt');
          sessionStore.createIndex('by-task', 'taskId');
        }
        // Habits store (v2)
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        // Habit logs store (v2)
        if (!db.objectStoreNames.contains('habitLogs')) {
          const logStore = db.createObjectStore('habitLogs', { keyPath: 'id' });
          logStore.createIndex('by-habit', 'habitId');
          logStore.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

// Task operations
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

export async function getTasksByDateRange(start: string, end: string): Promise<Task[]> {
  const db = await getDB();
  const allTasks = await db.getAllFromIndex('tasks', 'by-date', IDBKeyRange.bound(start, end));
  return allTasks;
}

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// Category operations
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function saveCategory(category: Category): Promise<void> {
  const db = await getDB();
  await db.put('categories', category);
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('categories', id);
}

// Import/Export
export async function exportData(): Promise<{ tasks: Task[]; categories: Category[] }> {
  const [tasks, categories] = await Promise.all([
    getAllTasks(),
    getAllCategories(),
  ]);
  return { tasks, categories };
}

export async function importData(data: { tasks: Task[]; categories: Category[] }): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['tasks', 'categories'], 'readwrite');
  await Promise.all([
    ...data.tasks.map(task => tx.objectStore('tasks').put(task)),
    ...data.categories.map(category => tx.objectStore('categories').put(category)),
    tx.done,
  ]);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('tasks'),
    db.clear('categories'),
    db.clear('focusSessions'),
    db.clear('habits'),
    db.clear('habitLogs'),
  ]);
}

// ========== Focus Session Operations ==========

export async function getAllFocusSessions(): Promise<FocusSession[]> {
  const db = await getDB();
  return db.getAll('focusSessions');
}

export async function getFocusSessionsByDateRange(start: number, end: number): Promise<FocusSession[]> {
  const db = await getDB();
  const allSessions = await db.getAllFromIndex('focusSessions', 'by-date', IDBKeyRange.bound(start, end));
  return allSessions;
}

export async function saveFocusSession(session: FocusSession): Promise<void> {
  const db = await getDB();
  await db.put('focusSessions', session);
}

export async function deleteFocusSession(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('focusSessions', id);
}

// ========== Habit Operations ==========

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAll('habits');
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  await db.put('habits', habit);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habits', id);
}

// ========== Habit Log Operations ==========

export async function getAllHabitLogs(): Promise<HabitLog[]> {
  const db = await getDB();
  return db.getAll('habitLogs');
}

export async function getHabitLogsByDate(date: string): Promise<HabitLog[]> {
  const db = await getDB();
  return db.getAllFromIndex('habitLogs', 'by-date', date);
}

export async function getHabitLogsByHabitId(habitId: string): Promise<HabitLog[]> {
  const db = await getDB();
  return db.getAllFromIndex('habitLogs', 'by-habit', habitId);
}

export async function saveHabitLog(log: HabitLog): Promise<void> {
  const db = await getDB();
  await db.put('habitLogs', log);
}

export async function deleteHabitLog(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('habitLogs', id);
}
