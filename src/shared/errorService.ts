/**
 * Enhanced error service with categorization, user-friendly messaging,
 * and centralized error handling.
 *
 * Provides a unified interface for error handling across the plugin,
 * with automatic categorization, recovery suggestions, and logging.
 */

import {
  CategorizedError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryAction,
  categorizeError,
  createCustomPatterns,
  getRecoveryActionMessage,
  getRetryDelay,
  shouldAutoRetry
} from './errorTypes';

// Re-export types for convenience
export type { CategorizedError } from './errorTypes';
// Re-export enums as values
export { ErrorCategory, ErrorSeverity, RecoveryAction } from './errorTypes';

/**
 * Error logging configuration
 */
interface ErrorLoggingConfig {
  /** Enable console logging */
  console: boolean;
  /** Enable structured logging */
  structured: boolean;
  /** Log level threshold */
  level: ErrorSeverity;
  /** Include stack traces */
  includeStack: boolean;
}

/**
 * Error reporting configuration
 */
interface ErrorReportingConfig {
  /** Enable external error reporting */
  enabled: boolean;
  /** API endpoint for error reporting */
  endpoint?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Include user data */
  includeUserData: boolean;
  /** Include technical details */
  includeTechnicalDetails: boolean;
}

/**
 * Error service configuration
 */
interface ErrorServiceConfig {
  /** Logging configuration */
  logging: ErrorLoggingConfig;
  /** Error reporting configuration */
  reporting: ErrorReportingConfig;
  /** Maximum number of auto-retries */
  maxRetries: number;
  /** Custom error patterns */
  customPatterns: Array<{
    pattern: RegExp | ((error: Error) => boolean);
    category: ErrorCategory;
    severity: ErrorSeverity;
    recoveryAction: RecoveryAction;
    message: string;
  }>;
}

/**
 * Default error service configuration
 */
const DEFAULT_CONFIG: ErrorServiceConfig = {
  logging: {
    console: true,
    structured: false,
    level: ErrorSeverity.LOW,
    includeStack: false
  },
  reporting: {
    enabled: false,
    includeUserData: false,
    includeTechnicalDetails: true
  },
  maxRetries: 3,
  customPatterns: []
};

/**
 * Error event listener type
 */
type ErrorEventListener = (categorizedError: CategorizedError) => void;

/**
 * Enhanced error service class
 */
export class ErrorService {
  private config: ErrorServiceConfig;
  private listeners: ErrorEventListener[] = [];
  private errorCounts: Map<string, number> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<ErrorServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handles an error with automatic categorization and processing
   *
   * @param error - The error to handle
   * @param context - Context where the error occurred
   * @returns Categorized error information
   *
   * @example
   * ```typescript
   * const errorService = new ErrorService();
   *
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   const handled = errorService.handleError(error as Error, 'data-export');
   *   showUserMessage(handled.userMessage);
   * }
   * ```
   */
  handleError(error: Error, context?: string): CategorizedError {
    const customPatterns = createCustomPatterns(this.config.customPatterns);
    const categorized = categorizeError(error, context, customPatterns);

    // Track error occurrence
    this.trackError(categorized);

    // Log the error
    this.logError(categorized);

    // Report the error if enabled
    if (this.config.reporting.enabled) {
      this.reportError(categorized);
    }

    // Notify listeners
    this.notifyListeners(categorized);

    return categorized;
  }

  /**
   * Handles an error with automatic retry logic
   *
   * @param operation - The operation to retry
   * @param context - Context for error handling
   * @param maxRetries - Maximum number of retries (overrides config)
   * @returns Promise resolving to operation result
   *
   * @example
   * ```typescript
   * const result = await errorService.handleWithRetry(
   *   async () => await fetchData(),
   *   'api-call'
   * );
   * ```
   */
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context?: string,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? this.config.maxRetries;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const categorized = this.handleError(lastError, context);

        // Check if we should retry
        if (attempt < retries && shouldAutoRetry(categorized)) {
          const delay = getRetryDelay(categorized, attempt);
          await this.delay(delay);
          continue;
        }

        // Max retries reached or shouldn't retry
        break;
      }
    }

    throw lastError!;
  }

  /**
   * Creates a user-friendly error message with recovery suggestions
   *
   * @param categorizedError - Categorized error
   * @returns User-friendly error message
   */
  createUserMessage(categorizedError: CategorizedError): string {
    const { userMessage, recoveryAction, code } = categorizedError;
    const actionMessage = getRecoveryActionMessage(recoveryAction);

    let message = userMessage;

    if (recoveryAction !== RecoveryAction.NONE) {
      message += `\n\nSuggested action: ${actionMessage}`;
    }

    if (code) {
      message += `\n\nError code: ${code}`;
    }

    return message;
  }

  /**
   * Gets error statistics
   *
   * @returns Error statistics object
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    topErrors: Array<{ code: string; count: number }>;
  } {
    const totalErrors = Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0);

    const errorsByCategory: Record<ErrorCategory, number> = {
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.USER]: 0,
      [ErrorCategory.PLUGIN]: 0,
      [ErrorCategory.UNKNOWN]: 0
    };

    const errorsBySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.CRITICAL]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.INFO]: 0
    };

    const topErrors = Array.from(this.errorCounts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      topErrors
    };
  }

  /**
   * Adds an error event listener
   *
   * @param listener - Error event listener function
   */
  addEventListener(listener: ErrorEventListener): void {
    this.listeners.push(listener);
  }

  /**
   * Removes an error event listener
   *
   * @param listener - Error event listener function to remove
   */
  removeEventListener(listener: ErrorEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Clears error statistics
   */
  clearStats(): void {
    this.errorCounts.clear();
    this.retryAttempts.clear();
  }

  /**
   * Updates service configuration
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<ErrorServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Tracks error occurrence for statistics
   *
   * @param categorizedError - Categorized error to track
   */
  private trackError(categorizedError: CategorizedError): void {
    const { code } = categorizedError;
    if (code) {
      const currentCount = this.errorCounts.get(code) || 0;
      this.errorCounts.set(code, currentCount + 1);
    }
  }

  /**
   * Logs error based on configuration
   *
   * @param categorizedError - Categorized error to log
   */
  private logError(categorizedError: CategorizedError): void {
    const { logging } = this.config;

    if (!logging.console) return;

    // Check if error meets logging level threshold
    const severityLevels = [ErrorSeverity.INFO, ErrorSeverity.LOW, ErrorSeverity.MEDIUM, ErrorSeverity.HIGH, ErrorSeverity.CRITICAL];
    const errorLevel = severityLevels.indexOf(categorizedError.severity);
    const thresholdLevel = severityLevels.indexOf(logging.level);

    if (errorLevel < thresholdLevel) return;

    const logMethod = this.getLogMethod(categorizedError.severity);
    const logMessage = this.createLogMessage(categorizedError, logging);

    logMethod(logMessage);
  }

  /**
   * Gets appropriate console log method for severity
   *
   * @param severity - Error severity
   * @returns Console log method
   */
  private getLogMethod(severity: ErrorSeverity): (...args: any[]) => void {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return console.error;
      case ErrorSeverity.MEDIUM:
        return console.warn;
      case ErrorSeverity.LOW:
      case ErrorSeverity.INFO:
      default:
        return console.log;
    }
  }

  /**
   * Creates log message based on configuration
   *
   * @param categorizedError - Categorized error
   * @param logging - Logging configuration
   * @returns Log message
   */
  private createLogMessage(categorizedError: CategorizedError, logging: ErrorLoggingConfig): any {
    if (logging.structured) {
      return {
        timestamp: new Date().toISOString(),
        level: categorizedError.severity,
        category: categorizedError.category,
        code: categorizedError.code,
        message: categorizedError.userMessage,
        technical: categorizedError.technicalDetails,
        context: categorizedError.context,
        recoveryAction: categorizedError.recoveryAction,
        stack: logging.includeStack ? categorizedError.error.stack : undefined
      };
    } else {
      let message = `[${categorizedError.category.toUpperCase()}] ${categorizedError.userMessage}`;
      if (categorizedError.code) {
        message += ` (${categorizedError.code})`;
      }
      if (logging.includeStack && categorizedError.error.stack) {
        message += `\n${categorizedError.error.stack}`;
      }
      return message;
    }
  }

  /**
   * Reports error to external service (placeholder for future implementation)
   *
   * @param categorizedError - Categorized error to report
   */
  private async reportError(categorizedError: CategorizedError): Promise<void> {
    const { reporting } = this.config;

    if (!reporting.endpoint || !reporting.apiKey) {
      return;
    }

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        category: categorizedError.category,
        severity: categorizedError.severity,
        code: categorizedError.code,
        message: categorizedError.userMessage,
        technical: reporting.includeTechnicalDetails ? categorizedError.technicalDetails : undefined,
        context: categorizedError.context,
        metadata: categorizedError.metadata
      };

      // Placeholder for actual API call
      // await fetch(reporting.endpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${reporting.apiKey}`
      //   },
      //   body: JSON.stringify(payload)
      // });

    } catch (error) {
      // Don't let error reporting failures break the application
      console.warn('Failed to report error:', error);
    }
  }

  /**
   * Notifies error event listeners
   *
   * @param categorizedError - Categorized error
   */
  private notifyListeners(categorizedError: CategorizedError): void {
    this.listeners.forEach(listener => {
      try {
        listener(categorizedError);
      } catch (error) {
        console.warn('Error in error event listener:', error);
      }
    });
  }

  /**
   * Utility function to create a delay
   *
   * @param ms - Delay in milliseconds
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global error service instance
 */
export const globalErrorService = new ErrorService();

/**
 * Convenience function for handling errors
 *
 * @param error - Error to handle
 * @param context - Context information
 * @returns Categorized error
 */
export function handleError(error: Error, context?: string): CategorizedError {
  return globalErrorService.handleError(error, context);
}

/**
 * Convenience function for operations with retry
 *
 * @param operation - Operation to retry
 * @param context - Context information
 * @param maxRetries - Maximum retry attempts
 * @returns Promise with operation result
 */
export function withRetry<T>(
  operation: () => Promise<T>,
  context?: string,
  maxRetries?: number
): Promise<T> {
  return globalErrorService.handleWithRetry(operation, context, maxRetries);
}
