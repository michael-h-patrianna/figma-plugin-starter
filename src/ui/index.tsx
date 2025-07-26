import { render } from '@create-figma-plugin/ui';
import { OperationResult } from '@main/types';
import { PLUGIN_NAME } from '@shared/constants';
import { exportToCSV } from '@shared/exportUtils';
import { copyToClipboard } from '@shared/utils';
import { useState } from 'preact/hooks';
import { Button } from './components/base/Button';
import { ErrorBoundary } from './components/base/ErrorBoundary';
import { Input } from './components/base/Input';
import { ConfirmBox, MessageBox } from './components/base/MessageBox';
import { Modal } from './components/base/Modal';
import { ProgressBar } from './components/base/ProgressBar';
import { Tabs } from './components/base/Tabs';
import { Toast } from './components/base/Toast';
import { ToggleSwitch } from './components/base/ToggleSwitch';
import { DebugPanel } from './components/panels/DebugPanel';
import { HelpPopup } from './components/panels/HelpPopup';
import { DataView } from './components/views/DataView';
import { FigmaView } from './components/views/FigmaView';
import { FormsView } from './components/views/FormsView';
import { MessagingView } from './components/views/MessagingView';
import { ModalsView } from './components/views/ModalsView';
import { SectionsView } from './components/views/SectionsView';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { commonShortcuts, useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePluginStorage } from './hooks/usePluginStorage';
import { useToast } from './hooks/useToast';
import { useWindowResize } from './hooks/useWindowResize';

function App() {
  const { colors, theme } = useTheme();

  // Apply theme to document body for CSS targeting
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }
  const [scanResult, setScanResult] = useState<OperationResult | null>(null);
  const [processResult, setProcessResult] = useState<OperationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Component demo states
  const [showModal, setShowModal] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sections');
  const [toggleState, setToggleState] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState('medium');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [selectedTime, setSelectedTime] = useState('09:00');

  const { toast, showToast, dismissToast } = useToast();
  const containerRef = useWindowResize(600, 400, 1200, 800);
  const { value: userPreference, setValue: setUserPreference } = usePluginStorage('demoPreference', 'default');

  // Enhanced storage for demo settings
  const { value: storedSettings, setValue: setStoredSettings } = usePluginStorage('userSettings', {
    userName: '',
    autoSave: false,
    lastExportPath: '',
    favoriteColor: '#3772FF'
  });

  // Keyboard shortcuts
  useKeyboardShortcuts([
    commonShortcuts.escape(() => {
      setShowModal(false);
      setShowHelp(false);
    }),
    {
      key: 'd',
      ctrlKey: true,
      action: () => setDebugMode(!debugMode),
      description: 'Toggle debug mode'
    }
  ]);

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

  // Demo functions for showcasing components
  function showDemoNotifications() {
    showToast('This is a success message!', 'success');
    setTimeout(() => showToast('This is a warning message!', 'warning'), 1000);
    setTimeout(() => showToast('This is an error message!', 'error'), 2000);
    setTimeout(() => showToast('This is an info message!', 'info'), 3000);
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

  function demoLoadingState() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Loading simulation completed!', 'success');
    }, 2000);
  }

  function demoExportData() {
    const demoData = [
      { id: 1, name: 'Item 1', type: 'Rectangle', color: '#FF5733' },
      { id: 2, name: 'Item 2', type: 'Text', color: '#33FF57' },
      { id: 3, name: 'Item 3', type: 'Ellipse', color: '#3357FF' }
    ];

    exportToCSV(demoData, 'demo-export.csv');

    // Update last export path in storage
    setStoredSettings({
      ...storedSettings,
      lastExportPath: 'demo-export.csv'
    });

    showToast('CSV export started!', 'success');
  }

  function demoStorageAction() {
    const newValue = userPreference === 'default' ? 'custom' : 'default';
    setUserPreference(newValue);
    showToast(`Preference changed to: ${newValue}`, 'info');
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
              <ToggleSwitch
                checked={debugMode}
                onChange={setDebugMode}
                label="Debug"
              />
            </div>
          </div>
        </div>

        {/* Debug Panel (positioned right after header) */}
        {debugMode && <DebugPanel isVisible={true} />}

        {/* Main Content with Tabs */}
        <Tabs
          tabs={[
            {
              id: 'sections',
              label: 'Sections',
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
                <FormsView
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  textareaValue={textareaValue}
                  onTextareaChange={setTextareaValue}
                  selectedDropdown={selectedDropdown}
                  onDropdownChange={setSelectedDropdown}
                  selectedRadio={selectedRadio}
                  onRadioChange={setSelectedRadio}
                  toggleState={toggleState}
                  onToggleChange={setToggleState}
                  isLoading={isLoading}
                  onDemoLoading={demoLoadingState}
                  onShowToast={() => showToast('Demo toast notification!', 'info')}
                  accordionItems={accordionItems}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  selectedTime={selectedTime}
                  onTimeChange={setSelectedTime}
                />
              )
            },
            {
              id: 'messaging',
              label: 'Messaging',
              content: (
                <MessagingView
                  onShowNotifications={showDemoNotifications}
                  onSimulateProgress={simulateProgress}
                  isScanning={isScanning}
                  scanProgress={scanProgress}
                  isLoading={isLoading}
                  onDemoLoading={demoLoadingState}
                />
              )
            },
            {
              id: 'modals',
              label: 'Modals',
              content: (
                <ModalsView
                  onShowModal={() => setShowModal(true)}
                  onShowMessageBox={() => setShowMessageBox(true)}
                  onShowConfirmBox={() => setShowConfirmBox(true)}
                />
              )
            },
            {
              id: 'figma',
              label: 'Figma',
              content: (
                <FigmaView
                  onShowToast={showToast}
                />
              )
            },
            {
              id: 'data',
              label: 'Data',
              content: (
                <DataView
                  onExportData={demoExportData}
                  onStorageAction={demoStorageAction}
                  userPreference={userPreference}
                  storedSettings={storedSettings}
                  onUpdateSettings={setStoredSettings}
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

        {/* Modal Demo */}
        <Modal
          isVisible={showModal}
          onClose={() => setShowModal(false)}
          title="Custom Modal Demo"
          size="medium"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ color: colors.textColor, margin: 0, lineHeight: 1.5 }}>
              This is a custom modal with full control over content and behavior. You can add any
              components, forms, or content here.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                value={inputValue}
                onChange={setInputValue}
                placeholder="Type something..."
                label="Modal Input"
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button onClick={() => setShowModal(false)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => {
                showToast('Custom modal action completed!', 'success');
                setShowModal(false);
              }}>
                Save
              </Button>
            </div>
          </div>
        </Modal>

        {/* Message Box Demo */}
        <MessageBox
          isVisible={showMessageBox}
          title="Information"
          message="This is a simple message box. Perfect for showing information, alerts, or confirmations with just an OK button."
          onOk={() => {
            setShowMessageBox(false);
            showToast('Message box closed!', 'info');
          }}
        />

        {/* Confirm Box Demo */}
        <ConfirmBox
          isVisible={showConfirmBox}
          title="Confirm Action"
          message="Are you sure you want to perform this action? This is a confirm dialog with OK and Cancel buttons."
          onOk={() => {
            setShowConfirmBox(false);
            showToast('Action confirmed!', 'success');
          }}
          onCancel={() => {
            setShowConfirmBox(false);
            showToast('Action cancelled!', 'warning');
          }}
          okText="Yes, do it"
          cancelText="No, cancel"
        />

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

function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default render(AppWithTheme);
