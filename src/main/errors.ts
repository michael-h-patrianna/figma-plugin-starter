import { Issue } from './types';

/**
 * Common error codes for the Figma plugin.
 *
 * Used to identify and categorize error types throughout the plugin.
 */
export const ERROR_CODES = {
  // Selection errors
  NO_SELECTION: 'NO_SELECTION',
  INVALID_SELECTION: 'INVALID_SELECTION',
  UNSUPPORTED_NODE_TYPE: 'UNSUPPORTED_NODE_TYPE',

  // Processing errors
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  INVALID_DATA: 'INVALID_DATA',
  MISSING_PROPERTY: 'MISSING_PROPERTY',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

/**
 * Helper functions to create common error types for plugin operations.
 *
 * Provides factory methods for generating standard error, warning, and info issues.
 */
export const ErrorHelpers = {
  /**
   * Returns an issue for when no selection is made in Figma.
   * @returns {Issue} Warning-level issue for no selection.
   */
  noSelection(): Issue {
    return {
      code: ERROR_CODES.NO_SELECTION,
      message: 'Please select at least one object to continue',
      level: 'warning'
    };
  },

  /**
   * Returns an error issue for invalid selection.
   * @param reason - Optional reason for invalid selection.
   * @returns {Issue} Error-level issue for invalid selection.
   */
  invalidSelection(reason?: string): Issue {
    return {
      code: ERROR_CODES.INVALID_SELECTION,
      message: reason ? 'Invalid selection: ' + reason : 'The selected objects are not valid for this operation',
      level: 'error'
    };
  },

  /**
   * Returns an error issue for unsupported node types.
   * @param nodeType - The unsupported node type.
   * @param nodeId - Optional node ID.
   * @returns {Issue} Error-level issue for unsupported node type.
   */
  unsupportedNodeType(nodeType: string, nodeId?: string): Issue {
    return {
      code: ERROR_CODES.UNSUPPORTED_NODE_TYPE,
      message: 'Unsupported node type: ' + nodeType + '. Please select a different object.',
      level: 'error',
      nodeId
    };
  },

  /**
   * Returns an error issue for processing failures.
   * @param details - Optional details about the failure.
   * @returns {Issue} Error-level issue for processing failure.
   */
  processingFailed(details?: string): Issue {
    return {
      code: ERROR_CODES.PROCESSING_FAILED,
      message: details ? 'Processing failed: ' + details : 'Processing failed due to an unexpected error',
      level: 'error'
    };
  },

  /**
   * Returns an error issue for missing required properties.
   * @param propertyName - The missing property name.
   * @param nodeId - Optional node ID.
   * @returns {Issue} Error-level issue for missing property.
   */
  missingProperty(propertyName: string, nodeId?: string): Issue {
    return {
      code: ERROR_CODES.MISSING_PROPERTY,
      message: 'Missing required property: ' + propertyName,
      level: 'error',
      nodeId
    };
  },

  /**
   * Returns an error issue for unknown errors.
   * @param error - The unknown error object.
   * @returns {Issue} Error-level issue for unknown error.
   */
  unknownError(error: unknown): Issue {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'Unexpected error: ' + message,
      level: 'error'
    };
  },

  /**
   * Returns an error issue for permission denied actions.
   * @param action - Optional action description.
   * @returns {Issue} Error-level issue for permission denied.
   */
  permissionDenied(action?: string): Issue {
    return {
      code: ERROR_CODES.PERMISSION_DENIED,
      message: action ? 'Permission denied: ' + action : 'You do not have permission to perform this action',
      level: 'error'
    };
  },

  // Success/info messages
  /**
   * Returns an info issue for successful operations.
   * @param message - Success message.
   * @returns {Issue} Info-level issue for success.
   */
  success(message: string): Issue {
    return {
      code: 'SUCCESS',
      message,
      level: 'info'
    };
  },

  /**
   * Returns an info issue for informational messages.
   * @param message - Info message.
   * @returns {Issue} Info-level issue for info.
   */
  info(message: string): Issue {
    return {
      code: 'INFO',
      message,
      level: 'info'
    };
  },

  /**
   * Returns a warning issue for warning messages.
   * @param message - Warning message.
   * @returns {Issue} Warning-level issue for warning.
   */
  warning(message: string): Issue {
    return {
      code: 'WARNING',
      message,
      level: 'warning'
    };
  }
};

/**
 * Utility to check if an issue list has errors.
 *
 * @param issues - List of issues to check.
 * @returns {boolean} True if any issue is error-level.
 */
export function hasErrors(issues: Issue[]): boolean {
  return issues.some(issue => issue.level === 'error');
}

/**
 * Utility to get only error-level issues from a list.
 *
 * @param issues - List of issues to filter.
 * @returns {Issue[]} Array of error-level issues.
 */
export function getErrors(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'error');
}

/**
 * Utility to get only warning-level issues from a list.
 *
 * @param issues - List of issues to filter.
 * @returns {Issue[]} Array of warning-level issues.
 */
export function getWarnings(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'warning');
}

/**
 * Utility to get only info-level issues from a list.
 *
 * @param issues - List of issues to filter.
 * @returns {Issue[]} Array of info-level issues.
 */
export function getInfos(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'info');
}
