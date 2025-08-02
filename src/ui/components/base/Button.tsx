import { exampleSchemas, validateProps } from '@shared/propValidation';
import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the Button component.
 */
interface ButtonProps {
  /** Content to display inside the button (text, icons, etc.) */
  children: any;
  /** Function to call when button is clicked */
  onClick?: () => void;
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Size of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: any;
  /** Accessible label for screen readers (defaults to text content) */
  'aria-label'?: string;
  /** Describes the button for screen readers */
  'aria-describedby'?: string;
  /** Whether the button is in a pressed state */
  'aria-pressed'?: boolean;
  /** Whether the button controls an expanded/collapsed element */
  'aria-expanded'?: boolean;
  /** ID of element(s) controlled by this button */
  'aria-controls'?: string;
}

/**
 * A themed button component with multiple variants and sizes.
 *
 * Provides consistent styling across the plugin with support for primary,
 * secondary, and danger variants. Includes hover states and disabled styling.
 *
 * @param props - The button props
 * @returns A styled button element
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button onClick={handleSave}>Save</Button>
 *
 * // Secondary button
 * <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
 *
 * // Danger button
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *
 * // Disabled button
 * <Button disabled onClick={handleSubmit}>Submit</Button>
 * ```
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  style = {},
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls
}: ButtonProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  // Validate props in development mode
  validateProps({
    children,
    onClick,
    variant,
    size,
    disabled,
    fullWidth,
    type,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-pressed': ariaPressed,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls
  }, exampleSchemas.button, 'Button');

  /**
   * Gets the style object for the current button variant.
   *
   * @returns Style object with colors and hover states for the variant
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: colors.buttonSecondary,
          color: colors.buttonSecondaryText,
          border: `1px solid ${colors.inputBorder}`,
          ':hover': {
            background: colors.buttonSecondaryHover
          }
        };
      case 'danger':
        return {
          background: colors.error,
          color: colors.textInverse,
          border: `1px solid ${colors.errorBorder}`,
          ':hover': {
            background: colors.errorLight
          }
        };
      default: // primary
        return {
          background: colors.accent,
          color: colors.textInverse,
          border: `1px solid ${colors.accent}`,
          ':hover': {
            background: colors.accentHover
          }
        };
    }
  };

  /**
   * Gets the style object for the current button size.
   *
   * @returns Style object with padding, font size, and min height for the size
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: `${spacing.xs + 2}px ${spacing.md}px`,
          fontSize: typography.caption,
          minHeight: '28px'
        };
      case 'large':
        return {
          padding: `${spacing.md}px ${spacing.lg}px`,
          fontSize: typography.body,
          minHeight: '40px'
        };
      default: // medium
        return {
          padding: `${spacing.sm}px ${spacing.md}px`,
          fontSize: typography.bodySmall,
          minHeight: '32px'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle = {
    ...variantStyles,
    ...sizeStyles,
    width: fullWidth ? '100%' : 'auto',
    borderRadius: borderRadius.default,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${spacing.xs + 2}px`,
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const disabledStyle = disabled ? {
    background: colors.buttonDisabled,
    color: colors.buttonDisabledText,
    border: `1px solid ${colors.inputBorder}`
  } : {};

  // Build ARIA attributes object, only including defined values
  const ariaAttributes: Record<string, any> = {};
  if (ariaLabel) ariaAttributes['aria-label'] = ariaLabel;
  if (ariaDescribedBy) ariaAttributes['aria-describedby'] = ariaDescribedBy;
  if (ariaPressed !== undefined) ariaAttributes['aria-pressed'] = ariaPressed;
  if (ariaExpanded !== undefined) ariaAttributes['aria-expanded'] = ariaExpanded;
  if (ariaControls) ariaAttributes['aria-controls'] = ariaControls;
  if (disabled) ariaAttributes['aria-disabled'] = 'true';

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
      style={{
        ...buttonStyle,
        ...disabledStyle
      }}
      {...ariaAttributes}
      onMouseEnter={(e) => {
        if (!disabled && variantStyles[':hover']) {
          e.currentTarget.style.background = variantStyles[':hover'].background;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyles.background;
        }
      }}
    >
      {children}
    </button>
  );
}
