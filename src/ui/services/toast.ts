import { signal } from '@preact/signals';
import { generateId } from '@shared/utils';

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
  /** Auto-dismiss timer reference */
  timerId?: number;
}

/**
 * Interface for toast service state management.
 */
export interface ToastState {
  /** Array of currently active toasts */
  toasts: Toast[];
}

/**
 * Global toast state using Preact signals.
 * This allows reactive updates across all components without prop drilling.
 */
export const toastState = signal<ToastState>({ toasts: [] });

/**
 * Configuration options for showing a toast.
 */
export interface ToastOptions {
  /** How long to show the toast in milliseconds - defaults to 5000ms */
  duration?: number;
  /** Whether to allow multiple toasts or replace the current one */
  allowMultiple?: boolean;
}

/**
 * Shows a toast notification with the specified message and type.
 *
 * This function manages the global toast state and automatically handles
 * dismissal after the specified duration. Supports both single and multiple
 * toast displays based on configuration.
 *
 * @param message - The text message to display in the toast
 * @param type - The type of toast (affects styling and icon) - defaults to 'info'
 * @param options - Configuration options for the toast
 * @returns The unique ID of the created toast
 */
export function showToast(
  message: string,
  type: Toast['type'] = 'info',
  options: ToastOptions = {}
): string {
  const { duration = 5000, allowMultiple = true } = options;
  const id = generateId(9);

  const newToast: Toast = { message, type, id };

  // Update state
  const currentState = toastState.value;

  if (allowMultiple) {
    // Add to existing toasts
    toastState.value = {
      toasts: [...currentState.toasts, newToast]
    };
  } else {
    // Clear existing toasts and show only this one
    // Clear any existing timers first
    currentState.toasts.forEach(toast => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    });

    toastState.value = {
      toasts: [newToast]
    };
  }

  // Auto-dismiss after duration
  const timerId = setTimeout(() => {
    dismissToast(id);
  }, duration);

  // Store timer reference
  newToast.timerId = timerId;

  return id;
}

/**
 * Dismisses a specific toast by its ID.
 *
 * @param id - The unique ID of the toast to dismiss
 */
export function dismissToast(id: string): void {
  const currentState = toastState.value;
  const toastIndex = currentState.toasts.findIndex(toast => toast.id === id);

  if (toastIndex >= 0) {
    const toast = currentState.toasts[toastIndex];

    // Clear timer if it exists
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }

    // Remove from array
    const newToasts = [...currentState.toasts];
    newToasts.splice(toastIndex, 1);

    toastState.value = {
      toasts: newToasts
    };
  }
}

/**
 * Dismisses all currently displayed toasts.
 */
export function dismissAllToasts(): void {
  const currentState = toastState.value;

  // Clear all timers
  currentState.toasts.forEach(toast => {
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }
  });

  // Clear all toasts
  toastState.value = { toasts: [] };
}

/**
 * Quick utility functions for common toast scenarios
 */
export const Toast = {
  /**
   * Show a success message
   */
  success: (message: string, options?: ToastOptions) =>
    showToast(message, 'success', options),

  /**
   * Show an error message
   */
  error: (message: string, options?: ToastOptions) =>
    showToast(message, 'error', options),

  /**
   * Show a warning message
   */
  warning: (message: string, options?: ToastOptions) =>
    showToast(message, 'warning', options),

  /**
   * Show an info message
   */
  info: (message: string, options?: ToastOptions) =>
    showToast(message, 'info', options),

  /**
   * Show a quick success message with shorter duration
   */
  quickSuccess: (message: string) =>
    showToast(message, 'success', { duration: 2000 }),

  /**
   * Show a persistent error that requires manual dismissal
   */
  persistentError: (message: string) =>
    showToast(message, 'error', { duration: 10000 }),

  /**
   * Show a single toast, replacing any existing ones
   */
  single: (message: string, type: Toast['type'] = 'info') =>
    showToast(message, type, { allowMultiple: false }),

  /**
   * Dismiss a specific toast
   */
  dismiss: dismissToast,

  /**
   * Dismiss all toasts
   */
  dismissAll: dismissAllToasts
};
