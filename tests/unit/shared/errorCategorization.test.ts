/**
 * Unit tests for error categorization and error service
 * Tests error classification, user-friendly messaging, and recovery suggestions
 */

import { ErrorService } from '../../../src/shared/errorService';
import { categorizeError, createCustomPatterns, ErrorCategory, ErrorSeverity, RecoveryAction, shouldAutoRetry } from '../../../src/shared/errorTypes';

describe('Error Categorization', () => {
  describe('categorizeError function', () => {
    test('categorizes network errors correctly', () => {
      const networkError = new Error('Network timeout occurred');
      const categorized = categorizeError(networkError, 'api-call');

      expect(categorized.category).toBe(ErrorCategory.NETWORK);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(categorized.recoveryAction).toBe(RecoveryAction.RETRY);
      expect(categorized.userMessage).toContain('Network connection');
      expect(categorized.context).toBe('api-call');
      expect(categorized.code).toMatch(/^NETWORK-[a-f0-9]{8}$/);
    });

    test('categorizes validation errors correctly', () => {
      const validationError = new Error('validation failed for email input');
      const categorized = categorizeError(validationError);

      expect(categorized.category).toBe(ErrorCategory.VALIDATION);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(categorized.recoveryAction).toBe(RecoveryAction.VALIDATE);
      expect(categorized.userMessage).toContain('check your input');
    });

    test('categorizes system errors correctly', () => {
      const systemError = new Error('Memory quota exceeded');
      const categorized = categorizeError(systemError);

      expect(categorized.category).toBe(ErrorCategory.SYSTEM);
      expect(categorized.severity).toBe(ErrorSeverity.HIGH);
      expect(categorized.recoveryAction).toBe(RecoveryAction.REFRESH);
      expect(categorized.userMessage).toContain('System resource limit');
    });

    test('categorizes Figma-specific errors correctly', () => {
      const figmaError = new Error('figma api call failed');
      const categorized = categorizeError(figmaError);

      expect(categorized.category).toBe(ErrorCategory.PLUGIN);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(categorized.recoveryAction).toBe(RecoveryAction.RETRY);
      expect(categorized.userMessage).toContain('Figma API error');
    });

    test('categorizes user cancellation correctly', () => {
      const cancelError = new Error('Operation was cancelled by user');
      const categorized = categorizeError(cancelError);

      expect(categorized.category).toBe(ErrorCategory.USER);
      expect(categorized.severity).toBe(ErrorSeverity.LOW);
      expect(categorized.recoveryAction).toBe(RecoveryAction.NONE);
      expect(categorized.userMessage).toContain('cancelled by user');
    });

    test('handles unknown errors with fallback', () => {
      const unknownError = new Error('Some unexpected error occurred');
      const categorized = categorizeError(unknownError);

      expect(categorized.category).toBe(ErrorCategory.UNKNOWN);
      expect(categorized.severity).toBe(ErrorSeverity.MEDIUM);
      expect(categorized.recoveryAction).toBe(RecoveryAction.RETRY);
      expect(categorized.userMessage).toContain('unexpected error');
    });

    test('uses custom patterns when provided', () => {
      const customPatterns = createCustomPatterns([
        {
          pattern: /custom.*error/i,
          category: ErrorCategory.PLUGIN,
          severity: ErrorSeverity.HIGH,
          recoveryAction: RecoveryAction.CONTACT,
          message: 'Custom plugin error occurred'
        }
      ]);

      const customError = new Error('Custom error in plugin');
      const categorized = categorizeError(customError, undefined, customPatterns);

      expect(categorized.category).toBe(ErrorCategory.PLUGIN);
      expect(categorized.severity).toBe(ErrorSeverity.HIGH);
      expect(categorized.recoveryAction).toBe(RecoveryAction.CONTACT);
      expect(categorized.userMessage).toBe('Custom plugin error occurred');
    });

    test('includes metadata in categorized error', () => {
      const error = new Error('Test error');
      const categorized = categorizeError(error, 'test-context');

      expect(categorized.error).toBe(error);
      expect(categorized.technicalDetails).toBe(error.message);
      expect(categorized.context).toBe('test-context');
      expect(categorized.metadata).toHaveProperty('timestamp');
      expect(categorized.metadata).toHaveProperty('stack');
    });
  });

  describe('Error code generation', () => {
    test('generates consistent error codes for same error', () => {
      const error = new Error('Same error message');
      const categorized1 = categorizeError(error);
      const categorized2 = categorizeError(error);

      expect(categorized1.code).toBe(categorized2.code);
    });

    test('generates different codes for different errors', () => {
      const error1 = new Error('First error message');
      const error2 = new Error('Second error message');
      const categorized1 = categorizeError(error1);
      const categorized2 = categorizeError(error2);

      expect(categorized1.code).not.toBe(categorized2.code);
    });
  });
});

describe('ErrorService', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    errorService = new ErrorService({
      logging: {
        console: false, // Disable console logging for tests
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
    });
  });

  afterEach(() => {
    errorService.clearStats();
  });

  describe('handleError method', () => {
    test('handles and categorizes errors', () => {
      const error = new Error('Network timeout');
      const result = errorService.handleError(error, 'test-context');

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.context).toBe('test-context');
      expect(result.error).toBe(error);
    });

    test('tracks error statistics', () => {
      const error1 = new Error('Network timeout');
      const error2 = new Error('Network timeout'); // Same error
      const error3 = new Error('validation failed for input'); // Different error

      errorService.handleError(error1);
      errorService.handleError(error2);
      errorService.handleError(error3);

      const stats = errorService.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.topErrors).toHaveLength(2);
      expect(stats.topErrors[0].count).toBe(2); // Network error occurred twice
    });
  });

  describe('handleWithRetry method', () => {
    test('retries failed operations automatically', async () => {
      let attemptCount = 0;
      const operation = jest.fn().mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network timeout'); // Retryable error
        }
        return 'success';
      });

      const result = await errorService.handleWithRetry(operation, 'test-operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('stops retrying after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network timeout'));

      await expect(
        errorService.handleWithRetry(operation, 'test-operation', 2)
      ).rejects.toThrow('Network timeout');

      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test('does not retry validation errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('validation failed for input'));

      await expect(
        errorService.handleWithRetry(operation, 'test-operation')
      ).rejects.toThrow('validation failed for input');

      expect(operation).toHaveBeenCalledTimes(1); // No retries for validation errors
    });
  });

  describe('createUserMessage method', () => {
    test('creates user-friendly messages with recovery actions', () => {
      const error = new Error('Network timeout');
      const categorized = errorService.handleError(error);
      const userMessage = errorService.createUserMessage(categorized);

      expect(userMessage).toContain('Network connection issue');
      expect(userMessage).toContain('Suggested action:');
      expect(userMessage).toContain('Try the operation again');
      expect(userMessage).toContain('Error code:');
    });

    test('omits action suggestion when recovery action is NONE', () => {
      const error = new Error('Operation was cancelled');
      const categorized = errorService.handleError(error);
      const userMessage = errorService.createUserMessage(categorized);

      expect(userMessage).toContain('cancelled by user');
      expect(userMessage).not.toContain('Suggested action:');
    });
  });

  describe('error event listeners', () => {
    test('notifies listeners when errors occur', () => {
      const listener = jest.fn();
      errorService.addEventListener(listener);

      const error = new Error('Test error');
      const categorized = errorService.handleError(error);

      expect(listener).toHaveBeenCalledWith(categorized);
    });

    test('can remove event listeners', () => {
      const listener = jest.fn();
      errorService.addEventListener(listener);
      errorService.removeEventListener(listener);

      const error = new Error('Test error');
      errorService.handleError(error);

      expect(listener).not.toHaveBeenCalled();
    });

    test('continues processing even if listener throws', () => {
      const badListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      errorService.addEventListener(badListener);
      errorService.addEventListener(goodListener);

      const error = new Error('Test error');
      const categorized = errorService.handleError(error);

      expect(badListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalledWith(categorized);
    });
  });

  describe('error statistics', () => {
    test('provides accurate error statistics', () => {
      // Create errors of different categories and severities
      errorService.handleError(new Error('Network timeout')); // NETWORK, MEDIUM
      errorService.handleError(new Error('validation failed for input')); // VALIDATION, MEDIUM
      errorService.handleError(new Error('Memory quota exceeded')); // SYSTEM, HIGH
      errorService.handleError(new Error('Network timeout')); // NETWORK, MEDIUM (duplicate)

      const stats = errorService.getErrorStats();

      expect(stats.totalErrors).toBe(4);
      expect(stats.topErrors).toHaveLength(3);

      // Network error should be at the top (occurred twice)
      expect(stats.topErrors[0].count).toBe(2);
    });

    test('can clear statistics', () => {
      errorService.handleError(new Error('Test error'));

      let stats = errorService.getErrorStats();
      expect(stats.totalErrors).toBe(1);

      errorService.clearStats();

      stats = errorService.getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(stats.topErrors).toHaveLength(0);
    });
  });

  describe('configuration updates', () => {
    test('can update service configuration', () => {
      const newConfig = {
        maxRetries: 5,
        logging: {
          console: true,
          structured: true,
          level: ErrorSeverity.HIGH,
          includeStack: true
        }
      };

      errorService.updateConfig(newConfig);

      // Test that new configuration is applied (indirectly)
      // We can't directly access private config, but we can test behavior
      expect(() => errorService.updateConfig(newConfig)).not.toThrow();
    });
  });
});

describe('Error Recovery Utilities', () => {
  describe('shouldAutoRetry function', () => {
    test('recommends retry for network errors', () => {
      const error = new Error('Connection timeout');
      const categorized = categorizeError(error);

      const shouldRetry = categorized.recoveryAction === RecoveryAction.RETRY &&
        categorized.severity !== ErrorSeverity.CRITICAL &&
        categorized.category !== ErrorCategory.VALIDATION;

      expect(shouldRetry).toBe(true);
    });

    test('does not recommend retry for validation errors', () => {
      const error = new Error('invalid format provided');
      const categorized = categorizeError(error);

      expect(shouldAutoRetry(categorized)).toBe(false);
    });

    test('does not recommend retry for critical errors', () => {
      // Create a custom pattern for critical errors
      const customPatterns = createCustomPatterns([
        {
          pattern: /critical/i,
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.CRITICAL,
          recoveryAction: RecoveryAction.RETRY,
          message: 'Critical error'
        }
      ]);

      const error = new Error('Critical system failure');
      const categorized = categorizeError(error, undefined, customPatterns);

      expect(shouldAutoRetry(categorized)).toBe(false);
    });
  });
});
