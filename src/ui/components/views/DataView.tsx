import { Button } from '@create-figma-plugin/ui';
import { COLORS } from '@shared/constants';
import { Input } from '../base/Input';
import { Panel } from '../base/Panel';
import { ToggleSwitch } from '../base/ToggleSwitch';

interface DataViewProps {
  onExportData: () => void;
  onStorageAction: () => void;
  userPreference: string;
  storedSettings: {
    userName: string;
    autoSave: boolean;
    lastExportPath: string;
    favoriteColor: string;
  };
  onUpdateSettings: (settings: any) => void;
}

export function DataView({
  onExportData,
  onStorageAction,
  userPreference,
  storedSettings,
  onUpdateSettings
}: DataViewProps) {
  const handleSettingChange = (key: string, value: any) => {
    onUpdateSettings({
      ...storedSettings,
      [key]: value
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Export Panel */}
      <Panel title="Data Export">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>CSV Export</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Export data as CSV files with proper formatting and headers. Perfect for analysis in Excel or Google Sheets.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button onClick={onExportData}>Export Demo Data</Button>
              {storedSettings.lastExportPath && (
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>
                  Last export: {new Date().toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* Plugin Storage Demo Panel */}
      <Panel title="Plugin Storage Demo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>What is Plugin Storage?</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Plugin storage allows you to save user preferences, settings, and data that persist between plugin sessions.
              This data is stored locally and remains available even after Figma is closed and reopened.
            </p>
          </div>

          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>User Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                value={storedSettings.userName}
                onChange={(value) => handleSettingChange('userName', value)}
                label="User Name"
                placeholder="Enter your name..."
                width="200px"
              />

              <Input
                value={storedSettings.favoriteColor}
                onChange={(value) => handleSettingChange('favoriteColor', value)}
                label="Favorite Color (Hex)"
                placeholder="#3772FF"
                width="140px"
              />

              <ToggleSwitch
                checked={storedSettings.autoSave}
                onChange={(value) => handleSettingChange('autoSave', value)}
                label="Enable Auto-Save"
              />
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Storage Status</h4>
            <div style={{
              background: COLORS.darkBg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              padding: 12,
              fontSize: 11,
              fontFamily: 'monospace'
            }}>
              <div style={{ color: COLORS.textSecondary, marginBottom: 8 }}>Current stored data:</div>
              <pre style={{
                margin: 0,
                color: COLORS.textColor,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {JSON.stringify(storedSettings, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Storage Actions</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button onClick={onStorageAction} secondary>
                Switch Theme: {userPreference}
              </Button>
              <Button
                onClick={() => onUpdateSettings({
                  userName: '',
                  autoSave: false,
                  lastExportPath: '',
                  favoriteColor: '#3772FF'
                })}
                secondary
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {/* Storage Benefits Panel */}
      <Panel title="Storage Use Cases" variant="standard">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h5 style={{ color: COLORS.textColor, margin: '0 0 6px 0', fontSize: 13 }}>Common Use Cases:</h5>
            <ul style={{ color: COLORS.textSecondary, fontSize: 12, lineHeight: 1.5, margin: 0, paddingLeft: 16 }}>
              <li>User preferences (theme, language, shortcuts)</li>
              <li>Recently used colors, fonts, or styles</li>
              <li>Export settings and file paths</li>
              <li>Plugin configuration and API keys</li>
              <li>User workspace layouts and tool states</li>
              <li>Cache frequently accessed data</li>
            </ul>
          </div>

          <div style={{
            background: COLORS.darkBg,
            border: `1px solid ${COLORS.accent}20`,
            borderLeft: `4px solid ${COLORS.accent}`,
            borderRadius: 4,
            padding: 12
          }}>
            <div style={{ color: COLORS.accent, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              💡 Pro Tip
            </div>
            <div style={{ color: COLORS.textSecondary, fontSize: 11, lineHeight: 1.4 }}>
              Storage is scoped per plugin, so your data won't conflict with other plugins.
              Perfect for creating personalized user experiences!
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
