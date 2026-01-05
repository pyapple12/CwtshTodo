import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Category } from '../types';

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
}

const DB_NAME = 'cwtshtodo-db';
const DB_VERSION = 1;

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
  ]);
}
