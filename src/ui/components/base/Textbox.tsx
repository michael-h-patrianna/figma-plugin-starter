import { useTheme } from '@ui/contexts/ThemeContext';
import { useState } from 'preact/hooks';

/**
 * Props for the Textbox component.
 */
interface TextboxProps {
  /** Current value of the textbox */
  value: string;
  /** Callback function called when the input value changes */
  onValueInput: (value: string) => void;
  /** Placeholder text shown when input is empty */
  placeholder?: string;
  /** Whether the textbox is disabled */
  disabled?: boolean;
  /** Visual style variant - 'border' shows full border, 'underline' shows bottom border only */
  variant?: 'border' | 'underline';
  /** Optional icon element to display on the left side */
  icon?: any;
  /** Optional suffix element to display on the right side (e.g., unit labels) */
  suffix?: any;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: any;
  /** Callback function called when input gains focus */
  onFocus?: () => void;
  /** Callback function called when input loses focus */
  onBlur?: () => void;
}

/**
 * A themed text input component with support for icons, suffixes, and different visual styles.
 *
 * Provides consistent styling across the plugin with focus states, disabled states,
 * and optional icons/suffixes for enhanced user experience.
 *
 * @param props - The textbox props
 * @returns A styled text input element with optional decorations
 *
 * @example
 * ```tsx
 * // Basic textbox
 * <Textbox
 *   value={name}
 *   onValueInput={setName}
 *   placeholder="Enter your name"
 * />
 *
 * // Textbox with underline style
 * <Textbox
 *   value={searchTerm}
 *   onValueInput={setSearchTerm}
 *   variant="underline"
 *   placeholder="Search..."
 * />
 *
 * // Textbox with suffix
 * <Textbox
 *   value={width}
 *   onValueInput={setWidth}
 *   placeholder="100"
 *   suffix={<span>px</span>}
 * />
 * ```
 */
export function Textbox({
  value,
  onValueInput,
  placeholder,
  disabled = false,
  variant = 'border',
  icon,
  suffix,
  className = '',
  style = {},
  onFocus,
  onBlur
}: TextboxProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Handles focus event and updates focus state.
   */
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  /**
   * Handles blur event and updates focus state.
   */
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
    border: variant === 'border'
      ? `1px solid ${isFocused ? colors.inputBorderFocus : colors.inputBorder}`
      : 'none',
    borderBottom: variant === 'underline'
      ? `1px solid ${isFocused ? colors.inputBorderFocus : colors.inputBorder}`
      : undefined,
    borderRadius: variant === 'border' ? borderRadius.default : '0',
    color: disabled ? colors.textDisabled : colors.textColor,
    fontSize: typography.bodySmall,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'text',
    ...style
  };

  const containerStyle = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  };

  return (
    <div style={containerStyle} className={`custom-textbox ${className}`}>
      {icon && (
        <div style={{
          position: 'absolute',
          left: '12px',
          zIndex: 1,
          color: colors.textSecondary,
          pointerEvents: 'none'
        }}>
          {icon}
        </div>
      )}

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onInput={(e) => onValueInput((e.target as HTMLInputElement).value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          ...inputStyle,
          paddingLeft: icon ? '36px' : '12px',
          paddingRight: suffix ? '36px' : '12px'
        }}
      />

      {suffix && (
        <div style={{
          position: 'absolute',
          right: '12px',
          zIndex: 1,
          color: colors.textSecondary
        }}>
          {suffix}
        </div>
      )}
    </div>
  );
}
