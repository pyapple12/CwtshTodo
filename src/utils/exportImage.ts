import dayjs from 'dayjs';
import { Task, Category } from '../types';

// Export task as image using Canvas
export async function exportTaskAsImage(
  task: Task,
  category?: Category
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Canvas dimensions
  const width = 600;
  const height = 200;
  canvas.width = width;
  canvas.height = height;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(1, '#f1f5f9');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Border/Shadow effect
  ctx.strokeStyle = category?.color || '#3b82f6';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  // Category color indicator
  ctx.fillStyle = category?.color || '#3b82f6';
  ctx.fillRect(24, 32, 6, height - 64);

  // Task title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(task.title, 48, 72);

  // Category badge
  if (category) {
    const badgeWidth = ctx.measureText(category.name).width + 24;
    ctx.fillStyle = category.color + '20'; // 20% opacity
    ctx.beginPath();
    ctx.roundRect(48, 88, badgeWidth, 32, 8);
    ctx.fill();

    ctx.fillStyle = category.color;
    ctx.font = '14px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${category.icon} ${category.name}`, 60, 110);
  }

  // Time
  const startTime = dayjs(task.startTime);
  const endTime = dayjs(task.endTime);
  const timeText = task.isAllDay
    ? 'All Day'
    : `${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`;
  const dateText = startTime.format('dddd, MMMM D, YYYY');

  ctx.fillStyle = '#64748b';
  ctx.font = '16px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${dateText} · ${timeText}`, 48, 152);

  // Priority badge
  if (task.priority && task.priority !== 'none') {
    const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
      high: { bg: '#FEE2E2', text: '#EF4444', label: 'High Priority' },
      medium: { bg: '#FEF3C7', text: '#F59E0B', label: 'Medium Priority' },
      low: { bg: '#D1FAE5', text: '#10B981', label: 'Low Priority' },
    };
    const priority = priorityColors[task.priority];
    const badgeWidth = ctx.measureText(priority.label).width + 20;

    ctx.fillStyle = priority.bg;
    ctx.beginPath();
    ctx.roundRect(width - badgeWidth - 36, 32, badgeWidth, 28, 6);
    ctx.fill();

    ctx.fillStyle = priority.text;
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(priority.label, width - badgeWidth - 28, 52);
  }

  // Completed status
  if (task.isCompleted) {
    // Completed badge
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.roundRect(width - 120, height - 48, 100, 36, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Completed', width - 70, height - 24);
    ctx.textAlign = 'left';
  } else {
    // Due status
    const now = dayjs();
    const isOverdue = startTime.isBefore(now, 'day');
    const isToday = startTime.isSame(now, 'day');

    if (isOverdue) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(width - 100, height - 48, 80, 36, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Overdue', width - 60, height - 24);
      ctx.textAlign = 'left';
    } else if (isToday) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(width - 80, height - 48, 60, 36, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Today', width - 50, height - 24);
      ctx.textAlign = 'left';
    }
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

// Download the exported image
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export task as image and download
export async function exportAndDownloadTask(
  task: Task,
  category?: Category
): Promise<void> {
  const blob = await exportTaskAsImage(task, category);
  const filename = `task-${task.title.replace(/[^a-z0-9]/gi, '-')}-${dayjs(task.startTime).format('YYYY-MM-DD')}.png`;
  downloadImage(blob, filename);
}
