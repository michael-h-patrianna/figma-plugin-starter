import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

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
  width = '100%'
}: DropdownProps) {
  const { colors, spacing } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safely find selected option
  const selectedOption = options?.find(option => option.value === value) || null;

  // Safe onChange handler
  const handleOptionSelect = useCallback((optionValue: string) => {
    try {
      onChange(optionValue);
    } catch (error) {
      console.error('Error in dropdown onChange:', error);
    } finally {
      setIsOpen(false);
    }
  }, [onChange]);

  // Safe toggle handler
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  }, [disabled]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!options || options.length === 0) {
    return (
      <div style={{ width }}>
        <div style={{
          padding: `${spacing.sm}px ${spacing.md - 4}px`,
          background: colors.inputBackgroundDisabled,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: BORDER_RADIUS,
          color: colors.textDisabled,
          fontSize: 13
        }}>
          No options available
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width }}>
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: `${spacing.sm}px ${spacing.md - 4}px`,
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
            marginTop: spacing.xs,
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
                  try {
                    onChange(option.value);
                    setIsOpen(false);
                  } catch (error) {
                    console.error('Error in dropdown onChange:', error);
                    setIsOpen(false);
                  }
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
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
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
