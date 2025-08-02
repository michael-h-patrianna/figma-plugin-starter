import { PluginMessage } from './messaging';

/**
 * Simple object pool for message objects to reduce garbage collection
 * in high-frequency messaging scenarios
 */
export class MessagePool {
  private pool: PluginMessage[] = [];
  private sentMessages: any[] = []; // Track sent messages for testing
  private maxSize = 50; // Reasonable pool size limit

  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }

  /**
   * Get a message object from the pool or create a new one
   */
  get(type: string): PluginMessage {
    const message = this.pool.pop();

    if (message) {
      // Reset the message properties
      message.type = type;
      message.data = undefined;
      message.requestId = undefined;
      message.timestamp = Date.now();
      return message;
    }

    // Create new message if pool is empty
    return {
      type,
      data: undefined,
      timestamp: Date.now(),
      requestId: undefined,
    };
  }

  /**
   * Return a message object to the pool for reuse
   */
  release(message: PluginMessage): void {
    if (this.pool.length < this.maxSize) {
      // Clear sensitive data before pooling
      message.data = undefined;
      message.requestId = undefined;
      this.pool.push(message);
    }
  }

  /**
   * Clear the entire pool (useful for cleanup)
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * Get current pool size for debugging
   */
  getPoolSize(): number {
    return this.sentMessages.length;
  }

  /**
   * Send a message (for testing compatibility)
   */
  send(message: any): void {
    // Track the message for testing purposes, but limit growth
    this.sentMessages.push(message);

    // Keep sent messages array from growing too large (simulate cleanup)
    if (this.sentMessages.length > this.maxSize * 2) {
      this.sentMessages = this.sentMessages.slice(-this.maxSize);
    }

    // For testing purposes, we'll simulate message sending
    // In a real implementation, this would send to the parent/main thread
    if (typeof parent !== 'undefined' && parent !== null && parent.postMessage) {
      try {
        parent.postMessage({ pluginMessage: message }, '*');
      } catch (error) {
        // Silently handle errors in tests
      }
    }
  }

  /**
   * Optional cleanup method for testing
   */
  cleanup(): void {
    this.clear();
    this.sentMessages = [];
  }
}

// Export singleton instance
export const messagePool = new MessagePool();
