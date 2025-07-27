import { useEffect } from 'preact/hooks';

/**
 * Configuration object for defining a keyboard shortcut.
 */
interface KeyboardShortcut {
  /** The key to listen for (case-insensitive) */
  key: string;
  /** Whether the Ctrl key must be pressed (Windows/Linux) */
  ctrlKey?: boolean;
  /** Whether the Meta key must be pressed (Mac Command key) */
  metaKey?: boolean;
  /** Whether the Shift key must be pressed */
  shiftKey?: boolean;
  /** Whether the Alt key must be pressed */
  altKey?: boolean;
  /** Function to execute when the shortcut is triggered */
  action: () => void;
  /** Optional description for documentation or help displays */
  description?: string;
}

/**
 * Custom hook for managing keyboard shortcuts in a Figma plugin.
 *
 * Listens for keyboard events and executes actions when matching shortcuts are pressed.
 * Automatically prevents default behavior and stops propagation for matched shortcuts.
 *
 * @param shortcuts - Array of keyboard shortcut configurations to listen for
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'Escape',
 *     action: () => setModalOpen(false),
 *     description: 'Close modal'
 *   },
 *   {
 *     key: 's',
 *     ctrlKey: true,
 *     action: () => saveDocument(),
 *     description: 'Save document'
 *   }
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    /**
     * Handles keydown events and matches them against configured shortcuts.
     *
     * @param event - The keyboard event to process
     */
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

/**
 * Collection of commonly used keyboard shortcuts with predefined configurations.
 *
 * Provides factory functions that return KeyboardShortcut objects for typical
 * plugin interactions like save, undo, close, etc.
 */
export const commonShortcuts = {
  /**
   * Creates an Escape key shortcut for closing/canceling actions.
   *
   * @param action - Function to execute when Escape is pressed
   * @returns Configured KeyboardShortcut for Escape key
   */
  escape: (action: () => void): KeyboardShortcut => ({
    key: 'Escape',
    action,
    description: 'Close/Cancel'
  }),

  /**
   * Creates an Enter key shortcut for confirming/submitting actions.
   *
   * @param action - Function to execute when Enter is pressed
   * @returns Configured KeyboardShortcut for Enter key
   */
  enter: (action: () => void): KeyboardShortcut => ({
    key: 'Enter',
    action,
    description: 'Confirm/Submit'
  }),

  /**
   * Creates a Ctrl+S shortcut for save actions (Windows/Linux).
   *
   * @param action - Function to execute when Ctrl+S is pressed
   * @returns Configured KeyboardShortcut for Ctrl+S
   */
  ctrlS: (action: () => void): KeyboardShortcut => ({
    key: 's',
    ctrlKey: true,
    action,
    description: 'Save (Ctrl+S)'
  }),

  /**
   * Creates a Cmd+S shortcut for save actions (Mac).
   *
   * @param action - Function to execute when Cmd+S is pressed
   * @returns Configured KeyboardShortcut for Cmd+S
   */
  cmdS: (action: () => void): KeyboardShortcut => ({
    key: 's',
    metaKey: true,
    action,
    description: 'Save (⌘+S)'
  }),

  /**
   * Creates a Ctrl+Z shortcut for undo actions (Windows/Linux).
   *
   * @param action - Function to execute when Ctrl+Z is pressed
   * @returns Configured KeyboardShortcut for Ctrl+Z
   */
  ctrlZ: (action: () => void): KeyboardShortcut => ({
    key: 'z',
    ctrlKey: true,
    action,
    description: 'Undo (Ctrl+Z)'
  }),

  /**
   * Creates a Cmd+Z shortcut for undo actions (Mac).
   *
   * @param action - Function to execute when Cmd+Z is pressed
   * @returns Configured KeyboardShortcut for Cmd+Z
   */
  cmdZ: (action: () => void): KeyboardShortcut => ({
    key: 'z',
    metaKey: true,
    action,
    description: 'Undo (⌘+Z)'
  }),

  /**
   * Creates a Delete key shortcut for delete actions.
   *
   * @param action - Function to execute when Delete is pressed
   * @returns Configured KeyboardShortcut for Delete key
   */
  delete: (action: () => void): KeyboardShortcut => ({
    key: 'Delete',
    action,
    description: 'Delete'
  }),

  /**
   * Creates a Backspace key shortcut for delete/back actions.
   *
   * @param action - Function to execute when Backspace is pressed
   * @returns Configured KeyboardShortcut for Backspace key
   */
  backspace: (action: () => void): KeyboardShortcut => ({
    key: 'Backspace',
    action,
    description: 'Delete/Back'
  })
};
