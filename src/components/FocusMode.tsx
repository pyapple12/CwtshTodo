import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { Task } from '../types';
import { WhiteNoisePanel } from './WhiteNoisePanel';
import dayjs from 'dayjs';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_CONFIG = {
  focus: { minutes: 25, label: '专注时间', color: '#EF4444' },
  shortBreak: { minutes: 5, label: '短休息', color: '#10B981' },
  longBreak: { minutes: 15, label: '长休息', color: '#3B82F6' },
};

export const FocusMode: React.FC = () => {
  const { tasks, categories, toggleTaskComplete, addFocusSession, getTodayFocusTime } = useStore();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get today's incomplete tasks
  const todayTasks = tasks.filter(t => {
    const isToday = dayjs(t.startTime).isSame(dayjs(), 'day');
    return isToday && !t.isCompleted;
  });

  // Calculate today's focus time from store
  const todayFocusTime = getTodayFocusTime();

  // Memoized playSound function
  const playSound = useCallback(() => {
    // Create a simple beep sound
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    setTimeout(() => osc.stop(), 500);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      setIsRunning(false);
      playSound();

      if (mode === 'focus') {
        setCompletedPomodoros(prev => prev + 1);

        // Save focus session to IndexedDB
        addFocusSession({
          id: `session-${Date.now()}`,
          taskId: selectedTask?.id,
          duration: TIMER_CONFIG.focus.minutes * 60,
          completedAt: Date.now(),
          mode: 'focus',
        });

        // Auto-complete task if selected
        if (selectedTask) {
          toggleTaskComplete(selectedTask.id);
          setSelectedTask(null);
        }

        // Switch to break
        if ((completedPomodoros + 1) % 4 === 0) {
          setMode('longBreak');
          setTimeLeft(TIMER_CONFIG.longBreak.minutes * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(TIMER_CONFIG.shortBreak.minutes * 60);
        }
      } else {
        // Break finished, switch to focus
        setMode('focus');
        setTimeLeft(TIMER_CONFIG.focus.minutes * 60);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, completedPomodoros, selectedTask, addFocusSession, toggleTaskComplete, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_CONFIG[mode].minutes * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(TIMER_CONFIG[newMode].minutes * 60);
  };

  const progress = ((TIMER_CONFIG[mode].minutes * 60 - timeLeft) / (TIMER_CONFIG[mode].minutes * 60)) * 100;

  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Focus Mode</h1>
        <p className="text-gray-500">番茄工作法 · 专注计时</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Mode Selector */}
              <div className="flex justify-center gap-2 mb-8">
                {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      mode === m
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={mode === m ? { backgroundColor: TIMER_CONFIG[m].color } : {}}
                  >
                    {TIMER_CONFIG[m].label}
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={TIMER_CONFIG[mode].color}
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '754' }}
                    animate={{ strokeDasharray: `${754 * (1 - progress / 100)} 754` }}
                    transition={{ duration: 1 }}
                  />
                </svg>

                {/* Time Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <p className="text-6xl font-bold text-gray-800 tabular-nums">
                        {formatTime(timeLeft)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {isRunning ? '计时中...' : '已暂停'}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleTimer}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: TIMER_CONFIG[mode].color }}
                >
                  {isRunning ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-500">{completedPomodoros}</p>
                  <p className="text-xs text-gray-500">完成的番茄</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-500">{formatFocusTime(todayFocusTime)}</p>
                  <p className="text-xs text-gray-500">今日专注</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-500">{Math.floor(completedPomodoros / 4)}</p>
                  <p className="text-xs text-gray-500">完成的轮次</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Selection */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">选择专注任务</h3>

              {selectedTask ? (
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-200 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-10 rounded-full"
                      style={{
                        backgroundColor: categories.find(c => c.id === selectedTask.categoryId)?.color || '#6B7280'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {categories.find(c => c.id === selectedTask.categoryId)?.icon}{' '}
                        {selectedTask.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {dayjs(selectedTask.startTime).format('HH:mm')} - {dayjs(selectedTask.endTime).format('HH:mm')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">选择一个任务开始专注</p>
              )}

              <div className="space-y-2 max-h-64 overflow-auto">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => {
                    const cat = categories.find(c => c.id === task.categoryId);
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className="w-2 h-10 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat?.color || '#6B7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {cat?.icon} {task.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dayjs(task.startTime).format('HH:mm')}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    今日暂无任务
                  </p>
                )}
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700 font-medium mb-2">番茄工作法提示</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• 专注时不要切换任务</li>
                  <li>• 休息时真正放松</li>
                  <li>• 每4个番茄后长休息</li>
                </ul>
              </div>
            </div>

            {/* White Noise Panel */}
            <div className="mt-6">
              <WhiteNoisePanel compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
