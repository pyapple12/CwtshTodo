import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleView } from './components/ScheduleView';
import { AllTasks } from './components/AllTasks';
import { FocusMode } from './components/FocusMode';
import { FullCalendar } from './components/FullCalendar';
import { Habits } from './components/Habits';
import { DataManagement } from './components/DataManagement';
import { Settings } from './components/Settings';
import { CategoryManage } from './components/CategoryManage';
import { BottomNav } from './components/BottomNav';
import { DnDProviderWrapper } from './components/DnDProvider';
import { useStore } from './store';
import { useDefaultKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Loading } from './components/Loading';
import { useEffect } from 'react';

function App() {
  // All hooks must be called unconditionally at the top
  const { isLoading, loadData, isSettingsOpen, closeSettings, isCategoryManageOpen, closeCategoryManage } = useStore();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Enable keyboard shortcuts (works after loading, no-op during loading)
  useDefaultKeyboardShortcuts();

  const [activeItem, setActiveItem] = useState('today');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show loading screen while data loads
  if (isLoading) {
    return <Loading />;
  }

  const renderContent = () => {
    switch (activeItem) {
      case 'today':
        return <Dashboard />;
      case 'schedule':
        return <ScheduleView />;
      case 'tasks':
        return <AllTasks />;
      case 'focus':
        return <FocusMode />;
      case 'calendar':
        return <FullCalendar />;
      case 'habits':
        return <Habits />;
      case 'categories':
        return <Dashboard />; // Categories is handled via modal
      case 'backup':
        return <DataManagement />;
      case 'settings':
        return <Dashboard />; // Settings is handled via modal
      default:
        return <Dashboard />;
    }
  };

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <DnDProviderWrapper>
      <div className="flex h-screen bg-gray-50 overflow-hidden prevent-pull-to-refresh">
        {/* Desktop Sidebar - hidden on mobile */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col h-screen">
          <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden"
              >
                <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 touch-manipulation"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-gray-800">CwtshTodo</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-16 lg:pb-0">
            {renderContent()}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav activeItem={activeItem} onItemClick={handleItemClick} />
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && <Settings onClose={closeSettings} />}
        </AnimatePresence>

        {/* Category Manage Modal */}
        <AnimatePresence>
          {isCategoryManageOpen && <CategoryManage onClose={closeCategoryManage} />}
        </AnimatePresence>
      </div>
    </DnDProviderWrapper>
  );
}

export default App;
