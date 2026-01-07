import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

interface ReportsProps {
  onClose: () => void;
}

export const Reports: React.FC<ReportsProps> = ({ onClose }) => {
  const { tasks, focusSessions, habits, habitLogs, categories } = useStore();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');

  const reportData = useMemo(() => {
    const today = dayjs();
    let startDate, endDate;

    if (reportType === 'weekly') {
      startDate = today.startOf('week');
      endDate = today.endOf('week');
    } else {
      startDate = today.startOf('month');
      endDate = today.endOf('month');
    }

    // Filter tasks in range
    const periodTasks = tasks.filter((task) => {
      const taskDate = dayjs(task.startTime);
      return taskDate.isAfter(startDate) && taskDate.isBefore(endDate);
    });

    const totalTasks = periodTasks.length;
    const completedTasks = periodTasks.filter((t) => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Focus time
    const periodFocusSessions = focusSessions.filter((s) => {
      return s.completedAt >= startDate.valueOf() && s.completedAt <= endDate.valueOf();
    });
    const totalFocusMinutes = periodFocusSessions.reduce((acc, s) => acc + Math.round(s.duration / 60), 0);
    const focusDays = new Set(periodFocusSessions.map((s) => dayjs(s.completedAt).format('YYYY-MM-DD'))).size;

    // Habits
    const periodHabitLogs = habitLogs.filter((log) => {
      const logDate = dayjs(log.date);
      return logDate.isAfter(startDate) && logDate.isBefore(endDate) && log.completed;
    });
    const habitsCompleted = periodHabitLogs.length;
    const habitsTarget = habits.reduce((acc, habit) => {
      let targetCount = 0;
      for (let i = 0; i <= (reportType === 'weekly' ? 7 : 30); i++) {
        const date = today.subtract(i, 'day');
        if (habit.targetDays.includes(date.day())) {
          targetCount++;
        }
      }
      return acc + targetCount;
    }, 0);

    // Top category
    const categoryStats = categories.map((cat) => ({
      ...cat,
      count: periodTasks.filter((t) => t.categoryId === cat.id).length,
    }));
    const topCategory = categoryStats.sort((a, b) => b.count - a.count)[0];

    // Generate achievements
    const achievements: string[] = [];
    if (completionRate >= 80) achievements.push('任务完成率超过 80%');
    if (completionRate >= 50 && completionRate < 80) achievements.push('任务完成率超过 50%');
    if (totalFocusMinutes >= 300) achievements.push('专注时长超过 5 小时');
    if (totalFocusMinutes >= 600) achievements.push('专注时长超过 10 小时');
    if (focusDays >= 5) achievements.push('一周专注 5 天以上');
    if (habitsCompleted >= habitsTarget * 0.8) achievements.push('习惯打卡率超过 80%');

    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalTasks,
      completedTasks,
      completionRate,
      totalFocusMinutes,
      focusDays,
      habitsCompleted,
      habitsTarget,
      topCategory,
      achievements,
    };
  }, [tasks, focusSessions, habits, habitLogs, categories, reportType]);

  const generateShareText = () => {
    const typeText = reportType === 'weekly' ? '本周' : '本月';
    return `CwtshTodo ${typeText}报告

📅 ${reportData.startDate} - ${reportData.endDate}

✅ 任务完成: ${reportData.completedTasks}/${reportData.totalTasks} (${reportData.completionRate}%)
⏱️ 专注时长: ${Math.round(reportData.totalFocusMinutes / 60)}小时
📅 专注天数: ${reportData.focusDays}天

${reportData.topCategory?.count ? `📊 最常完成: ${reportData.topCategory.icon} ${reportData.topCategory.name}` : ''}

${reportData.achievements.map((a) => `🏆 ${a}`).join('\n')}

--
来自 CwtshTodo`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToClipboard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CwtshTodo ${reportType === 'weekly' ? '周报' : '月报'}`,
          text: generateShareText(),
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">数据报告</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[60vh]">
          {/* Report Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setReportType('weekly')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                reportType === 'weekly'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              周报
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                reportType === 'monthly'
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              月报
            </button>
          </div>

          {/* Date Range */}
          <p className="text-center text-gray-500 text-sm mb-6">
            {reportData.startDate} - {reportData.endDate}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{reportData.completionRate}%</p>
              <p className="text-sm text-gray-500">完成率</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{reportData.completedTasks}</p>
              <p className="text-sm text-gray-500">已完成任务</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{Math.round(reportData.totalFocusMinutes / 60)}h</p>
              <p className="text-sm text-gray-500">专注时长</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{reportData.focusDays}</p>
              <p className="text-sm text-gray-500">专注天数</p>
            </div>
          </div>

          {/* Top Category */}
          {reportData.topCategory?.count ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">最常完成分类</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{reportData.topCategory.icon}</span>
                <div>
                  <p className="font-medium text-gray-800">{reportData.topCategory.name}</p>
                  <p className="text-sm text-gray-500">{reportData.topCategory.count} 个任务</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Achievements */}
          {reportData.achievements.length > 0 && (
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-primary-700 mb-3">🏆 成就达成</p>
              <ul className="space-y-2">
                {reportData.achievements.map((achievement, index) => (
                  <li key={index} className="text-sm text-primary-600 flex items-center gap-2">
                    <span className="text-primary-400">✓</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制报告
            </button>
            {'share' in navigator && (
              <button
                onClick={shareToClipboard}
                className="flex-1 py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                分享
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
