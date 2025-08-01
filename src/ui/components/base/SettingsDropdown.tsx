import { ContextMenu, useContextMenu } from '@ui/components/base/ContextMenu';
import { ToggleSwitch } from '@ui/components/base/ToggleSwitch';
import { useTheme } from '@ui/contexts/ThemeContext';
import React from 'preact/compat';

interface SettingsDropdownProps {
  debugMode: boolean;
  onDebugToggle: (enabled: boolean) => void;
  onThemeToggle: () => void;
}

/**
 * Settings dropdown component with cog wheel icon that opens a context menu
 * containing debug mode and theme toggle switches.
 */
export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  debugMode,
  onDebugToggle,
  onThemeToggle
}) => {
  const { colors, theme } = useTheme();
  const { isVisible, position, showContextMenu, hideContextMenu } = useContextMenu();

  const handleCogClick = (event: any) => {
    showContextMenu(event);
  };

  const contextMenuItems = [
    {
      id: 'debug-toggle',
      label: '',
      component: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ color: colors.textColor, fontSize: 13 }}>Debug Mode</span>
          <ToggleSwitch
            checked={debugMode}
            onChange={onDebugToggle}
            label=""
          />
        </div>
      )
    },
    {
      id: 'separator-1',
      label: '',
      separator: true
    },
    {
      id: 'theme-toggle',
      label: '',
      component: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ color: colors.textColor, fontSize: 13 }}>
            {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </span>
          <ToggleSwitch
            checked={theme === 'dark'}
            onChange={onThemeToggle}
            label=""
          />
        </div>
      )
    }
  ];

  return (
    <>
      <button
        onClick={handleCogClick}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
          color: colors.textSecondary
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.accent + '20';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title="Settings"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          style={{ transition: 'transform 0.2s ease' }}
        >
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
        </svg>
      </button>

      <ContextMenu
        items={contextMenuItems}
        isVisible={isVisible}
        position={position}
        onClose={hideContextMenu}
      />
    </>
  );
};
