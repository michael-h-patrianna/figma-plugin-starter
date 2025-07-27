import { useTheme } from '@ui/contexts/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: any;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
  style = {}
}: CheckboxProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const checkboxStyle = {
    width: '16px',
    height: '16px',
    background: checked
      ? colors.accent
      : (disabled ? colors.inputBackgroundDisabled : colors.inputBackground),
    border: `1px solid ${checked ? colors.accent : colors.inputBorder}`,
    borderRadius: borderRadius.small,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    ...style
  };

  const labelStyle = {
    color: disabled ? colors.textDisabled : colors.textColor,
    fontSize: typography.bodySmall,
    fontWeight: 500,
    userSelect: 'none' as const
  };

  return (
    <div
      onClick={handleChange}
      className={`custom-checkbox ${className}`}
      style={containerStyle}
    >
      <div style={checkboxStyle}>
        {checked && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            style={{ color: colors.textInverse }}
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {label && (
        <span style={labelStyle}>
          {label}
        </span>
      )}
    </div>
  );
}
