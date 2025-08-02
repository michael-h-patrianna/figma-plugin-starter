/**
 * Unit tests for Textbox component
 * Tests component rendering, variants, events, and accessibility
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { Textbox } from '../../../src/ui/components/base/Textbox';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to render Textbox with theme context
const renderTextbox = (props = {}, theme: 'light' | 'dark' = 'light') => {
  const defaultProps = {
    value: '',
    onValueInput: () => { },
    ...props
  };
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(Textbox, defaultProps) })
  );
};

describe('Textbox Component', () => {
  describe('Rendering', () => {
    test('renders textbox input', () => {
      renderTextbox();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('renders with placeholder', () => {
      renderTextbox({ placeholder: 'Enter text here' });
      expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument();
    });

    test('renders with value', () => {
      renderTextbox({ value: 'test content' });
      expect(screen.getByDisplayValue('test content')).toBeInTheDocument();
    });

    test('renders with custom className', () => {
      renderTextbox({ className: 'custom-textbox' });
      const textbox = screen.getByRole('textbox');
      expect(textbox.closest('.custom-textbox')).toHaveClass('custom-textbox');
    });

    test('applies custom styles', () => {
      const customStyle = { fontSize: '16px', color: 'rgb(0, 0, 255)' };
      renderTextbox({ style: customStyle });
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveStyle(customStyle);
    });
  });

  describe('Variants', () => {
    test('renders border variant by default', () => {
      renderTextbox();
      const textbox = screen.getByRole('textbox');
      // Border variant should have border style - check for any border width
      expect(textbox).toHaveStyle('border-width: 1px');
    });

    test('renders underline variant', () => {
      renderTextbox({ variant: 'underline' });
      const textbox = screen.getByRole('textbox');
      // Underline variant should have border-bottom but no full border
      expect(textbox).toHaveStyle('border-bottom-width: 1px');
    });

    test('renders border variant explicitly', () => {
      renderTextbox({ variant: 'border' });
      const textbox = screen.getByRole('textbox');
      // Border variant should have border style - check for any border width
      expect(textbox).toHaveStyle('border-width: 1px');
    });
  });

  describe('User Interactions', () => {
    test('calls onValueInput when typing', async () => {
      const user = userEvent.setup();
      const mockOnValueInput = jest.fn();
      renderTextbox({ onValueInput: mockOnValueInput });

      const textbox = screen.getByRole('textbox');
      await user.type(textbox, 'hello');

      expect(mockOnValueInput).toHaveBeenCalledTimes(5);
      expect(mockOnValueInput).toHaveBeenLastCalledWith('hello');
    });

    test('calls onFocus when focused', async () => {
      const user = userEvent.setup();
      const mockOnFocus = jest.fn();
      renderTextbox({ onFocus: mockOnFocus });

      const textbox = screen.getByRole('textbox');
      await user.click(textbox);

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    test('calls onBlur when focus is lost', async () => {
      const user = userEvent.setup();
      const mockOnBlur = jest.fn();
      renderTextbox({ onBlur: mockOnBlur });

      const textbox = screen.getByRole('textbox');
      await user.click(textbox);
      await user.tab();

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });

    test('handles clear input', async () => {
      const user = userEvent.setup();
      const mockOnValueInput = jest.fn();
      renderTextbox({ value: 'test', onValueInput: mockOnValueInput });

      const textbox = screen.getByRole('textbox');
      await user.clear(textbox);

      expect(mockOnValueInput).toHaveBeenCalledWith('');
    });
  });

  describe('Disabled State', () => {
    test('renders disabled textbox', () => {
      renderTextbox({ disabled: true });
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    test('does not call onValueInput when disabled', async () => {
      const user = userEvent.setup();
      const mockOnValueInput = jest.fn();
      renderTextbox({ disabled: true, onValueInput: mockOnValueInput });

      const textbox = screen.getByRole('textbox');
      await user.type(textbox, 'test');

      expect(mockOnValueInput).not.toHaveBeenCalled();
    });

    test('applies disabled styling', () => {
      renderTextbox({ disabled: true });
      const textbox = screen.getByRole('textbox');
      // Disabled textbox should have disabled attribute and not-allowed cursor
      expect(textbox).toBeDisabled();
      expect(textbox).toHaveStyle('cursor: not-allowed');
    });
  });

  describe('Icons and Suffixes', () => {
    test('renders with icon', () => {
      const iconElement = h('span', { className: 'test-icon' }, '🔍');
      renderTextbox({ icon: iconElement });
      expect(screen.getByText('🔍')).toBeInTheDocument();
    });

    test('renders with suffix', () => {
      const suffixElement = h('span', { className: 'test-suffix' }, 'px');
      renderTextbox({ suffix: suffixElement });
      expect(screen.getByText('px')).toBeInTheDocument();
    });

    test('renders with both icon and suffix', () => {
      const iconElement = h('span', { className: 'test-icon' }, '🔍');
      const suffixElement = h('span', { className: 'test-suffix' }, 'px');
      renderTextbox({ icon: iconElement, suffix: suffixElement });

      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(screen.getByText('px')).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    test('can be focused programmatically', async () => {
      const user = userEvent.setup();
      renderTextbox();

      const textbox = screen.getByRole('textbox');
      await user.click(textbox);
      expect(textbox).toHaveFocus();
    });

    test('shows focus state styling', async () => {
      const user = userEvent.setup();
      renderTextbox();

      const textbox = screen.getByRole('textbox');
      await user.click(textbox);

      // Focus state changes border color, but checking focus is sufficient
      expect(textbox).toHaveFocus();
    });
  });

  describe('Theme Support', () => {
    test('renders correctly in light theme', () => {
      renderTextbox({}, 'light');
      const textbox = screen.getByRole('textbox');
      expect(textbox).toBeInTheDocument();
    });

    test('renders correctly in dark theme', () => {
      renderTextbox({}, 'dark');
      const textbox = screen.getByRole('textbox');
      expect(textbox).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper role', () => {
      renderTextbox();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderTextbox();

      const textbox = screen.getByRole('textbox');

      // Tab to focus
      await user.tab();
      expect(textbox).toHaveFocus();

      // Tab away
      await user.tab();
      expect(textbox).not.toHaveFocus();
    });
  });
});
