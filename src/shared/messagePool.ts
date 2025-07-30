import { PluginMessage } from './messaging';

/**
 * Simple object pool for message objects to reduce garbage collection
 * in high-frequency messaging scenarios
 */
class MessagePool {
  private pool: PluginMessage[] = [];
  private maxSize = 50; // Reasonable pool size limit

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
    return this.pool.length;
  }
}

// Export singleton instance
export const messagePool = new MessagePool();
