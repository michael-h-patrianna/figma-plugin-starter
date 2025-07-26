import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { usePluginStorage } from '../hooks/usePluginStorage';

export type Theme = 'dark' | 'light';

interface ThemeColors {
  darkBg: string;
  darkPanel: string;
  border: string;
  textColor: string;
  textSecondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

const darkTheme: ThemeColors = {
  darkBg: '#181a20',
  darkPanel: '#202329',
  border: '#2c3039',
  textColor: '#ffffff',
  textSecondary: '#a0a3a8',
  accent: '#4f94ff',
  success: '#14ae5c',
  error: '#f24822',
  warning: '#f39c12',
  info: '#4f94ff'
};

const lightTheme: ThemeColors = {
  darkBg: '#ffffff',
  darkPanel: '#f8f9fa',
  border: '#e1e5e9',
  textColor: '#2c3e50',
  textSecondary: '#6c757d',
  accent: '#4f94ff',
  success: '#14ae5c',
  error: '#f24822',
  warning: '#f39c12',
  info: '#4f94ff'
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
