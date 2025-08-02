/**
 * Progress Manager Service
 *
 * A single modal that displays multiple progress operations in a clean list,
 * similar to Windows File Explorer or macOS Finder progress windows.
 * Each operation gets its own progress bar within the same modal.
 */

import { signal } from '@preact/signals';
import { generateId } from '@shared/utils';
import { sendToMain } from '@ui/messaging';

/**
 * Individual progress operation
 */
export interface ProgressOperation {
  /** Unique identifier for this operation */
  id: string;
  /** Operation ID for main thread communication */
  operationId: string;
  /** Title/name of the operation */
  title: string;
  /** Current description/status */
  description?: string;
  /** Current progress value (0-100) */
  progress: number;
  /** Total items being processed */
  total?: number;
  /** Current item being processed */
  current?: number;
  /** Whether this operation can be cancelled */
  cancellable: boolean;
  /** Whether the operation is completed */
  completed: boolean;
  /** Whether the operation failed */
  failed: boolean;
  /** Error message if failed */
  error?: string;
  /** Timestamp when operation started */
  startTime: number;
  /** Timestamp when operation completed/failed */
  endTime?: number;
}

/**
 * Progress Manager state
 */
export interface ProgressManagerState {
  /** Whether the progress manager modal is visible */
  isVisible: boolean;
  /** Map of all operations (active and completed) */
  operations: Map<string, ProgressOperation>;
  /** Whether to auto-hide when all operations complete */
  autoHide: boolean;
}

/**
 * Global signal for progress manager state
 */
export const progressManagerState = signal<ProgressManagerState>({
  isVisible: false,
  operations: new Map(),
  autoHide: true
});

/**
 * Options for starting a new operation
 */
export interface StartOperationOptions {
  /** Title/name of the operation */
  title: string;
  /** Initial description */
  description?: string;
  /** Whether this operation can be cancelled */
  cancellable?: boolean;
  /** Total items to process (optional) */
  total?: number;
}

/**
 * Start a new operation and send message to main thread
 *
 * @param options - Operation configuration
 * @param messageType - Message type to send to main thread
 * @param messageData - Additional data for main thread
 * @returns Object with operationId for tracking
 */
export function startOperation<T = any>(
  options: StartOperationOptions,
  messageType: string,
  messageData?: T
): { operationId: string } {
  const operationId = generateId();
  const id = generateId();

  const operation: ProgressOperation = {
    id,
    operationId,
    title: options.title,
    description: options.description,
    progress: 0,
    total: options.total,
    current: 0,
    cancellable: options.cancellable ?? false,
    completed: false,
    failed: false,
    startTime: Date.now()
  };

  // Add operation to state
  const currentState = progressManagerState.value;
  const newOperations = new Map(currentState.operations);
  newOperations.set(operationId, operation);

  progressManagerState.value = {
    ...currentState,
    isVisible: true, // Show modal when operation starts
    operations: newOperations
  };

  // Send message to main thread
  sendToMain(messageType, {
    operationId,
    ...messageData
  });

  return { operationId };
}

/**
 * Update progress for an operation
 *
 * @param operationId - The operation ID
 * @param progress - Progress value (0-100)
 * @param options - Optional updates
 */
export function updateProgress(
  operationId: string,
  progress: number,
  options?: {
    description?: string;
    current?: number;
    total?: number;
  }
): void {
  const currentState = progressManagerState.value;
  const operation = currentState.operations.get(operationId);

  if (!operation) {
    console.warn(`Progress operation with ID "${operationId}" not found`);
    return;
  }

  const updatedOperation: ProgressOperation = {
    ...operation,
    progress: Math.max(0, Math.min(100, progress)),
    ...(options?.description !== undefined && { description: options.description }),
    ...(options?.current !== undefined && { current: options.current }),
    ...(options?.total !== undefined && { total: options.total })
  };

  const newOperations = new Map(currentState.operations);
  newOperations.set(operationId, updatedOperation);

  progressManagerState.value = {
    ...currentState,
    operations: newOperations
  };
}

/**
 * Mark an operation as completed
 *
 * @param operationId - The operation ID
 * @param options - Optional completion details
 */
export function completeOperation(
  operationId: string,
  options?: {
    description?: string;
  }
): void {
  const currentState = progressManagerState.value;
  const operation = currentState.operations.get(operationId);

  if (!operation) {
    console.warn(`Progress operation with ID "${operationId}" not found`);
    return;
  }

  const updatedOperation: ProgressOperation = {
    ...operation,
    progress: 100,
    completed: true,
    endTime: Date.now(),
    ...(options?.description && { description: options.description })
  };

  const newOperations = new Map(currentState.operations);
  newOperations.set(operationId, updatedOperation);

  // Check if all operations are complete and auto-hide
  const allComplete = Array.from(newOperations.values()).every(op => op.completed || op.failed);
  const shouldHide = currentState.autoHide && allComplete;

  progressManagerState.value = {
    ...currentState,
    operations: newOperations,
    isVisible: !shouldHide
  };
}

/**
 * Mark an operation as failed
 *
 * @param operationId - The operation ID
 * @param error - Error message
 */
export function failOperation(
  operationId: string,
  error: string
): void {
  const currentState = progressManagerState.value;
  const operation = currentState.operations.get(operationId);

  if (!operation) {
    console.warn(`Progress operation with ID "${operationId}" not found`);
    return;
  }

  const updatedOperation: ProgressOperation = {
    ...operation,
    failed: true,
    error,
    endTime: Date.now()
  };

  const newOperations = new Map(currentState.operations);
  newOperations.set(operationId, updatedOperation);

  progressManagerState.value = {
    ...currentState,
    operations: newOperations
  };
}

/**
 * Cancel an operation (if cancellable)
 *
 * @param operationId - The operation ID
 */
export function cancelOperation(operationId: string): void {
  const currentState = progressManagerState.value;
  const operation = currentState.operations.get(operationId);

  if (!operation) {
    console.warn(`Progress operation with ID "${operationId}" not found`);
    return;
  }

  if (!operation.cancellable) {
    console.warn(`Operation "${operationId}" is not cancellable`);
    return;
  }

  // Send cancellation message to main thread
  sendToMain('CANCEL_OPERATION', { operationId });

  // Mark as failed with cancellation message
  failOperation(operationId, 'Operation cancelled by user');
}

/**
 * Remove completed/failed operations from the list
 */
export function clearCompletedOperations(): void {
  const currentState = progressManagerState.value;
  const newOperations = new Map();

  // Keep only active operations
  currentState.operations.forEach((operation, id) => {
    if (!operation.completed && !operation.failed) {
      newOperations.set(id, operation);
    }
  });

  // Hide modal if no operations remain
  const shouldHide = newOperations.size === 0;

  progressManagerState.value = {
    ...currentState,
    operations: newOperations,
    isVisible: !shouldHide
  };
}

/**
 * Show the progress manager modal
 */
export function showProgressManager(): void {
  const currentState = progressManagerState.value;
  progressManagerState.value = {
    ...currentState,
    isVisible: true
  };
}

/**
 * Hide the progress manager modal
 */
export function hideProgressManager(): void {
  const currentState = progressManagerState.value;
  progressManagerState.value = {
    ...currentState,
    isVisible: false
  };
}

/**
 * Get all active operations
 */
export function getActiveOperations(): ProgressOperation[] {
  const currentState = progressManagerState.value;
  return Array.from(currentState.operations.values()).filter(
    op => !op.completed && !op.failed
  );
}

/**
 * Get all operations (active and completed)
 */
export function getAllOperations(): ProgressOperation[] {
  const currentState = progressManagerState.value;
  return Array.from(currentState.operations.values());
}

/**
 * Convenience service object
 */
export const ProgressManagerService = {
  start: startOperation,
  update: updateProgress,
  complete: completeOperation,
  fail: failOperation,
  cancel: cancelOperation,
  clearCompleted: clearCompletedOperations,
  show: showProgressManager,
  hide: hideProgressManager,
  getActive: getActiveOperations,
  getAll: getAllOperations,
  getState: () => progressManagerState.value
};
