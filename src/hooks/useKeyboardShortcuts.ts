import { useEffect } from 'react';
import { useStore } from '../store';

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const { openAddTask, openSettings, openDataManagement } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
        const metaMatch = shortcut.meta ? e.metaKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          metaMatch &&
          shiftMatch
        ) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, openAddTask, openSettings, openDataManagement]);
}

// Default shortcuts for the app
export function useDefaultKeyboardShortcuts() {
  const { openAddTask, openSettings, openDataManagement } = useStore();

  useKeyboardShortcuts([
    { key: 'n', action: () => openAddTask() },
    { key: 'a', action: () => openAddTask() },
    { key: ',', action: () => openSettings() },
    { key: 's', action: () => openSettings() },
    { key: '/', action: () => openDataManagement() },
  ]);
}
