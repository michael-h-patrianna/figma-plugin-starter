
import { LoadingIndicator } from '@create-figma-plugin/ui';
import { Button } from '@ui/components/base/Button';
import { NotificationBanner } from '@ui/components/base/NotificationBanner';
import { Panel } from '@ui/components/base/Panel';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { Toast } from '@ui/components/base/Toast';
import { PluginCommunicationExample } from '@ui/components/examples/PluginCommunicationExample';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
import { useState } from 'preact/hooks';

/**
 * Props for the MessagingView component.
 */
interface MessagingViewProps {
  // No external dependencies - fully self-contained
}

/**
 * Renders a demonstration view for messaging components, including progress indicators, loading states, and notifications.
 *
 * This view showcases various messaging and feedback components including toast notifications,
 * notification banners, progress bars, and loading indicators. All interactions and state
 * management are self-contained within this view.
 *
 * @param props - {@link MessagingViewProps} for configuring the view
 * @returns The rendered messaging view React element
 */
export function MessagingView({ }: MessagingViewProps) {
  const { colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();

  // Messaging demo state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Shows demo toast notifications in sequence.
   */
  const showDemoNotifications = () => {
    showToast('This is a success message!', 'success');
    setTimeout(() => showToast('This is a warning message!', 'warning'), 1000);
    setTimeout(() => showToast('This is an error message!', 'error'), 2000);
    setTimeout(() => showToast('This is an info message!', 'info'), 3000);
  };

  /**
   * Simulates a progress operation.
   */
  const simulateProgress = () => {
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
  };

  /**
   * Simulates a loading state.
   */
  const demoLoadingState = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Loading simulation completed!', 'success');
    }, 2000);
  };

  /**
   * Demo issues for the notification banner.
   * Used to showcase error, warning, and info banners in the UI.
   */
  // Demo issues for notification banner
  const demoIssues = [
    { code: 'DEMO_ERROR', level: 'error' as const, message: 'This is a demo error message' },
    { code: 'DEMO_WARNING', level: 'warning' as const, message: 'This is a demo warning message' },
    { code: 'DEMO_INFO', level: 'info' as const, message: 'This is a demo info message' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Progress Bar Panel */}
      <Panel title="Progress Indicators">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Progress Bar</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Linear progress indicator with percentage display and custom styling.
            </p>
            <div style={{ marginBottom: 12 }}>
              <ProgressBar
                progress={scanProgress}
                label="Scanning progress"
                showPercentage={true}
                height={12}
              />
            </div>
            <Button onClick={simulateProgress} disabled={isScanning}>
              {isScanning ? 'Scanning...' : 'Simulate Progress'}
            </Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Static Progress Examples</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ProgressBar progress={25} label="25% Complete" color={colors.info} />
              <ProgressBar progress={50} label="Half way there" color={colors.warning} />
              <ProgressBar progress={75} label="Almost done" color={colors.accent} />
              <ProgressBar progress={100} label="Completed" color={colors.success} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Loading Indicators Panel */}
      <Panel title="Native Loading Indicators">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Interactive Loading</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Native Figma loading indicator for async operations and user feedback.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {isLoading && <LoadingIndicator />}
              <Button onClick={demoLoadingState} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Demo Loading'}
              </Button>
            </div>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Native Loading Indicators</h4>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <LoadingIndicator />
                <span style={{ fontSize: 11, color: colors.textSecondary }}>Default</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Notification Banner Panel */}
      <Panel title="Notification Banners">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Toast Notifications</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Temporary toast messages for user feedback (success, error, warning, info).
            </p>
            <Button onClick={showDemoNotifications}>
              Demo Toast Sequence
            </Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Issue Banner</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Persistent banner for displaying multiple issues and status messages.
            </p>
            <NotificationBanner issues={demoIssues} />
          </div>
        </div>
      </Panel>

      {/* Plugin Communication Example */}
      <PluginCommunicationExample />

      {/* Toast Notification */}
      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
