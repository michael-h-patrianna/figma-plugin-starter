/**
 * Simple Debug Mode System
 *
 * Just boolean variables on each thread, no storage, no complex sync.
 */

/**
 * Global debug state - main thread
 */
let isDebugMode = false;

/**
 * Check if debug mode is currently enabled
 */
export function isDebugEnabled(): boolean {
  return isDebugMode;
}

/**
 * Set debug mode (main thread)
 */
export function setDebugMode(enabled: boolean): void {
  isDebugMode = enabled;
}

/**
 * Handle debug mode messages from UI thread
 */
export function handleDebugMessage(type: string, data: any): boolean {
  if (type === 'SET_DEBUG_MODE') {
    isDebugMode = data.enabled;
    return true;
  }
  return false;
}
