import { Button } from '@create-figma-plugin/ui';
import { COLORS } from '@shared/constants';
import { NotificationBanner } from '../base/NotificationBanner';
import { Panel } from '../base/Panel';
import { ProgressBar } from '../base/ProgressBar';
import { Spinner } from '../base/Spinner';

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
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Progress Bar</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
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
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Static Progress Examples</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <ProgressBar progress={25} label="25% Complete" color={COLORS.info} />
              <ProgressBar progress={50} label="Half way there" color={COLORS.warning} />
              <ProgressBar progress={75} label="Almost done" color={COLORS.accent} />
              <ProgressBar progress={100} label="Completed" color={COLORS.success} />
            </div>
          </div>
        </div>
      </Panel>

      {/* Spinner Panel */}
      <Panel title="Loading Spinners">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Interactive Spinner</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Loading spinner for async operations and user feedback.
            </p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {isLoading && <Spinner size={16} />}
              <Button onClick={onDemoLoading} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Demo Loading'}
              </Button>
            </div>
          </div>

          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Spinner Sizes</h4>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Spinner size={12} />
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Small (12px)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Spinner size={16} />
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Medium (16px)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Spinner size={24} />
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>Large (24px)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Spinner size={32} />
                <span style={{ fontSize: 11, color: COLORS.textSecondary }}>XL (32px)</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Notification Banner Panel */}
      <Panel title="Notification Banners">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Toast Notifications</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Temporary toast messages for user feedback (success, error, warning, info).
            </p>
            <Button onClick={onShowNotifications}>
              Demo Toast Sequence
            </Button>
          </div>

          <div>
            <h4 style={{ color: COLORS.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Issue Banner</h4>
            <p style={{ color: COLORS.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Persistent banner for displaying multiple issues and status messages.
            </p>
            <NotificationBanner issues={demoIssues} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
