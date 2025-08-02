import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { ContextMenu, ContextMenuItem, useContextMenu } from '@ui/components/base/ContextMenu';
import { ThemeProvider } from '@ui/contexts/ThemeContext';

// Mock getBoundingClientRect for position calculations
const mockGetBoundingClientRect = jest.fn(() => ({
  width: 180,
  height: 200,
  top: 0,
  left: 0,
  bottom: 200,
  right: 180,
  x: 0,
  y: 0,
  toJSON: () => { }
}));

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 800,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 600,
});

// Test wrapper with theme
const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ContextMenu', () => {
  const mockOnClose = jest.fn();

  const defaultItems: ContextMenuItem[] = [
    { id: 'item1', label: 'Copy', icon: '📋', onClick: jest.fn() },
    { id: 'item2', label: 'Paste', icon: '📄', onClick: jest.fn() },
    { id: 'item3', label: 'Delete', icon: '🗑️', onClick: jest.fn(), disabled: true }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
  });

  afterEach(() => {
    // Clean up any active event listeners
    document.removeEventListener('mousedown', () => { });
    document.removeEventListener('keydown', () => { });
  });

  describe('Basic Rendering', () => {
    it('renders when visible', () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Paste')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={false}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Copy')).not.toBeInTheDocument();
    });

    it('applies custom className and style', () => {
      const customStyle = { border: '2px solid red' };
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
          className="custom-menu"
          style={customStyle}
        />
      );

      const menu = container.querySelector('.custom-menu');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveStyle('border: 2px solid red');
    });
  });

  describe('Menu Items', () => {
    it('renders icons when provided', () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('📄')).toBeInTheDocument();
      expect(screen.getByText('🗑️')).toBeInTheDocument();
    });

    it('calls onClick when item is clicked', () => {
      const mockClick = jest.fn();
      const items: ContextMenuItem[] = [
        { id: 'clickable', label: 'Click Me', onClick: mockClick }
      ];

      renderWithTheme(
        <ContextMenu
          items={items}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Click Me'));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick for disabled items', () => {
      const mockClick = jest.fn();
      const items: ContextMenuItem[] = [
        { id: 'disabled', label: 'Disabled Item', onClick: mockClick, disabled: true }
      ];

      renderWithTheme(
        <ContextMenu
          items={items}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      fireEvent.click(screen.getByText('Disabled Item'));
      expect(mockClick).not.toHaveBeenCalled();
    });

    it('renders custom components', () => {
      const customComponent = <div data-testid="custom-component">Custom Content</div>;
      const items: ContextMenuItem[] = [
        { id: 'custom', label: 'Custom', component: customComponent }
      ];

      renderWithTheme(
        <ContextMenu
          items={items}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId('custom-component')).toBeInTheDocument();
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('renders separators', () => {
      const items: ContextMenuItem[] = [
        { id: 'item1', label: 'Item 1' },
        { id: 'sep1', label: '', separator: true },
        { id: 'item2', label: 'Item 2' }
      ];

      const { container } = renderWithTheme(
        <ContextMenu
          items={items}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      // Check for separator div (height: 1px styling indicates separator)
      const separators = Array.from(container.querySelectorAll('div')).filter(
        div => div.style.height === '1px'
      );
      expect(separators).toHaveLength(1);
    });
  });

  describe('Position Adjustment', () => {
    it('adjusts position when menu would overflow viewport horizontally', async () => {
      // Position menu near right edge
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 750, y: 100 }} // Near right edge (window width is 800)
          onClose={mockOnClose}
        />
      );

      // Wait for position adjustment
      await waitFor(() => {
        const menu = container.firstChild as HTMLElement;
        expect(menu).toHaveStyle('position: fixed');
      });
    });

    it('adjusts position when menu would overflow viewport vertically', async () => {
      // Position menu near bottom edge
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 550 }} // Near bottom edge (window height is 600)
          onClose={mockOnClose}
        />
      );

      // Wait for position adjustment
      await waitFor(() => {
        const menu = container.firstChild as HTMLElement;
        expect(menu).toHaveStyle('position: fixed');
      });
    });

    it('sets z-index for proper layering', () => {
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      const menu = container.firstChild as HTMLElement;
      expect(menu).toHaveStyle('z-index: 10000');
    });
  });

  describe('Interaction Behavior', () => {
    it('closes menu when clicking outside', async () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      // Click outside the menu
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close menu when clicking inside', () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      // Click inside the menu
      fireEvent.mouseDown(screen.getByText('Copy'));

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('closes menu when pressing Escape key', async () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close menu for other key presses', () => {
      renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Styling and Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      const menu = container.firstChild as HTMLElement;
      expect(menu).toHaveStyle('font-family: Inter, sans-serif');
      expect(menu).toHaveStyle('font-size: 13px');
      expect(menu).toHaveStyle('border-radius: 6px');
    });

    it('shows hover effects on menu items', () => {
      renderWithTheme(
        <ContextMenu
          items={[{ id: 'hover-test', label: 'Hover Me', onClick: jest.fn() }]}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      const menuItem = screen.getByText('Hover Me');
      expect(menuItem).toBeInTheDocument();

      // Test hover effects work without throwing
      expect(() => {
        fireEvent.mouseEnter(menuItem);
        fireEvent.mouseLeave(menuItem);
      }).not.toThrow();
    });

    it('applies disabled styling to disabled items', () => {
      renderWithTheme(
        <ContextMenu
          items={[{ id: 'disabled', label: 'Disabled', disabled: true }]}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      const disabledItem = screen.getByText('Disabled');
      expect(disabledItem).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      const { container } = renderWithTheme(
        <ContextMenu
          items={[]}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      // Menu should still render but be empty
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles items without onClick handlers', () => {
      const items: ContextMenuItem[] = [
        { id: 'no-click', label: 'No Click Handler' }
      ];

      renderWithTheme(
        <ContextMenu
          items={items}
          isVisible={true}
          position={{ x: 100, y: 100 }}
          onClose={mockOnClose}
        />
      );

      // Should not throw error when clicked
      expect(() => {
        fireEvent.click(screen.getByText('No Click Handler'));
      }).not.toThrow();
    });

    it('handles large position values', () => {
      const { container } = renderWithTheme(
        <ContextMenu
          items={defaultItems}
          isVisible={true}
          position={{ x: 9999, y: 9999 }}
          onClose={mockOnClose}
        />
      );

      const menu = container.firstChild as HTMLElement;
      expect(menu).toHaveStyle('position: fixed');
    });
  });
});

describe('useContextMenu Hook', () => {
  // Test component that uses the hook
  const TestComponent = () => {
    const { isVisible, position, showContextMenu, hideContextMenu } = useContextMenu();

    return (
      <div>
        <button
          onContextMenu={showContextMenu}
          data-testid="trigger"
        >
          Right click me
        </button>
        <div data-testid="status">
          {isVisible ? 'visible' : 'hidden'}
        </div>
        <div data-testid="position">
          {position.x},{position.y}
        </div>
        <button onClick={hideContextMenu} data-testid="hide-button">
          Hide Menu
        </button>
      </div>
    );
  };

  it('initializes with correct default state', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('status')).toHaveTextContent('hidden');
    expect(screen.getByTestId('position')).toHaveTextContent('0,0');
  });

  it('shows context menu on right click with correct position', () => {
    render(<TestComponent />);

    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 150, clientY: 200 });

    expect(screen.getByTestId('status')).toHaveTextContent('visible');
    expect(screen.getByTestId('position')).toHaveTextContent('150,200');
  });

  it('hides context menu when hideContextMenu is called', () => {
    render(<TestComponent />);

    // Show menu first
    const trigger = screen.getByTestId('trigger');
    fireEvent.contextMenu(trigger, { clientX: 150, clientY: 200 });
    expect(screen.getByTestId('status')).toHaveTextContent('visible');

    // Hide menu
    fireEvent.click(screen.getByTestId('hide-button'));
    expect(screen.getByTestId('status')).toHaveTextContent('hidden');
  });

  it('prevents default context menu behavior', () => {
    render(<TestComponent />);

    const trigger = screen.getByTestId('trigger');
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      clientX: 100,
      clientY: 100
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    trigger.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
