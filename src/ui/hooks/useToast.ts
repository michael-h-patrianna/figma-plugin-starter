import { useCallback, useRef, useState } from 'preact/hooks';

/**
 * Interface for a toast notification object.
 */
export interface Toast {
  /** The message text to display in the toast */
  message: string;
  /** The type of toast which determines styling and icon */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Unique identifier for the toast */
  id: string;
}

/**
 * Custom hook for managing toast notifications in a Figma plugin.
 *
 * Provides functionality to show different types of toast messages with automatic
 * dismissal after a specified duration, as well as manual dismissal capability.
 *
 * @returns Object containing the current toast, showToast function, and dismissToast function
 *
 * @example
 * ```tsx
 * const { toast, showToast, dismissToast } = useToast();
 *
 * // Show different types of toasts
 * showToast('Success message!', 'success');
 * showToast('Error occurred', 'error');
 * showToast('Warning message', 'warning', 3000); // Custom duration
 *
 * // Manually dismiss
 * dismissToast();
 *
 * // Render the toast
 * {toast && <Toast toast={toast} onDismiss={dismissToast} />}
 * ```
 */
export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timeoutRef = useRef<number | null>(null);

  /**
   * Shows a toast notification with the specified message and type.
   *
   * Automatically dismisses the toast after the specified duration.
   * Only one toast can be shown at a time - new toasts replace existing ones.
   *
   * @param message - The text message to display in the toast
   * @param type - The type of toast (affects styling and icon) - defaults to 'info'
   * @param duration - How long to show the toast in milliseconds - defaults to 5000ms
   * @returns The unique ID of the created toast
   */
  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { message, type, id };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(newToast);

    // Auto-dismiss after duration
    timeoutRef.current = setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
      timeoutRef.current = null;
    }, duration);

    return id;
  }, []);

  /**
   * Manually dismisses the currently displayed toast.
   *
   * Clears any pending auto-dismissal timeouts and immediately hides the toast.
   */
  const dismissToast = useCallback(() => {
    setToast(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    toast,
    showToast,
    dismissToast
  };
}
