import { useTheme } from '@ui/contexts/ThemeContext';
import { ComponentChildren, cloneElement, isValidElement } from 'preact';

/**
 * Props for the Form component.
 */
interface FormProps {
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Child form sections and groups */
  children: ComponentChildren;
  /** Form submission handler */
  onSubmit?: (e: Event) => void;
  /** Custom spacing override */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Form component that wraps form content and removes bottom margins from last elements.
 *
 * Automatically removes bottom margins from the last FormGroup and last FormRow
 * to prevent excessive whitespace at the bottom of forms.
 */
export function Form({
  title = '',
  description = '',
  children = [],
  onSubmit = () => { },
  spacing = 'lg'
}: FormProps) {
  const { colors, spacing: themeSpacing } = useTheme();

  // Convert children to array for manipulation
  const childArray = Array.isArray(children) ? children : [children];

  // Clone children and mark the last one to remove bottom margin
  const processedChildren = childArray.map((child, index) => {
    const isLastChild = index === childArray.length - 1;

    if (isValidElement(child) && isLastChild) {
      // Pass isLast prop to the last child (FormSection or FormGroup)
      return cloneElement(child, { ...child.props, isLast: true });
    }

    return child;
  });

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        // Remove default form margins
        margin: 0
      }}
    >
      {title && (
        <div style={{ marginBottom: themeSpacing[spacing] }}>
          <h1 style={{
            margin: 0,
            color: colors.textColor,
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.3
          }}>
            {title}
          </h1>
          {description && (
            <p style={{
              margin: `${themeSpacing.sm}px 0 0 0`,
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: 1.5
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      {processedChildren}
    </form>
  );
}

/**
 * Props for the FormGroup component.
 */
interface FormGroupProps {
  /** Title for the form group */
  title?: string;
  /** Description text for the form group */
  description?: string;
  /** Child form elements */
  children: ComponentChildren;
  /** Custom spacing override */
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Internal prop to indicate this is the last group */
  isLast?: boolean;
}

/**
 * FormGroup component for organizing related form elements with consistent spacing.
 *
 * Provides visual grouping with optional title and description, and maintains
 * consistent spacing between form rows within the group.
 */
export function FormGroup({
  title,
  description,
  children,
  spacing = 'sm',
  isLast = false
}: FormGroupProps) {
  const { colors, spacing: themeSpacing } = useTheme();

  // Convert children to array and mark last FormRow
  const childArray = Array.isArray(children) ? children : [children];
  const processedChildren = childArray.map((child, index) => {
    const isLastChild = index === childArray.length - 1;

    if (isValidElement(child) && isLastChild && isLast) {
      // Pass isLast prop to the last FormRow when this is the last FormGroup
      return cloneElement(child, { ...child.props, isLast: true });
    }

    return child;
  });

  return (
    <div style={{ marginBottom: isLast ? 0 : themeSpacing[spacing] }}>
      {title && (
        <div style={{ marginBottom: themeSpacing.md }}>
          <h3 style={{
            margin: 0,
            color: colors.textColor,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.4
          }}>
            {title}
          </h3>
          {description && (
            <p style={{
              margin: `${themeSpacing.xs}px 0 0 0`,
              color: colors.textSecondary,
              fontSize: 12,
              lineHeight: 1.5
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: themeSpacing.md
      }}>
        {processedChildren}
      </div>
    </div>
  );
}

/**
 * Props for the FormRow component.
 */
interface FormRowProps {
  /** Child form elements */
  children: ComponentChildren;
  /** Number of columns (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Vertical alignment of elements */
  align?: 'start' | 'center' | 'end' | 'baseline';
  /** Custom gap override */
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  /** Internal prop to indicate this is the last row */
  isLast?: boolean;
}

/**
 * FormRow component for horizontal layout of form elements.
 *
 * Automatically distributes child elements in columns with consistent spacing.
 * Uses intelligent responsive behavior that wraps elements to new lines
 * when content doesn't fit (e.g., horizontal radio buttons with many options).
 *
 * The responsive system uses content-aware minimum widths:
 * - 2 columns: 300px minimum (accommodates horizontal radio buttons and longer content)
 * - 3 columns: 200px minimum (good for standard form controls)
 * - 4 columns: 150px minimum (for compact controls)
 *
 * When content exceeds available space, elements automatically wrap to new lines.
 */
export function FormRow({
  children,
  columns = 2,
  align = 'end',
  gap = 'md',
  isLast = false
}: FormRowProps) {
  const { spacing } = useTheme();

  // Convert children to array for easier manipulation
  const childArray = Array.isArray(children) ? children : [children];

  // Calculate responsive flex-basis with content-aware sizing
  const getFlexBasis = (columnCount: number) => {
    // Provide minimum widths that work well for different content types
    const minWidths = {
      1: '100%',
      2: '300px', // Increased for horizontal radio buttons and longer content
      3: '200px', // Increased for better content fit
      4: '150px'  // Minimum for compact controls
    };

    return minWidths[columnCount as keyof typeof minWidths] || '250px';
  };

  return (
    <div style={{
      display: 'flex',
      gap: spacing[gap],
      alignItems: align,
      flexWrap: 'wrap',
      // Remove bottom margin if this is the last row
      marginBottom: isLast ? 0 : undefined
    }}>
      {childArray.map((child, index) => (
        <div
          key={index}
          style={{
            flex: `1 1 ${getFlexBasis(columns)}`,
            minWidth: getFlexBasis(columns),
            maxWidth: '100%'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Props for the FormField component.
 */
interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Child form element */
  children: ComponentChildren;
  /** Full width override */
  fullWidth?: boolean;
}

/**
 * FormField component for wrapping individual form elements.
 *
 * Provides consistent label positioning, spacing, and error state handling.
 * Labels are positioned above the form element with proper spacing.
 */
export function FormField({
  label,
  helpText,
  error,
  required = false,
  children,
  fullWidth = false
}: FormFieldProps) {
  const { colors, spacing } = useTheme();

  return (
    <div style={{
      width: fullWidth ? '100%' : 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {label && (
        <label style={{
          display: 'block',
          color: colors.textColor,
          fontSize: 12,
          fontWeight: 500,
          marginBottom: spacing.xs,
          lineHeight: 1.4
        }}>
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}

      <div style={{ marginBottom: error || helpText ? spacing.xs : 0 }}>
        {children}
      </div>

      {error && (
        <div style={{
          color: colors.error,
          fontSize: 11,
          lineHeight: 1.4
        }}>
          {error}
        </div>
      )}

      {helpText && !error && (
        <div style={{
          color: colors.textSecondary,
          fontSize: 11,
          lineHeight: 1.4
        }}>
          {helpText}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the FormSection component.
 */
interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Child form groups */
  children: ComponentChildren;
  /** Whether to add a subtle visual separator */
  separator?: boolean;
  /** Internal prop to indicate this is the last section */
  isLast?: boolean;
}

/**
 * FormSection component for major form sections.
 *
 * Provides larger spacing and optional visual separation between major
 * sections of a form. Contains multiple FormGroups.
 */
export function FormSection({
  title,
  description,
  children,
  separator = false,
  isLast = false
}: FormSectionProps) {
  const { colors, spacing } = useTheme();

  // Convert children to array and mark last FormGroup
  const childArray = Array.isArray(children) ? children : [children];
  const processedChildren = childArray.map((child, index) => {
    const isLastChild = index === childArray.length - 1;

    if (isValidElement(child) && isLastChild && isLast) {
      // Pass isLast prop to the last FormGroup when this is the last FormSection
      return cloneElement(child, { ...child.props, isLast: true });
    }

    return child;
  });

  return (
    <div style={{
      marginBottom: isLast ? 0 : spacing.xl,
      paddingBottom: separator ? spacing.lg : 0,
      borderBottom: separator ? `1px solid ${colors.border}` : 'none'
    }}>
      {title && (
        <div style={{ marginBottom: spacing.lg }}>
          <h2 style={{
            margin: 0,
            color: colors.textColor,
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.3
          }}>
            {title}
          </h2>
          {description && (
            <p style={{
              margin: `${spacing.sm}px 0 0 0`,
              color: colors.textSecondary,
              fontSize: 13,
              lineHeight: 1.5
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      {processedChildren}
    </div>
  );
}
