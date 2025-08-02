/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/preact';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { ProgressManagerService } from '@ui/services/progressManager';

// Mock the messaging module
jest.mock('@ui/messaging', () => ({
  usePluginMessages: jest.fn()
}));

// Mock the ProgressManagerService
jest.mock('@ui/services/progressManager', () => ({
  ProgressManagerService: {
    update: jest.fn(),
    complete: jest.fn(),
    fail: jest.fn(),
    cancel: jest.fn()
  }
}));

import { usePluginMessages } from '@ui/messaging';

describe('useProgressManager Hook', () => {
  const mockUsePluginMessages = usePluginMessages as jest.MockedFunction<typeof usePluginMessages>;
  const mockProgressManagerService = ProgressManagerService as jest.Mocked<typeof ProgressManagerService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register message handlers on mount', () => {
    renderHook(() => useProgressManager());

    expect(mockUsePluginMessages).toHaveBeenCalledWith({
      PROGRESS: expect.any(Function),
      OPERATION_COMPLETE: expect.any(Function),
      OPERATION_ERROR: expect.any(Function),
      OPERATION_CANCELLED: expect.any(Function)
    });
  });

  it('should handle PROGRESS messages', () => {
    let progressHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      progressHandler = handlers.PROGRESS;
    });

    renderHook(() => useProgressManager());

    const progressData = {
      operationId: 'test-op-1',
      current: 5,
      total: 10,
      message: 'Processing...'
    };

    progressHandler!(progressData);

    expect(mockProgressManagerService.update).toHaveBeenCalledWith(
      'test-op-1',
      50, // Math.round((5/10) * 100)
      {
        description: 'Processing...',
        current: 5,
        total: 10
      }
    );
  });

  it('should handle OPERATION_COMPLETE messages', () => {
    let completeHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      completeHandler = handlers.OPERATION_COMPLETE;
    });

    renderHook(() => useProgressManager());

    const completeData = {
      operationId: 'test-op-1',
      message: 'Completed successfully!'
    };

    completeHandler!(completeData);

    expect(mockProgressManagerService.complete).toHaveBeenCalledWith(
      'test-op-1',
      {
        description: 'Completed successfully!'
      }
    );
  });

  it('should handle OPERATION_ERROR messages', () => {
    let errorHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      errorHandler = handlers.OPERATION_ERROR;
    });

    renderHook(() => useProgressManager());

    const errorData = {
      operationId: 'test-op-1',
      error: 'Something went wrong'
    };

    errorHandler!(errorData);

    expect(mockProgressManagerService.fail).toHaveBeenCalledWith(
      'test-op-1',
      'Something went wrong'
    );
  });

  it('should handle OPERATION_CANCELLED messages', () => {
    let cancelHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      cancelHandler = handlers.OPERATION_CANCELLED;
    });

    renderHook(() => useProgressManager());

    const cancelData = {
      operationId: 'test-op-1'
    };

    cancelHandler!(cancelData);

    expect(mockProgressManagerService.fail).toHaveBeenCalledWith(
      'test-op-1',
      'Operation was cancelled'
    );
  });

  it('should handle progress updates without optional fields', () => {
    let progressHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      progressHandler = handlers.PROGRESS;
    });

    renderHook(() => useProgressManager());

    const minimalProgressData = {
      operationId: 'test-op-1',
      current: 0,
      total: 0
    };

    progressHandler!(minimalProgressData);

    expect(mockProgressManagerService.update).toHaveBeenCalledWith(
      'test-op-1',
      0, // Math.round((0/0) * 100) = NaN but total > 0 check makes it 0
      {
        description: undefined,
        current: 0,
        total: 0
      }
    );
  });

  it('should handle complete operations without description', () => {
    let completeHandler: (data: any) => void;

    mockUsePluginMessages.mockImplementation((handlers) => {
      completeHandler = handlers.OPERATION_COMPLETE;
    });

    renderHook(() => useProgressManager());

    const minimalCompleteData = {
      operationId: 'test-op-1'
    };

    completeHandler!(minimalCompleteData);

    expect(mockProgressManagerService.complete).toHaveBeenCalledWith(
      'test-op-1',
      {
        description: 'Operation completed successfully'
      }
    );
  });
});
