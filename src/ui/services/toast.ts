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
  /** Count for consolidated messages */
  count?: number;
  /** Key for grouping similar messages */
  consolidationKey?: string;
  /** Priority level (higher = more important) */
  priority: number;
  /** Timestamp when toast was created */
  timestamp: number;
  /** Whether this toast should persist until manually dismissed */
  persist?: boolean;
}

/**
 * Interface for toast service state management.
 */
export interface ToastState {
  /** Array of currently active toasts */
  toasts: Toast[];
  /** Queue of toasts waiting to be displayed */
  queue: Toast[];
}

/**
 * Configuration for toast management behavior.
 */
export interface ToastConfig {
  /** Maximum number of toasts to display at once */
  maxVisible: number;
  /** Time window for consolidating similar messages (ms) */
  consolidationWindow: number;
  /** Default duration for auto-dismiss (ms) */
  defaultDuration: number;
}

/**
 * Default configuration for toast management.
 */
const DEFAULT_CONFIG: ToastConfig = {
  maxVisible: 3,
  consolidationWindow: 2000,
  defaultDuration: 3000
};

/**
 * Get priority value for toast type.
 */
function getToastPriority(type: Toast['type']): number {
  switch (type) {
    case 'error': return 3;
    case 'warning': return 2;
    case 'success':
    case 'info':
    default: return 1;
  }
}

/**
 * Generate a consolidation key for grouping similar messages.
 */
function generateConsolidationKey(message: string, type: Toast['type']): string {
  // Normalize message for consolidation
  const normalized = message.toLowerCase()
    .replace(/\d+/g, '#') // Replace numbers with #
    .replace(/["']/g, '') // Remove quotes
    .trim();

  return `${type}:${normalized}`;
}

/**
 * Global toast state using Preact signals.
 * This allows reactive updates across all components without prop drilling.
 */
export const toastState = signal<ToastState>({ toasts: [], queue: [] });

/**
 * Configuration options for showing a toast.
 */
export interface ToastOptions {
  /** How long to show the toast in milliseconds - defaults to 5000ms */
  duration?: number;
  /** Whether to allow multiple toasts or replace the current one */
  allowMultiple?: boolean;
  /** Whether this toast should persist until manually dismissed */
  persist?: boolean;
  /** Custom priority override */
  priority?: number;
  /** Whether to attempt consolidation with similar messages */
  consolidate?: boolean;
}

/**
 * Finds existing toast that can be consolidated with the new message.
 */
function findConsolidatableToast(
  message: string,
  type: Toast['type'],
  consolidationKey: string
): Toast | null {
  const currentState = toastState.value;
  const now = Date.now();

  return currentState.toasts.find(toast =>
    toast.consolidationKey === consolidationKey &&
    toast.type === type &&
    (now - toast.timestamp) < DEFAULT_CONFIG.consolidationWindow
  ) || null;
}

/**
 * Processes the toast queue and displays toasts up to the maximum visible limit.
 */
function processToastQueue(): void {
  const currentState = toastState.value;
  const { toasts, queue } = currentState;

  if (toasts.length >= DEFAULT_CONFIG.maxVisible || queue.length === 0) {
    return;
  }

  // Sort queue by priority (highest first), then by timestamp (oldest first)
  const sortedQueue = [...queue].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return a.timestamp - b.timestamp; // Older first
  });

  const toastsToShow = sortedQueue.slice(0, DEFAULT_CONFIG.maxVisible - toasts.length);
  const remainingQueue = sortedQueue.slice(DEFAULT_CONFIG.maxVisible - toasts.length);

  // Start timers for new toasts
  toastsToShow.forEach(toast => {
    if (!toast.persist) {
      const duration = toast.type === 'error' ? DEFAULT_CONFIG.defaultDuration * 2 : DEFAULT_CONFIG.defaultDuration;
      toast.timerId = setTimeout(() => {
        dismissToast(toast.id);
      }, duration);
    }
  });

  toastState.value = {
    toasts: [...toasts, ...toastsToShow],
    queue: remainingQueue
  };
}

/**
 * Removes old low-priority toasts to make room for new high-priority ones.
 */
function makeRoomForHighPriorityToast(newToastPriority: number): void {
  const currentState = toastState.value;
  const { toasts } = currentState;

  // Find the lowest priority toast that's older and lower priority
  const dismissibleToast = toasts
    .filter(toast => toast.priority < newToastPriority)
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority first
      }
      return a.timestamp - b.timestamp; // Older first
    })[0];

  if (dismissibleToast) {
    dismissToast(dismissibleToast.id);
  }
}

/**
 * Shows a toast notification with the specified message and type.
 *
 * This function manages the global toast state and automatically handles
 * dismissal after the specified duration. Supports consolidation, queuing,
 * and smart priority-based display management.
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
  const {
    duration,
    allowMultiple = true,
    persist = false,
    priority,
    consolidate = true
  } = options;

  const id = generateId(9);
  const timestamp = Date.now();
  const toastPriority = priority ?? getToastPriority(type);
  const consolidationKey = generateConsolidationKey(message, type);

  // Try to consolidate with existing toast if enabled
  if (consolidate && allowMultiple) {
    const existingToast = findConsolidatableToast(message, type, consolidationKey);
    if (existingToast) {
      // Update existing toast count and refresh timer
      const currentState = toastState.value;
      const updatedToasts = currentState.toasts.map(toast =>
        toast.id === existingToast.id
          ? {
            ...toast,
            count: (toast.count || 1) + 1,
            timestamp: timestamp // Refresh timestamp
          }
          : toast
      );

      // Clear old timer and set new one
      if (existingToast.timerId) {
        clearTimeout(existingToast.timerId);
      }

      const updatedToast = updatedToasts.find(t => t.id === existingToast.id);
      if (updatedToast && !persist) {
        const effectiveDuration = duration ?? (type === 'error' ? DEFAULT_CONFIG.defaultDuration * 2 : DEFAULT_CONFIG.defaultDuration);
        updatedToast.timerId = setTimeout(() => {
          dismissToast(updatedToast.id);
        }, effectiveDuration);
      }

      toastState.value = {
        ...currentState,
        toasts: updatedToasts
      };

      return existingToast.id;
    }
  }

  // Create new toast
  const newToast: Toast = {
    message,
    type,
    id,
    priority: toastPriority,
    timestamp,
    consolidationKey,
    count: 1,
    persist
  };

  const currentState = toastState.value;

  if (!allowMultiple) {
    // Clear existing toasts and show only this one
    currentState.toasts.forEach(toast => {
      if (toast.timerId) {
        clearTimeout(toast.timerId);
      }
    });

    // Set timer for new toast
    if (!persist) {
      const effectiveDuration = duration ?? (type === 'error' ? DEFAULT_CONFIG.defaultDuration * 2 : DEFAULT_CONFIG.defaultDuration);
      newToast.timerId = setTimeout(() => {
        dismissToast(id);
      }, effectiveDuration);
    }

    toastState.value = {
      toasts: [newToast],
      queue: []
    };
  } else {
    // Check if we need to make room for high priority toasts
    if (currentState.toasts.length >= DEFAULT_CONFIG.maxVisible && toastPriority > 1) {
      makeRoomForHighPriorityToast(toastPriority);
    }

    // Add to queue or display immediately
    if (currentState.toasts.length < DEFAULT_CONFIG.maxVisible) {
      // Display immediately
      if (!persist) {
        const effectiveDuration = duration ?? (type === 'error' ? DEFAULT_CONFIG.defaultDuration * 2 : DEFAULT_CONFIG.defaultDuration);
        newToast.timerId = setTimeout(() => {
          dismissToast(id);
        }, effectiveDuration);
      }

      toastState.value = {
        ...currentState,
        toasts: [...currentState.toasts, newToast]
      };
    } else {
      // Add to queue
      toastState.value = {
        ...currentState,
        queue: [...currentState.queue, newToast]
      };
    }
  }

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
      toasts: newToasts,
      queue: currentState.queue
    };

    // Process queue to show next toast if available
    processToastQueue();
  }
}

/**
 * Dismisses all currently displayed toasts and clears the queue.
 */
export function dismissAllToasts(): void {
  const currentState = toastState.value;

  // Clear all timers
  currentState.toasts.forEach(toast => {
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }
  });

  // Clear queue timers too (though they shouldn't have timers yet)
  currentState.queue.forEach(toast => {
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }
  });

  // Clear all toasts and queue
  toastState.value = { toasts: [], queue: [] };
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
    showToast(message, 'error', { persist: true }),

  /**
   * Show a single toast, replacing any existing ones
   */
  single: (message: string, type: Toast['type'] = 'info') =>
    showToast(message, type, { allowMultiple: false }),

  /**
   * Show a high-priority message that bypasses the queue
   */
  priority: (message: string, type: Toast['type'] = 'error') =>
    showToast(message, type, { priority: 3 }),

  /**
   * Show a consolidated message (auto-groups with similar messages)
   */
  consolidated: (message: string, type: Toast['type'] = 'info') =>
    showToast(message, type, { consolidate: true }),

  /**
   * Show multiple related messages efficiently
   */
  bulk: (messages: string[], type: Toast['type'] = 'info') => {
    if (messages.length === 0) return [];
    if (messages.length === 1) return [showToast(messages[0], type)];

    // For bulk messages, use consolidation and shorter duration
    return messages.map(message =>
      showToast(message, type, {
        consolidate: true,
        duration: 3000
      })
    );
  },

  /**
   * Show a summary message for multiple operations
   */
  summary: (count: number, operation: string, type: Toast['type'] = 'success') => {
    const message = count === 1
      ? `${operation}`
      : `${count} ${operation}s completed`;
    return showToast(message, type, { consolidate: false });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: dismissToast,

  /**
   * Dismiss all toasts
   */
  dismissAll: dismissAllToasts,

  /**
   * Get current toast state (for debugging or advanced usage)
   */
  getState: () => toastState.value,

  /**
   * Configure toast behavior
   */
  configure: (config: Partial<ToastConfig>) => {
    Object.assign(DEFAULT_CONFIG, config);
  }
};
