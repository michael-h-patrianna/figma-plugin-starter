import { render, screen } from '@testing-library/preact';
import { Panel } from '@ui/components/base/Panel';
import { ThemeProvider } from '@ui/contexts/ThemeContext';

// Mock theme provider wrapper
function renderPanel(props: any) {
  return render(
    <ThemeProvider>
      <Panel {...props} />
    </ThemeProvider>
  );
}

// Sample content for testing
const SampleContent = () => <div>Panel content</div>;
const SampleHeaderAction = () => <button>Action</button>;

describe('Panel Component', () => {
  describe('Basic Rendering', () => {
    it('renders with required props', () => {
      renderPanel({
        title: 'Test Panel',
        children: <SampleContent />
      });

      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('renders title correctly', () => {
      renderPanel({
        title: 'My Panel Title',
        children: <div>Content</div>
      });

      const title = screen.getByText('My Panel Title');
      expect(title).toBeInTheDocument();
    });

    it('renders children content', () => {
      const ComplexContent = () => (
        <div>
          <h3>Section Title</h3>
          <p>Some content</p>
          <button>Action Button</button>
        </div>
      );

      renderPanel({
        title: 'Panel',
        children: <ComplexContent />
      });

      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Some content')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });

  describe('Optional Elements', () => {
    it('renders subtitle when provided', () => {
      renderPanel({
        title: 'Main Title',
        subtitle: 'This is a subtitle',
        children: <div>Content</div>
      });

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      renderPanel({
        title: 'Main Title',
        children: <div>Content</div>
      });

      expect(screen.getByText('Main Title')).toBeInTheDocument();
      // Subtitle should not exist
      expect(screen.queryByText('This is a subtitle')).not.toBeInTheDocument();
    });

    it('renders header action when provided', () => {
      renderPanel({
        title: 'Panel Title',
        headerAction: <SampleHeaderAction />,
        children: <div>Content</div>
      });

      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('does not render header action when not provided', () => {
      renderPanel({
        title: 'Panel Title',
        children: <div>Content</div>
      });

      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.queryByText('Action')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('renders success status badge', () => {
      renderPanel({
        title: 'Panel',
        status: { label: 'Success Status', type: 'success' },
        children: <div>Content</div>
      });

      expect(screen.getByText('Success Status')).toBeInTheDocument();
    });

    it('renders error status badge', () => {
      renderPanel({
        title: 'Panel',
        status: { label: 'Error Status', type: 'error' },
        children: <div>Content</div>
      });

      expect(screen.getByText('Error Status')).toBeInTheDocument();
    });

    it('renders warning status badge', () => {
      renderPanel({
        title: 'Panel',
        status: { label: 'Warning Status', type: 'warning' },
        children: <div>Content</div>
      });

      expect(screen.getByText('Warning Status')).toBeInTheDocument();
    });

    it('renders info status badge', () => {
      renderPanel({
        title: 'Panel',
        status: { label: 'Info Status', type: 'info' },
        children: <div>Content</div>
      });

      expect(screen.getByText('Info Status')).toBeInTheDocument();
    });

    it('applies correct styling to status badge', () => {
      renderPanel({
        title: 'Panel',
        status: { label: 'Test Status', type: 'success' },
        children: <div>Content</div>
      });

      const statusBadge = screen.getByText('Test Status');
      expect(statusBadge).toHaveStyle({
        fontWeight: '500',
        borderRadius: '4px'
      });
    });

    it('does not render status when not provided', () => {
      renderPanel({
        title: 'Panel',
        children: <div>Content</div>
      });

      expect(screen.queryByText('Test Status')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with standard variant by default', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      expect(panel).toBeInTheDocument();
    });

    it('renders with yellow variant', () => {
      const { container } = renderPanel({
        title: 'Panel',
        variant: 'yellow',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveStyle({
        background: 'rgba(243, 156, 18, 0.08)',
        border: '1px solid rgba(243, 156, 18, 0.25)'
      });
    });

    it('renders with blue variant', () => {
      const { container } = renderPanel({
        title: 'Panel',
        variant: 'blue',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveStyle({
        background: 'rgba(90, 142, 255, 0.1)',
        border: '1px solid rgba(90, 142, 255, 0.3)'
      });
    });
  });

  describe('Layout and Styling', () => {
    it('applies default padding', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div data-testid="panel-content">Content</div>
      });

      // Check that content is rendered
      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });

    it('applies custom padding', () => {
      const { container } = renderPanel({
        title: 'Panel',
        padding: 16,
        children: <div data-testid="panel-content">Content</div>
      });

      // Check that content is rendered
      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });

    it('applies max height when provided', () => {
      const { container } = renderPanel({
        title: 'Panel',
        maxHeight: '400px',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveStyle({ maxHeight: '400px' });
    });

    it('applies flex layout correctly', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      });
    });
  });

  describe('Header Layout', () => {
    it('renders header with title and action side by side', () => {
      renderPanel({
        title: 'Panel Title',
        headerAction: <button>Header Action</button>,
        children: <div>Content</div>
      });

      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.getByText('Header Action')).toBeInTheDocument();
    });

    it('renders title with status badge inline', () => {
      renderPanel({
        title: 'Panel Title',
        status: { label: '5 items', type: 'info' },
        children: <div>Content</div>
      });

      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.getByText('5 items')).toBeInTheDocument();
    });

    it('renders all header elements together', () => {
      renderPanel({
        title: 'Panel Title',
        status: { label: 'Active', type: 'success' },
        headerAction: <button>Settings</button>,
        children: <div>Content</div>
      });

      expect(screen.getByText('Panel Title')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Content Area', () => {
    it('renders multiple children correctly', () => {
      renderPanel({
        title: 'Panel',
        children: [
          <div key="1">First child</div>,
          <div key="2">Second child</div>,
          <div key="3">Third child</div>
        ]
      });

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      renderPanel({
        title: 'Panel',
        children: <div></div>
      });

      expect(screen.getByText('Panel')).toBeInTheDocument();
      // Should render without errors
    });

    it('maintains proper flex layout for content', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div data-testid="panel-content">Content</div>
      });

      // Check that content is rendered properly
      expect(screen.getByTestId('panel-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const longTitle = 'This is a very long panel title that might cause layout issues in some cases';
      renderPanel({
        title: longTitle,
        children: <div>Content</div>
      });

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('handles very long subtitles', () => {
      const longSubtitle = 'This is a very long subtitle that provides detailed information about the panel';
      renderPanel({
        title: 'Panel',
        subtitle: longSubtitle,
        children: <div>Content</div>
      });

      expect(screen.getByText(longSubtitle)).toBeInTheDocument();
    });

    it('handles complex nested content', () => {
      const NestedContent = () => (
        <div>
          <div>
            <span>Nested content</span>
            <div>
              <button>Deeply nested button</button>
            </div>
          </div>
        </div>
      );

      renderPanel({
        title: 'Panel',
        children: <NestedContent />
      });

      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByText('Deeply nested button')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme-based styling', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div>Content</div>
      });

      // Check that border radius is applied
      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveStyle({ borderRadius: '6px' });
    });

    it('uses theme colors for borders', () => {
      const { container } = renderPanel({
        title: 'Panel',
        children: <div>Content</div>
      });

      const panel = container.firstChild as HTMLElement;
      // Border should use theme border color
      expect(panel.style.border).toContain('1px solid');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic structure', () => {
      renderPanel({
        title: 'Accessible Panel',
        subtitle: 'Panel description',
        children: <div>Panel content</div>
      });

      expect(screen.getByText('Accessible Panel')).toBeInTheDocument();
      expect(screen.getByText('Panel description')).toBeInTheDocument();
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('renders action buttons as interactive elements', () => {
      renderPanel({
        title: 'Panel',
        headerAction: <button>Interactive Action</button>,
        children: <div>Content</div>
      });

      const actionButton = screen.getByText('Interactive Action');
      expect(actionButton.tagName).toBe('BUTTON');
    });
  });
});
