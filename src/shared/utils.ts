// Utility functions for Figma plugin starter

/**
 * Copies text to the clipboard, with fallback for Figma plugin iframe environments.
 *
 * @param text - The text to copy.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for Figma plugin iframe
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounces function calls, ensuring the function is only called after a delay.
 *
 * @param func - The function to debounce.
 * @param delay - Delay in milliseconds.
 * @returns A debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  };
}

/**
 * Generates a random alphanumeric ID string.
 *
 * @param length - Length of the ID (default: 8).
 * @returns {string} The generated ID.
 */
export function generateId(length = 8): string {
  return Math.random().toString(36).substr(2, length);
}

/**
 * Formats a number of bytes as a human-readable string with units.
 *
 * @param bytes - Number of bytes.
 * @returns {string} Formatted size string.
 */
export function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Clamps a number between minimum and maximum values.
 *
 * @param value - The value to clamp.
 * @param min - Minimum allowed value.
 * @param max - Maximum allowed value.
 * @returns {number} The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Waits for a specified number of milliseconds.
 *
 * @param ms - Milliseconds to wait.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if a string is a valid slug (lowercase, alphanumeric, hyphens).
 *
 * @param str - The string to check.
 * @returns {boolean} True if valid slug, false otherwise.
 */
export function isValidSlug(str: string): boolean {
  return /^[a-z0-9-]+$/.test(str);
}

/**
 * Converts a string to slug format (lowercase, hyphens, alphanumeric).
 *
 * @param str - The string to convert.
 * @returns {string} The slugified string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
