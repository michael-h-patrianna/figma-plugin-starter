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

/**
 * Checks if a value is null or undefined.
 *
 * @param value - The value to check.
 * @returns {boolean} True if value is null or undefined.
 */
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is not null and not undefined.
 *
 * @param value - The value to check.
 * @returns {boolean} True if value is not null or undefined.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}

/**
 * Safe JSON stringify with error handling.
 *
 * @param obj - The object to stringify.
 * @param space - Optional spacing for formatting.
 * @returns {string} JSON string or empty string if parsing fails.
 */
export function safeJsonStringify(obj: any, space?: number): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return '';
  }
}

/**
 * Safe JSON parse with error handling.
 *
 * @param str - The string to parse.
 * @param fallback - Fallback value if parsing fails.
 * @returns {T} Parsed object or fallback value.
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns {string} String with first letter capitalized.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a maximum length with ellipsis.
 *
 * @param str - The string to truncate.
 * @param maxLength - Maximum length before truncation.
 * @param suffix - Suffix to add when truncated (default: '...').
 * @returns {string} Truncated string.
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Creates a safe timeout promise that doesn't reject.
 *
 * @param promise - The promise to race against timeout.
 * @param timeoutMs - Timeout in milliseconds.
 * @param timeoutValue - Value to return on timeout.
 * @returns {Promise<T>} Promise that resolves with result or timeout value.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutValue: T
): Promise<T> {
  const timeoutPromise = sleep(timeoutMs).then(() => timeoutValue);
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Retries a function a specified number of times with delay.
 *
 * @param fn - Function to retry.
 * @param retries - Number of retries.
 * @param delay - Delay between retries in milliseconds.
 * @returns {Promise<T>} Promise that resolves with function result.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      await sleep(delay);
    }
  }
  throw new Error('Retry failed'); // This should never be reached
}

// ===== Color Contrast Utilities =====

/**
 * Convert hex color to RGB values
 *
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid hex
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance according to WCAG guidelines
 *
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Relative luminance value (0-1)
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors according to WCAG guidelines
 *
 * @param color1 - First color (hex string)
 * @param color2 - Second color (hex string)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1; // Fallback if color parsing fails

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determine the best text color for a given background color based on contrast ratio
 *
 * @param backgroundColor - Background color (hex string)
 * @param textColor - Primary text color option (hex string)
 * @param textInverse - Alternative text color option (hex string)
 * @returns The text color with better contrast
 */
export function getBestTextColor(backgroundColor: string, textColor: string, textInverse: string): string {
  const contrastWithNormal = getContrastRatio(backgroundColor, textColor);
  const contrastWithInverse = getContrastRatio(backgroundColor, textInverse);

  return contrastWithInverse > contrastWithNormal ? textInverse : textColor;
}

/**
 * Check if a color combination meets WCAG contrast requirements
 *
 * @param backgroundColor - Background color (hex string)
 * @param textColor - Text color (hex string)
 * @param level - WCAG level ('AA' or 'AAA')
 * @param size - Text size ('normal' or 'large')
 * @returns True if contrast meets requirements
 */
export function meetsContrastRequirement(
  backgroundColor: string,
  textColor: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(backgroundColor, textColor);

  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
}
