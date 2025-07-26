import { useEffect } from 'preact/hooks';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.metaKey === !!shortcut.metaKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey;

        if (matches) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Common keyboard shortcuts
export const commonShortcuts = {
  escape: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    action,
    description: 'Close/Cancel'
  }),

  enter: (action: () => void): KeyboardShortcut => ({
    key: 'Enter',
    action,
    description: 'Confirm/Submit'
  }),

  ctrlS: (action: () => void): KeyboardShortcut => ({
    key: 's',
    ctrlKey: true,
    action,
    description: 'Save (Ctrl+S)'
  }),

  cmdS: (action: () => void): KeyboardShortcut => ({
    key: 's',
    metaKey: true,
    action,
    description: 'Save (⌘+S)'
  }),

  ctrlZ: (action: () => void): KeyboardShortcut => ({
    key: 'z',
    ctrlKey: true,
    action,
    description: 'Undo (Ctrl+Z)'
  }),

  cmdZ: (action: () => void): KeyboardShortcut => ({
    key: 'z',
    metaKey: true,
    action,
    description: 'Undo (⌘+Z)'
  }),

  delete: (action: () => void): KeyboardShortcut => ({
    key: 'Delete',
    action,
    description: 'Delete'
  }),

  backspace: (action: () => void): KeyboardShortcut => ({
    key: 'Backspace',
    action,
    description: 'Delete/Back'
  })
};
