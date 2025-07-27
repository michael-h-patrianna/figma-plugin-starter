
/**
 * The display name of the Figma plugin.
 */
export const PLUGIN_NAME = 'Figma Plugin Starter';

/**
 * The default width of the plugin UI window.
 */
export const DEFAULT_WIDTH = 800;

/**
 * The default height of the plugin UI window.
 */
export const DEFAULT_HEIGHT = 600;

/**
 * The default border radius for UI elements.
 */
export const BORDER_RADIUS = 8;

/**
 * Spacing system constants for consistent layout.
 * Based on a 4px base unit for predictable spacing patterns.
 */
export const SPACING = {
  /** 4px - micro spacing for tight layouts */
  XS: 4,
  /** 8px - small spacing for compact elements */
  SM: 8,
  /** 16px - medium spacing for standard layouts */
  MD: 16,
  /** 24px - large spacing for section separation */
  LG: 24,
  /** 32px - extra large spacing for major sections */
  XL: 32
} as const;
