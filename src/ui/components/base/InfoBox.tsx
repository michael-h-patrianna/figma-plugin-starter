import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '@ui/contexts/ThemeContext';
import { ReactNode } from 'preact/compat';

/**
 * Props for the InfoBox component.
 */
interface InfoBoxProps {
  /** The title/header text for the info box */
  title: string;
  /** The main content of the info box */
  children: ReactNode;
  /** The type/variant of the info box which determines the color scheme */
  variant?: 'info' | 'success' | 'warning' | 'error' | 'accent' | 'tip' | 'plain';
  /** Optional custom background color */
  backgroundColor?: string;
  /** Optional custom border color */
  borderColor?: string;
  /** Optional custom title color */
  titleColor?: string;
  /** Optional custom content color */
  contentColor?: string;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * A flexible, themable info box component for displaying contextual information.
 *
 * Supports different variants (info, success, warning, error, accent, tip, plain) with
 * automatic color theming, or custom colors can be provided. The component
 * features a left border accent for colored variants and clean styling for plain variant.
 *
 * @param props - {@link InfoBoxProps} for configuring the info box appearance and content
 * @returns The rendered InfoBox React element
 *
 * @example
 * ```tsx
 * // Basic usage with predefined variant
 * <InfoBox title="Pro Tip" variant="tip">
 *   This is helpful information for users.
 * </InfoBox>
 *
 * // Custom colors
 * <InfoBox
 *   title="Custom Info"
 *   borderColor="#ff6b6b"
 *   titleColor="#ff6b6b"
 * >
 *   Custom styled info box content.
 * </InfoBox>
 *
 * // Complex content
 * <InfoBox title="Code Example" variant="info">
 *   <div>
 *     <strong>Before:</strong> Old pattern<br />
 *     <strong>After:</strong> New pattern<br />
 *     <strong>Benefits:</strong> Improved flexibility
 *   </div>
 * </InfoBox>
 *
 * // Plain variant for minimal styling
 * <InfoBox title="Simple Info" variant="plain">
 *   Basic informational content without visual emphasis.
 * </InfoBox>
 * ```
 */
export function InfoBox({
  title,
  children,
  variant = 'info',
  backgroundColor,
  borderColor,
  titleColor,
  contentColor,
  className,
  style
}: InfoBoxProps) {
  const { colors } = useTheme();

  // Define variant color mappings
  const variantColors = {
    info: {
      border: colors.info,
      title: colors.info,
      background: colors.darkBg
    },
    success: {
      border: colors.success,
      title: colors.success,
      background: colors.darkBg
    },
    warning: {
      border: colors.warning,
      title: colors.warning,
      background: colors.darkBg
    },
    error: {
      border: colors.error,
      title: colors.error,
      background: colors.darkBg
    },
    accent: {
      border: colors.accent,
      title: colors.accent,
      background: colors.darkBg
    },
    tip: {
      border: colors.accent,
      title: colors.accent,
      background: colors.darkBg
    },
    plain: {
      border: colors.border,
      title: colors.textColor,
      background: colors.darkBg
    }
  };

  // Get colors for the selected variant
  const variantTheme = variantColors[variant];

  // Use custom colors if provided, otherwise fall back to variant colors
  const finalBorderColor = borderColor || variantTheme.border;
  const finalTitleColor = titleColor || variantTheme.title;
  const finalBackgroundColor = backgroundColor || variantTheme.background;
  const finalContentColor = contentColor || colors.textSecondary;


  return (
    <div
      className={className}
      style={{
        background: finalBackgroundColor,
        border: `1px solid ${variant === 'plain' ? finalBorderColor : finalBorderColor + '20'}`,
        borderLeft: variant === 'plain' ? `1px solid ${finalBorderColor}` : `4px solid ${finalBorderColor}`,
        borderRadius: BORDER_RADIUS,
        padding: 12,
        ...style
      }}
    >
      {/* Title  */}
      <div style={{
        color: finalTitleColor,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span>{title}</span>
      </div>

      {/* Content */}
      <div style={{
        color: finalContentColor,
        fontSize: 11,
        lineHeight: 1.4
      }}>
        {children}
      </div>
    </div>
  );
}
