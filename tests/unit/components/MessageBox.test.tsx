import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { MessageBox } from '@ui/components/base/MessageBox';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import {
  hideMessageBox,
  messageBoxState,
  showConfirmBox,
  showMessageBox,
  showYesNoBox,
  showYesNoCancelBox
} from '@ui/services/messageBox';

// Mock the Modal component since we're testing MessageBox functionality
jest.mock('@ui/components/base/Modal', () => ({
  Modal: ({ children, isVisible, onClose, title, showCloseButton }: any) => (
    isVisible ? (
      <div data-testid="modal">
        <div data-testid="modal-header">
          <h2>{title}</h2>
          {showCloseButton && (
            <button data-testid="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div data-testid="modal-content">{children}</div>
      </div>
    ) : null
  )
}));

// Mock the Button component
jest.mock('@ui/components/base/Button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button
      onClick={onClick}
      data-testid={`button-${children.toLowerCase()}`}
      data-variant={variant}
    >
      {children}
    </button>
  )
}));

const renderMessageBox = (props = {}) => {
  return render(
    <ThemeProvider>
      <MessageBox {...props} />
    </ThemeProvider>
  );
};

describe('MessageBox Component', () => {
  beforeEach(() => {
    // Reset message box state before each test
    messageBoxState.value = { open: false };
  });

  describe('Visibility', () => {
    test('renders nothing when messageBoxState.open is false', () => {
      messageBoxState.value = { open: false };
      const { container } = renderMessageBox();
      expect(container.firstChild).toBeNull();
    });

    test('renders modal when messageBoxState.open is true', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test Title',
        text: 'Test message'
      };
      renderMessageBox();
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    test('displays title and text content', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test Title',
        text: 'This is a test message'
      };
      renderMessageBox();

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test message')).toBeInTheDocument();
    });

    test('uses default title when none provided', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    test('applies correct text styling', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      const textElement = screen.getByText('Test message');
      expect(textElement).toHaveStyle('margin: 0');
      expect(textElement).toHaveStyle('line-height: 1.5');
      expect(textElement).toHaveStyle('font-size: 14px');
    });
  });

  describe('Button Types', () => {
    test('shows OK button for "ok" type', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('button-ok')).toBeInTheDocument();
      expect(screen.queryByTestId('button-cancel')).not.toBeInTheDocument();
    });

    test('shows OK and Cancel buttons for "okcancel" type', () => {
      messageBoxState.value = {
        open: true,
        type: 'okcancel',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('button-ok')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toHaveAttribute('data-variant', 'secondary');
    });

    test('shows Yes and No buttons for "yesno" type', () => {
      messageBoxState.value = {
        open: true,
        type: 'yesno',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('button-yes')).toBeInTheDocument();
      expect(screen.getByTestId('button-no')).toBeInTheDocument();
      expect(screen.getByTestId('button-no')).toHaveAttribute('data-variant', 'secondary');
    });

    test('shows Yes, No, and Cancel buttons for "yesnocancel" type', () => {
      messageBoxState.value = {
        open: true,
        type: 'yesnocancel',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('button-yes')).toBeInTheDocument();
      expect(screen.getByTestId('button-no')).toBeInTheDocument();
      expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      expect(screen.getByTestId('button-no')).toHaveAttribute('data-variant', 'secondary');
      expect(screen.getByTestId('button-cancel')).toHaveAttribute('data-variant', 'secondary');
    });

    test('shows default OK button for unknown type', () => {
      messageBoxState.value = {
        open: true,
        type: 'unknown' as any,
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('button-ok')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    test('calls onOk callback when OK button is clicked', () => {
      const onOkMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message',
        onOk: onOkMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('button-ok'));
      expect(onOkMock).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel callback when Cancel button is clicked', () => {
      const onCancelMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'okcancel',
        title: 'Test',
        text: 'Test message',
        onCancel: onCancelMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('button-cancel'));
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    test('calls onYes callback when Yes button is clicked', () => {
      const onYesMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'yesno',
        title: 'Test',
        text: 'Test message',
        onYes: onYesMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('button-yes'));
      expect(onYesMock).toHaveBeenCalledTimes(1);
    });

    test('calls onNo callback when No button is clicked', () => {
      const onNoMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'yesno',
        title: 'Test',
        text: 'Test message',
        onNo: onNoMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('button-no'));
      expect(onNoMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close Behavior', () => {
    test('calls onOk when close button is clicked on "ok" type', () => {
      const onOkMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message',
        onOk: onOkMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('close-button'));
      expect(onOkMock).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when close button is clicked on "okcancel" type', () => {
      const onCancelMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'okcancel',
        title: 'Test',
        text: 'Test message',
        onCancel: onCancelMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('close-button'));
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });

    test('calls onNo when close button is clicked on "yesno" type', () => {
      const onNoMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'yesno',
        title: 'Test',
        text: 'Test message',
        onNo: onNoMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('close-button'));
      expect(onNoMock).toHaveBeenCalledTimes(1);
    });

    test('calls onCancel when close button is clicked on "yesnocancel" type', () => {
      const onCancelMock = jest.fn();
      messageBoxState.value = {
        open: true,
        type: 'yesnocancel',
        title: 'Test',
        text: 'Test message',
        onCancel: onCancelMock
      };
      renderMessageBox();

      fireEvent.click(screen.getByTestId('close-button'));
      expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Integration', () => {
    test('showMessageBox displays message box correctly', async () => {
      renderMessageBox(); // Render the component first
      const promise = showMessageBox('Test Title', 'Test Message');

      await waitFor(() => {
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Message')).toBeInTheDocument();
        expect(screen.getByTestId('button-ok')).toBeInTheDocument();
      });

      // Click OK to resolve promise
      fireEvent.click(screen.getByTestId('button-ok'));
      await promise;
    });

    test('showConfirmBox displays confirm box correctly', async () => {
      renderMessageBox(); // Render the component first
      const promise = showConfirmBox('Confirm', 'Are you sure?');

      await waitFor(() => {
        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(screen.getByText('Are you sure?')).toBeInTheDocument();
        expect(screen.getByTestId('button-ok')).toBeInTheDocument();
        expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      });

      // Click OK to resolve promise
      fireEvent.click(screen.getByTestId('button-ok'));
      const result = await promise;
      expect(result).toBe(true);
    });

    test('showConfirmBox returns false when Cancel is clicked', async () => {
      renderMessageBox(); // Render the component first
      const promise = showConfirmBox('Confirm', 'Are you sure?');

      await waitFor(() => {
        expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button-cancel'));
      const result = await promise;
      expect(result).toBe(false);
    });

    test('showYesNoBox displays yes/no box correctly', async () => {
      renderMessageBox(); // Render the component first
      const promise = showYesNoBox('Question', 'Do you agree?');

      await waitFor(() => {
        expect(screen.getByText('Question')).toBeInTheDocument();
        expect(screen.getByText('Do you agree?')).toBeInTheDocument();
        expect(screen.getByTestId('button-yes')).toBeInTheDocument();
        expect(screen.getByTestId('button-no')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button-yes'));
      const result = await promise;
      expect(result).toBe(true);
    });

    test('showYesNoCancelBox displays all three buttons correctly', async () => {
      renderMessageBox(); // Render the component first
      const promise = showYesNoCancelBox('Save Changes', 'Do you want to save?');

      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
        expect(screen.getByText('Do you want to save?')).toBeInTheDocument();
        expect(screen.getByTestId('button-yes')).toBeInTheDocument();
        expect(screen.getByTestId('button-no')).toBeInTheDocument();
        expect(screen.getByTestId('button-cancel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('button-cancel'));
      const result = await promise;
      expect(result).toBe('cancel');
    });
  });

  describe('Layout and Styling', () => {
    test('applies correct container styling', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      const content = screen.getByTestId('modal-content');
      const container = content.firstChild as HTMLElement;
      expect(container).toHaveStyle('display: flex');
      expect(container).toHaveStyle('flex-direction: column');
      expect(container).toHaveStyle('gap: 16px');
    });

    test('applies correct button container styling', () => {
      messageBoxState.value = {
        open: true,
        type: 'okcancel',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      const buttonContainer = screen.getByTestId('button-ok').parentElement;
      expect(buttonContainer).toHaveStyle('display: flex');
      expect(buttonContainer).toHaveStyle('gap: 8px');
      expect(buttonContainer).toHaveStyle('justify-content: flex-end');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing callbacks gracefully', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
        // No callbacks provided
      };
      renderMessageBox();

      // Should not throw when clicking buttons without callbacks
      expect(() => {
        fireEvent.click(screen.getByTestId('button-ok'));
      }).not.toThrow();
    });

    test('handles hideMessageBox call directly', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      hideMessageBox();

      expect(messageBoxState.value.open).toBe(false);
    });

    test('handles empty or undefined text', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: ''
      };
      renderMessageBox();

      const textElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && content === '';
      });
      expect(textElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides proper modal structure', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test Title',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-header')).toBeInTheDocument();
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    test('includes close button for accessibility', () => {
      messageBoxState.value = {
        open: true,
        type: 'ok',
        title: 'Test',
        text: 'Test message'
      };
      renderMessageBox();

      expect(screen.getByTestId('close-button')).toBeInTheDocument();
    });
  });
});
