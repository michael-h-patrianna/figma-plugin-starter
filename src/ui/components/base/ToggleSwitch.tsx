import { useTheme } from '@ui/contexts/ThemeContext';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer'
    }} onClick={() => onChange(!checked)}>
      <span style={{
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: 500
      }}>
        {label}
      </span>
      <div style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? colors.toggleBackgroundActive : colors.toggleBackground,
        position: 'relative',
        transition: 'background 0.2s ease',
        cursor: 'pointer'
      }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: colors.toggleSlider,
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
        }} />
      </div>
    </div>
  );
}
