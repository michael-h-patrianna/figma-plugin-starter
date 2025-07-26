import { BORDER_RADIUS, COLORS } from '@shared/constants';
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
      padding: '8px 12px',
      background: disabled ? COLORS.darkBg : '#2a2d35',
      border: `1px solid ${error ? COLORS.error : isFocused ? COLORS.accent : COLORS.border}`,
      borderRadius: BORDER_RADIUS,
      color: disabled ? COLORS.textSecondary : COLORS.textColor,
      fontSize: 13,
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit'
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
          color: COLORS.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 4
        }}>
          {label}
          {required && <span style={{ color: COLORS.error }}>*</span>}
        </label>
      )}
      <input {...inputProps} />
      {error && (
        <div style={{
          color: COLORS.error,
          fontSize: 11,
          marginTop: 4
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

  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: COLORS.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 4
        }}>
          {label}
          {required && <span style={{ color: COLORS.error }}>*</span>}
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
          padding: '8px 12px',
          background: disabled ? COLORS.darkBg : '#2a2d35',
          border: `1px solid ${error ? COLORS.error : isFocused ? COLORS.accent : COLORS.border}`,
          borderRadius: BORDER_RADIUS,
          color: disabled ? COLORS.textSecondary : COLORS.textColor,
          fontSize: 13,
          outline: 'none',
          transition: 'border-color 0.2s ease',
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: '60px',
          maxHeight: '150px',
          overflowY: 'auto'
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 4
      }}>
        {error && (
          <div style={{
            color: COLORS.error,
            fontSize: 11
          }}>
            {error}
          </div>
        )}
        {maxLength && (
          <div style={{
            color: COLORS.textSecondary,
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
