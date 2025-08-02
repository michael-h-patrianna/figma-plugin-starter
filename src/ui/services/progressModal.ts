/**
 * Pimport { signal } from '@preact/signals';
import { generateId } from '@shared/utils';
import { sendToMain, usePluginMessages } from '../messaging';ress Modal Service
 *
 * Provides a global, easy-to-use progress modal system using Preact signals.
 * Can be called from anywhere in the application without prop drilling.
 * Supports multiple simultaneous progress modals with unique IDs.
 */

import { signal } from '@preact/signals';
import { generateId } from '@shared/utils';
import { sendToMain } from '@ui/messaging';

/**
 * Individual progress modal configuration
 */
export interface ProgressModal {
  /** Unique identifier for this progress modal */
  id: string;
  /** Whether this modal is currently visible */
  isVisible: boolean;
  /** Current progress value (0-100) */
  progress: number;
  /** Title displayed in the modal */
  title: string;
  /** Description/subtitle text */
  description?: string;
  /** Whether to show the close button */
  showCloseButton: boolean;
  /** Callback when the modal is closed */
  onClose?: () => void;
  /** Z-index for layering multiple modals */
  zIndex: number;
  /** Whether this modal can be dismissed by clicking outside */
  dismissOnClickOutside: boolean;
  /** Associated operation ID for main thread communication */
  operationId?: string;
}

/**
 * State interface for the Progress Modal service
 */
export interface ProgressModalState {
  /** Map of all active progress modals */
  modals: Map<string, ProgressModal>;
}

/**
 * Global signal for progress modal state
 */
export const progressModalState = signal<ProgressModalState>({
  modals: new Map()
});

/**
 * Base z-index for progress modals
 */
const BASE_Z_INDEX = 10000;

/**
 * Options for showing a progress modal
 */
export interface ShowProgressModalOptions {
  /** Title displayed in the modal */
  title: string;
  /** Description/subtitle text */
  description?: string;
  /** Initial progress value (0-100) - defaults to 0 */
  initialProgress?: number;
  /** Whether to show the close button - defaults to false */
  showCloseButton?: boolean;
  /** Callback when the modal is closed */
  onClose?: () => void;
  /** Whether this modal can be dismissed by clicking outside - defaults to false */
  dismissOnClickOutside?: boolean;
  /** Associated operation ID for main thread communication */
  operationId?: string;
}

/**
 * Shows a new progress modal and returns its unique ID.
 *
 * @param options - Configuration options for the progress modal
 * @returns The unique ID of the created progress modal
 *
 * @example
 * ```typescript
 * const modalId = ProgressModalService.show({
 *   title: 'Processing Files',
 *   description: 'Please wait while we process your files...',
 *   showCloseButton: false
 * });
 *
 * // Update progress
 * ProgressModalService.updateProgress(modalId, 50);
 *
 * // Close when done
 * ProgressModalService.hide(modalId);
 * ```
 */
export function showProgressModal(options: ShowProgressModalOptions): string {
  const {
    title,
    description,
    initialProgress = 0,
    showCloseButton = false,
    onClose,
    dismissOnClickOutside = false,
    operationId
  } = options;

  const id = generateId();
  const currentState = progressModalState.value;

  // Calculate z-index based on number of existing modals
  const zIndex = BASE_Z_INDEX + currentState.modals.size;

  const newModal: ProgressModal = {
    id,
    isVisible: true,
    progress: Math.max(0, Math.min(100, initialProgress)),
    title,
    description,
    showCloseButton,
    onClose,
    zIndex,
    dismissOnClickOutside,
    operationId
  };

  const newModals = new Map(currentState.modals);
  newModals.set(id, newModal);

  progressModalState.value = {
    modals: newModals
  };

  return id;
}

/**
 * Updates the progress of a specific progress modal.
 *
 * @param id - The unique ID of the progress modal
 * @param progress - New progress value (0-100)
 * @param options - Optional updates to other properties
 *
 * @example
 * ```typescript
 * ProgressModalService.updateProgress(modalId, 75, {
 *   description: 'Almost done...'
 * });
 * ```
 */
export function updateProgressModal(
  id: string,
  progress: number,
  options?: {
    title?: string;
    description?: string;
    showCloseButton?: boolean;
  }
): void {
  const currentState = progressModalState.value;
  const modal = currentState.modals.get(id);

  if (!modal) {
    console.warn(`Progress modal with ID "${id}" not found`);
    return;
  }

  const updatedModal: ProgressModal = {
    ...modal,
    progress: Math.max(0, Math.min(100, progress)),
    ...(options?.title !== undefined && { title: options.title }),
    ...(options?.description !== undefined && { description: options.description }),
    ...(options?.showCloseButton !== undefined && { showCloseButton: options.showCloseButton })
  };

  const newModals = new Map(currentState.modals);
  newModals.set(id, updatedModal);

  progressModalState.value = {
    modals: newModals
  };
}

/**
 * Hides and removes a specific progress modal.
 *
 * @param id - The unique ID of the progress modal to hide
 */
export function hideProgressModal(id: string): void {
  const currentState = progressModalState.value;
  const modal = currentState.modals.get(id);

  if (!modal) {
    console.warn(`Progress modal with ID "${id}" not found`);
    return;
  }

  // Call onClose callback if provided
  if (modal.onClose) {
    try {
      modal.onClose();
    } catch (error) {
      console.error('Error in progress modal onClose callback:', error);
    }
  }

  const newModals = new Map(currentState.modals);
  newModals.delete(id);

  progressModalState.value = {
    modals: newModals
  };
}

/**
 * Hides all currently displayed progress modals.
 */
export function hideAllProgressModals(): void {
  const currentState = progressModalState.value;

  // Call onClose callbacks for all modals
  currentState.modals.forEach(modal => {
    if (modal.onClose) {
      try {
        modal.onClose();
      } catch (error) {
        console.error('Error in progress modal onClose callback:', error);
      }
    }
  });

  progressModalState.value = {
    modals: new Map()
  };
}

/**
 * Gets the current state of a specific progress modal.
 *
 * @param id - The unique ID of the progress modal
 * @returns The progress modal data or undefined if not found
 */
export function getProgressModal(id: string): ProgressModal | undefined {
  return progressModalState.value.modals.get(id);
}

/**
 * Gets all currently active progress modals.
 *
 * @returns Array of all active progress modals
 */
export function getAllProgressModals(): ProgressModal[] {
  return Array.from(progressModalState.value.modals.values());
}

/**
 * Updates the progress of a modal by operationId.
 *
 * @param operationId - The unique operation ID
 * @param progress - The new progress value (0-100)
 * @param options - Optional properties to update
 */
export function updateProgressModalByOperationId(
  operationId: string,
  progress: number,
  options?: Partial<Pick<ProgressModal, 'title' | 'description' | 'showCloseButton'>>
): void {
  const currentState = progressModalState.value;

  // Find modal with matching operationId
  for (const [modalId, modal] of Array.from(currentState.modals.entries())) {
    if (modal.operationId === operationId) {
      updateProgressModal(modalId, progress, options);
      return;
    }
  }

  console.warn(`Progress modal with operationId "${operationId}" not found`);
}

/**
 * Hides a modal by operationId.
 *
 * @param operationId - The unique operation ID
 */
export function hideProgressModalByOperationId(operationId: string): void {
  const currentState = progressModalState.value;

  // Find modal with matching operationId
  for (const [modalId, modal] of Array.from(currentState.modals.entries())) {
    if (modal.operationId === operationId) {
      hideProgressModal(modalId);
      return;
    }
  }

  console.warn(`Progress modal with operationId "${operationId}" not found`);
}

/**
 * Convenience class with static methods for easier usage
 */
export const ProgressModalService = {
  /**
   * Show a new progress modal
   */
  show: showProgressModal,

  /**
   * Update progress and optionally other properties of a modal
   */
  update: updateProgressModal,

  /**
   * Hide a specific progress modal
   */
  hide: hideProgressModal,

  /**
   * Hide all progress modals
   */
  hideAll: hideAllProgressModals,

  /**
   * Get a specific progress modal
   */
  get: getProgressModal,

  /**
   * Get all active progress modals
   */
  getAll: getAllProgressModals,

  /**
   * Convenient method to show a simple progress modal with common defaults
   */
  simple: (title: string, description?: string) =>
    showProgressModal({ title, description, showCloseButton: false }),

  /**
   * Show a progress modal that can be manually closed
   */
  closeable: (title: string, description?: string, onClose?: () => void) =>
    showProgressModal({
      title,
      description,
      showCloseButton: true,
      onClose,
      dismissOnClickOutside: true
    }),

  /**
   * Show a progress modal with initial progress
   */
  withProgress: (title: string, initialProgress: number, description?: string) =>
    showProgressModal({ title, description, initialProgress }),

  /**
   * Simulate progress from 0 to 100 over a duration (for demos/testing)
   */
  simulate: (
    id: string,
    duration: number = 3000,
    onComplete?: () => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 20; // 20 steps for smooth animation
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps) * 100;

        updateProgressModal(id, progress);

        if (currentStep >= steps) {
          clearInterval(interval);
          if (onComplete) {
            onComplete();
          }
          resolve();
        }
      }, stepDuration);
    });
  },

  /**
   * Get current state (for debugging)
   */
  getState: () => progressModalState.value,

  /**
   * Shows a progress modal and immediately sends a message to the main thread.
   * This is the primary workflow: UI button → main thread → progress updates.
   * Returns both the modal ID and operation ID for tracking.
   *
   * @param options - Configuration options for the modal
   * @param messageType - The message type to send to main thread
   * @param messageData - The data to send with the message
   * @returns Object with modalId and operationId
   */
  startOperation: <T = any>(
    options: Omit<ShowProgressModalOptions, 'operationId'>,
    messageType: string,
    messageData?: T
  ): { modalId: string; operationId: string } => {
    const operationId = generateId();

    const modalId = showProgressModal({
      ...options,
      operationId
    });

    // Send message to main thread
    sendToMain(messageType, {
      operationId,
      ...messageData
    });

    return { modalId, operationId };
  }
};

// Re-export the hook from hooks directory
export { useProgressFromMainThread } from '../hooks/useProgressFromMainThread';
