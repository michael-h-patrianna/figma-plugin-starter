import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useState } from 'preact/hooks';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  width?: string;
  label?: string;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  width = '100%',
  label,
  error,
  required = false,
  min,
  max,
  step
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, spacing } = useTheme();

  const inputProps: any = {
    type,
    value,
    placeholder,
    disabled,
    required,
    onInput: (e: any) => onChange(e.currentTarget.value),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    style: {
      width: '100%',
      padding: `${spacing.sm}px ${spacing.md - 4}px`,
      background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
      border: `1px solid ${error ? colors.inputBorderError : isFocused ? colors.inputBorderFocus : colors.inputBorder}`,
      borderRadius: BORDER_RADIUS,
      color: disabled ? colors.textDisabled : colors.textColor,
      fontSize: 13,
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'text',
      colorScheme: type === 'number' ? (colors.textColor.includes('#') && parseInt(colors.textColor.slice(1), 16) > 0x888888 ? 'dark' : 'light') : undefined
    }
  };

  if (type === 'number') {
    if (min !== undefined) inputProps.min = min;
    if (max !== undefined) inputProps.max = max;
    if (step !== undefined) inputProps.step = step;
  }

  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: spacing.xs
        }}>
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <input {...inputProps} />
      {error && (
        <div style={{
          color: colors.error,
          fontSize: 11,
          marginTop: spacing.xs
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
  height?: string;
  label?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  width = '100%',
  height = 'auto',
  label,
  error,
  required = false,
  maxLength,
  rows = 3
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, spacing } = useTheme();

  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: spacing.xs
        }}>
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        onInput={(e: any) => onChange(e.currentTarget.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          height,
          padding: `${spacing.sm}px ${spacing.md - 4}px`,
          background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
          border: `1px solid ${error ? colors.inputBorderError : isFocused ? colors.inputBorderFocus : colors.inputBorder}`,
          borderRadius: BORDER_RADIUS,
          color: disabled ? colors.textDisabled : colors.textColor,
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 0.2s ease',
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: '60px',
          maxHeight: '150px',
          overflowY: 'auto',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.xs
      }}>
        {error && (
          <div style={{
            color: colors.error,
            fontSize: 11
          }}>
            {error}
          </div>
        )}
        {maxLength && (
          <div style={{
            color: colors.textSecondary,
            fontSize: 11,
            marginLeft: 'auto'
          }}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
