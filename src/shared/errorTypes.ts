/**
 * Error categorization system for improved error handling and user experience.
 *
 * Provides structured error types, classification utilities, and category-specific
 * handling to make errors more actionable and user-friendly.
 */

/**
 * Error category types for classification
 */
export enum ErrorCategory {
  /** Network-related errors (timeouts, connection issues) */
  NETWORK = 'network',
  /** Input validation errors (invalid data, format issues) */
  VALIDATION = 'validation',
  /** System errors (memory, permissions, API limits) */
  SYSTEM = 'system',
  /** User interaction errors (cancelled operations, conflicts) */
  USER = 'user',
  /** Plugin-specific errors (Figma API, node access) */
  PLUGIN = 'plugin',
  /** Unknown or uncategorized errors */
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /** Critical errors that prevent core functionality */
  CRITICAL = 'critical',
  /** High priority errors that impact major features */
  HIGH = 'high',
  /** Medium priority errors that impact some functionality */
  MEDIUM = 'medium',
  /** Low priority errors that are minor inconveniences */
  LOW = 'low',
  /** Informational messages that aren't really errors */
  INFO = 'info'
}

/**
 * Recovery action types
 */
export enum RecoveryAction {
  /** User can retry the operation */
  RETRY = 'retry',
  /** User should refresh or restart */
  REFRESH = 'refresh',
  /** User needs to check their input */
  VALIDATE = 'validate',
  /** User should contact support */
  CONTACT = 'contact',
  /** No action available */
  NONE = 'none'
}

/**
 * Structured error information
 */
export interface CategorizedError {
  /** Original error object */
  error: Error;
  /** Error category */
  category: ErrorCategory;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Suggested recovery action */
  recoveryAction: RecoveryAction;
  /** User-friendly error message */
  userMessage: string;
  /** Technical details for developers */
  technicalDetails?: string;
  /** Context where the error occurred */
  context?: string;
  /** Error code for tracking */
  code?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Error classification patterns for automatic categorization
 */
interface ErrorPattern {
  pattern: RegExp | ((error: Error) => boolean);
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoveryAction: RecoveryAction;
  messageTemplate: string;
}

/**
 * Built-in error patterns for common error types
 * Order matters - more specific patterns should come first
 */
const ERROR_PATTERNS: ErrorPattern[] = [
  // Network errors - check first to avoid confusion with other patterns
  {
    pattern: /network|timeout|fetch.*failed|connection.*failed|request.*failed/i,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.RETRY,
    messageTemplate: 'Network connection issue. Please check your internet connection and try again.'
  },

  // Validation errors - specific patterns for validation
  {
    pattern: /validation.*failed|invalid.*input|invalid.*format|required.*field|input.*validation|field.*required/i,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.VALIDATE,
    messageTemplate: 'Please check your input and try again.'
  },

  // System errors (specific patterns first)
  {
    pattern: /memory.*exceeded|quota.*exceeded|resource.*limit|rate.*limit/i,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    recoveryAction: RecoveryAction.REFRESH,
    messageTemplate: 'System resource limit reached. Please try again later.'
  },
  {
    pattern: /permission.*denied|unauthorized|forbidden|access.*denied/i,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    recoveryAction: RecoveryAction.CONTACT,
    messageTemplate: 'Permission denied. Please check your access rights.'
  },
  {
    pattern: /file.*not.*found|resource.*missing|path.*not.*found/i,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.REFRESH,
    messageTemplate: 'Required resource not found. Please refresh and try again.'
  },

  // User actions
  {
    pattern: /operation.*cancelled|user.*cancelled|cancelled.*by.*user/i,
    category: ErrorCategory.USER,
    severity: ErrorSeverity.LOW,
    recoveryAction: RecoveryAction.NONE,
    messageTemplate: 'Operation was cancelled by user.'
  },

  // Figma-specific errors (more specific patterns)
  {
    pattern: /figma\s+api|figma\s+node|figma\s+selection|figma\..*api|figma\..*node/i,
    category: ErrorCategory.PLUGIN,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.RETRY,
    messageTemplate: 'Figma API error occurred. Please try the operation again.'
  },
  {
    pattern: /node.*not.*found|selection.*empty|layer.*locked/i,
    category: ErrorCategory.PLUGIN,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.VALIDATE,
    messageTemplate: 'Issue with selected Figma elements. Please check your selection and try again.'
  }
];

/**
 * Categorizes an error based on built-in patterns and custom rules
 *
 * @param error - The error to categorize
 * @param context - Optional context information
 * @param customPatterns - Optional additional patterns
 * @returns Categorized error information
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   const categorized = categorizeError(error as Error, 'data-export');
 *   console.log(`${categorized.category}: ${categorized.userMessage}`);
 * }
 * ```
 */
export function categorizeError(
  error: Error,
  context?: string,
  customPatterns: ErrorPattern[] = []
): CategorizedError {
  const allPatterns = [...customPatterns, ...ERROR_PATTERNS];

  // Find matching pattern
  const matchedPattern = allPatterns.find(pattern => {
    if (typeof pattern.pattern === 'function') {
      return pattern.pattern(error);
    }
    return pattern.pattern.test(error.message) ||
      pattern.pattern.test(error.stack || '');
  });

  if (matchedPattern) {
    return {
      error,
      category: matchedPattern.category,
      severity: matchedPattern.severity,
      recoveryAction: matchedPattern.recoveryAction,
      userMessage: matchedPattern.messageTemplate,
      technicalDetails: error.message,
      context,
      code: generateErrorCode(matchedPattern.category, error),
      metadata: {
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Default categorization for unmatched errors
  return {
    error,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    recoveryAction: RecoveryAction.RETRY,
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalDetails: error.message,
    context,
    code: generateErrorCode(ErrorCategory.UNKNOWN, error),
    metadata: {
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Generates a unique error code for tracking
 *
 * @param category - Error category
 * @param error - Original error
 * @returns Error code string
 */
function generateErrorCode(category: ErrorCategory, error: Error): string {
  const hash = simpleHash(error.message);
  return `${category.toUpperCase()}-${hash.toString(16).substring(0, 8)}`;
}

/**
 * Simple hash function for error code generation
 *
 * @param str - String to hash
 * @returns Hash number
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Gets user-friendly message for a recovery action
 *
 * @param action - Recovery action type
 * @returns User-friendly action message
 */
export function getRecoveryActionMessage(action: RecoveryAction): string {
  switch (action) {
    case RecoveryAction.RETRY:
      return 'Try the operation again';
    case RecoveryAction.REFRESH:
      return 'Refresh the plugin or restart Figma';
    case RecoveryAction.VALIDATE:
      return 'Check your input and selection';
    case RecoveryAction.CONTACT:
      return 'Contact support if the problem persists';
    case RecoveryAction.NONE:
      return 'No action required';
    default:
      return 'Please try again later';
  }
}

/**
 * Checks if an error should be automatically retried
 *
 * @param categorizedError - Categorized error
 * @returns True if error is suitable for auto-retry
 */
export function shouldAutoRetry(categorizedError: CategorizedError): boolean {
  return categorizedError.recoveryAction === RecoveryAction.RETRY &&
    categorizedError.severity !== ErrorSeverity.CRITICAL &&
    categorizedError.category !== ErrorCategory.VALIDATION;
}

/**
 * Gets appropriate retry delay based on error category and severity
 *
 * @param categorizedError - Categorized error
 * @param attempt - Current attempt number (0-based)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(categorizedError: CategorizedError, attempt: number): number {
  const baseDelay = categorizedError.category === ErrorCategory.NETWORK ? 1000 : 500;
  const multiplier = categorizedError.severity === ErrorSeverity.HIGH ? 2 : 1.5;

  return Math.min(baseDelay * Math.pow(multiplier, attempt), 10000); // Max 10 seconds
}

/**
 * Creates custom error patterns for specific use cases
 *
 * @param patterns - Array of custom pattern definitions
 * @returns Array of error patterns
 *
 * @example
 * ```typescript
 * const customPatterns = createCustomPatterns([
 *   {
 *     pattern: /export.*failed/i,
 *     category: ErrorCategory.PLUGIN,
 *     severity: ErrorSeverity.HIGH,
 *     recoveryAction: RecoveryAction.RETRY,
 *     message: 'Export failed. Please try exporting again.'
 *   }
 * ]);
 * ```
 */
export function createCustomPatterns(patterns: Array<{
  pattern: RegExp | ((error: Error) => boolean);
  category: ErrorCategory;
  severity: ErrorSeverity;
  recoveryAction: RecoveryAction;
  message: string;
}>): ErrorPattern[] {
  return patterns.map(p => ({
    pattern: p.pattern,
    category: p.category,
    severity: p.severity,
    recoveryAction: p.recoveryAction,
    messageTemplate: p.message
  }));
}
