import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

/**
 * Visual variant types for the Panel component.
 */
type PanelVariant = 'standard' | 'yellow' | 'blue';

/**
 * Props for the Panel component.
 */
interface PanelProps {
  /** Title text displayed in the panel header */
  title: string;
  /** Optional subtitle text displayed below the title */
  subtitle?: string;
  /** Content to display in the panel body */
  children: h.JSX.Element | h.JSX.Element[];
  /** Optional action element (button, etc.) to display in the header */
  headerAction?: h.JSX.Element;
  /** Maximum height of the panel with scrolling */
  maxHeight?: string;
  /** Internal padding of the panel content */
  padding?: number;
  /** Optional status badge to display next to the title */
  status?: {
    label: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  /** Visual variant of the panel affecting border/background colors */
  variant?: PanelVariant;
}

/**
 * A themed panel component with header, optional status, and content area.
 *
 * Provides a structured container with title, optional subtitle, status badges,
 * header actions, and scrollable content. Supports different visual variants
 * for different use cases.
 *
 * @param props - The panel props
 * @returns A styled panel container
 *
 * @example
 * ```tsx
 * <Panel
 *   title="Layer Properties"
 *   subtitle="Edit selected layer"
 *   status={{ label: "3 selected", type: "info" }}
 *   headerAction={<Button size="small">Reset</Button>}
 *   variant="blue"
 * >
 *   <div>Panel content goes here</div>
 * </Panel>
 * ```
 */
export function Panel({
  title,
  subtitle,
  children,
  headerAction,
  maxHeight,
  padding = 20,
  status,
  variant = 'standard'
}: PanelProps) {
  const { colors } = useTheme();

  /**
   * Gets the color for a status type.
   *
   * @param type - The status type
   * @returns The corresponding color from the theme
   */
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.textSecondary;
    }
  };

  // Panel background/border by variant
  let background: string = colors.darkPanel;
  let border: string = `1px solid ${colors.border}`;
  if (variant === 'yellow') {
    background = 'rgba(243, 156, 18, 0.08)';
    border = '1px solid rgba(243, 156, 18, 0.25)';
  } else if (variant === 'blue') {
    background = 'rgba(90, 142, 255, 0.1)';
    border = '1px solid rgba(90, 142, 255, 0.3)';
  }

  return (
    <div style={{
      background,
      borderRadius: BORDER_RADIUS,
      border,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      maxHeight,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        color: colors.textSecondary,
        fontWeight: 600,
        padding: `${padding}px ${padding}px`,
        borderBottom: `1px solid ${colors.border}`,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        paddingBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{title}</span>
          {status && (
            <span style={{
              background: `${getStatusColor(status.type)}20`,
              color: getStatusColor(status.type),
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500
            }}>
              {status.label}
            </span>
          )}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          color: colors.textSecondary,
          fontSize: 12,
          padding: `8px ${padding}px 0 ${padding}px`,
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: 8
        }}>
          {subtitle}
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        padding
      }}>
        {children}
      </div>
    </div>
  );
}
