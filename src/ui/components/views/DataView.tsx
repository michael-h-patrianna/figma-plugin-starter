import { Alert } from '@ui/components/base/Alert';
import { Button } from '@ui/components/base/Button';
import { Code } from '@ui/components/base/Code';
import { Panel } from '@ui/components/base/Panel';
import { Textbox } from '@ui/components/base/Textbox';
import { Toast } from '@ui/components/base/Toast';
import { useTheme } from '@ui/contexts/ThemeContext';
import { PluginSettings } from '@ui/hooks/useSettings';
import { useToast } from '@ui/hooks/useToast';
import { useState } from 'preact/hooks';

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
  const { theme, colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
  const [localText, setLocalText] = useState(settings.userText || '');

  const handleSave = () => {
    onSettingsChange({ userText: localText });
    showToast('Text saved successfully!', 'success');
  };

  const handleLoad = () => {
    setLocalText(settings.userText || '');
    showToast('Text loaded from settings', 'info');
  };

  const handleClear = () => {
    setLocalText('');
    onSettingsChange({ userText: '' });
    showToast('Text cleared', 'info');
  };

  const handleExportSettings = () => {
    const exportData = JSON.stringify(settings, null, 2);
    console.log('Settings exported:', exportData);
    showToast('Settings exported to console', 'success');

    // In a real plugin, you might use figma.showUI or other Figma APIs
    // For now, we'll just log to console
  };

  return (
    <div style={{ padding: 16 }}>
      <Panel title="Settings Demo">
        <>
          {!isPersistent && (
            <Alert type="warning" style={{ marginBottom: 16 }}>
              <strong>Development Mode:</strong> Settings will not persist between sessions.
              Only real Figma plugins can save settings permanently.
            </Alert>
          )}

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: colors.textColor, margin: '0 0 8px 0' }}>Settings Status</h3>
            <p style={{ color: colors.textSecondary, margin: '4px 0' }}>Current Theme: {theme}</p>
            <p style={{ color: colors.textSecondary, margin: '4px 0' }}>Debug Mode: {debugMode ? 'Enabled' : 'Disabled'}</p>
            <p style={{ color: colors.textSecondary, margin: '4px 0' }}>Storage: {isPersistent ? 'Persistent (figma.clientStorage)' : 'In-Memory Only'}</p>
            <p style={{ color: colors.textSecondary, margin: '4px 0' }}>Last Saved: {settings.lastSaved ? new Date(settings.lastSaved).toLocaleString() : 'Never'}</p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: colors.textColor, margin: '0 0 8px 0' }}>Text Setting</h3>
            <Textbox
              value={localText}
              onValueInput={(value: string) => setLocalText(value)}
              placeholder="Enter some text..."
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Button onClick={handleSave}>Save Text</Button>
              <Button onClick={handleLoad} variant="secondary">Load Text</Button>
              <Button onClick={handleClear} variant="secondary">Clear Text</Button>
            </div>
          </div>


          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: colors.textColor, margin: '0 0 8px 0' }}>Export</h3>
            <Button onClick={handleExportSettings}>Export Settings to Console</Button>
          </div>

          <div style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 6,
            border: `1px solid ${colors.border}`
          }}>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0' }}>Settings Overview</h4>
            <Code language="json">
              {JSON.stringify(settings, null, 2)}
            </Code>
          </div>
        </>
      </Panel>

      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
};
