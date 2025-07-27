import { useTheme } from '@ui/contexts/ThemeContext';

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
  width = '120px',
  step = 60, // Default to 1-minute steps
  disabled = false
}: TimePickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 6
        }}>
          {label}
        </label>
      )}

      <input
        type="time"
        value={value}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
        step={step}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 12,
          color: disabled ? colors.textDisabled : colors.textColor,
          background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s ease'
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
