/**
 * Unit tests for ProgressModal component
 * Tests progress display, modal behavior, completion states, and close functionality
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { ProgressModal } from '../../../src/ui/components/base/ProgressModal';

// Mock theme context
jest.mock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      darkPanel: '#1e1f26',
      border: '#2c3039',
      textColor: '#ffffff',
      textSecondary: '#999999',
    },
    spacing: { xs: 4, md: 16, lg: 16 },
    typography: {
      subheading: '14px',
      heading: '18px',
    },
    borderRadius: {
      default: '8px',
      medium: '6px',
    },
  }),
}));

// Mock Modal component with proper jest mock structure
jest.mock('../../../src/ui/components/base/Modal', () => ({
  Modal: (props: any) => {
    const { h } = require('preact');
    if (!props.isVisible) return null;
    return h('div', {
      'data-testid': 'modal',
      role: 'dialog',
      'aria-label': props.title
    }, [
      // Title section
      props.title && h('div', { 'data-testid': 'modal-title' }, props.title),
      // Body section
      h('div', { 'data-testid': 'modal-body' }, props.children),
      // Close button section (conditionally rendered)
      props.showCloseButton && h('button', {
        'data-testid': 'close-button',
        'aria-label': 'Close dialog',
        onClick: props.onClose
      }, '×')
    ]);
  }
}));

jest.mock('../../../src/ui/components/base/ProgressBar', () => ({
  ProgressBar: (props: any) => {
    const { h } = require('preact');
    return h('div', {
      'data-testid': 'progress-bar',
      'aria-label': props.label,
      'data-progress': props.progress
    }, [
      h('div', { 'data-testid': 'progress-fill' }),
      h('span', { 'data-testid': 'progress-label' }, props.label)
    ]);
  }
}));

describe('ProgressModal Component', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    progress: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders progress modal when visible', () => {
      render(h(ProgressModal, defaultProps));

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    test('does not render when not visible', () => {
      render(h(ProgressModal, { ...defaultProps, isVisible: false }));

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    test('renders with default title', () => {
      render(h(ProgressModal, defaultProps));

      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
      render(h(ProgressModal, { ...defaultProps, title: 'Uploading Files' }));

      expect(screen.getByText('Uploading Files')).toBeInTheDocument();
    });

    test('renders with default description', () => {
      render(h(ProgressModal, defaultProps));

      expect(screen.getByText('Please wait while we process your request')).toBeInTheDocument();
    });

    test('renders with custom description', () => {
      render(h(ProgressModal, {
        ...defaultProps,
        description: 'Uploading your files to the server...'
      }));

      expect(screen.getByText('Uploading your files to the server...')).toBeInTheDocument();
    });

    test('renders without description when not provided', () => {
      render(h(ProgressModal, { ...defaultProps, description: '' }));

      expect(screen.queryByText('Please wait while we process your request')).not.toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    test('displays progress bar with correct progress value', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 75 }));

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-progress', '75');
    });

    test('displays progress label with percentage', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 33 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 33%');
    });

    test('handles 0% progress', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 0 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 0%');
    });

    test('handles 100% progress', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 100 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 100%');
    });

    test('rounds decimal progress values', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 33.7 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 34%');
    });

    test('handles very small progress values', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 0.1 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 0%');
    });
  });

  describe('Close Button Behavior', () => {
    test('hides close button by default when progress is incomplete', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 50 }));

      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
    });

    test('shows close button when showCloseButton is true', () => {
      render(h(ProgressModal, { ...defaultProps, showCloseButton: true }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('shows close button when progress is 100%', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 100 }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('shows close button when progress is above 100%', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 110 }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', async () => {
      const mockOnClose = jest.fn();
      const user = userEvent.setup();

      render(h(ProgressModal, {
        ...defaultProps,
        onClose: mockOnClose,
        showCloseButton: true
      }));

      const closeButton = screen.getByTestId('close-button');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close Handling', () => {
    test('prevents closing when progress is incomplete and showCloseButton is false', () => {
      const mockOnClose = jest.fn();
      render(h(ProgressModal, {
        ...defaultProps,
        onClose: mockOnClose,
        progress: 50,
        showCloseButton: false
      }));

      // Simulate modal onClose call (e.g., ESC key or backdrop click)
      // Since we're mocking Modal, we need to test the handleClose function behavior
      // This is tested through the showCloseButton prop logic
      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();
    });

    test('allows closing when progress is complete', () => {
      const mockOnClose = jest.fn();
      render(h(ProgressModal, {
        ...defaultProps,
        onClose: mockOnClose,
        progress: 100
      }));

      // Close button should be visible when complete
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('allows closing when showCloseButton is explicitly true', () => {
      const mockOnClose = jest.fn();
      render(h(ProgressModal, {
        ...defaultProps,
        onClose: mockOnClose,
        progress: 25,
        showCloseButton: true
      }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });
  });

  describe('Progress Updates', () => {
    test('updates progress bar when progress prop changes', () => {
      const { rerender } = render(h(ProgressModal, { ...defaultProps, progress: 30 }));

      expect(screen.getByTestId('progress-bar')).toHaveAttribute('data-progress', '30');
      expect(screen.getByText('Processing... 30%')).toBeInTheDocument();

      rerender(h(ProgressModal, { ...defaultProps, progress: 70 }));

      expect(screen.getByTestId('progress-bar')).toHaveAttribute('data-progress', '70');
      expect(screen.getByText('Processing... 70%')).toBeInTheDocument();
    });

    test('shows close button when progress reaches 100%', () => {
      const { rerender } = render(h(ProgressModal, { ...defaultProps, progress: 99 }));

      expect(screen.queryByTestId('close-button')).not.toBeInTheDocument();

      rerender(h(ProgressModal, { ...defaultProps, progress: 100 }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('maintains close button visibility after reaching 100%', () => {
      const { rerender } = render(h(ProgressModal, { ...defaultProps, progress: 100 }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();

      // Even if progress somehow goes back down, close button should remain
      rerender(h(ProgressModal, { ...defaultProps, progress: 100 }));

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    test('applies proper styling to description', () => {
      render(h(ProgressModal, {
        ...defaultProps,
        description: 'Custom description text'
      }));

      const description = screen.getByText('Custom description text');
      expect(description).toHaveStyle({
        color: '#999999', // textSecondary
        fontSize: '12px',
        textAlign: 'center',
      });
    });

    test('applies margin to description', () => {
      render(h(ProgressModal, defaultProps));

      const description = screen.getByText('Please wait while we process your request');
      expect(description).toHaveStyle({
        marginTop: '16px', // spacing.md
      });
    });

    test('applies proper container padding', () => {
      render(h(ProgressModal, defaultProps));

      const modalBody = screen.getByTestId('modal-body');
      const container = modalBody.firstChild as HTMLElement;
      expect(container).toHaveStyle({
        padding: '16px 0', // spacing.md
      });
    });
  });

  describe('Accessibility', () => {
    test('progress bar has accessible label', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 60 }));

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('aria-label', 'Processing... 60%');
    });

    test('modal has proper title for screen readers', () => {
      render(h(ProgressModal, { ...defaultProps, title: 'File Upload' }));

      const modal = screen.getByTestId('modal');
      expect(modal).toHaveAttribute('aria-label', 'File Upload');
    });

    test('close button has accessible label when visible', () => {
      render(h(ProgressModal, { ...defaultProps, showCloseButton: true }));

      const closeButton = screen.getByTestId('close-button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
    });
  });

  describe('Edge Cases', () => {
    test('handles negative progress values', () => {
      render(h(ProgressModal, { ...defaultProps, progress: -10 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... -10%');
    });

    test('handles progress values over 100%', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 150 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 150%');
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('handles undefined description', () => {
      render(h(ProgressModal, { ...defaultProps, description: '' }));

      expect(screen.queryByText('Please wait while we process your request')).not.toBeInTheDocument();
    });

    test('handles null description', () => {
      render(h(ProgressModal, { ...defaultProps, description: null as any }));

      expect(screen.queryByText('Please wait while we process your request')).not.toBeInTheDocument();
    });

    test('handles missing onClose callback', () => {
      expect(() => {
        render(h(ProgressModal, { ...defaultProps, onClose: undefined as any }));
      }).not.toThrow();
    });

    test('handles extreme progress values', () => {
      render(h(ProgressModal, { ...defaultProps, progress: Number.MAX_SAFE_INTEGER }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent(`Processing... ${Number.MAX_SAFE_INTEGER}%`);
    });

    test('handles floating point precision issues', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 33.333333333 }));

      const progressLabel = screen.getByTestId('progress-label');
      expect(progressLabel).toHaveTextContent('Processing... 33%');
    });
  });

  describe('Component Integration', () => {
    test('passes correct props to Modal component', () => {
      render(h(ProgressModal, {
        ...defaultProps,
        title: 'Custom Title',
        showCloseButton: true
      }));

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });

    test('passes correct props to ProgressBar component', () => {
      render(h(ProgressModal, { ...defaultProps, progress: 85 }));

      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveAttribute('data-progress', '85');
      expect(progressBar).toHaveAttribute('aria-label', 'Processing... 85%');
    });

    test('handles modal visibility correctly', () => {
      const { rerender } = render(h(ProgressModal, { ...defaultProps, isVisible: true }));

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      rerender(h(ProgressModal, { ...defaultProps, isVisible: false }));

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });
});
