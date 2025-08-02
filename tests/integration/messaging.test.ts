/**
 * Integration tests for message passing between UI and main threads
 * Tests the communication layer that's critical for Figma plugins
 */

import { MessagePool } from '../../src/shared/messagePool';

// Mock for the main thread environment
const mockMainThread = {
  messages: [] as any[],
  onMessage: null as ((message: any) => void) | null,

  // Simulate receiving a message from UI
  receiveMessage: function (message: any) {
    this.messages.push(message);
    if (this.onMessage) {
      this.onMessage(message);
    }
  },

  // Simulate sending a message to UI
  sendToUI: function (message: any) {
    if (global.mockUIThread.onMessage) {
      global.mockUIThread.onMessage(message);
    }
  }
};

// Mock for the UI thread environment
const mockUIThread = {
  messages: [] as any[],
  onMessage: null as ((message: any) => void) | null,

  // Simulate receiving a message from main
  receiveMessage: function (message: any) {
    this.messages.push(message);
    if (this.onMessage) {
      this.onMessage(message);
    }
  },

  // Simulate postMessage to main thread
  postMessage: function (message: any) {
    mockMainThread.receiveMessage(message.pluginMessage);
  }
};

// Set up global mocks
global.mockMainThread = mockMainThread;
global.mockUIThread = mockUIThread;

// Mock parent for UI thread
global.parent = {
  postMessage: mockUIThread.postMessage
} as any;

describe('UI to Main Thread Communication', () => {
  let messagePool: MessagePool;

  beforeEach(() => {
    messagePool = new MessagePool();
    mockMainThread.messages = [];
    mockUIThread.messages = [];
    mockMainThread.onMessage = null;
    mockUIThread.onMessage = null;
  });

  describe('Basic Message Passing', () => {
    test('sends simple message from UI to main', () => {
      const testMessage = { type: 'TEST_MESSAGE', data: { test: true } };

      messagePool.send(testMessage);

      expect(mockMainThread.messages).toHaveLength(1);
      expect(mockMainThread.messages[0]).toEqual(testMessage);
    });

    test('handles message with no data', () => {
      const testMessage = { type: 'SIMPLE_MESSAGE' };

      messagePool.send(testMessage);

      expect(mockMainThread.messages).toHaveLength(1);
      expect(mockMainThread.messages[0]).toEqual(testMessage);
    });

    test('preserves message structure and types', () => {
      const complexMessage = {
        type: 'COMPLEX_MESSAGE',
        data: {
          nodes: [{ id: '1', name: 'test' }],
          settings: { theme: 'dark', debug: true },
          timestamp: Date.now()
        }
      };

      messagePool.send(complexMessage);

      expect(mockMainThread.messages[0]).toEqual(complexMessage);
    });
  });

  describe('Message Pool Functionality', () => {
    test('tracks message pool size', () => {
      const initialSize = messagePool.getPoolSize();

      messagePool.send({ type: 'TEST_1' });
      messagePool.send({ type: 'TEST_2' });

      expect(messagePool.getPoolSize()).toBeGreaterThan(initialSize);
    });

    test('handles multiple rapid messages', () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        type: 'RAPID_MESSAGE',
        data: { index: i }
      }));

      messages.forEach(msg => messagePool.send(msg));

      expect(mockMainThread.messages).toHaveLength(10);
      expect(mockMainThread.messages[9].data.index).toBe(9);
    });

    test('manages pool cleanup', () => {
      // Send messages to populate pool
      for (let i = 0; i < 5; i++) {
        messagePool.send({ type: 'CLEANUP_TEST', data: { i } });
      }

      const sizeBeforeCleanup = messagePool.getPoolSize();

      // Force cleanup (implementation dependent)
      messagePool.cleanup?.();

      // Pool should be managed appropriately
      expect(messagePool.getPoolSize()).toBeLessThanOrEqual(sizeBeforeCleanup);
    });
  });

  describe('Bidirectional Communication', () => {
    test('UI receives response from main thread', (done) => {
      // Set up response handler in UI
      mockUIThread.onMessage = (message) => {
        expect(message.type).toBe('RESPONSE_MESSAGE');
        expect(message.data.success).toBe(true);
        done();
      };

      // Set up main thread to respond
      mockMainThread.onMessage = (message) => {
        if (message.type === 'REQUEST_MESSAGE') {
          mockMainThread.sendToUI({
            type: 'RESPONSE_MESSAGE',
            data: { success: true, requestId: message.data.requestId }
          });
        }
      };

      // Send request from UI
      messagePool.send({
        type: 'REQUEST_MESSAGE',
        data: { requestId: 'test-123' }
      });
    });

    test('handles message flow for node scanning', (done) => {
      let step = 0;

      // UI receives scan results
      mockUIThread.onMessage = (message) => {
        if (message.type === 'SCAN_RESULTS') {
          expect(message.data.nodes).toBeDefined();
          expect(message.data.nodes).toHaveLength(2);
          done();
        }
      };

      // Main thread processes scan request
      mockMainThread.onMessage = (message) => {
        if (message.type === 'SCAN_NODES') {
          // Simulate node scanning
          const mockResults = {
            nodes: [
              { id: '1', name: 'Frame 1', type: 'FRAME' },
              { id: '2', name: 'Rectangle 1', type: 'RECTANGLE' }
            ],
            timestamp: Date.now()
          };

          mockMainThread.sendToUI({
            type: 'SCAN_RESULTS',
            data: mockResults
          });
        }
      };

      // Trigger scan from UI
      messagePool.send({ type: 'SCAN_NODES' });
    });
  });

  describe('Error Handling', () => {
    test('handles malformed messages gracefully', () => {
      // This should not crash the system
      expect(() => {
        messagePool.send(null as any);
      }).not.toThrow();

      expect(() => {
        messagePool.send(undefined as any);
      }).not.toThrow();
    });

    test('handles message sending when parent is unavailable', () => {
      const originalParent = global.parent;
      global.parent = null as any;

      expect(() => {
        messagePool.send({ type: 'TEST_MESSAGE' });
      }).not.toThrow();

      global.parent = originalParent;
    });

    test('recovers from communication errors', () => {
      // Mock parent.postMessage to throw error
      const originalPostMessage = global.parent.postMessage;
      global.parent.postMessage = jest.fn(() => {
        throw new Error('Communication error');
      });

      expect(() => {
        messagePool.send({ type: 'ERROR_TEST' });
      }).not.toThrow();

      global.parent.postMessage = originalPostMessage;
    });
  });

  describe('Performance and Memory', () => {
    test('does not leak memory with many messages', () => {
      const initialPoolSize = messagePool.getPoolSize();

      // Send many messages
      for (let i = 0; i < 1000; i++) {
        messagePool.send({ type: 'MEMORY_TEST', data: { index: i } });
      }

      // Pool should not grow indefinitely
      const finalPoolSize = messagePool.getPoolSize();
      expect(finalPoolSize - initialPoolSize).toBeLessThan(1000);
    });

    test('processes messages efficiently', () => {
      const startTime = performance.now();

      // Send batch of messages
      for (let i = 0; i < 100; i++) {
        messagePool.send({ type: 'PERFORMANCE_TEST', data: { i } });
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process quickly (adjust threshold as needed)
      expect(processingTime).toBeLessThan(100); // 100ms for 100 messages
    });
  });
});

describe('Settings Synchronization', () => {
  test('synchronizes theme changes between threads', (done) => {
    // Main thread receives theme change
    mockMainThread.onMessage = (message) => {
      if (message.type === 'SET_THEME') {
        expect(message.data.theme).toBe('dark');

        // Main confirms theme change
        mockMainThread.sendToUI({
          type: 'THEME_CHANGED',
          data: { theme: 'dark', success: true }
        });
      }
    };

    // UI receives confirmation
    mockUIThread.onMessage = (message) => {
      if (message.type === 'THEME_CHANGED') {
        expect(message.data.theme).toBe('dark');
        expect(message.data.success).toBe(true);
        done();
      }
    };

    // Trigger theme change from UI
    const messagePool = new MessagePool();
    messagePool.send({
      type: 'SET_THEME',
      data: { theme: 'dark' }
    });
  });

  test('synchronizes debug mode between threads', (done) => {
    mockMainThread.onMessage = (message) => {
      if (message.type === 'SET_DEBUG_MODE') {
        expect(message.data.enabled).toBe(true);
        done();
      }
    };

    const messagePool = new MessagePool();
    messagePool.send({
      type: 'SET_DEBUG_MODE',
      data: { enabled: true }
    });
  });
});
