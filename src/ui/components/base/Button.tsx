import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  children: any;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: any;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  style = {}
}: ButtonProps) {
  const { colors } = useTheme();

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

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 12px',
          fontSize: '12px',
          minHeight: '28px'
        };
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: '14px',
          minHeight: '40px'
        };
      default: // medium
        return {
          padding: '8px 16px',
          fontSize: '13px',
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
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    outline: 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const disabledStyle = disabled ? {
    background: colors.buttonDisabled,
    color: colors.buttonDisabledText,
    border: `1px solid ${colors.inputBorder}`
  } : {};

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
