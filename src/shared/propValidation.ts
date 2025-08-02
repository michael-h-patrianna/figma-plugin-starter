/**
 * Runtime prop validation utilities for development mode
 *
 * Provides TypeScript-safe runtime validation for component props to catch
 * issues early in development. Only runs validation in development mode
 * to avoid performance impact in production builds.
 */

/**
 * Validation rule definition for props
 */
export interface PropValidationRule {
  type: 'string' | 'number' | 'boolean' | 'function' | 'object' | 'array' | 'node' | 'custom';
  required?: boolean;
  oneOf?: any[];
  validator?: (value: any) => boolean | string;
  message?: string;
}

/**
 * Validation schema for component props
 */
export interface PropValidationSchema {
  [propName: string]: PropValidationRule;
}

/**
 * Validation result for a single prop
 */
export interface PropValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check if we're in development mode
 * In Figma plugins, we can use the debug mode as a proxy for development
 */
function isDevelopmentMode(): boolean {
  // Check for debug mode flag or common development indicators
  return typeof window !== 'undefined' &&
    (window.location?.href?.includes('dev') ||
      document.body?.getAttribute('data-debug') === 'true');
}

/**
 * Validate a single prop value against a rule
 */
function validateProp(value: any, rule: PropValidationRule, propName: string): PropValidationResult {
  const result: PropValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check required
  if (rule.required && (value === undefined || value === null)) {
    result.isValid = false;
    result.errors.push(`${propName} is required but was ${value}`);
    return result;
  }

  // Skip type checking if value is undefined/null and not required
  if (value === undefined || value === null) {
    return result;
  }

  // Check type
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        result.isValid = false;
        result.errors.push(`${propName} should be a string, got ${typeof value}`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        result.isValid = false;
        result.errors.push(`${propName} should be a number, got ${typeof value}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        result.isValid = false;
        result.errors.push(`${propName} should be a boolean, got ${typeof value}`);
      }
      break;

    case 'function':
      if (typeof value !== 'function') {
        result.isValid = false;
        result.errors.push(`${propName} should be a function, got ${typeof value}`);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        result.isValid = false;
        result.errors.push(`${propName} should be an object, got ${Array.isArray(value) ? 'array' : typeof value}`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        result.isValid = false;
        result.errors.push(`${propName} should be an array, got ${typeof value}`);
      }
      break;

    case 'node':
      // Check for Preact/React node-like structure
      if (value && typeof value === 'object' && !value.type && !value.props) {
        result.warnings.push(`${propName} might not be a valid node element`);
      }
      break;

    case 'custom':
      if (rule.validator) {
        const validationResult = rule.validator(value);
        if (validationResult !== true) {
          result.isValid = false;
          const message = typeof validationResult === 'string' ? validationResult :
            rule.message || `${propName} failed custom validation`;
          result.errors.push(message);
        }
      }
      break;
  }

  // Check oneOf values
  if (rule.oneOf && !rule.oneOf.includes(value)) {
    result.isValid = false;
    result.errors.push(`${propName} should be one of [${rule.oneOf.join(', ')}], got ${value}`);
  }

  return result;
}

/**
 * Validate all props for a component
 */
export function validateProps(
  props: Record<string, any>,
  schema: PropValidationSchema,
  componentName: string = 'Component'
): PropValidationResult {
  // Skip validation in production or when not in development mode
  if (!isDevelopmentMode()) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const result: PropValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Validate each prop in the schema
  for (const [propName, rule] of Object.entries(schema)) {
    const propValue = props[propName];
    const propResult = validateProp(propValue, rule, propName);

    if (!propResult.isValid) {
      result.isValid = false;
    }

    result.errors.push(...propResult.errors);
    result.warnings.push(...propResult.warnings);
  }

  // Check for unexpected props (not in schema)
  const schemaKeys = Object.keys(schema);
  const propKeys = Object.keys(props);
  const unexpectedProps = propKeys.filter(key => !schemaKeys.includes(key) && key !== 'children');

  if (unexpectedProps.length > 0) {
    result.warnings.push(`${componentName} received unexpected props: ${unexpectedProps.join(', ')}`);
  }

  // Log validation results in development
  if (result.errors.length > 0) {
    console.error(`[PropValidation] ${componentName} validation failed:`, result.errors);
  }

  if (result.warnings.length > 0) {
    console.warn(`[PropValidation] ${componentName} validation warnings:`, result.warnings);
  }

  return result;
}

/**
 * Create a prop validation function for a specific component
 */
export function createPropValidator(schema: PropValidationSchema, componentName: string) {
  return function validateComponentProps(props: Record<string, any>): PropValidationResult {
    return validateProps(props, schema, componentName);
  };
}

/**
 * Common validation rules for reuse
 */
export const commonRules = {
  required: (type: PropValidationRule['type']): PropValidationRule => ({
    type,
    required: true
  }),

  optionalString: (): PropValidationRule => ({
    type: 'string',
    required: false
  }),

  optionalNumber: (): PropValidationRule => ({
    type: 'number',
    required: false
  }),

  optionalBoolean: (): PropValidationRule => ({
    type: 'boolean',
    required: false
  }),

  optionalFunction: (): PropValidationRule => ({
    type: 'function',
    required: false
  }),

  oneOfStrings: (values: string[]): PropValidationRule => ({
    type: 'string',
    oneOf: values
  }),

  variant: (variants: string[]): PropValidationRule => ({
    type: 'string',
    oneOf: variants,
    required: false
  }),

  size: (): PropValidationRule => ({
    type: 'string',
    oneOf: ['small', 'medium', 'large'],
    required: false
  }),

  callback: (): PropValidationRule => ({
    type: 'function',
    required: false
  }),

  children: (): PropValidationRule => ({
    type: 'node',
    required: false
  })
};

/**
 * Example schemas for common component patterns
 */
export const exampleSchemas = {
  button: {
    children: commonRules.children(),
    onClick: commonRules.callback(),
    variant: commonRules.variant(['primary', 'secondary', 'danger']),
    size: commonRules.size(),
    disabled: commonRules.optionalBoolean(),
    fullWidth: commonRules.optionalBoolean(),
    type: commonRules.oneOfStrings(['button', 'submit', 'reset'])
  },

  input: {
    value: commonRules.required('string'),
    onChange: commonRules.required('function'),
    placeholder: commonRules.optionalString(),
    type: commonRules.oneOfStrings(['text', 'number', 'email', 'password']),
    disabled: commonRules.optionalBoolean(),
    required: commonRules.optionalBoolean(),
    label: commonRules.optionalString(),
    error: commonRules.optionalString()
  },

  modal: {
    isVisible: commonRules.required('boolean'),
    onClose: commonRules.required('function'),
    title: commonRules.required('string'),
    children: commonRules.children(),
    size: commonRules.size(),
    showCloseButton: commonRules.optionalBoolean()
  }
};
