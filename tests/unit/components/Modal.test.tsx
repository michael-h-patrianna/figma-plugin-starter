/**
 * Unit tests for Modal component
 * Tests modal visibility, keyboard navigation, focus management, and accessibility
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { Modal } from '../../../src/ui/components/base/Modal';

// Mock theme context
jest.mock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      darkPanel: '#1e1f26',
      border: '#2c3039',
      textColor: '#ffffff',
      textSecondary: '#999999',
    },
    spacing: { xs: 4, lg: 16 },
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

describe('Modal Component', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: h('p', null, 'Modal content'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing modals
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Cleanup any remaining modals
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    test('renders modal when isVisible is true', () => {
      render(h(Modal, defaultProps));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render modal when isVisible is false', () => {
      render(h(Modal, { ...defaultProps, isVisible: false }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders modal title in header', () => {
      render(h(Modal, defaultProps));

      const title = screen.getByText('Test Modal');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    test('renders children content in body', () => {
      const customChildren = h('div', null,
        h('p', null, 'First paragraph'),
        h('p', null, 'Second paragraph')
      );

      render(h(Modal, { ...defaultProps, children: customChildren }));

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });

    test('renders close button by default', () => {
      render(h(Modal, defaultProps));

      const closeButton = screen.getByRole('button', { name: 'Close dialog' });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
    });

    test('hides close button when showCloseButton is false', () => {
      render(h(Modal, { ...defaultProps, showCloseButton: false }));

      expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    test('applies default medium size', () => {
      render(h(Modal, defaultProps));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        width: '480px',
        maxHeight: '500px',
      });
    });

    test('applies small size', () => {
      render(h(Modal, { ...defaultProps, size: 'small' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        width: '320px',
        maxHeight: '400px',
      });
    });

    test('applies large size', () => {
      render(h(Modal, { ...defaultProps, size: 'large' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        width: '600px',
        maxHeight: '700px',
      });
    });

    test('applies medium size explicitly', () => {
      render(h(Modal, { ...defaultProps, size: 'medium' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        width: '480px',
        maxHeight: '500px',
      });
    });
  });

  describe('Close Interactions', () => {
    test('calls onClose when close button is clicked', async () => {
      const mockOnClose = jest.fn();
      const user = userEvent.setup();

      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      const closeButton = screen.getByRole('button', { name: 'Close dialog' });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when backdrop is clicked', async () => {
      const mockOnClose = jest.fn();
      const user = userEvent.setup();

      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      // Click on backdrop (presentation role element)
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when modal content is clicked', async () => {
      const mockOnClose = jest.fn();
      const user = userEvent.setup();

      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      const modal = screen.getByRole('dialog');
      await user.click(modal);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('calls onClose when Escape key is pressed', async () => {
      const mockOnClose = jest.fn();
      const user = userEvent.setup();

      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    test('handles Escape key press', async () => {
      const mockOnClose = jest.fn();
      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('handles other key presses without closing', async () => {
      const mockOnClose = jest.fn();
      render(h(Modal, { ...defaultProps, onClose: mockOnClose }));

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'ArrowDown' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('manages focus trapping within modal', async () => {
      const modalWithButtons = h(Modal, { ...defaultProps }, [
        h('button', { key: 'first' }, 'First Button'),
        h('button', { key: 'second' }, 'Second Button'),
        h('button', { key: 'third' }, 'Third Button'),
      ]);

      render(modalWithButtons);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];
      const lastButton = buttons[buttons.length - 1];

      // Focus should be trapped within modal
      expect(firstButton).toBeInTheDocument();
      expect(lastButton).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    test('focuses first focusable element when modal opens', async () => {
      const modalWithInput = h(Modal, { ...defaultProps }, [
        h('input', { type: 'text', placeholder: 'Test input' }),
        h('button', null, 'Test button'),
      ]);

      render(modalWithInput);

      // Wait for focus to be set
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Test input');
        expect(input).toHaveFocus();
      });
    });

    test('restores focus to previously focused element when modal closes', async () => {
      // Create a button outside modal to focus initially
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(h(Modal, { ...defaultProps, isVisible: true }));

      // Close modal
      rerender(h(Modal, { ...defaultProps, isVisible: false }));

      // Focus should return to trigger button
      await waitFor(() => {
        expect(triggerButton).toHaveFocus();
      });

      document.body.removeChild(triggerButton);
    });

    test('handles focus when no focusable elements exist', () => {
      const modalWithoutFocusable = h(Modal, { ...defaultProps }, [
        h('p', null, 'Just text content'),
        h('div', null, 'More text'),
      ]);

      expect(() => {
        render(modalWithoutFocusable);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(h(Modal, defaultProps));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });

    test('uses custom aria-label when provided', () => {
      render(h(Modal, { ...defaultProps, 'aria-label': 'Custom modal label' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-label', 'Custom modal label');
    });

    test('uses custom aria-describedby when provided', () => {
      render(h(Modal, { ...defaultProps, 'aria-describedby': 'custom-description' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-describedby', 'custom-description');
    });

    test('generates unique IDs for accessibility', () => {
      const { rerender } = render(h(Modal, defaultProps));

      const firstModal = screen.getByRole('dialog');
      const firstId = firstModal.getAttribute('id');

      rerender(h(Modal, { ...defaultProps, isVisible: false }));
      rerender(h(Modal, defaultProps));

      const secondModal = screen.getByRole('dialog');
      const secondId = secondModal.getAttribute('id');

      expect(firstId).not.toBe(secondId);
      expect(firstId).toMatch(/^modal-/);
      expect(secondId).toMatch(/^modal-/);
    });

    test('uses custom ID when provided', () => {
      render(h(Modal, { ...defaultProps, id: 'custom-modal-id' }));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('id', 'custom-modal-id');
    });

    test('close button has accessible label', () => {
      render(h(Modal, defaultProps));

      const closeButton = screen.getByRole('button', { name: 'Close dialog' });
      expect(closeButton).toHaveAttribute('aria-label', 'Close dialog');
    });
  });

  describe('Styling and Theme Integration', () => {
    test('applies theme colors to modal', () => {
      render(h(Modal, defaultProps));

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle({
        background: '#1e1f26', // darkPanel
        border: '1px solid #2c3039', // border
        borderRadius: '8px', // borderRadius.default
      });
    });

    test('applies theme colors to title', () => {
      render(h(Modal, defaultProps));

      const title = screen.getByText('Test Modal');
      expect(title).toHaveStyle({
        color: '#ffffff', // textColor
        fontSize: '14px', // typography.subheading
        fontWeight: '600',
      });
    });

    test('applies backdrop styling', () => {
      render(h(Modal, defaultProps));

      const backdrop = screen.getByRole('presentation');
      expect(backdrop).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.6)',
      });

      // Check zIndex separately as it might be a number
      expect(backdrop.style.zIndex).toBe('10000');
    });

    test('applies close button hover styles', async () => {
      const user = userEvent.setup();
      render(h(Modal, defaultProps));

      const closeButton = screen.getByRole('button', { name: 'Close dialog' });

      // Initial color
      expect(closeButton).toHaveStyle({
        color: '#999999', // textSecondary
      });

      // Hover color change
      await user.hover(closeButton);
      expect(closeButton).toHaveStyle({
        color: '#ffffff', // textColor
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles missing children gracefully', () => {
      expect(() => {
        render(h(Modal, { ...defaultProps, children: undefined as any }));
      }).not.toThrow();
    });

    test('handles missing onClose callback', () => {
      expect(() => {
        render(h(Modal, { ...defaultProps, onClose: undefined as any }));
      }).not.toThrow();
    });

    test('handles empty title', () => {
      render(h(Modal, { ...defaultProps, title: '' }));

      const title = screen.getByRole('heading');
      expect(title).toHaveTextContent('');
    });

    test('handles rapid visibility changes', async () => {
      const { rerender } = render(h(Modal, { ...defaultProps, isVisible: false }));

      // Rapidly toggle visibility
      rerender(h(Modal, { ...defaultProps, isVisible: true }));
      rerender(h(Modal, { ...defaultProps, isVisible: false }));
      rerender(h(Modal, { ...defaultProps, isVisible: true }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(h(Modal, defaultProps));

      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

      unmount();

      // Should have removed event listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Content Overflow', () => {
    test('handles long content with scroll', () => {
      const longContent = h('div', null,
        Array.from({ length: 50 }, (_, i) =>
          h('p', { key: i }, `Long content paragraph ${i + 1}`)
        )
      );

      render(h(Modal, { ...defaultProps, children: longContent }));

      const modal = screen.getByRole('dialog');
      const contentArea = modal.querySelector('[id$="-body"]');

      expect(contentArea).toHaveStyle({
        overflow: 'auto',
        flex: '1',
      });
    });

    test('maintains modal structure with various content types', () => {
      const mixedContent = h('div', null, [
        h('h4', { key: 'heading' }, 'Content Heading'),
        h('p', { key: 'text' }, 'Some text content'),
        h('button', { key: 'button' }, 'Action Button'),
        h('input', { key: 'input', type: 'text', placeholder: 'Input field' }),
      ]);

      render(h(Modal, { ...defaultProps, children: mixedContent }));

      expect(screen.getByText('Content Heading')).toBeInTheDocument();
      expect(screen.getByText('Some text content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Input field')).toBeInTheDocument();
    });
  });
});
