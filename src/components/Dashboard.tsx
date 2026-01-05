import React from 'react';
import { ProgressChart } from './ProgressChart';
import { CategoryList } from './CategoryList';
import { CalendarCard } from './CalendarCard';
import { RingTimer } from './RingTimer';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 h-screen overflow-auto bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between z-10">
        {/* Search Box */}
        <div className="relative w-80">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tasks, events..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>

        {/* Right Action Group */}
        <div className="flex items-center gap-4">
          {/* Notification Icons */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
            U
          </div>
        </div>
      </div>

      {/* Dashboard Content - Grid Layout */}
      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Progress Chart */}
            <ProgressChart title="Focus Time" />

            {/* Category List */}
            <CategoryList title="Categories" />
          </div>

          {/* Right Column - Side Modules */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Calendar Card */}
            <CalendarCard title="Calendar" />

            {/* Ring Timer */}
            <RingTimer title="Focus Timer" timeText="25:00" />
          </div>
        </div>
      </div>
    </div>
  );
};
