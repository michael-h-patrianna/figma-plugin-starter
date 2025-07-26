import { BORDER_RADIUS } from '@shared/constants';
import { h } from 'preact';
import { useState } from 'preact/hooks';
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

export function Accordion({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) {
  const { colors } = useTheme();
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (itemId: string) => {
    if (allowMultiple) {
      setOpenItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      setOpenItems(prev =>
        prev.includes(itemId) ? [] : [itemId]
      );
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {items.map((item, index) => {
        const isOpen = openItems.includes(item.id);
        const isLast = index === items.length - 1;

        return (
          <div
            key={item.id}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: BORDER_RADIUS,
              marginBottom: isLast ? 0 : 8,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: item.disabled ? colors.darkBg : colors.darkPanel,
                border: 'none',
                color: item.disabled ? colors.textSecondary : colors.textColor,
                fontSize: 14,
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
                transition: 'transform 0.2s ease',
                fontSize: 12
              }}>
                ▼
              </span>
            </button>

            {/* Content */}
            {isOpen && (
              <div
                style={{
                  padding: '16px',
                  borderTop: `1px solid ${colors.border}`,
                  background: colors.darkBg,
                  animation: 'accordionSlideDown 0.2s ease-out'
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Add this to your CSS
export const accordionStyles = `
@keyframes accordionSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
