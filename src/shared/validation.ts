/**
 * Comprehensive validation utilities for type safety and runtime checks
 */

/**
 * Base validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Validation schema definition
 */
export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[];
}

/**
 * Individual validation rule
 */
export interface ValidationRule {
  type: 'required' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'custom';
  message?: string;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  allowNull?: boolean;
  allowUndefined?: boolean;
}

/**
 * Figma-specific validation rules
 */
export interface FigmaNodeValidation {
  nodeType?: SceneNode['type'] | SceneNode['type'][];
  hasChildren?: boolean;
  minChildren?: number;
  maxChildren?: number;
  requiredProperties?: string[];
}

/**
 * Create a validator function from a schema
 */
export function createValidator<T = any>(schema: ValidationSchema) {
  return function validate(data: any): ValidationResult & { data?: T } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Data must be an object'],
        warnings
      };
    }

    // Validate each field in the schema
    for (const [fieldName, rules] of Object.entries(schema)) {
      const fieldRules = Array.isArray(rules) ? rules : [rules];
      const fieldValue = data[fieldName];

      for (const rule of fieldRules) {
        const result = validateField(fieldValue, rule, fieldName);
        if (!result.isValid) {
          errors.push(...result.errors);
        }
        if (result.warnings?.length) {
          warnings.push(...result.warnings);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: errors.length === 0 ? data as T : undefined
    };
  };
}

/**
 * Validate a single field against a rule
 */
function validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Handle null/undefined values
  if (value === null) {
    if (!rule.allowNull) {
      errors.push(rule.message || `${fieldName} cannot be null`);
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  if (value === undefined) {
    if (rule.type === 'required') {
      errors.push(rule.message || `${fieldName} is required`);
    } else if (!rule.allowUndefined) {
      // Only error if explicitly not allowed
      if (rule.allowUndefined === false) {
        errors.push(rule.message || `${fieldName} cannot be undefined`);
      }
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  // Type-specific validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        errors.push(rule.message || `${fieldName} must be a string`);
        break;
      }
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push(rule.message || `${fieldName} must be at least ${rule.min} characters`);
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push(rule.message || `${fieldName} must be at most ${rule.max} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || `${fieldName} does not match required pattern`);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(rule.message || `${fieldName} must be a valid number`);
        break;
      }
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.message || `${fieldName} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.message || `${fieldName} must be at most ${rule.max}`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(rule.message || `${fieldName} must be a boolean`);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        errors.push(rule.message || `${fieldName} must be an array`);
        break;
      }
      if (rule.min !== undefined && value.length < rule.min) {
        errors.push(rule.message || `${fieldName} must have at least ${rule.min} items`);
      }
      if (rule.max !== undefined && value.length > rule.max) {
        errors.push(rule.message || `${fieldName} must have at most ${rule.max} items`);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(rule.message || `${fieldName} must be an object`);
      }
      break;

    case 'custom':
      if (rule.validator) {
        const result = rule.validator(value);
        if (result === false) {
          errors.push(rule.message || `${fieldName} failed custom validation`);
        } else if (typeof result === 'string') {
          errors.push(result);
        }
      }
      break;
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate Figma nodes with specific requirements
 */
export function validateFigmaNode(
  node: SceneNode | null,
  validation: FigmaNodeValidation,
  fieldName = 'node'
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!node) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors, warnings };
  }

  // Validate node type
  if (validation.nodeType) {
    const allowedTypes = Array.isArray(validation.nodeType)
      ? validation.nodeType
      : [validation.nodeType];

    if (!allowedTypes.includes(node.type)) {
      errors.push(`${fieldName} must be of type: ${allowedTypes.join(' or ')}`);
    }
  }

  // Validate children requirements
  if ('children' in node) {
    const children = node.children;

    if (validation.hasChildren === true && children.length === 0) {
      errors.push(`${fieldName} must have children`);
    }

    if (validation.hasChildren === false && children.length > 0) {
      warnings.push(`${fieldName} should not have children`);
    }

    if (validation.minChildren !== undefined && children.length < validation.minChildren) {
      errors.push(`${fieldName} must have at least ${validation.minChildren} children`);
    }

    if (validation.maxChildren !== undefined && children.length > validation.maxChildren) {
      errors.push(`${fieldName} must have at most ${validation.maxChildren} children`);
    }
  } else {
    if (validation.hasChildren === true) {
      errors.push(`${fieldName} cannot have children (not a parent node)`);
    }
  }

  // Validate required properties
  if (validation.requiredProperties) {
    for (const prop of validation.requiredProperties) {
      if (!(prop in node) || (node as any)[prop] === undefined) {
        errors.push(`${fieldName} is missing required property: ${prop}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Common validation schemas for Figma plugin development
 */
export const CommonSchemas = {
  // Validate selection data
  selection: createValidator({
    nodes: { type: 'array', min: 1 },
    count: { type: 'number', min: 1 }
  }),

  // Validate export settings
  exportSettings: createValidator({
    format: { type: 'string', pattern: /^(PNG|JPG|SVG|PDF)$/i },
    scale: { type: 'number', min: 0.1, max: 4 },
    quality: { type: 'number', min: 1, max: 100 }
  }),

  // Validate frame data
  frameData: createValidator({
    name: { type: 'string', min: 1, max: 255 },
    width: { type: 'number', min: 1 },
    height: { type: 'number', min: 1 },
    x: { type: 'number' },
    y: { type: 'number' }
  }),

  // Validate color values
  color: createValidator({
    r: { type: 'number', min: 0, max: 1 },
    g: { type: 'number', min: 0, max: 1 },
    b: { type: 'number', min: 0, max: 1 },
    a: { type: 'number', min: 0, max: 1, allowUndefined: true }
  }),

  // Validate plugin message
  pluginMessage: createValidator({
    type: { type: 'string', min: 1 },
    timestamp: { type: 'number', min: 0 },
    data: { type: 'object', allowNull: true, allowUndefined: true }
  })
};

/**
 * Type-safe assertion function
 */
export function assertValid<T>(
  data: unknown,
  validator: (data: any) => ValidationResult & { data?: T },
  context = 'Data'
): T {
  const result = validator(data);

  if (!result.isValid) {
    const errorMsg = `${context} validation failed: ${result.errors.join(', ')}`;
    throw new Error(errorMsg);
  }

  return result.data!;
}

/**
 * Safe type coercion with validation
 */
export function coerceToType<T>(
  value: unknown,
  targetType: 'string' | 'number' | 'boolean',
  fallback?: T
): T | string | number | boolean {
  try {
    switch (targetType) {
      case 'string':
        return String(value);
      case 'number':
        const num = Number(value);
        return isNaN(num) ? (fallback ?? 0) : num;
      case 'boolean':
        return Boolean(value);
      default:
        return fallback ?? value as T;
    }
  } catch {
    return fallback ?? value as T;
  }
}

/**
 * Deep object validation with nested schemas
 */
export function validateNested<T>(
  data: unknown,
  schema: ValidationSchema,
  path: string[] = []
): ValidationResult & { data?: T } {
  const validator = createValidator<T>(schema);
  const result = validator(data);

  // Add path context to errors
  if (path.length > 0) {
    const pathStr = path.join('.');
    result.errors = result.errors.map(error => `${pathStr}: ${error}`);
    if (result.warnings) {
      result.warnings = result.warnings.map(warning => `${pathStr}: ${warning}`);
    }
  }

  return result;
}
