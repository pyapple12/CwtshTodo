import dayjs from 'dayjs';

// Notification permission status
export type PermissionStatus = 'default' | 'granted' | 'denied';

class NotificationService {
  private static instance: NotificationService;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private lastNotificationTime: number = 0;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  getPermissionStatus(): PermissionStatus {
    if (!this.isSupported()) return 'denied';
    return Notification.permission as PermissionStatus;
  }

  // Request notification permission
  async requestPermission(): Promise<PermissionStatus> {
    if (!this.isSupported()) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission as PermissionStatus;
  }

  // Send a notification
  send(title: string, options?: NotificationOptions): void {
    if (this.getPermissionStatus() !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Debounce: don't send more than one notification per second
    const now = Date.now();
    if (now - this.lastNotificationTime < 1000) {
      return;
    }
    this.lastNotificationTime = now;

    const notification = new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: dayjs().format('YYYYMMDDHHmmss'),
      requireInteraction: false,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }

  // Send task reminder notification
  sendTaskReminder(taskTitle: string, minutesLeft: number): void {
    this.send(`任务即将开始`, {
      body: `「${taskTitle}」将在 ${minutesLeft} 分钟后开始`,
      tag: 'task-reminder',
    });
  }

  // Send task ending soon notification
  sendTaskEndingSoon(taskTitle: string, minutesLeft: number): void {
    this.send(`任务即将结束`, {
      body: `「${taskTitle}」将在 ${minutesLeft} 分钟后结束`,
      tag: 'task-ending',
    });
  }

  // Send task halfway notification
  sendTaskHalfway(taskTitle: string): void {
    this.send(`任务已过半`, {
      body: `「${taskTitle}」已完成一半，继续加油！`,
      tag: 'task-halfway',
    });
  }

  // Send focus session completed notification
  sendFocusCompleted(pomodoroCount: number): void {
    this.send(`专注完成！`, {
      body: `已连续完成 ${pomodoroCount} 个番茄钟`,
      tag: 'focus-completed',
    });
  }

  // Start checking for reminders
  startReminderCheck(
    tasks: Array<{
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      isCompleted: boolean;
      reminder?: {
        enabled: boolean;
        beforeMinutes: number[];
      };
    }>,
    onReminder: (taskId: string, type: 'start' | 'end' | 'halfway', taskTitle: string) => void
  ): void {
    // Clear existing interval
    this.stopReminderCheck();

    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      const now = Date.now();

      tasks.forEach(task => {
        if (task.isCompleted) return;

        const startTime = dayjs(task.startTime).valueOf();
        const endTime = dayjs(task.endTime).valueOf();
        const duration = endTime - startTime;
        const halfwayTime = startTime + duration / 2;

        // Task start reminder (e.g., 10 minutes before)
        if (task.reminder?.enabled) {
          task.reminder.beforeMinutes.forEach(minutes => {
            const reminderTime = startTime - minutes * 60 * 1000;
            if (now >= reminderTime && now < startTime) {
              // Check if we already notified for this reminder
              const notifyKey = `task-start-${task.id}-${minutes}`;
              const lastNotify = localStorage.getItem(notifyKey);
              const today = dayjs().format('YYYY-MM-DD');

              if (lastNotify !== today) {
                this.sendTaskReminder(task.title, minutes);
                localStorage.setItem(notifyKey, today);
                onReminder(task.id, 'start', task.title);
              }
            }
          });
        }

        // Task halfway notification
        if (now >= halfwayTime && now < endTime && !task.isCompleted) {
          const notifyKey = `task-halfway-${task.id}`;
          const today = dayjs().format('YYYY-MM-DD');
          const lastNotify = localStorage.getItem(notifyKey);

          if (lastNotify !== today) {
            this.sendTaskHalfway(task.title);
            localStorage.setItem(notifyKey, today);
            onReminder(task.id, 'halfway', task.title);
          }
        }

        // Task ending soon notification (5 minutes before)
        const endReminderTime = endTime - 5 * 60 * 1000;
        if (now >= endReminderTime && now < endTime && !task.isCompleted) {
          const notifyKey = `task-end-${task.id}`;
          const today = dayjs().format('YYYY-MM-DD');
          const lastNotify = localStorage.getItem(notifyKey);

          if (lastNotify !== today) {
            this.sendTaskEndingSoon(task.title, 5);
            localStorage.setItem(notifyKey, today);
            onReminder(task.id, 'end', task.title);
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // Stop checking for reminders
  stopReminderCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const notificationService = NotificationService.getInstance();
