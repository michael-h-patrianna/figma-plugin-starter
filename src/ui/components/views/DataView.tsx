import { Alert } from '@ui/components/base/Alert';
import { Button } from '@ui/components/base/Button';
import { Panel } from '@ui/components/base/Panel';
import { Textbox } from '@ui/components/base/Textbox';
import { ToggleSwitch } from '@ui/components/base/ToggleSwitch';
import { useTheme } from '@ui/contexts/ThemeContext';
import { PluginSettings } from '@ui/hooks/useSettings';
import React, { useState } from 'react';

interface DataViewProps {
  settings: PluginSettings;
  onSettingsChange: (settings: Partial<PluginSettings>) => void;
  debugMode: boolean;
  onDebugToggle: () => void;
  onThemeToggle: () => void;
  isPersistent: boolean;
}

export const DataView: React.FC<DataViewProps> = ({
  settings,
  onSettingsChange,
  debugMode,
  onDebugToggle,
  onThemeToggle,
  isPersistent
}) => {
  const { theme } = useTheme();
  const [localText, setLocalText] = useState(settings.userText || '');

  const handleSave = () => {
    onSettingsChange({ userText: localText });
  };

  const handleLoad = () => {
    setLocalText(settings.userText || '');
  };

  const handleClear = () => {
    setLocalText('');
    onSettingsChange({ userText: '' });
  };

  const handleExportSettings = () => {
    const exportData = JSON.stringify(settings, null, 2);
    console.log('Settings exported:', exportData);

    // In a real plugin, you might use figma.showUI or other Figma APIs
    // For now, we'll just log to console
  };

  return (
    <div style={{ padding: '16px' }}>
      <Panel title="Settings Demo">
        <>
          {!isPersistent && (
            <Alert type="warning" style={{ marginBottom: '16px' }}>
              <strong>Development Mode:</strong> Settings will not persist between sessions.
              Only real Figma plugins can save settings permanently.
            </Alert>
          )}

          <div style={{ marginBottom: '16px' }}>
            <h3>Settings Status</h3>
            <p>Current Theme: {theme}</p>
            <p>Debug Mode: {debugMode ? 'Enabled' : 'Disabled'}</p>
            <p>Storage: {isPersistent ? 'Persistent (figma.clientStorage)' : 'In-Memory Only'}</p>
            <p>Last Saved: {settings.lastSaved ? new Date(settings.lastSaved).toLocaleString() : 'Never'}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Text Setting</h3>
            <Textbox
              value={localText}
              onValueInput={(value: string) => setLocalText(value)}
              placeholder="Enter some text..."
              style={{ marginBottom: '8px' }}
            />
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Button onClick={handleSave}>Save Text</Button>
              <Button onClick={handleLoad} variant="secondary">Load Text</Button>
              <Button onClick={handleClear} variant="secondary">Clear Text</Button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Quick Controls</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginBottom: '8px' }}>
              💡 Try the cog wheel icon (⚙️) in the top-right corner for a settings context menu!
            </p>
            <Alert type="info" variant="subtle" style={{ marginBottom: '12px' }}>
              <strong>New Alert Component:</strong> Check out the Content tab to see all Alert examples and usage patterns!
            </Alert>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <ToggleSwitch
                checked={debugMode}
                onChange={onDebugToggle}
                label="Debug Mode"
              />
              <Button onClick={onThemeToggle} variant="secondary">
                Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Export</h3>
            <Button onClick={handleExportSettings}>Export Settings to Console</Button>
          </div>

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5', borderRadius: '4px' }}>
            <h4>Settings Overview</h4>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        </>
      </Panel>
    </div>
  );
};
