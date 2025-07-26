import { COLORS } from '@shared/constants';

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
  width = '160px',
  min,
  max,
  disabled = false
}: DatePickerProps) {
  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: COLORS.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 6
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
          padding: '8px 12px',
          fontSize: 12,
          color: disabled ? COLORS.textSecondary : COLORS.textColor,
          background: disabled ? COLORS.border : COLORS.darkPanel,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s ease'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = COLORS.accent;
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = COLORS.border;
        }}
      />
    </div>
  );
}
