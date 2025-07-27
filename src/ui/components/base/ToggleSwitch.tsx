import { useTheme } from '@ui/contexts/ThemeContext';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onChange, label, disabled = false }: ToggleSwitchProps) {
  const { colors, spacing } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing.sm,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1
    }} onClick={() => !disabled && onChange(!checked)}>
      <span style={{
        color: disabled ? colors.textDisabled : colors.textSecondary,
        fontSize: 13,
        fontWeight: 500
      }}>
        {label}
      </span>
      <div style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: disabled
          ? colors.inputBackgroundDisabled
          : (checked ? colors.toggleBackgroundActive : colors.toggleBackground),
        border: `1px solid ${disabled ? colors.inputBorder : (checked ? colors.toggleBackgroundActive : colors.border)}`,
        position: 'relative',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: disabled ? colors.textDisabled : colors.toggleSlider,
          position: 'absolute',
          top: 1,
          left: checked ? 17 : 1,
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
      </div>
    </div>
  );
}
