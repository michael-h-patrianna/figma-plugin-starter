import { COLORS } from '@shared/constants';
import { h } from 'preact';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer'
    }} onClick={() => onChange(!checked)}>
      <span style={{
        color: COLORS.textSecondary,
        fontSize: 13,
        fontWeight: 500
      }}>
        {label}
      </span>
      <div style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        background: checked ? COLORS.accent : '#2a2d35',
        position: 'relative',
        transition: 'background 0.2s ease',
        cursor: 'pointer'
      }}>
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
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
