/**
 * Web Worker utilities for offloading heavy computations in Figma plugins
 *
 * Note: This provides the infrastructure for web workers, but Figma plugins
 * have limitations on worker usage. Use this primarily for UI-side computations.
 */

/**
 * Message types for worker communication
 */
export interface WorkerMessage<T = any> {
  id: string;
  type: 'execute' | 'result' | 'error' | 'progress';
  data?: T;
  error?: string;
}

/**
 * Worker task definition
 */
export interface WorkerTask<TInput = any, TOutput = any> {
  id: string;
  taskType: string;
  input: TInput;
  resolve: (result: TOutput) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number, message?: string) => void;
  timeout?: number;
}

/**
 * Worker execution context for tasks
 */
export interface WorkerExecutionContext {
  postProgress: (progress: number, message?: string) => void;
  isCanceled: () => boolean;
}

/**
 * Task handler function type
 */
export type TaskHandler<TInput = any, TOutput = any> = (
  input: TInput,
  context: WorkerExecutionContext
) => Promise<TOutput> | TOutput;

/**
 * Enhanced worker manager with task queuing and progress tracking
 */
export class WorkerManager {
  private workers: Worker[] = [];
  private workerIndex = 0;
  private pendingTasks = new Map<string, WorkerTask>();
  private taskHandlers = new Map<string, TaskHandler>();
  private maxWorkers: number;
  private workerScript?: string;

  constructor(options: {
    maxWorkers?: number;
    workerScript?: string;
  } = {}) {
    this.maxWorkers = options.maxWorkers || Math.max(1, navigator.hardwareConcurrency - 1);
    this.workerScript = options.workerScript;
  }

  /**
   * Register a task handler for a specific task type
   */
  registerTaskHandler<TInput, TOutput>(
    taskType: string,
    handler: TaskHandler<TInput, TOutput>
  ): void {
    this.taskHandlers.set(taskType, handler);
  }

  /**
   * Execute a task with optional progress tracking
   */
  async executeTask<TInput, TOutput>(
    taskType: string,
    input: TInput,
    options: {
      timeout?: number;
      onProgress?: (progress: number, message?: string) => void;
    } = {}
  ): Promise<TOutput> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise<TOutput>((resolve, reject) => {
      const task: WorkerTask<TInput, TOutput> = {
        id: taskId,
        taskType,
        input,
        resolve,
        reject,
        onProgress: options.onProgress,
        timeout: options.timeout || 30000 // 30 second default timeout
      };

      this.pendingTasks.set(taskId, task);

      // Try to execute in worker, fallback to main thread
      if (this.workerScript && this.workers.length > 0) {
        this.executeInWorker(task);
      } else {
        this.executeInMainThread(task);
      }

      // Set timeout
      if (task.timeout) {
        setTimeout(() => {
          if (this.pendingTasks.has(taskId)) {
            this.pendingTasks.delete(taskId);
            reject(new Error(`Task ${taskType} timed out after ${task.timeout}ms`));
          }
        }, task.timeout);
      }
    });
  }

  /**
   * Execute task in a web worker
   */
  private executeInWorker<TInput, TOutput>(task: WorkerTask<TInput, TOutput>): void {
    const worker = this.getNextWorker();

    const message: WorkerMessage<TInput> = {
      id: task.id,
      type: 'execute',
      data: task.input
    };

    worker.postMessage(message);
  }

  /**
   * Execute task in main thread as fallback
   */
  private async executeInMainThread<TInput, TOutput>(
    task: WorkerTask<TInput, TOutput>
  ): Promise<void> {
    try {
      const handler = this.taskHandlers.get(task.taskType);
      if (!handler) {
        throw new Error(`No handler registered for task type: ${task.taskType}`);
      }

      let canceled = false;
      const context: WorkerExecutionContext = {
        postProgress: (progress: number, message?: string) => {
          if (task.onProgress && !canceled) {
            task.onProgress(progress, message);
          }
        },
        isCanceled: () => canceled
      };

      // Check if task was canceled while waiting
      if (!this.pendingTasks.has(task.id)) {
        canceled = true;
        return;
      }

      const result = await handler(task.input, context);

      // Only resolve if task hasn't been canceled/timed out
      if (this.pendingTasks.has(task.id)) {
        this.pendingTasks.delete(task.id);
        task.resolve(result);
      }
    } catch (error) {
      if (this.pendingTasks.has(task.id)) {
        this.pendingTasks.delete(task.id);
        task.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }

  /**
   * Get next available worker (round-robin)
   */
  private getNextWorker(): Worker {
    if (this.workers.length === 0) {
      throw new Error('No workers available');
    }

    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;
    return worker;
  }

  /**
   * Initialize workers (if worker script is available)
   */
  async initializeWorkers(): Promise<void> {
    if (!this.workerScript) {
      console.warn('No worker script provided, tasks will run on main thread');
      return;
    }

    try {
      for (let i = 0; i < this.maxWorkers; i++) {
        const worker = new Worker(this.workerScript);

        worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
          this.handleWorkerMessage(event.data);
        };

        worker.onerror = (error) => {
          console.error('Worker error:', error);
        };

        this.workers.push(worker);
      }

      console.log(`Initialized ${this.workers.length} workers`);
    } catch (error) {
      console.error('Failed to initialize workers:', error);
      // Continue without workers - tasks will run on main thread
    }
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(message: WorkerMessage): void {
    const task = this.pendingTasks.get(message.id);
    if (!task) {
      return; // Task may have timed out
    }

    switch (message.type) {
      case 'result':
        this.pendingTasks.delete(message.id);
        task.resolve(message.data);
        break;

      case 'error':
        this.pendingTasks.delete(message.id);
        task.reject(new Error(message.error || 'Worker task failed'));
        break;

      case 'progress':
        if (task.onProgress && message.data) {
          task.onProgress(message.data.progress, message.data.message);
        }
        break;
    }
  }

  /**
   * Cancel a pending task
   */
  cancelTask(taskId: string): boolean {
    if (this.pendingTasks.has(taskId)) {
      this.pendingTasks.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all pending tasks
   */
  cancelAllTasks(): void {
    this.pendingTasks.clear();
  }

  /**
   * Get number of pending tasks
   */
  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * Terminate all workers and cleanup
   */
  terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.pendingTasks.clear();
    this.taskHandlers.clear();
  }
}

/**
 * Singleton worker manager instance
 */
export const workerManager = new WorkerManager();

/**
 * Utility functions for common heavy computations
 */
export const ComputationTasks = {
  /**
   * Process large arrays in chunks
   */
  async processArray<T, R>(
    items: T[],
    processor: (item: T, index: number) => R | Promise<R>,
    options: {
      chunkSize?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<R[]> {
    const { chunkSize = 100, onProgress } = options;
    const results: R[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((item, chunkIndex) => processor(item, i + chunkIndex))
      );

      results.push(...chunkResults);

      if (onProgress) {
        const progress = Math.min(100, ((i + chunk.length) / items.length) * 100);
        onProgress(progress);
      }

      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  },

  /**
   * Debounce function execution
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: number | undefined;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve) => {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
          resolve(func(...args));
        }, delay);
      });
    };
  },

  /**
   * Throttle function execution
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecution = 0;

    return (...args: Parameters<T>): void => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        lastExecution = now;
        func(...args);
      }
    };
  }
};

/**
 * Register common task handlers
 */
workerManager.registerTaskHandler('processArray', async (input: {
  items: any[];
  processorString: string;
  chunkSize?: number;
}, context) => {
  const { items, processorString, chunkSize = 100 } = input;

  // Note: In a real worker, you'd need to reconstruct the processor function
  // This is a simplified example
  const results = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    if (context.isCanceled()) {
      throw new Error('Task was canceled');
    }

    const chunk = items.slice(i, i + chunkSize);
    // Process chunk here
    results.push(...chunk);

    const progress = Math.min(100, ((i + chunk.length) / items.length) * 100);
    context.postProgress(progress, `Processed ${i + chunk.length}/${items.length} items`);

    // Yield control
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
});
