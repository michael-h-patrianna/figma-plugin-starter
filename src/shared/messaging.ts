/**
 * Bulletproof Messaging System
 *
 * This module provides a completely WASM-safe messaging system for Figma plugins.
 * It handles all the complexities of message passing while ensuring memory safety.
 */
import { clamp, sleep } from './utils';

/**
 * Standard message format for all plugin communications
 */
export interface PluginMessage<T = any> {
  type: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

/**
 * Progress update message format
 */
export interface ProgressMessage {
  progress: number; // 0-100
  message?: string;
  current?: number;
  total?: number;
  currentItem?: string;
}

/**
 * Error message format
 */
export interface ErrorMessage {
  error: string;
  details?: string;
  code?: string;
}

/**
 * WASM-SAFE: Send message from main thread to UI
 * This function ensures all data is serialized safely
 */
export function sendToUI<T = any>(type: string, data?: T): void {
  try {
    if (!type || typeof type !== 'string') {
      throw new Error('Message type must be a non-empty string');
    }

    // Ensure data is safely serializable
    let safeData: any = null;
    if (data !== undefined && data !== null) {
      try {
        // Test serialization to catch any problematic objects
        const testSerialization = JSON.stringify(data);
        safeData = JSON.parse(testSerialization);
      } catch (serializationError) {
        console.error('❌ Data serialization failed, sending error message instead:', serializationError);
        figma.ui.postMessage({
          type: 'ERROR',
          data: {
            error: 'Data serialization failed',
            originalType: type,
            details: serializationError instanceof Error ? serializationError.message : 'Unknown error'
          },
          timestamp: Date.now()
        });
        return;
      }
    }

    const message: PluginMessage<T> = {
      type,
      data: safeData,
      timestamp: Date.now()
    };

    console.log(`📤 Sending ${type} to UI`);
    figma.ui.postMessage(message);
  } catch (error) {
    console.error(`❌ Failed to send message ${type}:`, error);

    // Send error message as fallback
    try {
      figma.ui.postMessage({
        type: 'ERROR',
        data: {
          error: 'Message sending failed',
          originalType: type,
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: Date.now()
      });
    } catch (fallbackError) {
      console.error('❌ Even fallback message failed:', fallbackError);
    }
  }
}

/**
 * WASM-SAFE: Send progress update to UI
 */
export function sendProgress(progress: number, message?: string, current?: number, total?: number, currentItem?: string): void {
  const progressData: ProgressMessage = {
    progress: clamp(progress, 0, 100),
    message,
    current,
    total,
    currentItem
  };

  sendToUI('PROGRESS', progressData);
}

/**
 * WASM-SAFE: Send error message to UI
 */
export function sendError(error: string, details?: string, code?: string): void {
  const errorData: ErrorMessage = {
    error,
    details,
    code
  };

  sendToUI('ERROR', errorData);
}

/**
 * WASM-SAFE: Send success message with results
 */
export function sendSuccess<T = any>(type: string, data: T, summary?: string): void {
  sendToUI(`${type}_COMPLETE`, {
    success: true,
    data,
    summary: summary || `${type} completed successfully`,
    timestamp: Date.now()
  });
}

/**
 * Message handler type for UI side
 */
export type MessageHandler<T = any> = (data: T) => void;

/**
 * Message handlers map for UI side
 */
export interface MessageHandlers {
  [messageType: string]: MessageHandler<any>;
}

/**
 * WASM-SAFE: Extract message data safely on UI side
 */
export function extractMessageSafely(event: MessageEvent): PluginMessage | null {
  try {
    if (!event.data || !event.data.pluginMessage) {
      return null;
    }

    const msg = event.data.pluginMessage;

    // Validate message structure
    if (!msg.type || typeof msg.type !== 'string') {
      console.warn('Invalid message format: missing or invalid type');
      return null;
    }

    return {
      type: msg.type,
      data: msg.data,
      timestamp: msg.timestamp || Date.now(),
      requestId: msg.requestId
    };
  } catch (error) {
    console.error('Failed to extract message safely:', error);
    return null;
  }
}

/**
 * WASM-SAFE: Batch processing utility for large datasets
 */
export class SafeBatchProcessor<T, R> {
  private items: T[];
  private processor: (item: T, index: number) => Promise<R>;
  private batchSize: number;
  private onProgress?: (progress: number, current: number, total: number) => void;
  private onBatchComplete?: (batch: R[], batchIndex: number) => void;

  constructor(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    options: {
      batchSize?: number;
      onProgress?: (progress: number, current: number, total: number) => void;
      onBatchComplete?: (batch: R[], batchIndex: number) => void;
    } = {}
  ) {
    this.items = items;
    this.processor = processor;
    this.batchSize = options.batchSize || 10;
    this.onProgress = options.onProgress;
    this.onBatchComplete = options.onBatchComplete;
  }

  async process(): Promise<R[]> {
    const results: R[] = [];
    const total = this.items.length;

    for (let i = 0; i < total; i += this.batchSize) {
      const batch = this.items.slice(i, i + this.batchSize);
      const batchResults: R[] = [];

      for (let j = 0; j < batch.length; j++) {
        const globalIndex = i + j;
        try {
          const result = await this.processor(batch[j], globalIndex);
          batchResults.push(result);

          // Report progress
          if (this.onProgress) {
            const progress = Math.round(((globalIndex + 1) / total) * 100);
            this.onProgress(progress, globalIndex + 1, total);
          }
        } catch (error) {
          console.error(`Error processing item ${globalIndex}:`, error);
          // Continue processing other items
        }
      }

      results.push(...batchResults);

      // Report batch completion
      if (this.onBatchComplete) {
        this.onBatchComplete(batchResults, Math.floor(i / this.batchSize));
      }

      // Yield control to prevent blocking
      await sleep(1);
    }

    return results;
  }
}

/**
 * Common message types for standardized communication
 */
export const MessageTypes = {
  // Progress and status
  PROGRESS: 'PROGRESS',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',

  // Node operations
  SCAN_NODES: 'SCAN_NODES',
  SCAN_NODES_COMPLETE: 'SCAN_NODES_COMPLETE',

  // Frame operations
  ANALYZE_FRAMES: 'ANALYZE_FRAMES',
  ANALYZE_FRAMES_START: 'ANALYZE_FRAMES_START',
  ANALYZE_FRAMES_PROGRESS: 'ANALYZE_FRAMES_PROGRESS',
  ANALYZE_FRAMES_COMPLETE: 'ANALYZE_FRAMES_COMPLETE',

  // Selection operations
  GET_SELECTION: 'GET_SELECTION',
  GET_SELECTION_COMPLETE: 'GET_SELECTION_COMPLETE',

  // Utility operations
  PING: 'PING',
  PONG: 'PONG',
  RESIZE: 'RESIZE'
} as const;
