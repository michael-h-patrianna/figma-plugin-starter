/**
 * Unit tests for Spinner component
 * Tests component rendering, animation, props, and accessibility
 */

import { act, render } from '@testing-library/preact';
import { h } from 'preact';
import { Spinner } from '../../../src/ui/components/base/Spinner';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Mock timers for animation testing
jest.useFakeTimers();

// Helper to render Spinner with theme context
const renderSpinner = (props = {}, theme: 'light' | 'dark' = 'light') => {
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(Spinner, props) })
  );
};

describe('Spinner Component', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Rendering', () => {
    test('renders spinner with default props', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveStyle({
        width: '20px',
        height: '20px',
        display: 'inline-block'
      });
    });

    test('renders with custom size', () => {
      const { container } = renderSpinner({ size: 40 });
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toHaveStyle({
        width: '40px',
        height: '40px'
      });
    });

    test('renders with custom thickness', () => {
      const { container } = renderSpinner({ thickness: 4 });
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.style.borderWidth).toBe('4px');
      expect(spinner.style.borderTopWidth).toBe('4px');
    });

    test('applies default border radius for circular shape', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toHaveStyle({ borderRadius: '50%' });
    });
  });

  describe('Animation', () => {
    test('starts with initial rotation of 0', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.style.transform).toBe('rotate(0deg)');
    });

    test('animates rotation over time', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      // Initial state
      expect(spinner.style.transform).toBe('rotate(0deg)');

      // Advance time by one frame (16ms)
      act(() => {
        jest.advanceTimersByTime(16);
      });

      expect(spinner.style.transform).toBe('rotate(10deg)');
    });

    test('applies smooth transition for animation', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toHaveStyle({ transition: 'transform 0.016s linear' });
    });
  });

  describe('Props and Styling', () => {
    test('applies default size when not specified', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toHaveStyle({
        width: '20px',
        height: '20px'
      });
    });

    test('applies default thickness when not specified', () => {
      const { container } = renderSpinner();
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.style.borderWidth).toBe('2px');
    });
  });

  describe('Edge Cases', () => {
    test('handles zero size gracefully', () => {
      const { container } = renderSpinner({ size: 0 });
      const spinner = container.firstChild as HTMLElement;

      expect(spinner).toHaveStyle({
        width: '0px',
        height: '0px'
      });
    });

    test('handles zero thickness gracefully', () => {
      const { container } = renderSpinner({ thickness: 0 });
      const spinner = container.firstChild as HTMLElement;

      expect(spinner.style.borderWidth).toBe('0px');
    });
  });
});
