/**
 * Unit tests for TimePicker component
 * Tests time selection, step intervals, disabled states, and accessibility
 */

import { fireEvent, render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { TimePicker } from '../../../src/ui/components/base/TimePicker';

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

describe('TimePicker Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders time input without label', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toBeInTheDocument();
      expect(timeInput).toHaveAttribute('type', 'time');
    });

    test('renders with label when provided', () => {
      render(h(TimePicker, { ...defaultProps, label: 'Start Time' }));

      expect(screen.getByText('Start Time')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    });

    test('renders with initial value', () => {
      render(h(TimePicker, { ...defaultProps, value: '14:30' }));

      const timeInput = screen.getByDisplayValue('14:30');
      expect(timeInput).toBeInTheDocument();
    });

    test('applies custom width', () => {
      render(h(TimePicker, { ...defaultProps, width: '150px' }));

      const container = screen.getByDisplayValue('').parentElement;
      expect(container).toHaveStyle({ width: '150px' });
    });

    test('applies default width when not specified', () => {
      render(h(TimePicker, defaultProps));

      const container = screen.getByDisplayValue('').parentElement;
      expect(container).toHaveStyle({ width: '100%' });
    });
  });

  describe('Time Selection', () => {
    test('calls onChange when time is selected', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');
      await user.type(timeInput, '09:30');

      expect(mockOnChange).toHaveBeenCalledWith('09:30');
    });

    test('handles time change with fireEvent', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '15:45' } });

      expect(mockOnChange).toHaveBeenCalledWith('15:45');
    });

    test('updates display value when value prop changes', () => {
      const { rerender } = render(h(TimePicker, { ...defaultProps, value: '08:00' }));

      expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();

      rerender(h(TimePicker, { ...defaultProps, value: '17:30' }));

      expect(screen.getByDisplayValue('17:30')).toBeInTheDocument();
    });

    test('handles 24-hour format', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '23:59' } });

      expect(mockOnChange).toHaveBeenCalledWith('23:59');
    });

    test('handles midnight time (00:00)', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '00:00' } });

      expect(mockOnChange).toHaveBeenCalledWith('00:00');
    });
  });

  describe('Step Configuration', () => {
    test('applies default step of 60 seconds', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '60');
    });

    test('applies custom step value', () => {
      render(h(TimePicker, { ...defaultProps, step: 300 })); // 5 minutes

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '300');
    });

    test('applies 1-second precision step', () => {
      render(h(TimePicker, { ...defaultProps, step: 1 }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '1');
    });

    test('applies 15-minute step intervals', () => {
      render(h(TimePicker, { ...defaultProps, step: 900 })); // 15 minutes

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '900');
    });
  });

  describe('Disabled State', () => {
    test('renders disabled input when disabled prop is true', () => {
      render(h(TimePicker, { ...defaultProps, disabled: true }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toBeDisabled();
    });

    test('does not call onChange when disabled', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, {
        ...defaultProps,
        onChange: mockOnChange,
        disabled: true
      }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '12:00' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('applies disabled styling', () => {
      render(h(TimePicker, { ...defaultProps, disabled: true }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveStyle({
        color: '#555862', // textDisabled
        background: '#1f2128', // inputBackgroundDisabled
      });
    });
  });

  describe('Accessibility', () => {
    test('associates label with input using htmlFor', () => {
      render(h(TimePicker, { ...defaultProps, label: 'Meeting Time' }));

      const label = screen.getByText('Meeting Time');
      const input = screen.getByLabelText('Meeting Time');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    test('has proper input type for screen readers', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('type', 'time');
    });

    test('is keyboard accessible', async () => {
      const mockOnChange = jest.fn();
      const user = userEvent.setup();

      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');

      // Focus input
      await user.click(timeInput);
      expect(timeInput).toHaveFocus();

      // Type time
      await user.keyboard('14:30');

      expect(mockOnChange).toHaveBeenCalled();
    });

    test('supports tab navigation', async () => {
      const user = userEvent.setup();

      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');

      // Tab to input
      await user.tab();
      expect(timeInput).toHaveFocus();

      // Tab away
      await user.tab();
      expect(timeInput).not.toHaveFocus();
    });
  });

  describe('Styling and Theme Integration', () => {
    test('applies theme colors to input', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveStyle({
        color: '#ffffff', // textColor
        background: '#2a2d35', // inputBackground
        border: '1px solid #2c3039', // inputBorder
      });
    });

    test('applies theme spacing to input padding', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveStyle({
        padding: '8px 12px', // spacing.sm and spacing.md-4
      });
    });

    test('applies theme colors to label', () => {
      render(h(TimePicker, { ...defaultProps, label: 'Test Label' }));

      const label = screen.getByText('Test Label');
      expect(label).toHaveStyle({
        color: '#ffffff', // textColor
        fontSize: '12px',
        fontWeight: '500',
      });
    });

    test('applies correct border radius', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveStyle({
        borderRadius: '6px',
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string value', () => {
      render(h(TimePicker, { ...defaultProps, value: '' }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toBeInTheDocument();
    });

    test('handles invalid time format gracefully', () => {
      // Component should still render even with invalid initial value
      expect(() => {
        render(h(TimePicker, { ...defaultProps, value: 'invalid-time' }));
      }).not.toThrow();
    });

    test('handles missing onChange prop gracefully', () => {
      const propsWithoutCallback = { ...defaultProps };
      delete (propsWithoutCallback as any).onChange;

      expect(() => {
        render(h(TimePicker, propsWithoutCallback));
      }).not.toThrow();
    });

    test('handles zero step value', () => {
      render(h(TimePicker, { ...defaultProps, step: 0 }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '0');
    });

    test('handles negative step value', () => {
      render(h(TimePicker, { ...defaultProps, step: -60 }));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('step', '-60');
    });
  });

  describe('Time Format Validation', () => {
    test('accepts valid HH:MM format', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '13:45' } });

      expect(mockOnChange).toHaveBeenCalledWith('13:45');
    });

    test('accepts valid HH:MM:SS format with seconds step', () => {
      const mockOnChange = jest.fn();
      render(h(TimePicker, { ...defaultProps, onChange: mockOnChange, step: 1 }));

      const timeInput = screen.getByDisplayValue('');
      fireEvent.change(timeInput, { target: { value: '13:45:30' } });

      expect(mockOnChange).toHaveBeenCalledWith('13:45:30');
    });

    test('maintains time format consistency', () => {
      const { rerender } = render(h(TimePicker, { ...defaultProps, value: '09:05' }));

      expect(screen.getByDisplayValue('09:05')).toBeInTheDocument();

      rerender(h(TimePicker, { ...defaultProps, value: '21:30' }));

      expect(screen.getByDisplayValue('21:30')).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility', () => {
    test('uses HTML5 time input type', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveAttribute('type', 'time');
    });

    test('provides proper box-sizing for cross-browser compatibility', () => {
      render(h(TimePicker, defaultProps));

      const timeInput = screen.getByDisplayValue('');
      expect(timeInput).toHaveStyle({
        boxSizing: 'border-box',
      });
    });
  });
});
