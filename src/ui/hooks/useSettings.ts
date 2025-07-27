import { useEffect, useState } from 'preact/hooks';

/**
 * Plugin settings interface - keep it simple!
 */
export interface PluginSettings {
  theme: 'light' | 'dark';
  debugMode: boolean;
  userText: string;
  lastSaved: string;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: PluginSettings = {
  theme: 'dark',
  debugMode: false,
  userText: '',
  lastSaved: ''
};

/**
 * Storage utility for Figma plugins
 *
 * IMPORTANT: Settings only persist between sessions when running as a real Figma plugin.
 * During development/testing, settings will reset to defaults on each reload.
 */
class SettingsStorage {
  private static readonly SETTINGS_KEY = 'plugin-settings';
  private static inMemorySettings: PluginSettings | null = null;

  static async load(): Promise<PluginSettings> {
    try {
      if (typeof figma !== 'undefined' && figma.clientStorage) {
        // Real Figma plugin - ONLY way to get persistent storage
        const stored = await figma.clientStorage.getAsync(this.SETTINGS_KEY);
        return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
      } else {
        // Development/testing mode - settings don't persist between sessions
        console.warn('Running in development mode - settings will not persist between sessions');
        return this.inMemorySettings || DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async save(settings: PluginSettings): Promise<void> {
    try {
      const settingsToSave = {
        ...settings,
        lastSaved: new Date().toISOString()
      };

      if (typeof figma !== 'undefined' && figma.clientStorage) {
        // Real Figma plugin - persistent storage
        await figma.clientStorage.setAsync(this.SETTINGS_KEY, settingsToSave);
      } else {
        // Development mode - store in memory only (lost on reload)
        this.inMemorySettings = settingsToSave;
        console.warn('Settings saved to memory only - will be lost on reload');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      if (typeof figma !== 'undefined' && figma.clientStorage) {
        await figma.clientStorage.deleteAsync(this.SETTINGS_KEY);
      } else {
        this.inMemorySettings = null;
      }
    } catch (error) {
      console.error('Failed to clear settings:', error);
    }
  }

  static isPersistent(): boolean {
    return typeof figma !== 'undefined' && !!figma.clientStorage;
  }
}

/**
 * Hook for managing plugin settings with automatic load/save
 */
export function useSettings() {
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-load settings on mount
  useEffect(() => {
    async function loadSettings() {
      const loadedSettings = await SettingsStorage.load();
      setSettings(loadedSettings);
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  // Auto-save when settings change (debounced)
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load

    const saveTimeout = setTimeout(async () => {
      setIsSaving(true);
      await SettingsStorage.save(settings);
      setIsSaving(false);
    }, 500); // 500ms debounce

    return () => clearTimeout(saveTimeout);
  }, [settings, isLoading]);

  // Auto-save on window unload (only works in real Figma plugins)
  useEffect(() => {
    const handleUnload = () => {
      // Only attempt save if we have persistent storage
      if (SettingsStorage.isPersistent()) {
        try {
          // Note: This may not work reliably on unload in all browsers
          SettingsStorage.save({ ...settings, lastSaved: new Date().toISOString() });
        } catch (error) {
          console.warn('Failed to save on unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [settings]);

  const updateSettings = (partial: Partial<PluginSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    await SettingsStorage.save(settings);
    setIsSaving(false);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    const loadedSettings = await SettingsStorage.load();
    setSettings(loadedSettings);
    setIsLoading(false);
  };

  const clearSettings = async () => {
    await SettingsStorage.clear();
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    loadSettings,
    clearSettings,
    isLoading,
    isSaving,
    isPersistent: SettingsStorage.isPersistent()
  };
}
