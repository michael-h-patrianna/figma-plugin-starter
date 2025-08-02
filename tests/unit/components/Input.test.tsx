/**
 * Unit tests for Input component
 * Tests component rendering, validation, events, and accessibility
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { Input } from '../../../src/ui/components/base/Input';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to render Input with theme context
const renderInput = (props = {}, theme: 'light' | 'dark' = 'light') => {
  const defaultProps = {
    value: '',
    onChange: () => { },
    ...props
  };
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(Input, defaultProps) })
  );
};

describe('Input Component', () => {
  describe('Rendering', () => {
    test('renders input field', () => {
      renderInput();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('renders with placeholder', () => {
      renderInput({ placeholder: 'Enter text' });
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    test('renders with label', () => {
      renderInput({ label: 'Username' });
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    test('renders with error message', () => {
      renderInput({ error: 'This field is required' });
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('renders with value', () => {
      renderInput({ value: 'test value' });
      expect(screen.getByDisplayValue('test value')).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    test('renders text input by default', () => {
      renderInput();
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
    });

    test('renders number input', () => {
      renderInput({ type: 'number' });
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });

    test('renders email input', () => {
      renderInput({ type: 'email' });
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    test('renders password input', () => {
      renderInput({ type: 'password' });
      const input = document.querySelector('input[type="password"]');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when typing', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderInput({ onChange: mockOnChange });

      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');

      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenLastCalledWith('hello');
    });

    test('handles clear input', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderInput({ value: 'test', onChange: mockOnChange });

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    test('handles focus and blur', async () => {
      const user = userEvent.setup();
      renderInput();

      const input = screen.getByRole('textbox');
      await user.click(input);
      expect(input).toHaveFocus();

      await user.tab();
      expect(input).not.toHaveFocus();
    });
  });

  describe('Number Input Validation', () => {
    test('respects min attribute', () => {
      renderInput({ type: 'number', min: 5 });
      expect(screen.getByRole('spinbutton')).toHaveAttribute('min', '5');
    });

    test('respects max attribute', () => {
      renderInput({ type: 'number', max: 100 });
      expect(screen.getByRole('spinbutton')).toHaveAttribute('max', '100');
    });

    test('respects step attribute', () => {
      renderInput({ type: 'number', step: 0.1 });
      expect(screen.getByRole('spinbutton')).toHaveAttribute('step', '0.1');
    });
  });

  describe('Disabled State', () => {
    test('renders disabled input', () => {
      renderInput({ disabled: true });
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderInput({ disabled: true, onChange: mockOnChange });

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label', () => {
      renderInput({ 'aria-label': 'Custom label' });
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    test('links label to input with id', () => {
      renderInput({ label: 'Username', id: 'username-input' });
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username-input');
    });

    test('shows required attribute', () => {
      renderInput({ required: true });
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    test('shows aria-invalid when error present', () => {
      renderInput({ error: 'Invalid input' });
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    test('has aria-describedby when error present', () => {
      renderInput({ error: 'Invalid input' });
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Invalid input')).toHaveAttribute('id', errorId);
    });
  });

  describe('Styling', () => {
    test('applies custom width', () => {
      renderInput({ width: '200px' });
      const container = document.querySelector('div[style*="width: 200px"]');
      expect(container).toHaveStyle({ width: '200px' });
    });

    test('applies error styling when error present', () => {
      renderInput({ error: 'Error message' });
      const input = screen.getByRole('textbox');
      const computedStyle = window.getComputedStyle(input);
      expect(computedStyle.borderColor).not.toBe('rgb(225, 229, 233)'); // Should not be the default border color
    });
  });

  describe('Theme Support', () => {
    test('renders correctly in light theme', () => {
      renderInput({}, 'light');
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('renders correctly in dark theme', () => {
      renderInput({}, 'dark');
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });
  });
});
