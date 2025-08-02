import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface AccordionItem {
  id: string;
  title: string;
  content: h.JSX.Element;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

interface AccordionItemComponentProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}

function AccordionItemComponent({ item, isOpen, onToggle, isLast }: AccordionItemComponentProps) {
  const { colors, borderRadius, spacing, typography } = useTheme();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [isAnimatedOpen, setIsAnimatedOpen] = useState(isOpen);

  // Handle opening animation with requestAnimationFrame
  useEffect(() => {
    if (isOpen && !isAnimatedOpen) {
      // Opening: trigger animation in next frame
      const animationFrame = requestAnimationFrame(() => {
        setIsAnimatedOpen(true);
      });
      return () => cancelAnimationFrame(animationFrame);
    } else if (!isOpen && isAnimatedOpen) {
      // Closing: start animation immediately
      setIsAnimatedOpen(false);
    }
  }, [isOpen, isAnimatedOpen]);

  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.default,
        marginBottom: isLast ? 0 : spacing.sm,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <button
        onClick={() => !item.disabled && onToggle()}
        disabled={item.disabled}
        style={{
          width: '100%',
          padding: `${spacing.sm + spacing.xs}px ${spacing.md}px`,
          background: item.disabled ? colors.darkBg : colors.darkPanel,
          border: 'none',
          color: item.disabled ? colors.textSecondary : colors.textColor,
          fontSize: typography.body,
          fontWeight: 500,
          textAlign: 'left',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = colors.darkBg;
          }
        }}
        onMouseLeave={(e) => {
          if (!item.disabled) {
            e.currentTarget.style.backgroundColor = colors.darkPanel;
          }
        }}
      >
        <span>{item.title}</span>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 150ms ease',
          fontSize: typography.body
        }}>
          ▼
        </span>
      </button>

      {/* Content - only render when open for better performance and test compatibility */}
      {isOpen && (
        <div
          ref={contentWrapperRef}
          style={{
            maxHeight: isAnimatedOpen ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: isAnimatedOpen ? 1 : 0
          }}
        >
          <div
            style={{
              padding: isAnimatedOpen ? `${spacing.md}px` : '0px',
              transition: 'all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              color: item.disabled ? colors.textSecondary : colors.textColor
            }}
          >
            {item.content}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * A collapsible accordion component with multiple expansion modes.
 *
 * Provides an accordion interface with configurable single or multiple item
 * expansion, disabled states, and smooth animations. Each accordion item
 * consists of a clickable header and collapsible content area.
 *
 * @param props - The accordion configuration
 * @returns An accordion component with expandable/collapsible items
 *
 * @example
 * ```tsx
 * const items = [
 *   {
 *     id: 'section1',
 *     title: 'Settings',
 *     content: <SettingsPanel />
 *   },
 *   {
 *     id: 'section2',
 *     title: 'Advanced',
 *     content: <AdvancedPanel />,
 *     disabled: true
 *   }
 * ];
 *
 * <Accordion
 *   items={items}
 *   allowMultiple={true}
 *   defaultOpen={['section1']}
 * />
 * ```
 */
export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const handleToggle = (itemId: string) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev);

      if (newOpenItems.has(itemId)) {
        // Close the item
        newOpenItems.delete(itemId);
      } else {
        // Open the item
        if (!allowMultiple) {
          // In single mode, close all other items
          newOpenItems.clear();
        }
        newOpenItems.add(itemId);
      }

      return newOpenItems;
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {items.map((item, index) => (
        <AccordionItemComponent
          key={item.id}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => handleToggle(item.id)}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
}
