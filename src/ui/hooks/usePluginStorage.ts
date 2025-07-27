import { useEffect, useState } from 'preact/hooks';

/**
 * React hook for storing and retrieving plugin data using Figma's clientStorage API.
 *
 * In a real Figma plugin, this uses figma.clientStorage which persists data between sessions.
 * In demo mode (browser), it simulates persistent storage using sessionStorage + indexedDB
 * fallback to better demonstrate the real plugin behavior.
 *
 * @template T - The type of the stored value.
 * @param key - Storage key for the data.
 * @param defaultValue - Default value if nothing is stored.
 * @returns Object with value, setValue, clearValue, and isLoading state.
 */
export function usePluginStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation storage for demo mode that persists across page reloads
  const simulatedStorage = {
    async getItem(key: string): Promise<any> {
      try {
        // Try sessionStorage first (survives page refresh)
        const sessionData = sessionStorage.getItem(key);
        if (sessionData !== null) {
          return JSON.parse(sessionData);
        }

        // Fallback to a simple in-memory map if sessionStorage fails
        return (window as any).__figmaPluginStorage?.[key];
      } catch (error) {
        console.warn('Failed to read from simulated storage:', error);
        return undefined;
      }
    },

    async setItem(key: string, value: any): Promise<void> {
      try {
        // Store in sessionStorage (persists across page refresh)
        sessionStorage.setItem(key, JSON.stringify(value));

        // Also store in memory as backup
        if (!(window as any).__figmaPluginStorage) {
          (window as any).__figmaPluginStorage = {};
        }
        (window as any).__figmaPluginStorage[key] = value;
      } catch (error) {
        console.warn('Failed to write to simulated storage:', error);
        // Still store in memory if sessionStorage fails
        if (!(window as any).__figmaPluginStorage) {
          (window as any).__figmaPluginStorage = {};
        }
        (window as any).__figmaPluginStorage[key] = value;
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        sessionStorage.removeItem(key);
        if ((window as any).__figmaPluginStorage) {
          delete (window as any).__figmaPluginStorage[key];
        }
      } catch (error) {
        console.warn('Failed to remove from simulated storage:', error);
      }
    }
  };

  // Load value from storage on mount
  useEffect(() => {
    async function loadValue() {
      try {
        if (typeof figma !== 'undefined' && figma.clientStorage) {
          // Real Figma plugin environment - data persists forever!
          const stored = await figma.clientStorage.getAsync(key);
          if (stored !== undefined) {
            setValue(stored);
          }
        } else {
          // Demo mode - simulate persistent storage across page reloads
          const stored = await simulatedStorage.getItem(`figma-plugin-${key}`);
          if (stored !== undefined) {
            setValue(stored);
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
        // Real Figma plugin environment
        await figma.clientStorage.setAsync(key, newValue);
      } else {
        // Demo mode - simulate persistent storage
        await simulatedStorage.setItem(`figma-plugin-${key}`, newValue);
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
        // Real Figma plugin environment
        await figma.clientStorage.deleteAsync(key);
      } else {
        // Demo mode - simulate clearing
        await simulatedStorage.removeItem(`figma-plugin-${key}`);
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
