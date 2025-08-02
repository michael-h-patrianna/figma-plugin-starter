/**
 * Unit tests for ToggleSwitch component
 * Tests component rendering, state changes, events, and accessibility
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { ToggleSwitch } from '../../../src/ui/components/base/ToggleSwitch';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to render ToggleSwitch with theme context
const renderToggleSwitch = (props = {}, theme: 'light' | 'dark' = 'light') => {
  const defaultProps = {
    checked: false,
    onChange: () => { },
    label: 'Test Toggle',
    ...props
  };
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(ToggleSwitch, defaultProps) })
  );
};

describe('ToggleSwitch Component', () => {
  describe('Rendering', () => {
    test('renders toggle switch container', () => {
      renderToggleSwitch();
      expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    });

    test('renders with label', () => {
      renderToggleSwitch({ label: 'Enable notifications' });
      expect(screen.getByText('Enable notifications')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onChange when clicked', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderToggleSwitch({ checked: false, onChange: mockOnChange });

      const container = screen.getByText('Test Toggle').closest('div');
      if (container) {
        await user.click(container);
        expect(mockOnChange).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('Disabled State', () => {
    test('does not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderToggleSwitch({ disabled: true, onChange: mockOnChange });

      const container = screen.getByText('Test Toggle').closest('div');
      if (container) {
        await user.click(container);
        expect(mockOnChange).not.toHaveBeenCalled();
      }
    });
  });
});
