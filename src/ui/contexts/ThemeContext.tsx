import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

/**
 * Available theme options for the plugin.
 */
export type Theme = 'dark' | 'light';

/**
 * Spacing system for consistent layout throughout the application.
 */
interface ThemeSpacing {
  /** 4px - micro spacing for tight layouts */
  xs: number;
  /** 8px - small spacing for compact elements */
  sm: number;
  /** 16px - medium spacing for standard layouts */
  md: number;
  /** 24px - large spacing for section separation */
  lg: number;
  /** 32px - extra large spacing for major sections */
  xl: number;
}

/**
 * Typography system for consistent text styling throughout the application.
 * Based on Inter font family optimized for desktop UI.
 */
interface ThemeTypography {
  /** 18px - Large headings and titles */
  heading: number;
  /** 16px - Secondary headings and modal titles */
  subheading: number;
  /** 14px - Base body text and default UI text */
  body: number;
  /** 13px - Form inputs and secondary content */
  bodySmall: number;
  /** 12px - Labels, captions, and metadata */
  caption: number;
  /** 11px - Fine print and helper text (minimum readable size) */
  tiny: number;
}

/**
 * Border radius system for consistent rounded corners.
 */
interface ThemeBorderRadius {
  /** 6px - Standard border radius for most UI elements */
  default: number;
  /** 3px - Small border radius for checkboxes and small elements */
  small: number;
  /** 4px - Slightly larger than small for buttons and inputs */
  medium: number;
  /** 50% - Circular elements like avatars and radio buttons */
  round: string;
}

/**
 * Typography system for consistent text styling throughout the application.
 * Based on Inter font family optimized for desktop UI.
 */
interface ThemeTypography {
  /** 18px - Large headings and titles */
  heading: number;
  /** 16px - Secondary headings and modal titles */
  subheading: number;
  /** 14px - Base body text and default UI text */
  body: number;
  /** 13px - Form inputs and secondary content */
  bodySmall: number;
  /** 12px - Labels, captions, and metadata */
  caption: number;
  /** 11px - Fine print and helper text (minimum readable size) */
  tiny: number;
}

/**
 * Complete color palette interface for the plugin theming system.
 *
 * Provides all the color tokens needed for consistent theming across
 * all UI components in both light and dark modes.
 */
interface ThemeColors {
  /** Background colors */
  darkBg: string;
  darkPanel: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  overlay: string;

  /** Border colors */
  border: string;
  borderSecondary: string;
  borderActive: string;

  /** Text colors */
  textColor: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  /** Interactive colors */
  accent: string;
  accentHover: string;
  accentActive: string;

  /** State colors */
  success: string;
  successLight: string;
  successBorder: string;
  error: string;
  errorLight: string;
  errorBorder: string;
  warning: string;
  warningLight: string;
  warningBorder: string;
  info: string;
  infoLight: string;
  infoBorder: string;

  /** Form input colors */
  inputBackground: string;
  inputBackgroundDisabled: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputBorderError: string;

  /** Component specific colors */
  toggleBackground: string;
  toggleBackgroundActive: string;
  toggleSlider: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonSecondaryText: string;
  buttonDisabled: string;
  buttonDisabledText: string;

  /** Data visualization */
  dataRow: string;
  dataRowAlt: string;
  dataHeader: string;

  /** Scrollbar colors */
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

/**
 * Spacing system values following a consistent 4px base scale.
 */
const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

/**
 * Typography system values optimized for Inter font on desktop.
 */
const typography: ThemeTypography = {
  heading: 18,
  subheading: 16,
  body: 14,
  bodySmall: 13,
  caption: 12,
  tiny: 11
};

/**
 * Border radius system values for consistent rounded corners.
 */
const borderRadius: ThemeBorderRadius = {
  default: 6,
  small: 3,
  medium: 4,
  round: '50%'
};

/**
 * Dark theme color palette.
 *
 * Provides all color tokens for dark mode with proper contrast ratios
 * and accessibility considerations.
 */
const darkTheme: ThemeColors = {
  // Background colors
  darkBg: '#181a20',
  darkPanel: '#202329',
  backgroundSecondary: '#2a2d35',
  backgroundTertiary: '#1f2128',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Border colors
  border: '#2c3039',
  borderSecondary: '#383b44',
  borderActive: '#4f94ff',

  // Text colors
  textColor: '#ffffff',
  textSecondary: '#a0a3a8',
  textTertiary: '#6c757d',
  textDisabled: '#555862',
  textInverse: '#ffffff',

  // Interactive colors
  accent: '#4f94ff',
  accentHover: '#3d7df0',
  accentActive: '#2e66d1',

  // State colors
  success: '#14ae5c',
  successLight: 'rgba(20, 174, 92, 0.1)',
  successBorder: 'rgba(20, 174, 92, 0.3)',
  error: '#f24822',
  errorLight: 'rgba(242, 72, 34, 0.1)',
  errorBorder: 'rgba(242, 72, 34, 0.3)',
  warning: '#f39c12',
  warningLight: 'rgba(243, 156, 18, 0.1)',
  warningBorder: 'rgba(243, 156, 18, 0.3)',
  info: '#4f94ff',
  infoLight: 'rgba(79, 148, 255, 0.1)',
  infoBorder: 'rgba(79, 148, 255, 0.3)',

  // Form input colors
  inputBackground: '#2a2d35',
  inputBackgroundDisabled: '#1f2128',
  inputBorder: '#2c3039',
  inputBorderFocus: '#4f94ff',
  inputBorderError: '#f24822',

  // Component specific colors
  toggleBackground: '#2a2d35',
  toggleBackgroundActive: '#4f94ff',
  toggleSlider: '#ffffff',
  buttonSecondary: '#2a2d35',
  buttonSecondaryHover: '#383b44',
  buttonSecondaryText: '#ffffff',
  buttonDisabled: '#383b44',
  buttonDisabledText: '#6c757d',

  // Data visualization
  dataRow: 'transparent',
  dataRowAlt: 'rgba(255, 255, 255, 0.02)',
  dataHeader: '#202329',

  // Scrollbar colors
  scrollbarTrack: '#202329',
  scrollbarThumb: '#a0a3a8',
  scrollbarThumbHover: '#ffffff'
};

const lightTheme: ThemeColors = {
  // Background colors
  darkBg: '#ffffff',
  darkPanel: '#f8f9fa',
  backgroundSecondary: '#f1f3f4',
  backgroundTertiary: '#e8eaed',
  overlay: 'rgba(0, 0, 0, 0.4)',

  // Border colors
  border: '#e1e5e9',
  borderSecondary: '#dadce0',
  borderActive: '#4f94ff',

  // Text colors
  textColor: '#2c3e50',
  textSecondary: '#6c757d',
  textTertiary: '#95a5a6',
  textDisabled: '#bdc3c7',
  textInverse: '#ffffff',

  // Interactive colors
  accent: '#4f94ff',
  accentHover: '#3d7df0',
  accentActive: '#2e66d1',

  // State colors
  success: '#14ae5c',
  successLight: 'rgba(20, 174, 92, 0.08)',
  successBorder: 'rgba(20, 174, 92, 0.2)',
  error: '#f24822',
  errorLight: 'rgba(242, 72, 34, 0.08)',
  errorBorder: 'rgba(242, 72, 34, 0.2)',
  warning: '#f39c12',
  warningLight: 'rgba(243, 156, 18, 0.08)',
  warningBorder: 'rgba(243, 156, 18, 0.2)',
  info: '#4f94ff',
  infoLight: 'rgba(79, 148, 255, 0.08)',
  infoBorder: 'rgba(79, 148, 255, 0.2)',

  // Form input colors
  inputBackground: '#ffffff',
  inputBackgroundDisabled: '#f8f9fa',
  inputBorder: '#e1e5e9',
  inputBorderFocus: '#4f94ff',
  inputBorderError: '#f24822',

  // Component specific colors
  toggleBackground: '#dadce0',
  toggleBackgroundActive: '#4f94ff',
  toggleSlider: '#ffffff',
  buttonSecondary: '#f1f3f4',
  buttonSecondaryHover: '#e8eaed',
  buttonSecondaryText: '#2c3e50',
  buttonDisabled: '#e8eaed',
  buttonDisabledText: '#95a5a6',

  // Data visualization
  dataRow: 'transparent',
  dataRowAlt: 'rgba(0, 0, 0, 0.02)',
  dataHeader: '#f8f9fa',

  // Scrollbar colors
  scrollbarTrack: '#f8f9fa',
  scrollbarThumb: '#6c757d',
  scrollbarThumbHover: '#2c3e50'
};

/**
 * Context interface for theme functionality.
 */
interface ThemeContextType {
  /** Current active theme */
  theme: Theme;
  /** Color palette for the current theme */
  colors: ThemeColors;
  /** Spacing system for consistent layout */
  spacing: ThemeSpacing;
  /** Typography system for consistent text styling */
  typography: ThemeTypography;
  /** Border radius system for consistent rounded corners */
  borderRadius: ThemeBorderRadius;
  /** Function to toggle between light and dark themes */
  toggleTheme: () => void;
  /** Function to set a specific theme */
  setTheme: (theme: Theme) => void;
}

/**
 * React context for theme management.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Props for the ThemeProvider component.
 */
interface ThemeProviderProps {
  /** Child components to provide theme context to */
  children: any;
  /** Default theme to use if no stored preference exists */
  defaultTheme?: Theme;
}

/**
 * Theme provider component that manages theme state and provides theme context.
 *
 * Handles theme persistence via plugin storage, applies CSS custom properties
 * for Figma component integration, and provides theme switching functionality.
 *
 * @param props - The theme provider props
 * @returns A context provider with theme state and functions
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ThemeProvider defaultTheme="dark">
 *       <YourComponents />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // Apply theme to document for CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);

      // Also update CSS custom properties for better Figma component integration
      const root = document.documentElement;
      const themeColors = theme === 'dark' ? darkTheme : lightTheme;

      root.style.setProperty('--figma-button-secondary-bg', themeColors.buttonSecondary);
      root.style.setProperty('--figma-button-secondary-bg-hover', themeColors.buttonSecondaryHover);
      root.style.setProperty('--figma-button-secondary-text', themeColors.buttonSecondaryText);
      root.style.setProperty('--figma-button-disabled-bg', themeColors.buttonDisabled);
      root.style.setProperty('--figma-button-disabled-text', themeColors.buttonDisabledText);
      root.style.setProperty('--figma-input-bg', themeColors.inputBackground);
      root.style.setProperty('--figma-input-border', themeColors.inputBorder);
      root.style.setProperty('--figma-input-border-focus', themeColors.inputBorderFocus);
      root.style.setProperty('--figma-input-text', themeColors.textColor);
      root.style.setProperty('--figma-text-color', themeColors.textColor);
      root.style.setProperty('--figma-text-secondary', themeColors.textSecondary);
      root.style.setProperty('--figma-bg', themeColors.darkBg);
      root.style.setProperty('--figma-bg-secondary', themeColors.darkPanel);

      // Force secondary button styling with high specificity
      const styleElement = document.getElementById('theme-override-styles') || document.createElement('style');
      styleElement.id = 'theme-override-styles';
      styleElement.innerHTML = `
        /* High priority secondary button override - NO TRANSPARENT BACKGROUNDS */
        button[secondary="true"],
        button[secondary],
        div button[secondary="true"],
        div button[secondary] {
          background-color: ${themeColors.buttonSecondary} !important;
          background: ${themeColors.buttonSecondary} !important;
          color: ${themeColors.buttonSecondaryText} !important;
          border: 1px solid ${themeColors.inputBorder} !important;
          opacity: 1 !important;
        }

        button[secondary="true"]:hover,
        button[secondary]:hover,
        div button[secondary="true"]:hover,
        div button[secondary]:hover {
          background-color: ${themeColors.buttonSecondaryHover} !important;
          background: ${themeColors.buttonSecondaryHover} !important;
        }

        /* Override any transparent backgrounds */
        button[secondary] {
          background: ${themeColors.buttonSecondary} !important;
        }
      `;

      if (!document.head.contains(styleElement)) {
        document.head.appendChild(styleElement);
      }
    }
  }, [theme]);

  /**
   * Toggles between light and dark themes.
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
  };

  /**
   * Sets a specific theme.
   *
   * @param newTheme - The theme to set
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, spacing, typography, borderRadius, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access the current theme context.
 *
 * Provides access to the current theme, colors, and theme manipulation functions.
 * Must be used within a ThemeProvider component.
 *
 * @returns The current theme context
 * @throws Error if used outside of ThemeProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, colors, toggleTheme } = useTheme();
 *
 *   return (
 *     <div style={{ color: colors.textColor }}>
 *       Current theme: {theme}
 *       <button onClick={toggleTheme}>Toggle Theme</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Helper function to get theme colors without requiring context.
 *
 * Useful for components that need theme colors but aren't within a ThemeProvider,
 * such as error boundaries or standalone components.
 *
 * @param theme - The theme to get colors for (defaults to 'dark')
 * @returns The color palette for the specified theme
 *
 * @example
 * ```tsx
 * // In an error boundary or standalone component
 * const colors = getThemeColors('dark');
 * const lightColors = getThemeColors('light');
 * ```
 */
export function getThemeColors(theme: Theme = 'dark'): ThemeColors {
  return theme === 'dark' ? darkTheme : lightTheme;
}
