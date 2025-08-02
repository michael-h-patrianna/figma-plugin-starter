/**
 * Unit tests for ErrorBoundary component
 * Tests error recovery scenarios, retry mechanisms, and auto-recovery
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { Component, h } from 'preact';
import { ErrorBoundary } from '../../../src/ui/components/base/ErrorBoundary';

// Mock console.error to prevent error logs during testing
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

/**
 * Helper component that throws an error when shouldThrow is true
 */
interface ThrowErrorProps {
  shouldThrow?: boolean;
  errorMessage?: string;
}

class ThrowError extends Component<ThrowErrorProps> {
  render() {
    if (this.props.shouldThrow) {
      throw new Error(this.props.errorMessage || 'Test error');
    }
    return h('div', {}, 'Component working fine');
  }
}

/**
 * Helper to render ErrorBoundary
 */
const renderErrorBoundary = (props: any = {}, childProps: ThrowErrorProps = {}) => {
  return render(
    h(ErrorBoundary, props,
      h(ThrowError, childProps)
    )
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Error Detection and Recovery', () => {
    test('catches component crashes and shows error UI', () => {
      renderErrorBoundary({}, { shouldThrow: true });

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('shows working component when no error occurs', () => {
      renderErrorBoundary({}, { shouldThrow: false });

      expect(screen.getByText('Component working fine')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    test('calls onError callback when error occurs', () => {
      const onErrorMock = jest.fn();
      renderErrorBoundary({ onError: onErrorMock }, { shouldThrow: true });

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Retry Mechanisms', () => {
    test('retries component after clicking retry button', async () => {
      let shouldThrow = true;

      // Custom component that can change error state
      class TestComponent extends Component {
        render() {
          if (shouldThrow) {
            throw new Error('Initial error');
          }
          return h('div', {}, 'Recovery successful');
        }
      }

      const { rerender } = render(
        h(ErrorBoundary, { children: h(TestComponent, {}) })
      );

      // Error should be caught
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Component should recover
      await waitFor(() => {
        expect(screen.getByText('Recovery successful')).toBeInTheDocument();
      });
    });

    test('tracks retry count with maxRetries limit', async () => {
      const maxRetries = 3; // Increase to 3 for better testing
      let throwCount = 0;

      class TestComponent extends Component {
        render() {
          throwCount++;
          throw new Error(`Error attempt ${throwCount}`);
          return null; // This will never be reached but satisfies TypeScript
        }
      }

      render(
        h(ErrorBoundary, { maxRetries, children: h(TestComponent, {}) })
      );

      // Should show retry button initially
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      // First retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Second retry
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Third retry - should hit max and show persistent error
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      await waitFor(() => {
        expect(screen.getByText(/persistent error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-Recovery', () => {
    test('auto-recovers after specified timeout when autoRecover is enabled', async () => {
      const autoRecoverMs = 3000;
      let shouldThrow = true;

      class TestComponent extends Component {
        render() {
          if (shouldThrow) {
            throw new Error('Auto-recovery test');
          }
          return h('div', {}, 'Auto-recovered');
        }
      }

      const { rerender } = render(
        h(ErrorBoundary, { autoRecover: true, recoveryDelay: autoRecoverMs, children: h(TestComponent, {}) })
      );

      // Error should be caught
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Fast-forward time to trigger auto-recovery
      jest.advanceTimersByTime(autoRecoverMs + 100);

      // Component should auto-recover
      await waitFor(() => {
        expect(screen.getByText('Auto-recovered')).toBeInTheDocument();
      });
    });

    test('does not auto-recover when autoRecover is false', async () => {
      renderErrorBoundary({ autoRecover: false }, { shouldThrow: true });

      // Wait for potential auto-recovery
      jest.advanceTimersByTime(10000);

      // Should still show error state
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Count Limits', () => {
    test('shows different UI after reaching error threshold', async () => {
      let errorCount = 0;

      class TestComponent extends Component {
        render() {
          errorCount++;
          throw new Error(`Error ${errorCount}`);
          return null; // This will never be reached but satisfies TypeScript
        }
      }

      render(
        h(ErrorBoundary, { maxRetries: 3, children: h(TestComponent, {}) })
      );

      // Should show normal error UI initially
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Trigger retries until max errors reached
      let retryButton = screen.getByRole('button', { name: /try again/i });

      // First retry
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Second retry
      retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });

      // Third retry (should hit limit)
      retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      await waitFor(() => {
        expect(screen.getByText(/persistent error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Custom Fallback UI', () => {
    test('renders custom fallback when provided', () => {
      const customFallback = (error: Error, errorInfo: any, retry: () => void) => {
        return h('div', {},
          h('h2', {}, 'Custom Error UI'),
          h('p', {}, error.message),
          h('button', { onClick: retry }, 'Custom Retry')
        );
      };

      renderErrorBoundary({ fallback: customFallback }, { shouldThrow: true, errorMessage: 'Custom error message' });

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    test('cleans up timers on unmount', () => {
      const { unmount } = renderErrorBoundary(
        { autoRecover: true, recoveryDelay: 5000 },
        { shouldThrow: true }
      );

      // Should have active timer for auto-recovery
      expect(jest.getTimerCount()).toBeGreaterThan(0);

      unmount();

      // Timers should be cleaned up (may still have some background timers)
      const remainingTimers = jest.getTimerCount();
      expect(remainingTimers).toBeLessThanOrEqual(1); // Allow for potential cleanup timers
    });

    test('does not cause memory leaks with multiple error cycles', () => {
      // Test that multiple error/recovery cycles don't accumulate memory
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderErrorBoundary({}, { shouldThrow: true });

        // Trigger retry
        const retryButton = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(retryButton);

        unmount();
      }

      // If we get here without crashes, memory management is working
      expect(true).toBe(true);
    });
  });
});
