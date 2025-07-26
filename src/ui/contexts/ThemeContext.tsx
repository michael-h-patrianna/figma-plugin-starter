import { createContext } from 'preact';
import { useContext, useEffect } from 'preact/hooks';
import { usePluginStorage } from '../hooks/usePluginStorage';

export type Theme = 'dark' | 'light';

interface ThemeColors {
  // Background colors
  darkBg: string;
  darkPanel: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  overlay: string;

  // Border colors
  border: string;
  borderSecondary: string;
  borderActive: string;

  // Text colors
  textColor: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  // Interactive colors
  accent: string;
  accentHover: string;
  accentActive: string;

  // State colors
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

  // Form input colors
  inputBackground: string;
  inputBackgroundDisabled: string;
  inputBorder: string;
  inputBorderFocus: string;
  inputBorderError: string;

  // Component specific colors
  toggleBackground: string;
  toggleBackgroundActive: string;
  toggleSlider: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonSecondaryText: string;
  buttonDisabled: string;
  buttonDisabledText: string;

  // Data visualization
  dataRow: string;
  dataRowAlt: string;
  dataHeader: string;

  // Scrollbar colors
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

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
  textInverse: '#000000',

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

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: any;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const { value: theme, setValue: setStoredTheme } = usePluginStorage<Theme>('theme', defaultTheme);

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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setStoredTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setStoredTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to get current theme colors (fallback for non-context usage)
export function getThemeColors(theme: Theme = 'dark'): ThemeColors {
  return theme === 'dark' ? darkTheme : lightTheme;
}
