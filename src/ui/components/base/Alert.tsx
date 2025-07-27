import { useTheme } from '@ui/contexts/ThemeContext';
import { ComponentChildren } from 'preact';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertProps {
  /** Type of alert that determines the color scheme */
  type: AlertType;
  /** The main content of the alert */
  children: ComponentChildren;
  /** Optional icon to display (defaults based on type) */
  icon?: string;
  /** Whether to show the alert (for conditional rendering) */
  visible?: boolean;
  /** Additional CSS styles */
  style?: any;
  /** CSS class name */
  className?: string;
  /** Whether to show with a subtle background or solid background */
  variant?: 'subtle' | 'solid';
}

/**
 * A themed alert component for displaying important messages.
 *
 * Features:
 * - Multiple types (info, warning, error, success) with appropriate colors
 * - Automatic theming that adapts to light/dark mode
 * - Default icons for each alert type
 * - Flexible content support (text, JSX, etc.)
 * - Conditional visibility
 * - Two variants: subtle (light background) or solid (colored background)
 *
 * @example
 * ```tsx
 * // Warning alert
 * <Alert type="warning">
 *   ⚠️ <strong>Development Mode:</strong> Settings will not persist between sessions.
 * </Alert>
 *
 * // Error alert
 * <Alert type="error">
 *   Failed to save data. Please try again.
 * </Alert>
 *
 * // Success with custom icon
 * <Alert type="success" icon="🎉">
 *   Data saved successfully!
 * </Alert>
 *
 * // Subtle variant
 * <Alert type="info" variant="subtle">
 *   This is informational content.
 * </Alert>
 * ```
 */
export const Alert: React.FC<AlertProps> = ({
  type,
  children,
  icon,
  visible = true,
  style = {},
  className = '',
  variant = 'solid'
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  /**
   * Gets the appropriate colors for the alert type
   */
  const getTypeStyles = () => {
    const base = {
      error: {
        solid: {
          backgroundColor: colors.error,
          borderColor: colors.errorBorder,
          color: colors.textInverse
        },
        subtle: {
          backgroundColor: colors.errorLight,
          borderColor: colors.errorBorder,
          color: colors.textColor
        }
      },
      success: {
        solid: {
          backgroundColor: colors.success,
          borderColor: colors.successBorder,
          color: colors.textInverse
        },
        subtle: {
          backgroundColor: colors.successLight,
          borderColor: colors.successBorder,
          color: colors.textColor
        }
      },
      info: {
        solid: {
          backgroundColor: colors.info,
          borderColor: colors.infoBorder,
          color: colors.textInverse
        },
        subtle: {
          backgroundColor: colors.infoLight,
          borderColor: colors.infoBorder,
          color: colors.textColor
        }
      },
      warning: {
        solid: {
          backgroundColor: colors.warning,
          borderColor: colors.warningBorder,
          color: colors.textInverse
        },
        subtle: {
          backgroundColor: colors.warningLight,
          borderColor: colors.warningBorder,
          color: colors.textColor
        }
      }
    };

    return base[type][variant];
  };

  /**
   * Gets the default icon for the alert type
   */
  const getDefaultIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default: // warning
        return '⚠️';
    }
  };

  const typeStyles = getTypeStyles();
  const displayIcon = icon !== undefined ? icon : getDefaultIcon();

  const alertStyle = {
    ...typeStyles,
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.4',
    border: `1px solid ${typeStyles.borderColor}`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
    ...style
  };

  return (
    <div className={`alert alert--${type} alert--${variant} ${className}`} style={alertStyle}>
      {displayIcon && (
        <span
          style={{
            fontSize: '16px',
            lineHeight: '1',
            flexShrink: 0,
            marginTop: '1px'
          }}
        >
          {displayIcon}
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};
