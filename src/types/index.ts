// 任务分类
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

// 提醒设置
export interface Reminder {
  enabled: boolean; // 是否启用
  beforeMinutes: number[]; // 提前多少分钟提醒
}

// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  startTime: string; // ISO 时间字符串
  endTime: string;
  isAllDay: boolean;
  isCompleted: boolean;
  isRecurring: boolean;
  recurringRule?: RecurringRule;
  reminder?: Reminder;
  createdAt: number;
  updatedAt: number;
}

// 重复规则
export interface RecurringRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 间隔
  endDate?: string; // 结束日期
  daysOfWeek?: number[]; // 0-6，周日到周六
}

// 视图模式
export type ViewMode = 'day' | 'week' | 'month';

// 过滤状态
export interface FilterState {
  showCompleted: boolean;
  categoryIds: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

// 专注会话记录
export interface FocusSession {
  id: string;
  taskId?: string;
  duration: number; // 秒
  completedAt: number;
  mode: 'focus' | 'shortBreak' | 'longBreak';
}

// 习惯
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetDays: number[]; // 0-6，周日到周六
  reminderTime?: string; // HH:mm
  createdAt: number;
}

// 习惯打卡记录
export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: number;
}
