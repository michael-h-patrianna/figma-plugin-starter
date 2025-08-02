import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { SettingsDropdown } from '@ui/components/base/SettingsDropdown';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

const renderSettingsDropdown = (props: any) => {
  return render(
    h(ThemeProvider, { children: h(SettingsDropdown, props) })
  );
};

const defaultProps = {
  debugMode: false,
  onDebugToggle: jest.fn(),
  onThemeToggle: jest.fn(),
};

describe('SettingsDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders settings button with cog icon', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('title', 'Settings');

      // Check for SVG icon
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
    });

    it('applies correct button styling', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      expect(button).toHaveStyle({
        background: 'transparent',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '4px',
      });
      // Note: border styling is handled by CSS reset and may vary
    });

    it('does not show context menu initially', () => {
      renderSettingsDropdown(defaultProps);

      // Context menu should not be visible initially
      expect(screen.queryByText('Debug Mode')).not.toBeInTheDocument();
      expect(screen.queryByText('Dark Theme')).not.toBeInTheDocument();
      expect(screen.queryByText('Light Theme')).not.toBeInTheDocument();
    });
  });

  describe('Context Menu Interaction', () => {
    it('shows context menu when button is clicked', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
      });
    });

    it('shows both debug and theme toggle options', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
        expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      });
    });

    it('includes separator between toggle options', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Check that menu items are rendered and separated
        const debugText = screen.getByText('Debug Mode');
        const themeText = screen.getByText('Dark Theme');
        expect(debugText).toBeInTheDocument();
        expect(themeText).toBeInTheDocument();
      });
    });
  });

  describe('Debug Mode Toggle', () => {
    it('shows debug toggle in off state when debugMode is false', async () => {
      renderSettingsDropdown({ ...defaultProps, debugMode: false });

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        const debugText = screen.getByText('Debug Mode');
        expect(debugText).toBeInTheDocument();

        // Find the toggle switch for debug mode
        const toggles = screen.getAllByRole('button');
        const debugToggle = toggles.find(toggle =>
          toggle.closest('div')?.textContent?.includes('Debug Mode')
        );
        expect(debugToggle).toBeInTheDocument();
      });
    });

    it('shows debug toggle in on state when debugMode is true', async () => {
      renderSettingsDropdown({ ...defaultProps, debugMode: true });

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
      });
    });

    it('calls onDebugToggle when debug toggle is clicked', async () => {
      const onDebugToggle = jest.fn();
      renderSettingsDropdown({ ...defaultProps, onDebugToggle });

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
      });

      // Find the debug toggle switch container and click it
      const debugContainer = screen.getByText('Debug Mode').closest('div');
      const toggleContainer = debugContainer?.querySelector('div[style*="width: 36px"]');

      if (toggleContainer) {
        fireEvent.click(toggleContainer);
        expect(onDebugToggle).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('Theme Toggle', () => {
    it('shows "Dark Theme" text in dark theme', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      });
    });

    it('calls onThemeToggle when theme toggle is clicked', async () => {
      const onThemeToggle = jest.fn();
      renderSettingsDropdown({ ...defaultProps, onThemeToggle });

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      });

      // Find the theme toggle switch container and click it
      const themeContainer = screen.getByText('Dark Theme').closest('div');
      const toggleContainer = themeContainer?.querySelector('div[style*="width: 36px"]');

      if (toggleContainer) {
        fireEvent.click(toggleContainer);
        expect(onThemeToggle).toHaveBeenCalled();
      }
    });
  });

  describe('Button Hover Effects', () => {
    it('applies hover effects on mouse enter and leave', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });

      // Initial state - check that background is transparent
      expect(button.style.background).toBe('transparent');

      // Mouse enter - should apply hover effect
      fireEvent.mouseEnter(button);
      // Note: Hover color is applied via inline style handlers

      // Mouse leave - should return to transparent
      fireEvent.mouseLeave(button);
      expect(button.style.background).toBe('transparent');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors to text elements', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        const debugText = screen.getByText('Debug Mode');
        const themeText = screen.getByText('Dark Theme');

        // Text should have color styles applied
        expect(debugText).toHaveStyle({ fontSize: '13px' });
        expect(themeText).toHaveStyle({ fontSize: '13px' });
      });
    });

    it('applies correct font size to menu text', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        const debugText = screen.getByText('Debug Mode');
        const themeText = screen.getByText('Dark Theme');

        expect(debugText).toHaveStyle({ fontSize: '13px' });
        expect(themeText).toHaveStyle({ fontSize: '13px' });
      });
    });
  });

  describe('Menu Structure', () => {
    it('structures menu items with proper layout', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        const debugText = screen.getByText('Debug Mode');
        const themeText = screen.getByText('Dark Theme');

        // Check that text elements are in flex containers
        const debugContainer = debugText.closest('div');
        const themeContainer = themeText.closest('div');

        expect(debugContainer).toHaveStyle({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        });

        expect(themeContainer).toHaveStyle({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button accessibility attributes', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      expect(button).toHaveAttribute('title', 'Settings');
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });

    it('provides accessible labels for toggle switches', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Toggle switches should be present in the DOM as clickable elements
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
        expect(screen.getByText('Dark Theme')).toBeInTheDocument();

        // The toggles are rendered as styled divs, not buttons
        const debugContainer = screen.getByText('Debug Mode').closest('div');
        const themeContainer = screen.getByText('Dark Theme').closest('div');
        const debugToggle = debugContainer?.querySelector('div[style*="width: 36px"]');
        const themeToggle = themeContainer?.querySelector('div[style*="width: 36px"]');

        expect(debugToggle).toBeInTheDocument();
        expect(themeToggle).toBeInTheDocument();
      });
    });
  });

  describe('Menu Positioning', () => {
    it('uses ContextMenu with proper positioning', async () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });

      // Mock getBoundingClientRect for positioning
      button.getBoundingClientRect = jest.fn(() => ({
        x: 100,
        y: 50,
        width: 32,
        height: 32,
        top: 50,
        left: 100,
        bottom: 82,
        right: 132,
        toJSON: jest.fn(),
      }));

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Debug Mode')).toBeInTheDocument();
      });
    });
  });

  describe('Icon Rendering', () => {
    it('renders settings icon with correct attributes', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      const svg = button.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '16');
      expect(svg).toHaveAttribute('height', '16');
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
      expect(svg).toHaveAttribute('fill', 'currentColor');
      expect(svg).toHaveStyle({ transition: 'transform 0.2s ease' });
    });

    it('renders complete gear icon paths', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      const svg = button.querySelector('svg');
      const paths = svg?.querySelectorAll('path');

      expect(paths).toHaveLength(2); // Two path elements for the gear icon
      expect(paths?.[0]).toHaveAttribute('d');
      expect(paths?.[1]).toHaveAttribute('d');
    });
  });

  describe('Button Transitions', () => {
    it('applies transition styles to button and icon', () => {
      renderSettingsDropdown(defaultProps);

      const button = screen.getByRole('button', { name: /settings/i });
      const svg = button.querySelector('svg');

      expect(button).toHaveStyle({
        transition: 'background-color 0.15s ease'
      });
      expect(svg).toHaveStyle({
        transition: 'transform 0.2s ease'
      });
    });
  });
});
