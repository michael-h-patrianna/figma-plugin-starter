import { useEffect, useRef, useState } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface DropdownOption {
  value: string;
  text: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: any;
}

export function CustomDropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  style = {}
}: CustomDropdownProps) {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const selectOption = (optionValue: string, optionDisabled?: boolean) => {
    if (!optionDisabled) {
      onValueChange(optionValue);
      setIsOpen(false);
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '8px 12px',
    background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '6px',
    color: disabled ? colors.textDisabled : colors.textColor,
    fontSize: '13px',
    textAlign: 'left' as const,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    ...style
  };

  const menuStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: colors.inputBackground,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: '6px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', width: '100%' }}
      className={`custom-dropdown ${className}`}
    >
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        style={buttonStyle}
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
        <span style={{
          color: selectedOption ? colors.textColor : colors.textSecondary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {selectedOption ? selectedOption.text : placeholder}
        </span>
        <span style={{
          color: colors.textSecondary,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
          fontSize: '12px'
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={menuStyle}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value, option.disabled)}
              disabled={option.disabled}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                color: option.disabled ? colors.textDisabled : colors.textColor,
                fontSize: '13px',
                textAlign: 'left',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                fontFamily: 'inherit'
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
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
