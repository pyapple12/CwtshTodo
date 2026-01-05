import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataManagement } from './components/DataManagement';
import { Settings } from './components/Settings';
import { DnDProviderWrapper } from './components/DnDProvider';
import { useStore } from './store';

function App() {
  const [activeItem, setActiveItem] = useState('today');
  const { isSettingsOpen, closeSettings } = useStore();

  const renderContent = () => {
    switch (activeItem) {
      case 'settings':
        return null;
      case 'backup':
        return <DataManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DnDProviderWrapper>
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar */}
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

        {/* Main Content */}
        {renderContent()}

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && <Settings onClose={closeSettings} />}
        </AnimatePresence>
      </div>
    </DnDProviderWrapper>
  );
}

export default App;
