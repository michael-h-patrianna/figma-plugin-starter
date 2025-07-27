import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the ColorPicker component
 */
export interface ColorPickerProps {
  /** Current color value in hex format */
  value?: string;
  /** Callback when color changes */
  onChange?: (color: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size of the color picker */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Simple HTML color picker input with theming
 */
export function ColorPicker({
  value = '#3772FF',
  onChange,
  disabled = false,
  size = 'medium'
}: ColorPickerProps) {
  const { colors } = useTheme();

  // Get size styles
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 32, height: 32 };
      case 'large': return { width: 56, height: 56 };
      default: return { width: 40, height: 40 };
    }
  };

  const sizeStyles = getSize();

  return (
    <input
      type="color"
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const target = e.target as HTMLInputElement;
        onChange?.(target.value);
      }}
      style={{
        ...sizeStyles,
        border: `2px solid ${colors.border}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        padding: 0,
        outline: 'none',
        backgroundColor: 'transparent'
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = colors.textColor;
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = colors.border;
        }
      }}
    />
  );
}
