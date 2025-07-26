import { useState } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface TextboxProps {
  value: string;
  onValueInput: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variant?: 'border' | 'underline';
  icon?: any;
  suffix?: any;
  className?: string;
  style?: any;
  onFocus?: () => void;
  onBlur?: () => void;
}

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
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

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
    borderRadius: variant === 'border' ? '6px' : '0',
    color: disabled ? colors.textDisabled : colors.textColor,
    fontSize: '13px',
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
