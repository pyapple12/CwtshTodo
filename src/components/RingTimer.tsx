import React from 'react';

interface RingTimerProps {
  title: string;
  timeText: string;
  progress?: number;
}

export const RingTimer: React.FC<RingTimerProps> = ({ title, timeText, progress = 65 }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = ['#10B981', '#14B8A6', '#EAB308', '#F97316', '#EF4444', '#8B5CF6'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      {/* Ring progress */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-40 h-40">
          {/* Background rings */}
          <svg className="w-full h-full transform -rotate-90">
            {colors.map((color, i) => (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius - i * 8}
                fill="none"
                stroke={color}
                strokeWidth="8"
                opacity="0.15"
              />
            ))}
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="20%" stopColor="#14B8A6" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="60%" stopColor="#F97316" />
                <stop offset="80%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{timeText}</span>
            <span className="text-xs text-gray-500 mt-1">remaining</span>
          </div>
        </div>
      </div>

      {/* Percent labels */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Completed', value: '65%' },
          { label: 'Focus', value: '45%' },
          { label: 'Breaks', value: '20%' },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
