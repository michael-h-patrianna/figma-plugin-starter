/**
 * Unit tests for Toast components
 * Tests toast display, types, interactions, and queue management
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

// Create mock functions
const mockDismissToast = jest.fn();
const mockDismissAllToasts = jest.fn();

// Create a mock toastState signal
const createMockToastState = () => ({
  value: {
    toasts: [] as any[],
    queue: [] as any[],
  }
});

const mockToastState = createMockToastState();

// Mock the toast service module BEFORE importing the component
jest.doMock('../../../src/ui/services/toast', () => ({
  toastState: mockToastState,
  dismissToast: mockDismissToast,
  dismissAllToasts: mockDismissAllToasts,
  showToast: jest.fn(),
  Toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    dismiss: mockDismissToast,
    dismissAll: mockDismissAllToasts,
  }
}));

// Mock theme context
jest.doMock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      darkPanel: '#1e1f26',
      textColor: '#ffffff',
      textInverse: '#000000',
      toastCountBadge: '#374151',
      toastPersistIndicator: '#6b7280',
      toastQueueBackground: '#2d3748',
      toastQueueBackgroundHover: '#4a5568',
      toastQueueText: '#ffffff',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 20 },
    shadows: {
      toast: '0 4px 12px rgba(0, 0, 0, 0.15)',
      toastHover: '0 8px 20px rgba(0, 0, 0, 0.25)',
      queue: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    animations: {
      transition: 'all 0.2s ease',
      hover: 'all 0.15s ease',
    },
  }),
}));

// Mock getBestTextColor utility
jest.doMock('../../../src/shared/utils', () => ({
  getBestTextColor: jest.fn(() => '#ffffff'),
}));

// Now import the component AFTER setting up the mocks
const { GlobalToastContainer } = require('../../../src/ui/components/base/Toast');

describe('Toast Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToastState.value = { toasts: [], queue: [] };
  });

  describe('GlobalToastContainer', () => {
    test('renders nothing when no toasts are present', () => {
      const { container } = render(h(GlobalToastContainer, {}));
      expect(container.firstChild).toBeNull();
    });

    test('renders toasts when present', () => {
      mockToastState.value = {
        toasts: [{
          id: '1',
          message: 'Success message',
          type: 'success',
          persist: false,
        }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    test('calls dismissAllToasts when dismiss all is clicked', async () => {
      const user = userEvent.setup();

      mockToastState.value = {
        toasts: [
          { id: '1', message: 'Toast 1', type: 'info' },
          { id: '2', message: 'Toast 2', type: 'success' },
          { id: '3', message: 'Toast 3', type: 'warning' },
        ],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      const dismissAllButton = screen.getByText('Dismiss All');
      await user.click(dismissAllButton);

      expect(mockDismissAllToasts).toHaveBeenCalledTimes(1);
    });

    test('shows queue indicator when queue is not empty', () => {
      mockToastState.value = {
        toasts: [{ id: '1', message: 'Active toast', type: 'info' }],
        queue: [{ id: '2', message: 'Queued toast', type: 'success' }],
      };

      render(h(GlobalToastContainer, {}));

      expect(screen.getByText('+1 queued')).toBeInTheDocument();
      expect(screen.getByText('Dismiss All')).toBeInTheDocument();
    });
  });

  describe('SingleToast (via GlobalToastContainer)', () => {
    test('renders toast with correct message and styling', () => {
      mockToastState.value = {
        toasts: [{
          id: '1',
          message: 'Success notification',
          type: 'success',
        }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      const toast = screen.getByText('Success notification');
      expect(toast).toBeInTheDocument();
      expect(toast.parentElement).toHaveStyle({
        background: '#10b981',
      });
    });

    test('calls dismissToast when toast is clicked', async () => {
      const user = userEvent.setup();

      mockToastState.value = {
        toasts: [{
          id: 'clickable-toast',
          message: 'Click to dismiss',
          type: 'info',
        }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      const toast = screen.getByText('Click to dismiss').parentElement;
      await user.click(toast!);

      expect(mockDismissToast).toHaveBeenCalledWith('clickable-toast');
    });

    test('shows count badge for consolidated messages', () => {
      mockToastState.value = {
        toasts: [{
          id: '1',
          message: 'Repeated message',
          type: 'info',
          count: 5,
        }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('shows persist indicator for persistent toasts', () => {
      mockToastState.value = {
        toasts: [{
          id: '1',
          message: 'Persistent message',
          type: 'info',
          persist: true,
        }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      const toast = screen.getByText('Persistent message').parentElement;
      const persistIndicator = toast?.querySelector('div:last-child');
      expect(persistIndicator).toHaveStyle({
        width: '6px',
        height: '6px',
        borderRadius: '50%',
      });
    });

    test('applies different colors for different toast types', () => {
      const toastTypes = [
        { type: 'success', color: '#10b981' },
        { type: 'error', color: '#ef4444' },
        { type: 'warning', color: '#f59e0b' },
        { type: 'info', color: '#3b82f6' },
      ];

      toastTypes.forEach(({ type, color }) => {
        mockToastState.value = {
          toasts: [{ id: type, message: `${type} message`, type }],
          queue: [],
        };

        const { unmount } = render(h(GlobalToastContainer, {}));

        const toast = screen.getByText(`${type} message`);
        expect(toast.parentElement).toHaveStyle({ background: color });

        unmount();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles toast without count badge', () => {
      mockToastState.value = {
        toasts: [{ id: '1', message: 'Simple toast', type: 'info' }],
        queue: [],
      };

      expect(() => {
        render(h(GlobalToastContainer, {}));
      }).not.toThrow();

      expect(screen.getByText('Simple toast')).toBeInTheDocument();
    });

    test('handles unknown toast type gracefully', () => {
      mockToastState.value = {
        toasts: [{ id: '1', message: 'Unknown type toast', type: 'unknown-type' }],
        queue: [],
      };

      expect(() => {
        render(h(GlobalToastContainer, {}));
      }).not.toThrow();

      const toast = screen.getByText('Unknown type toast').parentElement;
      expect(toast).toHaveStyle({ background: '#1e1f26' });
    });

    test('handles empty message gracefully', () => {
      mockToastState.value = {
        toasts: [{ id: '1', message: '', type: 'info' }],
        queue: [],
      };

      expect(() => {
        render(h(GlobalToastContainer, {}));
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('toasts have proper cursor styling', () => {
      mockToastState.value = {
        toasts: [{ id: '1', message: 'Clickable toast', type: 'info' }],
        queue: [],
      };

      render(h(GlobalToastContainer, {}));

      const toast = screen.getByText('Clickable toast').parentElement;
      expect(toast).toHaveStyle({ cursor: 'pointer' });
    });
  });
});
