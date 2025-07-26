import { useEffect, useState } from 'preact/hooks';

// Plugin storage hook for saving user preferences
export function usePluginStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load value from storage on mount
  useEffect(() => {
    async function loadValue() {
      try {
        // In demo mode, we'll use localStorage since we don't have figma.clientStorage
        if (typeof figma !== 'undefined' && figma.clientStorage) {
          const stored = await figma.clientStorage.getAsync(key);
          if (stored !== undefined) {
            setValue(stored);
          }
        } else {
          // Fallback to localStorage for demo
          const stored = localStorage.getItem(`figma-plugin-${key}`);
          if (stored !== null) {
            setValue(JSON.parse(stored));
          }
        }
      } catch (error) {
        console.warn(`Failed to load storage key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    }

    loadValue();
  }, [key]);

  // Save value to storage
  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue);

      if (typeof figma !== 'undefined' && figma.clientStorage) {
        await figma.clientStorage.setAsync(key, newValue);
      } else {
        // Fallback to localStorage for demo
        localStorage.setItem(`figma-plugin-${key}`, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Failed to save storage key "${key}":`, error);
    }
  };

  // Clear value from storage
  const clearStoredValue = async () => {
    try {
      setValue(defaultValue);

      if (typeof figma !== 'undefined' && figma.clientStorage) {
        await figma.clientStorage.deleteAsync(key);
      } else {
        // Fallback to localStorage for demo
        localStorage.removeItem(`figma-plugin-${key}`);
      }
    } catch (error) {
      console.error(`Failed to clear storage key "${key}":`, error);
    }
  };

  return {
    value,
    setValue: setStoredValue,
    clearValue: clearStoredValue,
    isLoading
  };
}
