import { exampleSchemas, validateProps } from '@shared/propValidation';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useState } from 'preact/hooks';

/**
 * Props for the Input component.
 */
interface InputProps {
  /** Current value of the input */
  value: string;
  /** Function called when input value changes */
  onChange: (value: string) => void;
  /** Placeholder text to show when input is empty */
  placeholder?: string;
  /** Type of input field (text, number, email, password) */
  type?: 'text' | 'number' | 'email' | 'password';
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Width of the input container */
  width?: string;
  /** Label text to display above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Step increment for number inputs */
  step?: number;
  /** Accessible label for screen readers (defaults to label prop) */
  'aria-label'?: string;
  /** ID of element that describes this input */
  'aria-describedby'?: string;
  /** Whether the input has invalid value */
  'aria-invalid'?: boolean;
  /** Unique ID for the input element */
  id?: string;
}

/**
 * A themed input component with validation support.
 *
 * Provides consistent styling across the plugin with support for different input types,
 * validation states, labels, and error messages. Includes focus states and proper
 * accessibility attributes.
 *
 * @param props - The input props
 * @returns A styled input field with optional label and error message
 *
 * @example
 * ```tsx
 * // Basic text input
 * <Input
 *   value={name}
 *   onChange={setName}
 *   placeholder="Enter your name"
 * />
 *
 * // Input with label and validation
 * <Input
 *   value={email}
 *   onChange={setEmail}
 *   type="email"
 *   label="Email Address"
 *   required
 *   error={emailError}
 * />
 *
 * // Number input with constraints
 * <Input
 *   value={count}
 *   onChange={setCount}
 *   type="number"
 *   min={0}
 *   max={100}
 *   step={1}
 * />
 * ```
 */

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  width = '100%',
  label,
  error,
  required = false,
  min,
  max,
  step,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  id
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, spacing, typography, borderRadius } = useTheme();

  // Validate props in development mode
  validateProps({
    value,
    onChange,
    placeholder,
    type,
    disabled,
    width,
    label,
    error,
    required,
    min,
    max,
    step,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    id
  }, exampleSchemas.input, 'Input');

  // Generate unique IDs for accessibility
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const labelId = label ? `${inputId}-label` : undefined;

  const inputProps: any = {
    type,
    value,
    placeholder,
    disabled,
    required,
    id: inputId,
    'aria-label': ariaLabel || label,
    'aria-describedby': [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': ariaInvalid !== undefined ? ariaInvalid : Boolean(error),
    'aria-required': required,
    onInput: (e: any) => onChange(e.currentTarget.value),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    style: {
      width: '100%',
      padding: `${spacing.sm}px ${spacing.md - 4}px`,
      background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
      border: `1px solid ${error ? colors.inputBorderError : isFocused ? colors.inputBorderFocus : colors.inputBorder}`,
      borderRadius: borderRadius.default,
      color: disabled ? colors.textDisabled : colors.textColor,
      fontSize: typography.bodySmall,
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
      cursor: disabled ? 'not-allowed' : 'text',
      colorScheme: type === 'number' ? (colors.textColor.includes('#') && parseInt(colors.textColor.slice(1), 16) > 0x888888 ? 'dark' : 'light') : undefined
    }
  };

  if (type === 'number') {
    if (min !== undefined) inputProps.min = min;
    if (max !== undefined) inputProps.max = max;
    if (step !== undefined) inputProps.step = step;
  }

  return (
    <div style={{ width }}>
      {label && (
        <label
          id={labelId}
          htmlFor={inputId}
          style={{
            display: 'block',
            color: colors.textColor,
            fontSize: typography.caption,
            fontWeight: 500,
            marginBottom: spacing.xs
          }}
        >
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <input {...inputProps} />
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            color: colors.error,
            fontSize: 11,
            marginTop: spacing.xs
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the Textarea component.
 */
interface TextareaProps {
  /** Current value of the textarea */
  value: string;
  /** Function called when textarea value changes */
  onChange: (value: string) => void;
  /** Placeholder text to show when textarea is empty */
  placeholder?: string;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Width of the textarea container */
  width?: string;
  /** Height of the textarea */
  height?: string;
  /** Label text to display above the textarea */
  label?: string;
  /** Error message to display below the textarea */
  error?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Maximum number of characters allowed */
  maxLength?: number;
  /** Number of visible text lines */
  rows?: number;
}

/**
 * A themed textarea component for multi-line text input.
 *
 * Provides consistent styling with the Input component, including validation states,
 * character counting, and proper accessibility. Features auto-sizing within limits
 * and disabled states.
 *
 * @param props - The textarea props
 * @returns A styled textarea field with optional label, error message, and character count
 *
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea
 *   value={description}
 *   onChange={setDescription}
 *   placeholder="Enter description"
 *   rows={4}
 * />
 *
 * // Textarea with character limit
 * <Textarea
 *   value={comment}
 *   onChange={setComment}
 *   label="Comments"
 *   maxLength={500}
 *   required
 * />
 * ```
 */

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  width = '100%',
  height = 'auto',
  label,
  error,
  required = false,
  maxLength,
  rows = 3
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, spacing, typography, borderRadius } = useTheme();

  return (
    <div style={{ width }}>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: typography.caption,
          fontWeight: 500,
          marginBottom: spacing.xs
        }}>
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <textarea
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        rows={rows}
        onInput={(e: any) => onChange(e.currentTarget.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          width: '100%',
          height,
          padding: `${spacing.sm}px ${spacing.md - 4}px`,
          background: disabled ? colors.inputBackgroundDisabled : colors.inputBackground,
          border: `1px solid ${error ? colors.inputBorderError : isFocused ? colors.inputBorderFocus : colors.inputBorder}`,
          borderRadius: borderRadius.default,
          color: disabled ? colors.textDisabled : colors.textColor,
          fontSize: typography.bodySmall,
          outline: 'none',
          transition: 'border-color 0.2s ease',
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: '60px',
          maxHeight: '150px',
          overflowY: 'auto',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: spacing.xs
      }}>
        {error && (
          <div style={{
            color: colors.error,
            fontSize: 11
          }}>
            {error}
          </div>
        )}
        {maxLength && (
          <div style={{
            color: colors.textSecondary,
            fontSize: 11,
            marginLeft: 'auto'
          }}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
