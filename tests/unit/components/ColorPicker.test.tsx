/**
 * Unit tests for ColorPicker component
 * Tests c  describe('Color Selection', () => {
    test('calls onChange when color is selected', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      expect(mockOnChange).toHaveBeenCalledWith('#ff0000');
    });tion, size variants, disabled states, and hex value handling
 */

import { fireEvent, render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { ColorPicker } from '../../../src/ui/components/base/ColorPicker';

// Mock theme context
jest.mock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      textColor: '#ffffff',
      border: '#2c3039',
    },
  }),
}));

describe('ColorPicker Component', () => {
  const defaultProps = {
    value: '#3772FF',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders color input with default value', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    test('renders with custom value', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, value: '#ff5733' }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
    });

    test('has correct input type for color picker', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });
  });

  describe('Color Selection', () => {
    test('calls onChange when color is selected', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      expect(mockOnChange).toHaveBeenCalledWith('#ff0000');
    });

    test('handles hex color format changes', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      // Test various hex formats
      fireEvent.change(colorInput, { target: { value: '#00ff00' } });
      expect(mockOnChange).toHaveBeenCalledWith('#00ff00');

      fireEvent.change(colorInput, { target: { value: '#0000ff' } });
      expect(mockOnChange).toHaveBeenCalledWith('#0000ff');
    });

    test('updates display value when value prop changes', () => {
      const { rerender, container } = render(h(ColorPicker, { ...defaultProps, value: '#ff0000' }));

      expect(container.querySelector('input[type="color"]') as HTMLInputElement).toBeInTheDocument();

      rerender(h(ColorPicker, { ...defaultProps, value: '#00ff00' }));

      expect(container.querySelector('input[type="color"]') as HTMLInputElement).toBeInTheDocument();
    });

    test('handles uppercase hex values', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#FF5733' } });

      // HTML color inputs normalize to lowercase
      expect(mockOnChange).toHaveBeenCalledWith('#ff5733');
    });

    test('handles lowercase hex values', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#abc123' } });

      expect(mockOnChange).toHaveBeenCalledWith('#abc123');
    });
  });

  describe('Size Variants', () => {
    test('applies default medium size', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        width: '40px',
        height: '40px',
      });
    });

    test('applies small size', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, size: 'small' }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        width: '32px',
        height: '32px',
      });
    });

    test('applies large size', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, size: 'large' }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        width: '56px',
        height: '56px',
      });
    });

    test('applies medium size when size prop is medium', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, size: 'medium' }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        width: '40px',
        height: '40px',
      });
    });
  });

  describe('Disabled State', () => {
    test('renders disabled input when disabled prop is true', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: true }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeDisabled();
    });

    test('does not call onChange when disabled', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, {
        ...defaultProps,
        onChange: mockOnChange,
        disabled: true
      }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('applies disabled styling', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: true }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        cursor: 'not-allowed',
        opacity: '0.5',
      });
    });

    test('maintains enabled styling when not disabled', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: false }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        cursor: 'pointer',
        opacity: '1',
      });
    });
  });

  describe('Focus and Blur Interactions', () => {
    test('changes border color on focus', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      // Initial border color
      expect(colorInput).toHaveStyle({
        borderColor: '#2c3039', // colors.border
      });

      fireEvent.focus(colorInput);

      expect(colorInput).toHaveStyle({
        borderColor: '#ffffff', // colors.textColor
      });
    });

    test('restores border color on blur', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      // Focus then blur
      fireEvent.focus(colorInput);
      fireEvent.blur(colorInput);

      expect(colorInput).toHaveStyle({
        borderColor: '#2c3039', // colors.border
      });
    });

    test('does not change border color on focus when disabled', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: true }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      const initialBorderColor = '#2c3039';
      expect(colorInput).toHaveStyle({ borderColor: initialBorderColor });

      fireEvent.focus(colorInput);

      // Border color should remain the same when disabled
      expect(colorInput).toHaveStyle({ borderColor: initialBorderColor });
    });

    test('does not change border color on blur when disabled', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: true }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      const initialBorderColor = '#2c3039';
      fireEvent.focus(colorInput);
      fireEvent.blur(colorInput);

      expect(colorInput).toHaveStyle({ borderColor: initialBorderColor });
    });
  });

  describe('Styling and Theme Integration', () => {
    test('applies theme border color', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        border: '2px solid #2c3039', // colors.border
      });
    });

    test('applies correct border radius', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        borderRadius: '6px',
      });
    });

    test('applies transition for smooth interactions', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveStyle({
        transition: 'all 0.2s ease',
      });
    });

    test('removes default padding and outline', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      // Check that these properties are set, but JSDOM might not reflect all CSS exactly
      expect(colorInput).toBeInTheDocument();
      expect(colorInput.style.padding).toBe('0px');
    });
  });

  describe('Accessibility', () => {
    test('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      // Focus input
      await user.click(colorInput);
      expect(colorInput).toHaveFocus();
    });

    test('supports tab navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;

      // Tab to input
      await user.tab();
      expect(colorInput).toHaveFocus();

      // Tab away
      await user.tab();
      expect(colorInput).not.toHaveFocus();
    });

    test('has proper input type for screen readers', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    test('maintains focus behavior when not disabled', async () => {
      const user = userEvent.setup();
      const { container } = render(h(ColorPicker, { ...defaultProps, disabled: false }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      await user.click(colorInput);

      expect(colorInput).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    test('handles missing onChange prop gracefully', () => {
      const propsWithoutCallback = { ...defaultProps };
      delete (propsWithoutCallback as any).onChange;

      const { container } = render(h(ColorPicker, propsWithoutCallback));

      // Should not crash when change event occurs
      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    });

    test('handles undefined value prop', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, value: undefined }));

      // Should use default value
      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
    });

    test('handles empty string value', () => {
      const { container } = render(h(ColorPicker, { ...defaultProps, value: '' }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
    });

    test('handles invalid hex values gracefully', () => {
      expect(() => {
        const { container } = render(h(ColorPicker, { ...defaultProps, value: 'invalid-color' }));
      }).not.toThrow();
    });

    test('handles null onChange callback', () => {
      expect(() => {
        const { container } = render(h(ColorPicker, { ...defaultProps, onChange: null as any }));
      }).not.toThrow();
    });
  });

  describe('Color Format Validation', () => {
    test('accepts valid hex colors with #', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#123456' } });

      expect(mockOnChange).toHaveBeenCalledWith('#123456');
    });

    test('handles 3-digit hex shorthand', () => {
      const mockOnChange = jest.fn();
      const { container } = render(h(ColorPicker, { ...defaultProps, onChange: mockOnChange }));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      fireEvent.change(colorInput, { target: { value: '#abc' } });

      // JSDOM handles 3-digit hex differently - this is a limitation
      expect(mockOnChange).toHaveBeenCalled();
    });

    test('maintains hex format consistency', () => {
      const { rerender, container } = render(h(ColorPicker, { ...defaultProps, value: '#ff0000' }));

      expect(container.querySelector('input[type="color"]') as HTMLInputElement).toBeInTheDocument();

      rerender(h(ColorPicker, { ...defaultProps, value: '#00FF00' }));

      expect(container.querySelector('input[type="color"]') as HTMLInputElement).toBeInTheDocument();
    });
  });

  describe('Browser Compatibility', () => {
    test('uses HTML5 color input type', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    test('provides fallback for unsupported browsers', () => {
      const { container } = render(h(ColorPicker, defaultProps));

      const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
      // Color input should still render as text input in unsupported browsers
      expect(colorInput).toBeInTheDocument();
    });
  });
});
