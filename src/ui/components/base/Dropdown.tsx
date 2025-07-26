import { BORDER_RADIUS } from '@shared/constants';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  disabled = false,
  width = '200px'
}: DropdownProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width }}>
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: BORDER_RADIUS,
          color: disabled ? colors.textDisabled : colors.textColor,
          fontSize: 13,
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.inputBorderFocus;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = colors.inputBorder;
          }
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: colors.inputBackground,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: BORDER_RADIUS,
            marginTop: 4,
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={option.disabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: option.disabled ? colors.textDisabled : colors.textColor,
                fontSize: 13,
                textAlign: 'left',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
