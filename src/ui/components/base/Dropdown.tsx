import { useTheme } from '@ui/contexts/ThemeContext';
import { createPortal } from 'preact/compat';
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
  /** Accessible label for the dropdown */
  'aria-label'?: string;
  /** ID of element that labels the dropdown */
  'aria-labelledby'?: string;
  /** ID of element that describes the dropdown */
  'aria-describedby'?: string;
  /** Unique ID for the dropdown */
  id?: string;
}

/**
 * A customizable dropdown component with keyboard navigation and ARIA accessibility.
 *
 * @example
 * ```tsx
 * const options = [
 *   { value: 'option1', label: 'Option 1' },
 *   { value: 'option2', label: 'Option 2' }
 * ];
 *
 * <Dropdown
 *   options={options}
 *   value={selectedValue}
 *   onValueChange={setSelectedValue}
 *   placeholder="Select an option"
 *   aria-label="Select an option from the list"
 * />
 * ```
 */
export function Dropdown({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  id
}: DropdownProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt: DropdownOption) => opt.value === value);

  useEffect(() => {
    /**
     * Handles clicks outside the dropdown to close it.
     */
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the button and the portal menu
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // For portal-rendered menu, we need to check if click is on the menu
        const target = event.target as Element;
        const isMenuClick = target.closest('[data-dropdown-menu]');
        if (!isMenuClick) {
          setIsOpen(false);
        }
      }
    };

    /**
     * Also handle regular click events for compatibility with tests
     */
    const handleClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    /**
     * Handles keyboard navigation
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            if (prev === -1) return 0; // Start from first option
            const next = prev + 1;
            return next >= options.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            if (prev === -1) return options.length - 1; // Start from last option
            const next = prev - 1;
            return next < 0 ? options.length - 1 : next;
          });
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              selectOption(option.value, option.disabled);
            }
          }
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, options]);

  /**
   * Toggles the dropdown open/closed state.
   */
  const toggleOpen = () => {
    if (!disabled) {
      if (!isOpen && buttonRef.current) {
        // Calculate button position and dropdown placement
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(200, Math.max(120, options.length * 32 + 16));
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Open upward if there's not enough space below but enough space above
        const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight;
        setOpenUpward(shouldOpenUpward);

        // Calculate fixed position for portal
        setMenuPosition({
          top: shouldOpenUpward
            ? Math.max(4, buttonRect.top - dropdownHeight - 4)
            : buttonRect.bottom + 4,
          left: buttonRect.left,
          width: Math.max(buttonRect.width, 200)
        });
        setFocusedIndex(-1);
      }
      setIsOpen(!isOpen);
    }
  };

  /**
   * Handles keyboard events on the button
   */
  const handleButtonKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        toggleOpen();
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        toggleOpen();
        break;
    }
  };  /**
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
    position: 'fixed' as const,
    top: menuPosition.top,
    left: menuPosition.left,
    width: menuPosition.width,
    background: colors.inputBackground,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: borderRadius.default,
    minHeight: '120px',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    zIndex: 10000,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', width: '100%', ...style }}
      className={`custom-dropdown ${className}`.trim()}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        style={buttonStyle}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label={ariaLabel || `${selectedOption ? selectedOption.text : placeholder}. Select to open dropdown`}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        id={id}
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

      {isOpen && createPortal(
        <div
          style={menuStyle}
          data-dropdown-menu="true"
          role="listbox"
          aria-label={ariaLabel ? `${ariaLabel} options` : "Dropdown options"}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {options.map((option: DropdownOption, index: number) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value ? 'true' : 'false'}
              onClick={() => selectOption(option.value, option.disabled)}
              disabled={option.disabled}
              style={{
                width: '100%',
                padding: `${spacing.sm}px ${spacing.md}px`,
                background: index === focusedIndex ? colors.backgroundSecondary : 'transparent',
                border: 'none',
                color: option.disabled ? colors.textDisabled : colors.textColor,
                fontSize: typography.bodySmall,
                textAlign: 'left',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '32px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                  setFocusedIndex(index);
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index === focusedIndex ? colors.backgroundSecondary : 'transparent';
              }}
            >
              {option.text}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
