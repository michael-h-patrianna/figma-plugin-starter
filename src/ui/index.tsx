import { render } from '@create-figma-plugin/ui';
import { OperationResult } from '@main/types';
import { PLUGIN_NAME } from '@shared/constants';
import { copyToClipboard } from '@shared/utils';
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { SettingsDropdown } from '@ui/components/base/SettingsDropdown';
import { Tabs } from '@ui/components/base/Tabs';
import { Toast } from '@ui/components/base/Toast';
import { DebugPanel } from '@ui/components/panels/DebugPanel';
import { HelpPopup } from '@ui/components/panels/HelpPopup';
import { ContentView } from '@ui/components/views/ContentView';
import { DataView } from '@ui/components/views/DataView';
import { FigmaView } from '@ui/components/views/FigmaView';
import { FormsView } from '@ui/components/views/FormsView';
import { MessagingView } from '@ui/components/views/MessagingView';
import { ModalsView } from '@ui/components/views/ModalsView';
import { SectionsView } from '@ui/components/views/SectionsView';
import { ThemeProvider, useTheme } from '@ui/contexts/ThemeContext';
import { useSettings } from '@ui/hooks/useSettings';
import { useToast } from '@ui/hooks/useToast';
import { useWindowResize } from '@ui/hooks/useWindowResize';
import { useEffect, useState } from 'preact/hooks';

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

  const [scanResult, setScanResult] = useState<OperationResult | null>(null);
  const [processResult, setProcessResult] = useState<OperationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Component demo states
  const [activeTab, setActiveTab] = useState('sections');

  const { toast, showToast, dismissToast } = useToast();
  const containerRef = useWindowResize(600, 400, 1200, 800);

  // Handle debug mode toggle (update both local state and settings)
  const handleDebugToggle = (enabled: boolean) => {
    updateSettings({ debugMode: enabled });
  };

  // Handle theme toggle (update both theme context and settings)
  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  async function handleCopyData() {
    if (processResult && processResult.data) {
      const success = await copyToClipboard(JSON.stringify(processResult.data, null, 2));
      showToast(
        success ? 'Data copied to clipboard!' : 'Copy failed - try again',
        success ? 'success' : 'error'
      );
    } else {
      showToast('No processed data available', 'warning');
    }
  }

  function loadDemoData() {
    // Create demo scan result with various issue types
    const demoScanResult: OperationResult = {
      success: false,
      data: {
        selectionCount: 12,
        pageInfo: {
          name: 'Demo Page',
          id: 'demo-page-id'
        },
        totalItems: 25,
        uniqueItems: 12
      },
      issues: [
        { code: 'MISSING_LAYER', level: 'error', message: 'Missing required layer found' },
        { code: 'NAMING_ISSUE', level: 'warning', message: 'Inconsistent naming detected' },
        { code: 'GROUPING_SUGGESTION', level: 'info', message: 'Consider grouping similar elements' }
      ]
    };

    const demoProcessResult: OperationResult = {
      success: true,
      data: {
        processedItems: 12,
        outputFormat: 'JSON',
        timestamp: new Date().toISOString(),
        summary: {
          total: 12,
          processed: 12,
          errors: 0
        }
      }
    };

    setScanResult(demoScanResult);
    setProcessResult(demoProcessResult);
    showToast('Demo data loaded successfully!', 'success');
  }

  function simulateProgress() {
    setIsScanning(true);
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          showToast('Progress simulation completed!', 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }

  const accordionItems = [
    {
      id: 'overview',
      title: 'Plugin Overview',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          This starter includes comprehensive UI components, hooks, and utilities for building professional Figma plugins.
        </div>
      )
    },
    {
      id: 'components',
      title: 'Available Components',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          Panels, Modals, Inputs, Dropdowns, Tabs, Accordions, Native Loading, Tables, Notifications, and more.
        </div>
      )
    },
    {
      id: 'features',
      title: 'Advanced Features',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          Theme system, plugin storage, error boundaries, export utilities, and selection helpers.
        </div>
      )
    }
  ];

  return (
    <ErrorBoundary onError={(error, errorInfo) => {
      console.error('App Error:', error, errorInfo);
      showToast('An unexpected error occurred', 'error');
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
              content: (
                <SectionsView
                  scanResult={scanResult}
                  processResult={processResult}
                  onLoadDemoData={loadDemoData}
                  onCopyData={handleCopyData}
                />
              )
            },
            {
              id: 'forms',
              label: 'Forms',
              content: (
                <FormsView />
              )
            },
            {
              id: 'content',
              label: 'Content',
              content: (
                <ContentView
                  accordionItems={accordionItems}
                />
              )
            },
            {
              id: 'messaging',
              label: 'Communications',
              content: (
                <MessagingView />
              )
            },
            {
              id: 'modals',
              label: 'Modal Dialogs',
              content: (
                <ModalsView />
              )
            },
            {
              id: 'figma',
              label: 'Figma',
              content: (
                <FigmaView />
              )
            },
            {
              id: 'data',
              label: 'Data',
              content: (
                <DataView
                  settings={settings}
                  onSettingsChange={updateSettings}
                  debugMode={settings.debugMode}
                  onDebugToggle={() => handleDebugToggle(!settings.debugMode)}
                  onThemeToggle={handleThemeToggle}
                  isPersistent={isPersistent}
                />
              )
            }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Progress Overlay */}
        {isScanning && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: colors.darkPanel,
              padding: 32,
              borderRadius: 8,
              textAlign: 'center',
              minWidth: 300,
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ marginBottom: 16, color: colors.textColor, fontSize: 16 }}>
                Scanning...
              </div>
              <ProgressBar
                progress={scanProgress}
                showPercentage={true}
                height={12}
              />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast toast={toast} onDismiss={dismissToast} />
        )}

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
      </div>
    </ErrorBoundary>
  );
}

/**
 * Root application component wrapped with theme provider.
 *
 * Provides the theme context to the entire application and renders
 * the main App component. This is the entry point for the plugin UI
 * that gets rendered by the Figma plugin system.
 *
 * @returns The themed application component
 */
function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

/**
 * Renders the plugin UI using the Figma plugin utilities.
 *
 * This is the main export that gets called by the Figma plugin system
 * to initialize and render the plugin's user interface.
 */
export default render(AppWithTheme);
