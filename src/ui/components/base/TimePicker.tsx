import { useTheme } from '@ui/contexts/ThemeContext';
import { useState } from 'preact/hooks';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  width?: string;
  step?: number;
  disabled?: boolean;
}

export function TimePicker({
  value,
  onChange,
  label,
  width = '100%',
  step = 60, // Default to 1-minute steps
  disabled = false
}: TimePickerProps) {
  const { colors, spacing } = useTheme();
  const [inputId] = useState(() => `time-picker-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div style={{ width }}>
      {label && (
        <label htmlFor={inputId} style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: spacing.xs
        }}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="time"
        value={value}
        onChange={(e) => {
          if (!disabled) {
            onChange((e.target as HTMLInputElement).value);
          }
        }}
        step={step}
        disabled={disabled}
        style={{
          width: '100%',
          padding: `${spacing.sm}px ${spacing.md - 4}px`,
          fontSize: 12,
          color: disabled ? colors.textDisabled : colors.textColor,
          background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s ease',
          colorScheme: colors.textColor.includes('#') && parseInt(colors.textColor.slice(1), 16) > 0x888888 ? 'dark' : 'light'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.inputBorderFocus;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = colors.inputBorder;
        }}
      />
    </div>
  );
}
