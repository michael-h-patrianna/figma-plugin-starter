/**
 * @jest-environment jsdom
 */

// Mock the messaging module before imports
jest.mock('@ui/messaging', () => ({
  sendToMain: jest.fn(),
  usePluginMessages: jest.fn()
}));

import { sendToMain } from '@ui/messaging';
import {
  completeOperation,
  failOperation,
  getActiveOperations,
  getAllOperations,
  ProgressManagerService,
  progressManagerState,
  updateProgress
} from '@ui/services/progressManager';

describe('Progress Manager Service', () => {
  const mockSendToMain = sendToMain as jest.MockedFunction<typeof sendToMain>;

  beforeEach(() => {
    // Clear all operations before each test
    progressManagerState.value = {
      isVisible: false,
      operations: new Map(),
      autoHide: true
    };
    mockSendToMain.mockClear();
  });

  describe('Basic Operation Management', () => {
    it('should start a new operation', () => {
      const { operationId } = ProgressManagerService.start(
        {
          title: 'Test Operation',
          description: 'Testing...',
          cancellable: true
        },
        'TEST_MESSAGE',
        { data: 'test' }
      );

      expect(operationId).toBeDefined();
      expect(progressManagerState.value.isVisible).toBe(true);
      expect(progressManagerState.value.operations.size).toBe(1);

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation).toBeDefined();
      expect(operation!.title).toBe('Test Operation');
      expect(operation!.description).toBe('Testing...');
      expect(operation!.cancellable).toBe(true);
      expect(operation!.progress).toBe(0);
      expect(operation!.completed).toBe(false);
      expect(operation!.failed).toBe(false);

      // Should send message to main thread
      expect(mockSendToMain).toHaveBeenCalledWith('TEST_MESSAGE', {
        operationId,
        data: 'test'
      });
    });

    it('should update operation progress', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      ProgressManagerService.update(operationId, 50, {
        description: 'Half done...',
        current: 5,
        total: 10
      });

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.progress).toBe(50);
      expect(operation!.description).toBe('Half done...');
      expect(operation!.current).toBe(5);
      expect(operation!.total).toBe(10);
    });

    it('should clamp progress values to 0-100', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      ProgressManagerService.update(operationId, -10);
      let operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.progress).toBe(0);

      ProgressManagerService.update(operationId, 150);
      operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.progress).toBe(100);
    });

    it('should complete an operation', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      ProgressManagerService.complete(operationId, {
        description: 'Completed successfully!'
      });

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.completed).toBe(true);
      expect(operation!.progress).toBe(100);
      expect(operation!.description).toBe('Completed successfully!');
      expect(operation!.endTime).toBeDefined();
    });

    it('should fail an operation', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      ProgressManagerService.fail(operationId, 'Something went wrong');

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.failed).toBe(true);
      expect(operation!.error).toBe('Something went wrong');
      expect(operation!.endTime).toBeDefined();
    });
  });

  describe('Cancellation', () => {
    it('should cancel a cancellable operation', () => {
      const { operationId } = ProgressManagerService.start(
        {
          title: 'Cancellable Operation',
          cancellable: true
        },
        'TEST'
      );

      ProgressManagerService.cancel(operationId);

      // Should send cancellation message to main thread
      expect(mockSendToMain).toHaveBeenLastCalledWith('CANCEL_OPERATION', {
        operationId
      });

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.failed).toBe(true);
      expect(operation!.error).toBe('Operation cancelled by user');
    });

    it('should not cancel a non-cancellable operation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { operationId } = ProgressManagerService.start(
        {
          title: 'Non-cancellable Operation',
          cancellable: false
        },
        'TEST'
      );

      ProgressManagerService.cancel(operationId);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Operation "${operationId}" is not cancellable`
      );

      const operation = progressManagerState.value.operations.get(operationId);
      expect(operation!.failed).toBe(false);
      expect(operation!.completed).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle cancelling non-existent operation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      ProgressManagerService.cancel('non-existent-id');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress operation with ID "non-existent-id" not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Auto-hide Behavior', () => {
    it('should auto-hide when all operations complete', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      expect(progressManagerState.value.isVisible).toBe(true);

      ProgressManagerService.complete(operationId);

      expect(progressManagerState.value.isVisible).toBe(false);
    });

    it('should not auto-hide when operations fail', () => {
      const { operationId } = ProgressManagerService.start(
        { title: 'Test Operation' },
        'TEST'
      );

      ProgressManagerService.fail(operationId, 'Error');

      expect(progressManagerState.value.isVisible).toBe(true);
    });

    it('should not auto-hide when multiple operations and some incomplete', () => {
      const op1 = ProgressManagerService.start({ title: 'Op 1' }, 'TEST');
      const op2 = ProgressManagerService.start({ title: 'Op 2' }, 'TEST');

      ProgressManagerService.complete(op1.operationId);

      expect(progressManagerState.value.isVisible).toBe(true);

      ProgressManagerService.complete(op2.operationId);

      expect(progressManagerState.value.isVisible).toBe(false);
    });
  });

  describe('Operation Management', () => {
    it('should get active operations only', () => {
      const op1 = ProgressManagerService.start({ title: 'Active Op' }, 'TEST');
      const op2 = ProgressManagerService.start({ title: 'Completed Op' }, 'TEST');
      const op3 = ProgressManagerService.start({ title: 'Failed Op' }, 'TEST');

      ProgressManagerService.complete(op2.operationId);
      ProgressManagerService.fail(op3.operationId, 'Error');

      const activeOps = getActiveOperations();
      expect(activeOps).toHaveLength(1);
      expect(activeOps[0].operationId).toBe(op1.operationId);
    });

    it('should get all operations', () => {
      const op1 = ProgressManagerService.start({ title: 'Active Op' }, 'TEST');
      const op2 = ProgressManagerService.start({ title: 'Completed Op' }, 'TEST');

      ProgressManagerService.complete(op2.operationId);

      const allOps = getAllOperations();
      expect(allOps).toHaveLength(2);
    });

    it('should clear completed operations', () => {
      const op1 = ProgressManagerService.start({ title: 'Active Op' }, 'TEST');
      const op2 = ProgressManagerService.start({ title: 'Completed Op' }, 'TEST');
      const op3 = ProgressManagerService.start({ title: 'Failed Op' }, 'TEST');

      ProgressManagerService.complete(op2.operationId);
      ProgressManagerService.fail(op3.operationId, 'Error');

      expect(progressManagerState.value.operations.size).toBe(3);

      ProgressManagerService.clearCompleted();

      expect(progressManagerState.value.operations.size).toBe(1);
      expect(progressManagerState.value.operations.has(op1.operationId)).toBe(true);
    });

    it('should hide modal when clearing all operations', () => {
      const op1 = ProgressManagerService.start({ title: 'Completed Op' }, 'TEST');
      ProgressManagerService.complete(op1.operationId);

      // Modal should be hidden after completion due to auto-hide
      expect(progressManagerState.value.isVisible).toBe(false);

      // Show modal manually
      ProgressManagerService.show();
      expect(progressManagerState.value.isVisible).toBe(true);

      // Clear completed operations should hide modal
      ProgressManagerService.clearCompleted();
      expect(progressManagerState.value.isVisible).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle updating non-existent operation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      updateProgress('non-existent-id', 50);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress operation with ID "non-existent-id" not found'
      );

      consoleSpy.mockRestore();
    });

    it('should handle completing non-existent operation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      completeOperation('non-existent-id');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress operation with ID "non-existent-id" not found'
      );

      consoleSpy.mockRestore();
    });

    it('should handle failing non-existent operation', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      failOperation('non-existent-id', 'Error');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Progress operation with ID "non-existent-id" not found'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Service API', () => {
    it('should provide service state', () => {
      const state = ProgressManagerService.getState();
      expect(state).toEqual(progressManagerState.value);
    });

    it('should show and hide manually', () => {
      expect(progressManagerState.value.isVisible).toBe(false);

      ProgressManagerService.show();
      expect(progressManagerState.value.isVisible).toBe(true);

      ProgressManagerService.hide();
      expect(progressManagerState.value.isVisible).toBe(false);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent operations', () => {
      const op1 = ProgressManagerService.start({ title: 'Operation 1', total: 10 }, 'TEST1');
      const op2 = ProgressManagerService.start({ title: 'Operation 2', total: 5 }, 'TEST2');
      const op3 = ProgressManagerService.start({ title: 'Operation 3', cancellable: true }, 'TEST3');

      expect(progressManagerState.value.operations.size).toBe(3);

      // Update each operation independently
      ProgressManagerService.update(op1.operationId, 30, { current: 3, total: 10 });
      ProgressManagerService.update(op2.operationId, 60, { current: 3, total: 5 });
      ProgressManagerService.update(op3.operationId, 10);

      const operations = getAllOperations();
      expect(operations.find(op => op.operationId === op1.operationId)!.progress).toBe(30);
      expect(operations.find(op => op.operationId === op2.operationId)!.progress).toBe(60);
      expect(operations.find(op => op.operationId === op3.operationId)!.progress).toBe(10);

      // Complete them in different ways
      ProgressManagerService.complete(op1.operationId);
      ProgressManagerService.fail(op2.operationId, 'Failed');
      ProgressManagerService.cancel(op3.operationId);

      const finalOps = getAllOperations();
      expect(finalOps.find(op => op.operationId === op1.operationId)!.completed).toBe(true);
      expect(finalOps.find(op => op.operationId === op2.operationId)!.failed).toBe(true);
      expect(finalOps.find(op => op.operationId === op3.operationId)!.failed).toBe(true);
      expect(finalOps.find(op => op.operationId === op3.operationId)!.error).toBe('Operation cancelled by user');
    });
  });
});
