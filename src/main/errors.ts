import { Issue } from './types';

/**
 * Common error codes for the Figma plugin starter
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
 * Helper functions to create common error types
 */
export const ErrorHelpers = {
  noSelection(): Issue {
    return {
      code: ERROR_CODES.NO_SELECTION,
      message: 'Please select at least one object to continue',
      level: 'warning'
    };
  },

  invalidSelection(reason?: string): Issue {
    return {
      code: ERROR_CODES.INVALID_SELECTION,
      message: reason ? 'Invalid selection: ' + reason : 'The selected objects are not valid for this operation',
      level: 'error'
    };
  },

  unsupportedNodeType(nodeType: string, nodeId?: string): Issue {
    return {
      code: ERROR_CODES.UNSUPPORTED_NODE_TYPE,
      message: 'Unsupported node type: ' + nodeType + '. Please select a different object.',
      level: 'error',
      nodeId
    };
  },

  processingFailed(details?: string): Issue {
    return {
      code: ERROR_CODES.PROCESSING_FAILED,
      message: details ? 'Processing failed: ' + details : 'Processing failed due to an unexpected error',
      level: 'error'
    };
  },

  missingProperty(propertyName: string, nodeId?: string): Issue {
    return {
      code: ERROR_CODES.MISSING_PROPERTY,
      message: 'Missing required property: ' + propertyName,
      level: 'error',
      nodeId
    };
  },

  unknownError(error: unknown): Issue {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'Unexpected error: ' + message,
      level: 'error'
    };
  },

  permissionDenied(action?: string): Issue {
    return {
      code: ERROR_CODES.PERMISSION_DENIED,
      message: action ? 'Permission denied: ' + action : 'You do not have permission to perform this action',
      level: 'error'
    };
  },

  // Success/info messages
  success(message: string): Issue {
    return {
      code: 'SUCCESS',
      message,
      level: 'info'
    };
  },

  info(message: string): Issue {
    return {
      code: 'INFO',
      message,
      level: 'info'
    };
  },

  warning(message: string): Issue {
    return {
      code: 'WARNING',
      message,
      level: 'warning'
    };
  }
};

/**
 * Utility to check if an issue list has errors
 */
export function hasErrors(issues: Issue[]): boolean {
  return issues.some(issue => issue.level === 'error');
}

/**
 * Utility to get only error-level issues
 */
export function getErrors(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'error');
}

/**
 * Utility to get only warning-level issues
 */
export function getWarnings(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'warning');
}

/**
 * Utility to get only info-level issues
 */
export function getInfos(issues: Issue[]): Issue[] {
  return issues.filter(issue => issue.level === 'info');
}
