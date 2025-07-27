import { useTheme } from '@ui/contexts/ThemeContext';

interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioButtonProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  direction?: 'horizontal' | 'vertical';
}

export function RadioButton({
  options,
  value,
  onChange,
  name,
  label,
  direction = 'vertical'
}: RadioButtonProps) {
  const { colors } = useTheme();
  return (
    <div>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: 8
        }}>
          {label}
        </label>
      )}

      <div style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: direction === 'horizontal' ? 16 : 8
      }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.5 : 1
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `2px solid ${value === option.value ? colors.accent : colors.textSecondary}`,
                background: value === option.value ? colors.accent : colors.darkBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                boxSizing: 'border-box'
              }}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                }
              }}
            >
              {value === option.value && (
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'white'
                }} />
              )}
            </div>

            <span style={{
              color: option.disabled ? colors.textSecondary : colors.textColor,
              fontSize: 13,
              userSelect: 'none'
            }}>
              {option.label}
            </span>

            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => {
                if (!option.disabled) {
                  onChange(option.value);
                }
              }}
              disabled={option.disabled}
              style={{ display: 'none' }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
