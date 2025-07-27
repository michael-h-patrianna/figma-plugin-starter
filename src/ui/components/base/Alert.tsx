import { useTheme } from '@ui/contexts/ThemeContext';
import { ComponentChildren } from 'preact';

export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertProps {
  /** Type of alert that determines the color scheme */
  type: AlertType;
  /** The main content of the alert */
  children: ComponentChildren;
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
export function Alert({ type, children, visible = true, style, className = '', variant = 'subtle' }: AlertProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

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


  const typeStyles = getTypeStyles();

  const alertStyle = {
    ...typeStyles,
    padding: `${spacing.md}px ${spacing.md}px`,
    borderRadius: borderRadius.default,
    fontSize: typography.body,
    lineHeight: '1.4',
    border: `1px solid ${typeStyles.borderColor}`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${spacing.sm}px`,
    ...style
  };

  return (
    <div className={`alert alert--${type} alert--${variant} ${className}`} style={alertStyle}>

      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};
