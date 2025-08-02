/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { ProgressManager } from '../../../src/ui/components/base/ProgressManager';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';
import { ProgressManagerService, progressManagerState } from '../../../src/ui/services/progressManager';

// Mock the messaging module
jest.mock('@ui/messaging', () => ({
  sendToMain: jest.fn(),
  usePluginMessages: jest.fn()
}));

// Mock the useProgressManager hook
jest.mock('@ui/hooks/useProgressManager', () => ({
  useProgressManager: jest.fn()
}));

// Mock the ProgressManagerService
jest.mock('@ui/services/progressManager', () => {
  const originalModule = jest.requireActual('@ui/services/progressManager');
  return {
    ...originalModule,
    ProgressManagerService: {
      ...originalModule.ProgressManagerService,
      hide: jest.fn(),
      cancel: jest.fn(),
      clearCompleted: jest.fn()
    }
  };
});

describe('ProgressManager Component', () => {
  const mockProgressManagerService = ProgressManagerService as jest.Mocked<typeof ProgressManagerService>;

  beforeEach(() => {
    // Reset the state before each test
    progressManagerState.value = {
      isVisible: false,
      operations: new Map(),
      autoHide: true
    };
    jest.clearAllMocks();
  });

  const createMockOperation = (id: string, overrides = {}) => ({
    id: `id-${id}`,
    operationId: id,
    title: `Test Operation ${id}`,
    description: 'Testing...',
    progress: 0,
    completed: false,
    failed: false,
    cancellable: true,
    startTime: Date.now(),
    ...overrides
  });

  // Helper to render ProgressManager with theme context
  const renderProgressManager = () => {
    return render(
      h(ThemeProvider, {
        defaultTheme: 'light',
        children: h(ProgressManager, {})
      })
    );
  };

  it('should not render when not visible', () => {
    progressManagerState.value = {
      isVisible: false,
      operations: new Map(),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('should render when visible with operations', () => {
    const operation = createMockOperation('1');
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', operation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText('Progress Manager')).toBeInTheDocument();
    expect(screen.getByText('Test Operation 1')).toBeInTheDocument();
    expect(screen.getAllByText('Testing...')).toHaveLength(2); // Both in progress bar and description
  });

  it('should show active operations section', () => {
    const activeOperation = createMockOperation('1', { progress: 50 });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', activeOperation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText(/Active Operations \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Test Operation 1')).toBeInTheDocument();
  });

  it('should show completed operations section', () => {
    const completedOperation = createMockOperation('1', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', completedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText(/Completed \(1\)/)).toBeInTheDocument();
    expect(screen.getByText('Test Operation 1')).toBeInTheDocument();
  });

  it('should show failed operations with error message', () => {
    const failedOperation = createMockOperation('1', {
      failed: true,
      error: 'Something went wrong',
      endTime: Date.now()
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', failedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Operation 1')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should display progress information with current/total', () => {
    const operation = createMockOperation('1', {
      progress: 60,
      current: 6,
      total: 10,
      description: 'Processing files...'
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', operation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getAllByText('Processing files...')).toHaveLength(2); // Both in progress bar and description
    expect(screen.getByText(/6 of 10/)).toBeInTheDocument();
  });

  it('should show cancel button for cancellable operations', () => {
    const cancellableOperation = createMockOperation('1', {
      cancellable: true,
      progress: 30
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', cancellableOperation]]),
      autoHide: true
    };

    renderProgressManager();

    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });

  it('should not show cancel button for non-cancellable operations', () => {
    const nonCancellableOperation = createMockOperation('1', {
      cancellable: false,
      progress: 30
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', nonCancellableOperation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should call cancel when cancel button is clicked', () => {
    const cancellableOperation = createMockOperation('1', {
      cancellable: true,
      progress: 30
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', cancellableOperation]]),
      autoHide: true
    };

    renderProgressManager();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProgressManagerService.cancel).toHaveBeenCalledWith('1');
  });

  it('should show clear completed button when there are completed operations', () => {
    const completedOperation = createMockOperation('1', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', completedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should call clearCompleted when clear button is clicked', () => {
    const completedOperation = createMockOperation('1', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', completedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockProgressManagerService.clearCompleted).toHaveBeenCalled();
  });

  it('should close modal when close button is clicked', () => {
    // Close button only shows when there are no active operations
    const completedOperation = createMockOperation('1', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', completedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);

    expect(mockProgressManagerService.hide).toHaveBeenCalled();
  });

  it('should display duration for completed operations', () => {
    const startTime = Date.now() - 5000; // 5 seconds ago
    const endTime = Date.now();

    const completedOperation = createMockOperation('1', {
      completed: true,
      progress: 100,
      startTime,
      endTime
    });
    progressManagerState.value = {
      isVisible: true,
      operations: new Map([['1', completedOperation]]),
      autoHide: true
    };

    renderProgressManager();

    // Should show duration in milliseconds format
    expect(screen.getByText(/\d+ms/)).toBeInTheDocument();
  });

  it('should handle multiple operations of different types', () => {
    const activeOperation = createMockOperation('1', { progress: 30 });
    const completedOperation = createMockOperation('2', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    const failedOperation = createMockOperation('3', {
      failed: true,
      error: 'Failed',
      endTime: Date.now()
    });

    progressManagerState.value = {
      isVisible: true,
      operations: new Map([
        ['1', activeOperation],
        ['2', completedOperation],
        ['3', failedOperation]
      ]),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText(/Active Operations \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Completed \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('Test Operation 1')).toBeInTheDocument();
    expect(screen.getByText('Test Operation 2')).toBeInTheDocument();
    expect(screen.getByText('Test Operation 3')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should show correct status icons', () => {
    const activeOperation = createMockOperation('1', { progress: 30 });
    const completedOperation = createMockOperation('2', {
      completed: true,
      progress: 100,
      endTime: Date.now()
    });
    const failedOperation = createMockOperation('3', {
      failed: true,
      error: 'Failed',
      endTime: Date.now()
    });

    progressManagerState.value = {
      isVisible: true,
      operations: new Map([
        ['1', activeOperation],
        ['2', completedOperation],
        ['3', failedOperation]
      ]),
      autoHide: true
    };

    renderProgressManager();

    // Check for status icons (these are text content in our implementation)
    expect(screen.getByText('⏳')).toBeInTheDocument(); // Active
    expect(screen.getByText('✅')).toBeInTheDocument(); // Completed
    expect(screen.getByText('❌')).toBeInTheDocument(); // Failed
  });

  it('should handle empty state gracefully', () => {
    progressManagerState.value = {
      isVisible: true,
      operations: new Map(),
      autoHide: true
    };

    renderProgressManager();

    expect(screen.getByText('Progress Manager')).toBeInTheDocument();
    expect(screen.getByText('No operations in progress')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });
});
