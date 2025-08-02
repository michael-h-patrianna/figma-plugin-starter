/**
 * @jest-environment node
 */

import { UIHelpers } from '@main/tools/ui-helpers';

describe('UIHelpers', () => {
  let uiHelpers: UIHelpers;
  let mockPostMessage: jest.MockedFunction<any>;
  let mockNotify: jest.MockedFunction<any>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    uiHelpers = new UIHelpers();
    mockPostMessage = figma.ui.postMessage as jest.MockedFunction<any>;
    mockNotify = figma.notify as jest.MockedFunction<any>;
    mockPostMessage.mockClear();
    mockNotify.mockClear();

    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('sendToUI', () => {
    it('should send message with type and data', () => {
      uiHelpers.sendToUI('TEST_MESSAGE', { foo: 'bar' });

      expect(mockPostMessage).toHaveBeenCalledTimes(1);
      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'TEST_MESSAGE',
        foo: 'bar'
      });
    });

    it('should send message with just type when no data provided', () => {
      uiHelpers.sendToUI('SIMPLE_MESSAGE');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'SIMPLE_MESSAGE'
      });
    });

    it('should handle errors gracefully', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPostMessage.mockImplementation(() => {
        throw new Error('Test error');
      });

      uiHelpers.sendToUI('ERROR_MESSAGE');

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to send message to UI:',
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });
  });

  describe('sendError', () => {
    it('should send error message with correct format', () => {
      uiHelpers.sendError('Test Error', 'Something went wrong', 'ERR001');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        title: 'Test Error',
        message: 'Something went wrong',
        code: 'ERR001'
      });
    });

    it('should send error message without code', () => {
      uiHelpers.sendError('Test Error', 'Something went wrong');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'ERROR',
        title: 'Test Error',
        message: 'Something went wrong',
        code: undefined
      });
    });
  });

  describe('sendProgress', () => {
    it('should send progress update with operationId', () => {
      uiHelpers.sendProgress(25, 100, 'Processing...', 'op-123');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'PROGRESS',
        current: 25,
        total: 100,
        percentage: 25,
        message: 'Processing...',
        operationId: 'op-123'
      });
    });

    it('should send progress update without operationId', () => {
      uiHelpers.sendProgress(50, 200, 'Half done');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'PROGRESS',
        current: 50,
        total: 200,
        percentage: 25,
        message: 'Half done',
        operationId: undefined
      });
    });

    it('should calculate correct percentage', () => {
      uiHelpers.sendProgress(33, 100);

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'PROGRESS',
        current: 33,
        total: 100,
        percentage: 33,
        message: undefined,
        operationId: undefined
      });
    });

    it('should round percentage to nearest integer', () => {
      uiHelpers.sendProgress(33, 99); // 33.33...%

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'PROGRESS',
        current: 33,
        total: 99,
        percentage: 33, // Should be rounded
        message: undefined,
        operationId: undefined
      });
    });

    it('should handle edge case of zero total', () => {
      uiHelpers.sendProgress(10, 0, 'Edge case', 'op-456');

      expect(mockPostMessage).toHaveBeenCalledWith({
        type: 'PROGRESS',
        current: 10,
        total: 0,
        percentage: Infinity, // Math.round(10/0 * 100)
        message: 'Edge case',
        operationId: 'op-456'
      });
    });
  });

  describe('showNotification', () => {
    it('should show notification with message only', () => {
      uiHelpers.showNotification('Test notification');

      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify).toHaveBeenCalledWith('Test notification', undefined);
    });

    it('should show notification with options', () => {
      const options = { timeout: 5000 };
      uiHelpers.showNotification('Test notification', options);

      expect(mockNotify).toHaveBeenCalledWith('Test notification', options);
    });

    it('should handle notification errors gracefully', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotify.mockImplementation(() => {
        throw new Error('Notification error');
      });

      uiHelpers.showNotification('Error notification');

      expect(errorSpy).toHaveBeenCalledWith(
        '❌ Failed to show notification:',
        expect.any(Error)
      );

      errorSpy.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple progress updates for same operation', () => {
      const operationId = 'scan-operation-789';

      uiHelpers.sendProgress(1, 10, 'Starting...', operationId);
      uiHelpers.sendProgress(5, 10, 'Halfway...', operationId);
      uiHelpers.sendProgress(10, 10, 'Complete!', operationId);

      expect(mockPostMessage).toHaveBeenCalledTimes(3);

      // Check first call
      expect(mockPostMessage).toHaveBeenNthCalledWith(1, {
        type: 'PROGRESS',
        current: 1,
        total: 10,
        percentage: 10,
        message: 'Starting...',
        operationId: 'scan-operation-789'
      });

      // Check last call
      expect(mockPostMessage).toHaveBeenNthCalledWith(3, {
        type: 'PROGRESS',
        current: 10,
        total: 10,
        percentage: 100,
        message: 'Complete!',
        operationId: 'scan-operation-789'
      });
    });

    it('should handle concurrent operations with different operationIds', () => {
      uiHelpers.sendProgress(1, 5, 'Op1 start', 'op-1');
      uiHelpers.sendProgress(1, 3, 'Op2 start', 'op-2');
      uiHelpers.sendProgress(3, 5, 'Op1 progress', 'op-1');
      uiHelpers.sendProgress(3, 3, 'Op2 done', 'op-2');

      expect(mockPostMessage).toHaveBeenCalledTimes(4);

      // Verify messages have correct operationIds
      const calls = mockPostMessage.mock.calls;
      expect(calls[0][0].operationId).toBe('op-1');
      expect(calls[1][0].operationId).toBe('op-2');
      expect(calls[2][0].operationId).toBe('op-1');
      expect(calls[3][0].operationId).toBe('op-2');
    });
  });
});
