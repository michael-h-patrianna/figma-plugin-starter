/**
 * Main thread debug mode variable
 *
 * This variable can be imported by any main thread script to check if debug mode is enabled.
 * Usage: import { isDebugMode } from '@main/debug';
 */
export let isDebugMode = false;

/**
 * Set the debug mode (for internal use only)
 */
export function setDebugMode(enabled: boolean): void {
  // @ts-ignore
  isDebugMode = enabled;
}
