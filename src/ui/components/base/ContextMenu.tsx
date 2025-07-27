import { useTheme } from '@ui/contexts/ThemeContext';
import React, { useEffect, useRef, useState } from 'preact/compat';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  component?: React.ReactNode;
  onClick?: () => void;
  separator?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  className?: string;
  style?: any;
}

/**
 * A context menu component that appears at a specified position.
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  isVisible,
  position,
  onClose,
  className,
  style
}) => {
  const { colors } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (isVisible && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth) {
        x = Math.max(0, viewportWidth - rect.width - 10);
      }

      // Adjust vertical position
      if (y + rect.height > viewportHeight) {
        y = Math.max(0, viewportHeight - rect.height - 10);
      }

      setAdjustedPosition({ x, y });
    }
  }, [isVisible, position]);

  // Handle clicks outside the menu
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const menuStyle = {
    position: 'fixed' as const,
    top: adjustedPosition.y,
    left: adjustedPosition.x,
    background: colors.darkPanel,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    minWidth: 180,
    maxWidth: 300,
    zIndex: 10000,
    padding: '4px 0',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    ...style
  };

  return (
    <div
      ref={menuRef}
      className={className}
      style={menuStyle}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              style={{
                height: 1,
                background: colors.border,
                margin: '4px 0'
              }}
            />
          );
        }

        if (item.component) {
          return (
            <div
              key={item.id}
              style={{
                padding: '8px 12px',
                borderBottom: index < items.length - 1 ? `1px solid ${colors.border}` : 'none'
              }}
            >
              {item.component}
            </div>
          );
        }

        return (
          <div
            key={item.id}
            onClick={item.disabled ? undefined : item.onClick}
            style={{
              padding: '8px 12px',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: item.disabled ? colors.textSecondary : colors.textColor,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = colors.accent + '20';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.icon && (
              <span style={{ fontSize: 14, opacity: 0.8 }}>
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Hook for managing context menu state
 */
export function useContextMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const showContextMenu = (event: any) => {
    event.preventDefault();
    event.stopPropagation();

    setPosition({ x: event.clientX, y: event.clientY });
    setIsVisible(true);
  };

  const hideContextMenu = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    position,
    showContextMenu,
    hideContextMenu
  };
}
