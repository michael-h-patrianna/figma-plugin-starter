import { BORDER_RADIUS, COLORS } from '@shared/constants';
import { h } from 'preact';


type PanelVariant = 'standard' | 'yellow' | 'blue';

interface PanelProps {
  title: string;
  subtitle?: string;
  children: h.JSX.Element | h.JSX.Element[];
  headerAction?: h.JSX.Element;
  maxHeight?: string;
  padding?: number;
  status?: {
    label: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  variant?: PanelVariant;
}

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
  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.warning;
      case 'info': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  // Panel background/border by variant
  let background: string = COLORS.darkPanel;
  let border: string = `1px solid ${COLORS.border}`;
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
        color: COLORS.textSecondary,
        fontWeight: 600,
        padding: `${padding}px ${padding}px`,
        borderBottom: `1px solid ${COLORS.border}`,
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
          color: COLORS.textSecondary,
          fontSize: 12,
          padding: `8px ${padding}px 0 ${padding}px`,
          borderBottom: `1px solid ${COLORS.border}`,
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
