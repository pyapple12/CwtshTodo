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

// 任务优先级
export type TaskPriority = 'high' | 'medium' | 'low' | 'none';

// 任务
export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId?: string;
  priority: TaskPriority; // 优先级
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

// 任务模板
export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  defaultDuration: number; // 默认时长（分钟）
  isAllDay: boolean;
  reminderEnabled: boolean;
  reminderBeforeMinutes: number[];
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

// 快捷键配置
export interface KeyboardShortcutConfig {
  id: string;
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  action: string; // openAddTask, openSettings, openDataManagement, etc.
  enabled: boolean;
}

// 自动备份设置
export interface AutoBackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string; // HH:mm
  maxBackups: number; // 保留数量
  lastBackupAt?: number;
}

// 报告生成记录
export interface Report {
  id: string;
  type: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  generatedAt: number;
  data: ReportData;
}

export interface ReportData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalFocusTime: number; // 分钟
  focusDays: number;
  habitsCompleted: number;
  habitsTarget: number;
  topCategory?: string;
  achievements: string[];
}

// 操作历史记录类型
export type ActionType = 'add' | 'update' | 'delete' | 'complete' | 'uncomplete';

export interface ActionHistory {
  id: string;
  type: ActionType;
  entity: 'task' | 'category' | 'habit';
  data: {
    before?: Partial<Task> | Partial<Category> | Partial<Habit>;
    after?: Partial<Task> | Partial<Category> | Partial<Habit>;
  };
  timestamp: number;
}
