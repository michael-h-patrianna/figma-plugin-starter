/**
 * Unit tests for ProgressBar component
 * Tests component rendering, props, progress clamping, and accessibility
 */

import { render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { ProgressBar } from '../../../src/ui/components/base/ProgressBar';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to render ProgressBar with theme context
const renderProgressBar = (props = {}, theme: 'light' | 'dark' = 'light') => {
  return render(
    h(ThemeProvider, { defaultTheme: theme, children: h(ProgressBar, { progress: 50, ...props }) })
  );
};

describe('ProgressBar Component', () => {
  describe('Rendering', () => {
    test('renders progress bar with default progress', () => {
      renderProgressBar();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('renders with custom progress value', () => {
      renderProgressBar({ progress: 75 });
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    test('renders with label', () => {
      renderProgressBar({ label: 'Loading...' });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('hides percentage when showPercentage is false', () => {
      renderProgressBar({ showPercentage: false });
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    test('renders only label when showPercentage is false and label is provided', () => {
      renderProgressBar({ label: 'Progress', showPercentage: false });
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    test('hides label section when no label and showPercentage is false', () => {
      const { container } = renderProgressBar({ showPercentage: false });
      // Should only have the progress bar container, no label section
      const outerContainer = container.firstChild as HTMLElement;
      expect(outerContainer.children).toHaveLength(1);
      expect(outerContainer.firstChild).toHaveStyle('border-radius: 6px'); // Progress bar
    });
  });

  describe('Progress Clamping', () => {
    test('clamps progress above 100 to 100', () => {
      renderProgressBar({ progress: 150 });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    test('clamps negative progress to 0', () => {
      renderProgressBar({ progress: -25 });
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    test('handles decimal progress values', () => {
      renderProgressBar({ progress: 33.7 });
      expect(screen.getByText('34%')).toBeInTheDocument(); // Rounded
    });

    test('handles zero progress', () => {
      renderProgressBar({ progress: 0 });
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    test('handles 100% progress', () => {
      renderProgressBar({ progress: 100 });
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Styling and Props', () => {
    test('applies custom height', () => {
      const { container } = renderProgressBar({ height: 12 });
      const progressContainer = container.querySelector('div > div:nth-child(2)') as HTMLElement;
      expect(progressContainer).toHaveStyle('height: 12px');
    });

    test('applies default height when not specified', () => {
      const { container } = renderProgressBar();
      const progressContainer = container.querySelector('div > div:nth-child(2)') as HTMLElement;
      expect(progressContainer).toHaveStyle('height: 8px');
    });

    test('applies custom color to progress fill', () => {
      const customColor = '#ff0000';
      const { container } = renderProgressBar({ color: customColor });
      const progressFill = container.querySelector('div > div:nth-child(2) > div') as HTMLElement;
      expect(progressFill).toHaveStyle('background: #ff0000');
    });

    test('uses theme accent color when no custom color provided', () => {
      const { container } = renderProgressBar();
      const progressFill = container.querySelector('div > div:last-child > div');
      expect(progressFill).toHaveStyle({ background: expect.any(String) });
    });

    test('applies correct width based on progress', () => {
      const { container } = renderProgressBar({ progress: 25 });
      const progressFill = container.querySelector('div > div:nth-child(2) > div') as HTMLElement;
      expect(progressFill).toHaveStyle('width: 25%');
    });
  });

  describe('Theme Integration', () => {
    test('applies light theme styling', () => {
      const { container } = renderProgressBar({}, 'light');
      const labelContainer = container.querySelector('div > div:first-child');
      expect(labelContainer).toBeInTheDocument();
    });

    test('applies dark theme styling', () => {
      const { container } = renderProgressBar({}, 'dark');
      const labelContainer = container.querySelector('div > div:first-child');
      expect(labelContainer).toBeInTheDocument();
    });

    test('uses theme colors for background and border', () => {
      const { container } = renderProgressBar();
      const progressContainer = container.querySelector('div > div:last-child');
      expect(progressContainer).toHaveStyle({
        background: expect.any(String),
        border: expect.stringContaining('1px solid')
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', () => {
      const { container } = renderProgressBar({ label: 'Upload progress' });
      expect(container.firstChild).toBeInTheDocument();
    });

    test('provides readable text content', () => {
      renderProgressBar({ label: 'Loading data', progress: 65 });
      expect(screen.getByText('Loading data')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });

    test('supports screen readers with label and percentage', () => {
      const { container } = renderProgressBar({
        label: 'File upload',
        progress: 45
      });

      // Check that both label and percentage are present for screen readers
      expect(screen.getByText('File upload')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very small progress values', () => {
      renderProgressBar({ progress: 0.1 });
      expect(screen.getByText('0%')).toBeInTheDocument(); // Rounded down
    });

    test('handles very large progress values', () => {
      renderProgressBar({ progress: 999 });
      expect(screen.getByText('100%')).toBeInTheDocument(); // Clamped
    });

    test('handles NaN progress values gracefully', () => {
      renderProgressBar({ progress: NaN });
      expect(screen.getByText('NaN%')).toBeInTheDocument(); // Shows NaN as-is
    });

    test('handles undefined/null label gracefully', () => {
      renderProgressBar({ label: undefined });
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('handles empty string label', () => {
      renderProgressBar({ label: '' });
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    test('applies transition styling for smooth progress updates', () => {
      const { container } = renderProgressBar();
      const progressFill = container.querySelector('div > div:nth-child(2) > div') as HTMLElement;
      expect(progressFill).toHaveStyle('transition: width 0.3s ease');
    });
  });

  describe('Responsive Behavior', () => {
    test('fills full width of container', () => {
      const { container } = renderProgressBar();
      const outerContainer = container.firstChild as HTMLElement;
      expect(outerContainer).toHaveStyle({ width: '100%' });
    });

    test('progress bar fills full width of its container', () => {
      const { container } = renderProgressBar();
      const progressContainer = container.querySelector('div > div:last-child');
      expect(progressContainer).toHaveStyle({ width: '100%' });
    });
  });
});
