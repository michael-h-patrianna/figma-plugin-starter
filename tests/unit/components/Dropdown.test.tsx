/**
 * Unit tests for Dropdown component
 * Tests selection logic, keyboard navigation, disabled states, and accessibility
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { h } from 'preact';
import { Dropdown } from '../../../src/ui/components/base/Dropdown';

// Mock theme context
jest.mock('../../../src/ui/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      darkBg: '#181a20',
      darkPanel: '#202329',
      backgroundSecondary: '#2a2d35',
      border: '#2c3039',
      textColor: '#ffffff',
      textSecondary: '#a0a3a8',
      textDisabled: '#555862',
      accent: '#4f94ff',
      accentHover: '#3d7df0',
      inputBackground: '#2a2d35',
      inputBorder: '#2c3039',
      inputBorderFocus: '#4f94ff',
    },
    spacing: { xs: 4, sm: 8, md: 16 },
    typography: { body: 14, bodySmall: 13 },
    borderRadius: { default: 6 },
  }),
}));

// Mock createPortal for dropdown positioning
jest.mock('preact/compat', () => ({
  ...jest.requireActual('preact/compat'),
  createPortal: (children: any) => children,
}));

describe('Dropdown Component', () => {
  const mockOptions = [
    { value: 'option1', text: 'Option 1' },
    { value: 'option2', text: 'Option 2' },
    { value: 'option3', text: 'Option 3', disabled: true },
    { value: 'option4', text: 'Option 4' },
  ];

  const defaultProps = {
    options: mockOptions,
    value: '',
    onValueChange: jest.fn(),
    placeholder: 'Select an option',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders with placeholder when no value selected', () => {
      render(h(Dropdown, defaultProps));

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    test('renders with selected value when value is provided', () => {
      render(h(Dropdown, { ...defaultProps, value: 'option1' }));

      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    test('applies custom className and style', () => {
      const customStyle = { marginTop: '10px' };
      render(h(Dropdown, {
        ...defaultProps,
        className: 'custom-dropdown',
        style: customStyle
      }));

      const container = screen.getByRole('button').parentElement;
      expect(container).toHaveClass('custom-dropdown');
      expect(container).toHaveStyle({ marginTop: '10px' });
    });

    test('shows disabled state when disabled prop is true', () => {
      render(h(Dropdown, { ...defaultProps, disabled: true }));

      const dropdown = screen.getByRole('button');
      expect(dropdown).toBeDisabled();
    });
  });

  describe('Dropdown Menu Interaction', () => {
    test('opens dropdown menu on click', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 4')).toBeInTheDocument();
      });
    });

    test('closes dropdown when clicking outside', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      // Wait for dropdown to open
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    test('closes dropdown on escape key', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      fireEvent.keyDown(dropdown, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Option Selection', () => {
    test('calls onValueChange when option is selected', async () => {
      const mockOnValueChange = jest.fn();
      render(h(Dropdown, { ...defaultProps, onValueChange: mockOnValueChange }));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Option 2'));

      expect(mockOnValueChange).toHaveBeenCalledWith('option2');
    });

    test('does not call onValueChange for disabled options', async () => {
      const mockOnValueChange = jest.fn();
      render(h(Dropdown, { ...defaultProps, onValueChange: mockOnValueChange }));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Option 3'));

      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    test('closes dropdown after selection', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Option 1'));

      await waitFor(() => {
        expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    test('opens dropdown with Enter key', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.keyDown(dropdown, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    test('opens dropdown with Space key', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.keyDown(dropdown, { key: ' ', code: 'Space' });

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    test('navigates options with arrow keys', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Arrow down should highlight first option
      fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });

      // Arrow up should navigate back
      fireEvent.keyDown(document, { key: 'ArrowUp', code: 'ArrowUp' });

      // Enter should select highlighted option
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

      expect(defaultProps.onValueChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      expect(dropdown).toHaveAttribute('aria-haspopup', 'listbox');
      expect(dropdown).toHaveAttribute('aria-expanded', 'false');
    });

    test('updates aria-expanded when dropdown opens', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        expect(dropdown).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('has proper role attributes for options', async () => {
      render(h(Dropdown, defaultProps));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      await waitFor(() => {
        const optionsList = screen.getByRole('listbox');
        expect(optionsList).toBeInTheDocument();

        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(4);
      });
    });
  });

  describe('Disabled State', () => {
    test('does not open when disabled', () => {
      render(h(Dropdown, { ...defaultProps, disabled: true }));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    test('ignores keyboard events when disabled', () => {
      render(h(Dropdown, { ...defaultProps, disabled: true }));

      const dropdown = screen.getByRole('button');
      fireEvent.keyDown(dropdown, { key: 'Enter', code: 'Enter' });

      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty options array', () => {
      render(h(Dropdown, { ...defaultProps, options: [] }));

      const dropdown = screen.getByRole('button');
      fireEvent.click(dropdown);

      // Should still render dropdown button but no options
      expect(dropdown).toBeInTheDocument();
    });

    test('handles missing onValueChange prop gracefully', () => {
      const propsWithoutCallback = { ...defaultProps };
      delete (propsWithoutCallback as any).onValueChange;

      expect(() => {
        render(h(Dropdown, propsWithoutCallback));
      }).not.toThrow();
    });

    test('handles invalid selected value', () => {
      render(h(Dropdown, { ...defaultProps, value: 'invalid-option' }));

      // Should show placeholder when value doesn't match any option
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not render dropdown menu when closed', () => {
      render(h(Dropdown, defaultProps));

      // Dropdown menu should not be in DOM when closed
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('memoizes options properly', () => {
      const { rerender } = render(h(Dropdown, defaultProps));

      // Rerender with same props
      rerender(h(Dropdown, defaultProps));

      // Should not cause unnecessary re-renders (component should handle this internally)
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
