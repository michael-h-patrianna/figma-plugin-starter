/**
 * Unit tests for DatePicker component
 * Tests date selection, validation, disabled states, and accessibility
 */

import { fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { DatePicker } from '../../../src/ui/components/base/DatePicker';

// Mock theme context
jest.mock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textColor: '#ffffff',
      textDisabled: '#555862',
      inputBackground: '#2a2d35',
      inputBackgroundDisabled: '#1f2128',
      inputBorder: '#2c3039',
      inputBorderFocus: '#4f94ff',
    },
    spacing: { xs: 4, sm: 8, md: 16 },
  }),
}));

describe('DatePicker Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders date input without label', () => {
      render(h(DatePicker, defaultProps));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('renders with label when provided', () => {
      render(h(DatePicker, { ...defaultProps, label: 'Birth Date' }));

      expect(screen.getByText('Birth Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    });

    test('renders with initial value', () => {
      render(h(DatePicker, { ...defaultProps, value: '2024-01-15' }));

      const dateInput = screen.getByDisplayValue('2024-01-15');
      expect(dateInput).toBeInTheDocument();
    });

    test('applies custom width', () => {
      render(h(DatePicker, { ...defaultProps, width: '200px' }));

      const container = screen.getByDisplayValue('').parentElement;
      expect(container).toHaveStyle({ width: '200px' });
    });
  });

  describe('Date Selection', () => {
    test('calls onChange when date is selected', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(h(DatePicker, { ...defaultProps, onChange: mockOnChange }));

      const dateInput = screen.getByDisplayValue('');
      await user.type(dateInput, '2024-01-15');

      expect(mockOnChange).toHaveBeenCalledWith('2024-01-15');
    });

    test('handles date change with fireEvent', () => {
      const mockOnChange = jest.fn();
      render(h(DatePicker, { ...defaultProps, onChange: mockOnChange }));

      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });

      expect(mockOnChange).toHaveBeenCalledWith('2024-12-25');
    });

    test('updates display value when value prop changes', () => {
      const { rerender } = render(h(DatePicker, { ...defaultProps, value: '2024-01-01' }));

      expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();

      rerender(h(DatePicker, { ...defaultProps, value: '2024-12-31' }));

      expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    });
  });

  describe('Date Constraints', () => {
    test('applies min date constraint', () => {
      render(h(DatePicker, { ...defaultProps, min: '2024-01-01' }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('min', '2024-01-01');
    });

    test('applies max date constraint', () => {
      render(h(DatePicker, { ...defaultProps, max: '2024-12-31' }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('max', '2024-12-31');
    });

    test('applies both min and max constraints', () => {
      render(h(DatePicker, {
        ...defaultProps,
        min: '2024-01-01',
        max: '2024-12-31'
      }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('min', '2024-01-01');
      expect(dateInput).toHaveAttribute('max', '2024-12-31');
    });

    test('validates date within range', () => {
      const mockOnChange = jest.fn();
      render(h(DatePicker, {
        ...defaultProps,
        onChange: mockOnChange,
        min: '2024-01-01',
        max: '2024-12-31'
      }));

      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-06-15' } });

      expect(mockOnChange).toHaveBeenCalledWith('2024-06-15');
    });
  });

  describe('Disabled State', () => {
    test('renders disabled input when disabled prop is true', () => {
      render(h(DatePicker, { ...defaultProps, disabled: true }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toBeDisabled();
    });

    test('does not call onChange when disabled', () => {
      const mockOnChange = jest.fn();
      render(h(DatePicker, {
        ...defaultProps,
        onChange: mockOnChange,
        disabled: true
      }));

      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('applies disabled styling', () => {
      render(h(DatePicker, { ...defaultProps, disabled: true }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveStyle({
        color: '#555862', // textDisabled
        background: '#1f2128', // inputBackgroundDisabled
      });
    });
  });

  describe('Accessibility', () => {
    test('associates label with input using htmlFor', () => {
      render(h(DatePicker, { ...defaultProps, label: 'Event Date' }));

      const label = screen.getByText('Event Date');
      const input = screen.getByLabelText('Event Date');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    test('has proper input type for screen readers', () => {
      render(h(DatePicker, defaultProps));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('is keyboard accessible', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(h(DatePicker, { ...defaultProps, onChange: mockOnChange }));

      const dateInput = screen.getByDisplayValue('');

      // Focus input
      await user.click(dateInput);
      expect(dateInput).toHaveFocus();

      // Type date
      await user.keyboard('2024-01-15');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Styling and Theme Integration', () => {
    test('applies correct default width', () => {
      render(h(DatePicker, defaultProps));

      const container = screen.getByDisplayValue('').parentElement;
      expect(container).toHaveStyle({ width: '100%' });
    });

    test('applies theme colors to input', () => {
      render(h(DatePicker, defaultProps));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveStyle({
        color: '#ffffff', // textColor
        background: '#2a2d35', // inputBackground
        border: '1px solid #2c3039', // inputBorder
      });
    });

    test('applies theme spacing to input padding', () => {
      render(h(DatePicker, defaultProps));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveStyle({
        padding: '8px 12px', // spacing.sm and spacing.md-4
      });
    });

    test('applies theme colors to label', () => {
      render(h(DatePicker, { ...defaultProps, label: 'Test Label' }));

      const label = screen.getByText('Test Label');
      expect(label).toHaveStyle({
        color: '#ffffff', // textColor
        fontSize: '12px',
        fontWeight: '500',
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string value', () => {
      render(h(DatePicker, { ...defaultProps, value: '' }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toBeInTheDocument();
    });

    test('handles invalid date format gracefully', () => {
      // Component should still render even with invalid initial value
      expect(() => {
        render(h(DatePicker, { ...defaultProps, value: 'invalid-date' }));
      }).not.toThrow();
    });

    test('handles missing onChange prop gracefully', () => {
      const propsWithoutCallback = { ...defaultProps };
      delete (propsWithoutCallback as any).onChange;

      expect(() => {
        render(h(DatePicker, propsWithoutCallback));
      }).not.toThrow();
    });

    test('handles undefined min/max values', () => {
      render(h(DatePicker, {
        ...defaultProps,
        min: undefined,
        max: undefined
      }));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).not.toHaveAttribute('min');
      expect(dateInput).not.toHaveAttribute('max');
    });
  });

  describe('Browser Compatibility', () => {
    test('uses HTML5 date input type', () => {
      render(h(DatePicker, defaultProps));

      const dateInput = screen.getByDisplayValue('');
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    test('maintains proper date format (YYYY-MM-DD)', () => {
      const mockOnChange = jest.fn();
      render(h(DatePicker, { ...defaultProps, onChange: mockOnChange }));

      const dateInput = screen.getByDisplayValue('');
      fireEvent.change(dateInput, { target: { value: '2024-01-15' } });

      expect(mockOnChange).toHaveBeenCalledWith('2024-01-15');
    });
  });
});
