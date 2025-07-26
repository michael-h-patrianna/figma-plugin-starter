import { LoadingIndicator } from '@create-figma-plugin/ui';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../base/Button';
import { NotificationBanner } from '../base/NotificationBanner';
import { Panel } from '../base/Panel';
import { ProgressBar } from '../base/ProgressBar';

interface MessagingViewProps {
  onShowNotifications: () => void;
  onSimulateProgress: () => void;
  isScanning: boolean;
  scanProgress: number;
  isLoading: boolean;
  onDemoLoading: () => void;
}

export function MessagingView({
  onShowNotifications,
  onSimulateProgress,
  isScanning,
  scanProgress,
  isLoading,
  onDemoLoading
}: MessagingViewProps) {
  const { colors } = useTheme();
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
            <Button onClick={onSimulateProgress} disabled={isScanning}>
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
              <Button onClick={onDemoLoading} disabled={isLoading}>
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
            <Button onClick={onShowNotifications}>
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
    </div>
  );
}
