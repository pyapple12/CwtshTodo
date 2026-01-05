import React, { useState } from 'react';

interface ProgressChartProps {
  title: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ title }) => {
  const [hovered, setHovered] = useState(false);

  const segments = [
    { color: '#10B981', width: 25 }, // green
    { color: '#14B8A6', width: 15 }, // teal
    { color: '#EAB308', width: 20 }, // yellow
    { color: '#F97316', width: 15 }, // orange
    { color: '#EF4444', width: 10 }, // red
    { color: '#8B5CF6', width: 15 }, // purple
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-gray-50 rounded-lg" style={{
          backgroundImage: `
            linear-gradient(to right, #E5E7EB 1px, transparent 1px),
            linear-gradient(to bottom, #E5E7EB 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {/* Progress bar */}
        <div className="relative h-12 rounded-lg overflow-hidden flex">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="h-full flex items-center justify-center"
              style={{ width: `${seg.width}%`, backgroundColor: seg.color }}
            />
          ))}
        </div>

        {/* Data markers */}
        <div className="absolute top-0 left-[40%] transform -translate-x-1/2">
          <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-md" />
        </div>
        <div className="absolute top-0 left-[75%] transform -translate-x-1/2">
          <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white shadow-md" />
        </div>

        {/* Hover tooltip */}
        {hovered && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
            Focus Time: 75%
          </div>
        )}
      </div>
    </div>
  );
};
