import { useTheme } from '@ui/contexts/ThemeContext';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Configuration for a single tab.
 */
interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Content to display when tab is active */
  content: h.JSX.Element;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Props for the Tabs component.
 */
interface TabsProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** ID of the currently active tab */
  activeTab: string;
  /** Callback function called when a tab is selected */
  onChange: (tabId: string) => void;
  /** Visual style variant of the tabs */
  variant?: 'default' | 'pills';
}

/**
 * A tabbed interface component with navigation and content switching.
 *
 * Provides a horizontal tab navigation with active states, disabled states,
 * content switching, and horizontal scrolling with Netflix-style arrow navigation
 * when tabs overflow the container width.
 *
 * Features:
 * - Horizontal scrolling without visible scrollbars
 * - Arrow navigation buttons (left/right) when scrollable
 * - Smooth scroll behavior
 * - Automatic scroll to active tab
 * - Responsive design
 *
 * @param props - The tabs props
 * @returns A tabbed interface with navigation and content
 *
 * @example
 * ```tsx
 * const [activeTab, setActiveTab] = useState('tab1');
 *
 * const tabs = [
 *   { id: 'tab1', label: 'Settings', content: <SettingsPanel /> },
 *   { id: 'tab2', label: 'Data', content: <DataPanel /> },
 *   { id: 'tab3', label: 'Help', content: <HelpPanel />, disabled: true }
 * ];
 *
 * <Tabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 *   variant="pills"
 * />
 * ```
 */
export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  const { colors } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * Updates scroll button visibility based on scroll position and container dimensions.
   */
  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  /**
   * Scrolls the tab container in the specified direction.
   * @param direction - 'left' or 'right'
   */
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of visible width
    const targetScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  };

  /**
   * Scrolls to ensure the active tab is visible.
   */
  const scrollToActiveTab = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeButton = container.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLButtonElement;
    if (!activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    // Check if button is fully visible
    const isFullyVisible =
      buttonRect.left >= containerRect.left &&
      buttonRect.right <= containerRect.right;

    if (!isFullyVisible) {
      const offsetLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;
      const containerWidth = container.clientWidth;

      // Center the active tab in the visible area
      const targetScrollLeft = offsetLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      });
    }
  };

  // Update scroll buttons on mount and when tabs change
  useEffect(() => {
    updateScrollButtons();
    scrollToActiveTab();

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);

      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, [tabs, activeTab]);

  /**
   * Arrow button component for scroll navigation.
   */
  const ArrowButton = ({ direction, visible, onClick }: {
    direction: 'left' | 'right';
    visible: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 32,
        [direction]: 0,
        background: `linear-gradient(to ${direction === 'left' ? 'right' : 'left'}, ${colors.darkBg}, transparent)`,
        border: 'none',
        cursor: 'pointer',
        display: visible ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        transition: 'opacity 0.2s ease',
        opacity: visible ? 1 : 0,
        fontSize: 14,
        color: colors.textColor
      }}
      onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
      onMouseLeave={(e) => e.currentTarget.style.color = colors.textColor}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Tab Navigation Container */}
      <div style={{
        position: 'relative',
        borderBottom: `2px solid ${colors.border}`,
        marginBottom: 16
      }}>
        {/* Left Arrow */}
        <ArrowButton
          direction="left"
          visible={canScrollLeft}
          onClick={() => scroll('left')}
        />

        {/* Scrollable Tab Container */}
        <div
          ref={scrollContainerRef}
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            scrollBehavior: 'smooth'
          }}
          className="tabs-scroll-container"
          onScroll={updateScrollButtons}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => !tab.disabled && onChange(tab.id)}
                disabled={tab.disabled}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: tab.disabled
                    ? colors.textSecondary
                    : isActive
                      ? colors.accent
                      : colors.textColor,
                  padding: '12px 20px 10px 20px',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  cursor: tab.disabled ? 'not-allowed' : 'pointer',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  outline: 'none',
                  borderBottom: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                  marginBottom: '-2px', // Overlap the parent border
                  whiteSpace: 'nowrap', // Prevent text wrapping
                  flexShrink: 0 // Prevent tabs from shrinking
                }}
                onMouseEnter={(e) => {
                  if (!tab.disabled && !isActive) {
                    e.currentTarget.style.color = colors.accent;
                    e.currentTarget.style.borderBottomColor = `${colors.accent}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!tab.disabled && !isActive) {
                    e.currentTarget.style.color = colors.textColor;
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <ArrowButton
          direction="right"
          visible={canScrollRight}
          onClick={() => scroll('right')}
        />
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
