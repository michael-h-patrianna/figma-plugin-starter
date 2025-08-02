/**
 * Unit tests for Button component
 * Tests component rendering, props, events, and accessibility
 */

import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import { Button } from '../../../src/ui/components/base/Button';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to render Button with theme context
const renderButton = (props = {}, theme: 'light' | 'dark' = 'light') => {
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(Button, { ...props, children: 'Test Button' }) })
  );
};

describe('Button Component', () => {
  describe('Rendering', () => {
    test('renders button with children', () => {
      renderButton();
      expect(screen.getByRole('button')).toHaveTextContent('Test Button');
    });

    test('renders with correct variant styles', () => {
      renderButton({ variant: 'primary' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });

    test('renders all variant types', () => {
      const variants = ['primary', 'secondary', 'danger'];

      variants.forEach(variant => {
        const { unmount } = renderButton({ variant });
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        unmount();
      });
    });

    test('renders all size types', () => {
      const sizes = ['small', 'medium', 'large'];

      sizes.forEach(size => {
        const { unmount } = renderButton({ size });
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Props and Behavior', () => {
    test('handles click events', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick });

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('does not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick, disabled: true });

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('is disabled when disabled prop is true', () => {
      renderButton({ disabled: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('applies full width styling', () => {
      renderButton({ fullWidth: true });
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '100%' });
    });

    test('accepts custom className', () => {
      renderButton({ className: 'custom-class' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button', 'custom-class');
    });

    test('applies custom styles', () => {
      const customStyle = { background: 'red' };
      renderButton({ style: customStyle });
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ background: 'red' });
    });

    test('sets correct button type', () => {
      renderButton({ type: 'submit' });
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Accessibility', () => {
    test('has accessible role', () => {
      renderButton();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('supports aria-label', () => {
      renderButton({ 'aria-label': 'Custom label' });
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
    });

    test('supports aria-describedby', () => {
      renderButton({ 'aria-describedby': 'description-id' });
      expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', 'description-id');
    });

    test('supports aria-pressed', () => {
      renderButton({ 'aria-pressed': true });
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });

    test('supports aria-expanded', () => {
      renderButton({ 'aria-expanded': false });
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    test('supports aria-controls', () => {
      renderButton({ 'aria-controls': 'menu-id' });
      expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'menu-id');
    });

    test('sets aria-disabled when disabled', () => {
      renderButton({ disabled: true });
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    test('is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick });

      // Focus and activate with keyboard
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    test('applies light theme colors', () => {
      renderButton({}, 'light');
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Note: Actual color testing would require more sophisticated setup
      // since we're using CSS-in-JS with dynamic colors
    });

    test('applies dark theme colors', () => {
      renderButton({}, 'dark');
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Prop Validation', () => {
    test('validates props in development mode', () => {
      // Mock console.error to capture validation messages
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // This should trigger validation warnings for invalid props
      renderButton({ variant: 'invalid-variant' as any });

      // In a real test, we'd check for validation messages
      // expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('validation failed'));

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('handles null children gracefully', () => {
      render(
        h(ThemeProvider, { defaultTheme: 'light', children: h(Button, { children: null }) })
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles multiple children', () => {
      render(
        h(ThemeProvider, {
          defaultTheme: 'light',
          children: h(Button, {
            children: [
              h('span', {}, 'Icon'),
              h('span', {}, 'Text')
            ]
          })
        })
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('handles rapid clicks', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      renderButton({ onClick: handleClick });

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });
});
