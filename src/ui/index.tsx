import { render } from '@create-figma-plugin/ui';
import { PLUGIN_NAME } from '@shared/constants';
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
import { GlobalProgressModalContainer } from '@ui/components/base/GlobalProgressModalContainer';
import { LazyLoader } from '@ui/components/base/LazyLoader';
import { MessageBox } from '@ui/components/base/MessageBox';
import { ProgressManager } from '@ui/components/base/ProgressManager';
import { SettingsDropdown } from '@ui/components/base/SettingsDropdown';
import { Tabs } from '@ui/components/base/Tabs';
import { GlobalToastContainer } from '@ui/components/base/Toast';
import { DebugPanel } from '@ui/components/panels/DebugPanel';
import { HelpPopup } from '@ui/components/panels/HelpPopup';
import { SectionsView } from '@ui/components/views/SectionsView';
import { ThemeProvider, useTheme } from '@ui/contexts/ThemeContext';
import { useSettings } from '@ui/hooks/useSettings';
import { useWindowResize } from '@ui/hooks/useWindowResize';
import { ProgressManagerService } from '@ui/services/progressManager';
import { Toast as ToastService } from '@ui/services/toast';
import { useEffect, useState } from 'preact/hooks';

// Import messaging for debug mode sync
function sendToMain(type: string, data?: any) {
  parent.postMessage({ pluginMessage: { type, ...data } }, '*');
}

/**
 * Main application component for the Figma plugin UI.
 *
 * Provides a tabbed interface showcasing different UI component categories.
 * Each view is self-contained and manages its own state and interactions.
 * Settings (theme, debug mode, user preferences) are automatically loaded
 * on startup and saved when changed.
 *
 * Features:
 * - Auto-loading/saving settings with persistent storage
 * - Theme switching (light/dark) that persists
 * - Debug panel with persistent state
 * - Help system
 * - Progress overlay for scanning operations
 * - Self-contained component views
 */
function App() {
  const { colors, theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoading: settingsLoading, isPersistent } = useSettings();

  // Apply theme from settings when loaded
  useEffect(() => {
    if (!settingsLoading && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, settingsLoading, theme, setTheme]);

  // Apply theme to document body for CSS targeting
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }

  const [showHelp, setShowHelp] = useState(false);

  // Component demo states
  const [activeTab, setActiveTab] = useState('sections');

  const containerRef = useWindowResize(600, 400, 1200, 800);

  // Handle debug mode toggle (update both local state and settings)
  const handleDebugToggle = (enabled: boolean) => {
    updateSettings({ debugMode: enabled });
    // Send message to main thread to sync debug mode
    sendToMain('SET_DEBUG_MODE', { enabled });
  };

  // Handle theme toggle (update both theme context and settings)
  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleShowProgressManager = () => {
    ProgressManagerService.show();
  };

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
      ToastService.error('An unexpected error occurred');
    }}>
      <div ref={containerRef} style={{
        background: colors.darkBg,
        padding: 24,
        color: colors.textColor,
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8
          }}>
            <div>
              <h2 style={{
                color: colors.textColor,
                margin: 0,
                marginBottom: 16,
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: 24
              }}>{PLUGIN_NAME}</h2>
              <p style={{
                color: colors.textSecondary,
                margin: '8px 0 0 0',
                fontSize: 14,
                lineHeight: 1.4
              }}>
                Interactive demo showcasing all components and features - Toast notifications, panels, debug mode, and more.
              </p>
            </div>

            {/* Toggle Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SettingsDropdown
                debugMode={settings.debugMode}
                onDebugToggle={handleDebugToggle}
                onThemeToggle={handleThemeToggle}
                onShowProgressManager={handleShowProgressManager}
              />
            </div>
          </div>
        </div>

        {/* Debug Panel (positioned right after header) */}
        {settings.debugMode && <DebugPanel isVisible={true} />}

        {/* Main Content with Tabs */}
        <Tabs
          tabs={[
            {
              id: 'sections',
              label: 'Start',
              content: <SectionsView />
            },
            {
              id: 'forms',
              label: 'Forms',
              content: (
                <LazyLoader
                  loader={() => import('@ui/components/views/FormsView')}
                >
                  {(module) => <module.FormsView />}
                </LazyLoader>
              )
            },
            {
              id: 'content',
              label: 'Content',
              content: (
                <LazyLoader
                  loader={() => import('@ui/components/views/ContentView')}
                >
                  {(module) => <module.ContentView />}
                </LazyLoader>
              )
            },
            {
              id: 'modals',
              label: 'Modal Dialogs',
              content: (
                <LazyLoader
                  loader={() => import('@ui/components/views/ModalsView')}
                >
                  {(module) => <module.ModalsView />}
                </LazyLoader>
              )
            },
            {
              id: 'messaging',
              label: 'Messaging',
              content: (
                <LazyLoader
                  loader={() => import('@ui/components/views/MessagingView')}
                >
                  {(module) => <module.MessagingView />}
                </LazyLoader>
              )
            },
            {
              id: 'data',
              label: 'Data',
              content: (
                <LazyLoader
                  loader={() => import('@ui/components/views/DataView')}
                >
                  {(module) => (
                    <module.DataView
                      settings={settings}
                      onSettingsChange={updateSettings}
                      debugMode={settings.debugMode}
                      onDebugToggle={() => handleDebugToggle(!settings.debugMode)}
                      onThemeToggle={handleThemeToggle}
                      isPersistent={isPersistent}
                    />
                  )}
                </LazyLoader>
              )
            }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Help Button */}
        <button
          onClick={() => setShowHelp(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: colors.accent,
            border: 'none',
            color: 'white',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          ?
        </button>

        {/* Help Popup */}
        <HelpPopup isVisible={showHelp} onClose={() => setShowHelp(false)} />

        {/* Global Progress Modal Container */}
        <GlobalProgressModalContainer />

        {/* Progress Manager */}
        <ProgressManager />

        {/* Global MessageBox */}
        <MessageBox />

        {/* Global Toast Container */}
        <GlobalToastContainer />
      </div>
    </ErrorBoundary>
  );
}

/**
 * Root application component wrapped with providers and enhanced error boundary.
 *
 * Provides comprehensive error handling, theme context, and message context
 * to the entire application. This is the entry point for the plugin UI
 * that gets rendered by the Figma plugin system.
 *
 * @returns The app with all necessary providers and error protection
 */
function AppWithProviders() {
  return (
    <ThemeProvider>
      <ErrorBoundary
        maxRetries={3}
        autoRecover={true}
        onError={(error, errorInfo) => {
          console.error('🚨 App Level Error:', error, errorInfo);
          ToastService.error('Application error occurred. Attempting recovery...');
        }}
      >
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

/**
 * Renders the plugin UI using the Figma plugin utilities.
 *
 * This is the main export that gets called by the Figma plugin system
 * to initialize and render the plugin's user interface.
 */
export default render(AppWithProviders);
