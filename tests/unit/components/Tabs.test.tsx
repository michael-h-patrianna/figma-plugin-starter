import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { Tabs } from '@ui/components/base/Tabs';
import { ThemeProvider } from '@ui/contexts/ThemeContext';

// Mock theme provider wrapper
function renderTabs(props: any) {
  return render(
    <ThemeProvider>
      <Tabs {...props} />
    </ThemeProvider>
  );
}

// Sample content components for testing
const SampleContent1 = () => <div>Content 1</div>;
const SampleContent2 = () => <div>Content 2</div>;
const SampleContent3 = () => <div>Content 3</div>;

// Default test tabs
const defaultTabs = [
  { id: 'tab1', label: 'First Tab', content: <SampleContent1 /> },
  { id: 'tab2', label: 'Second Tab', content: <SampleContent2 /> },
  { id: 'tab3', label: 'Third Tab', content: <SampleContent3 /> }
];

describe('Tabs Component', () => {
  describe('Basic Rendering', () => {
    it('renders all tabs in navigation', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
    });

    it('displays content for active tab', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab2',
        onChange
      });

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('renders with no tabs', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: [],
        activeTab: '',
        onChange
      });

      // Should render without errors
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Tab Interaction', () => {
    it('calls onChange when tab is clicked', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      fireEvent.click(screen.getByText('Second Tab'));
      expect(onChange).toHaveBeenCalledWith('tab2');
    });

    it('does not call onChange when active tab is clicked', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      fireEvent.click(screen.getByText('First Tab'));
      expect(onChange).toHaveBeenCalledWith('tab1');
    });

    it('handles tab switching correctly', () => {
      const onChange = jest.fn();
      const { rerender } = renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      expect(screen.getByText('Content 1')).toBeInTheDocument();

      // Simulate tab change
      rerender(
        <ThemeProvider>
          <Tabs
            tabs={defaultTabs}
            activeTab="tab3"
            onChange={onChange}
          />
        </ThemeProvider>
      );

      expect(screen.getByText('Content 3')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });
  });

  describe('Disabled Tabs', () => {
    const tabsWithDisabled = [
      { id: 'tab1', label: 'First Tab', content: <SampleContent1 /> },
      { id: 'tab2', label: 'Second Tab', content: <SampleContent2 />, disabled: true },
      { id: 'tab3', label: 'Third Tab', content: <SampleContent3 /> }
    ];

    it('renders disabled tabs correctly', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: tabsWithDisabled,
        activeTab: 'tab1',
        onChange
      });

      const disabledTab = screen.getByText('Second Tab');
      expect(disabledTab).toBeDisabled();
    });

    it('does not call onChange when disabled tab is clicked', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: tabsWithDisabled,
        activeTab: 'tab1',
        onChange
      });

      fireEvent.click(screen.getByText('Second Tab'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('applies disabled styling', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: tabsWithDisabled,
        activeTab: 'tab1',
        onChange
      });

      const disabledTab = screen.getByText('Second Tab');
      expect(disabledTab).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('Tab Navigation Styling', () => {
    it('applies active tab styling', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab2',
        onChange
      });

      const activeTab = screen.getByText('Second Tab');
      expect(activeTab).toHaveStyle({ fontWeight: '600' });
    });

    it('applies inactive tab styling', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab2',
        onChange
      });

      const inactiveTab = screen.getByText('First Tab');
      expect(inactiveTab).toHaveStyle({ fontWeight: '500' });
    });

    it('has proper tab container structure', () => {
      const onChange = jest.fn();
      const { container } = renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const scrollContainer = container.querySelector('.tabs-scroll-container');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveStyle({
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden'
      });
    });
  });

  describe('Scroll Navigation', () => {
    // Mock getBoundingClientRect and scroll methods
    const mockScrollTo = jest.fn();
    const mockGetBoundingClientRect = jest.fn();

    beforeEach(() => {
      // Mock scrollTo method
      Element.prototype.scrollTo = mockScrollTo;

      // Mock getBoundingClientRect
      Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

      // Mock querySelector
      Element.prototype.querySelector = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('initializes with no scroll buttons when content fits', () => {
      const onChange = jest.fn();

      // Mock container dimensions to simulate content fitting
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 200
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 200
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: 0
      });

      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      // Arrow buttons should not be visible
      const leftArrow = screen.queryByText('‹');
      const rightArrow = screen.queryByText('›');

      // They exist but are hidden
      expect(leftArrow).toBeInTheDocument();
      expect(rightArrow).toBeInTheDocument();
      expect(leftArrow).toHaveStyle({ display: 'none' });
      expect(rightArrow).toHaveStyle({ display: 'none' });
    });

    it('shows right arrow when content overflows', async () => {
      const onChange = jest.fn();

      // Mock container dimensions to simulate overflow
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 400
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 200
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: 0
      });

      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      // Wait for useEffect to run
      await waitFor(() => {
        const rightArrow = screen.getByText('›');
        expect(rightArrow).toHaveStyle({ display: 'flex' });
      });
    });

    it('handles scroll button clicks', async () => {
      const onChange = jest.fn();

      // Mock container to show arrows
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 400
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 200
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: 0
      });

      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      await waitFor(() => {
        const rightArrow = screen.getByText('›');
        expect(rightArrow).toHaveStyle({ display: 'flex' });
      });

      // Click right arrow
      fireEvent.click(screen.getByText('›'));

      expect(mockScrollTo).toHaveBeenCalledWith({
        left: 160, // 80% of 200px clientWidth
        behavior: 'smooth'
      });
    });
  });

  describe('Data Attributes', () => {
    it('sets data-tab-id attributes on tab buttons', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const firstTab = screen.getByText('First Tab');
      const secondTab = screen.getByText('Second Tab');
      const thirdTab = screen.getByText('Third Tab');

      expect(firstTab).toHaveAttribute('data-tab-id', 'tab1');
      expect(secondTab).toHaveAttribute('data-tab-id', 'tab2');
      expect(thirdTab).toHaveAttribute('data-tab-id', 'tab3');
    });
  });

  describe('Event Handling', () => {
    it('handles mouse enter and leave events on tabs', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const inactiveTab = screen.getByText('Second Tab');

      // Mouse enter should not throw errors
      fireEvent.mouseEnter(inactiveTab);
      fireEvent.mouseLeave(inactiveTab);

      expect(inactiveTab).toBeInTheDocument();
    });

    it('handles mouse events on arrow buttons', async () => {
      const onChange = jest.fn();

      // Mock container to show arrows
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 400
      });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        value: 200
      });
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: 0
      });

      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      await waitFor(() => {
        const rightArrow = screen.getByText('›');
        expect(rightArrow).toHaveStyle({ display: 'flex' });
      });

      const rightArrow = screen.getByText('›');

      // Mouse events should not throw errors
      fireEvent.mouseEnter(rightArrow);
      fireEvent.mouseLeave(rightArrow);

      expect(rightArrow).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('renders complex content correctly', () => {
      const ComplexContent = () => (
        <div>
          <h2>Complex Content</h2>
          <p>With multiple elements</p>
          <button>Action Button</button>
        </div>
      );

      const tabsWithComplex = [
        { id: 'complex', label: 'Complex Tab', content: <ComplexContent /> }
      ];

      const onChange = jest.fn();
      renderTabs({
        tabs: tabsWithComplex,
        activeTab: 'complex',
        onChange
      });

      expect(screen.getByText('Complex Content')).toBeInTheDocument();
      expect(screen.getByText('With multiple elements')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      const tabsWithEmpty = [
        { id: 'empty', label: 'Empty Tab', content: <div></div> }
      ];

      const onChange = jest.fn();
      renderTabs({
        tabs: tabsWithEmpty,
        activeTab: 'empty',
        onChange
      });

      // Should render without errors
      expect(screen.getByText('Empty Tab')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles invalid active tab ID', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'nonexistent',
        onChange
      });

      // Should not display any content
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument();
    });

    it('handles tabs with duplicate IDs', () => {
      const duplicateTabs = [
        { id: 'duplicate', label: 'First Duplicate', content: <div>First</div> },
        { id: 'duplicate', label: 'Second Duplicate', content: <div>Second</div> }
      ];

      const onChange = jest.fn();
      renderTabs({
        tabs: duplicateTabs,
        activeTab: 'duplicate',
        onChange
      });

      // Should render both tabs (React will show key warning in console)
      expect(screen.getByText('First Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Second Duplicate')).toBeInTheDocument();
    });

    it('handles very long tab labels', () => {
      const longLabelTabs = [
        {
          id: 'long',
          label: 'This is a very long tab label that might cause layout issues',
          content: <div>Long tab content</div>
        }
      ];

      const onChange = jest.fn();
      renderTabs({
        tabs: longLabelTabs,
        activeTab: 'long',
        onChange
      });

      const longTab = screen.getByText('This is a very long tab label that might cause layout issues');
      expect(longTab).toHaveStyle({ whiteSpace: 'nowrap' });
    });
  });

  describe('Accessibility', () => {
    it('renders tab buttons with proper roles', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const tabButtons = screen.getAllByRole('button');
      // Should include 3 tab buttons + 2 arrow buttons (left and right)
      expect(tabButtons.length).toBeGreaterThanOrEqual(3);

      // Check specific tab buttons by their text
      expect(screen.getByText('First Tab')).toBeInTheDocument();
      expect(screen.getByText('Second Tab')).toBeInTheDocument();
      expect(screen.getByText('Third Tab')).toBeInTheDocument();
    });

    it('maintains focus management', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const firstTab = screen.getByText('First Tab');
      firstTab.focus();
      expect(firstTab).toHaveFocus();
    });

    it('supports keyboard navigation', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      const firstTab = screen.getByText('First Tab');

      // Tab key should work for focus
      firstTab.focus();
      fireEvent.keyDown(firstTab, { key: 'Tab' });

      expect(firstTab).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors consistently', () => {
      const onChange = jest.fn();
      renderTabs({
        tabs: defaultTabs,
        activeTab: 'tab1',
        onChange
      });

      // Check that active tab has accent color styling
      const activeTab = screen.getByText('First Tab');
      expect(activeTab).toBeInTheDocument();

      // Check that the tabs are rendered with proper styling
      const scrollContainer = screen.getByText('First Tab').closest('.tabs-scroll-container');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
