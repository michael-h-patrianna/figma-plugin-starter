import { useTheme } from '@ui/contexts/ThemeContext';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Configuration for a dropdown option.
 */
interface DropdownOption {
  /** Unique value for the option */
  value: string;
  /** Display text for the option */
  text: string;
  /** Whether the option is disabled and cannot be selected */
  disabled?: boolean;
}

/**
 * Props for the Dropdown component.
 */
interface DropdownProps {
  /** Array of options to display in the dropdown */
  options: DropdownOption[];
  /** Currently selected value */
  value: string;
  /** Callback function called when selection changes */
  onValueChange: (value: string) => void;
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
  /** Whether the dropdown is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Additional inline styles */
  style?: any;
}

/**
 * A custom dropdown/select component with themed styling and keyboard navigation.
 *
 * Provides a styled dropdown menu with hover states, disabled options,
 * click-outside-to-close functionality, and smooth animations.
 *
 * @param props - The dropdown props
 * @returns A styled dropdown select component
 *
 * @example
 * ```tsx
 * const [selectedColor, setSelectedColor] = useState('');
 *
 * const colorOptions = [
 *   { value: 'red', text: 'Red' },
 *   { value: 'blue', text: 'Blue' },
 *   { value: 'green', text: 'Green', disabled: true }
 * ];
 *
 * <Dropdown
 *   options={colorOptions}
 *   value={selectedColor}
 *   onValueChange={setSelectedColor}
 *   placeholder="Choose a color"
 * />
 * ```
 */
export function Dropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  style = {}
}: DropdownProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt: DropdownOption) => opt.value === value);

  useEffect(() => {
    /**
     * Handles clicks outside the dropdown to close it.
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Toggles the dropdown open/closed state.
   */
  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  /**
   * Selects an option and closes the dropdown.
   *
   * @param optionValue - The value of the option to select
   * @param optionDisabled - Whether the option is disabled
   */
  const selectOption = (optionValue: string, optionDisabled?: boolean) => {
    if (!optionDisabled) {
      onValueChange(optionValue);
      setIsOpen(false);
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: borderRadius.default,
    color: disabled ? colors.textDisabled : colors.textColor,
    fontSize: typography.bodySmall,
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
    borderRadius: borderRadius.default,
    marginTop: `${spacing.xs}px`,
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
          fontSize: typography.caption
        }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div style={menuStyle}>
          {options.map((option: DropdownOption) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectOption(option.value, option.disabled)}
              disabled={option.disabled}
              style={{
                width: '100%',
                padding: `${spacing.sm}px ${spacing.md}px`,
                background: 'transparent',
                border: 'none',
                color: option.disabled ? colors.textDisabled : colors.textColor,
                fontSize: typography.bodySmall,
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
              {option.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
