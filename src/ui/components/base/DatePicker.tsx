import { useTheme } from '@ui/contexts/ThemeContext';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  width?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label,
  width = '100%',
  min,
  max,
  disabled = false
}: DatePickerProps) {
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
        </label>
      )}

      <input
        type="date"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        min={min}
        max={max}
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
