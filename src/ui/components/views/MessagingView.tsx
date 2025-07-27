import { Button } from '@ui/components/base/Button';
import { Code } from '@ui/components/base/Code';
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
import { Panel } from '@ui/components/base/Panel';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { ProgressModal } from '@ui/components/base/ProgressModal';
import { Spinner } from '@ui/components/base/Spinner';
import { useTheme } from '@ui/contexts/ThemeContext';
import { sendToMain, usePluginMessages } from '@ui/messaging-simple';
import { Toast as ToastService } from '@ui/services/toast';
import { useState } from 'preact/hooks';

export function MessagingView() {
  const { colors } = useTheme();
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [inlineProgress, setInlineProgress] = useState(0);
  const [showInlineProgress, setShowInlineProgress] = useState(false);
  const [hasError, setHasError] = useState(false);

  usePluginMessages({
    PONG: (data) => {
      setLastMessage(data);
      ToastService.success('Received PONG!');
    },
    SELECTION_RESULT: (data) => {
      setLastMessage(data);
      ToastService.success(`Selection: ${data.count} items`);
    },
  });

  const handlePing = () => {
    sendToMain('PING', { message: 'Hello from UI!' });
    ToastService.info('Sent PING');
  };

  const handleGetSelection = () => {
    sendToMain('GET_SELECTION');
    ToastService.info('Requested selection');
  };



  const handleSpinnerDemo = () => {
    setIsLoading(true);
    ToastService.info('Loading started...');
    setTimeout(() => {
      setIsLoading(false);
      ToastService.success('Loading completed!');
    }, 3000);
  };

  const handleProgressDemo = () => {
    setProgress(0);
    setShowProgressModal(true);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowProgressModal(false);
            ToastService.success('Process completed!');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleInlineProgressDemo = () => {
    setInlineProgress(0);
    setShowInlineProgress(true);
    ToastService.info('Starting inline progress...');

    const interval = setInterval(() => {
      setInlineProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowInlineProgress(false);
            ToastService.success('Inline process completed!');
          }, 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Component that throws an error for demo purposes
  const ErrorComponent = () => {
    if (hasError) {
      throw new Error('This is a demo error thrown by ErrorComponent');
    }
    return <div>No error - component is working fine!</div>;
  };

  const handleErrorDemo = () => {
    setHasError(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Messaging Tests">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button onClick={handlePing} size="small">
              Send Ping
            </Button>
            <Button onClick={handleGetSelection} size="small">
              Get Selection
            </Button>

          </div>
        </div>
      </Panel>

      {lastMessage && (
        <Panel title="Last Message">
          <Code language="json">
            {JSON.stringify(lastMessage, null, 2)}
          </Code>
        </Panel>
      )}

      <Panel title="Toast Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Basic Toast Types</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={() => ToastService.info('This is an info message')}
                size="small"
              >
                Info Toast
              </Button>
              <Button
                onClick={() => ToastService.success('Operation completed successfully!')}
                size="small"
              >
                Success Toast
              </Button>
              <Button
                onClick={() => ToastService.warning('Warning: Please check your settings')}
                size="small"
              >
                Warning Toast
              </Button>
              <Button
                onClick={() => ToastService.error('Error: Something went wrong')}
                size="small"
              >
                Error Toast
              </Button>
            </div>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Special Toast Features</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={() => ToastService.quickSuccess('Quick success (2s duration)!')}
                size="small"
              >
                Quick Success
              </Button>
              <Button
                onClick={() => ToastService.persistentError('Persistent error - click to dismiss')}
                size="small"
                variant="secondary"
              >
                Persistent Error
              </Button>
              <Button
                onClick={() => ToastService.single('Single toast (replaces others)')}
                size="small"
                variant="secondary"
              >
                Single Toast
              </Button>
            </div>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Multiple Toasts Demo</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  ToastService.info('First toast message');
                  setTimeout(() => ToastService.success('Second toast message'), 500);
                  setTimeout(() => ToastService.warning('Third toast message'), 1000);
                  setTimeout(() => ToastService.error('Fourth toast message'), 1500);
                }}
                size="small"
              >
                Show Multiple
              </Button>
              <Button
                onClick={() => ToastService.dismissAll()}
                size="small"
                variant="secondary"
              >
                Dismiss All
              </Button>
            </div>
          </div>

          <div style={{
            padding: 12,
            background: colors.backgroundSecondary,
            borderRadius: 6,
            border: `1px solid ${colors.border}`
          }}>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Singleton Toast Benefits</h4>
            <p style={{ color: colors.textSecondary, margin: 0, fontSize: 12, lineHeight: 1.4 }}>
              • <strong>Global Access:</strong> Call from anywhere without component state<br />
              • <strong>Multiple Toasts:</strong> Stack multiple notifications automatically<br />
              • <strong>Rich API:</strong> Special methods for common scenarios<br />
              • <strong>No Prop Drilling:</strong> Zero boilerplate in components<br />
              • <strong>Reactive State:</strong> Powered by Preact signals
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Loading Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              onClick={handleSpinnerDemo}
              size="small"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Demo Spinner'}
            </Button>
            {isLoading && <Spinner size={16} />}
            <Button
              onClick={handleProgressDemo}
              size="small"
            >
              Demo Progress Modal
            </Button>
            <Button
              onClick={handleInlineProgressDemo}
              size="small"
              disabled={showInlineProgress}
            >
              {showInlineProgress ? 'Processing...' : 'Demo Inline Progress'}
            </Button>
          </div>
          {showInlineProgress && (
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 4, fontSize: 11, color: colors.textSecondary }}>
                Inline Progress: {inlineProgress}%
              </div>
              <ProgressBar
                progress={inlineProgress}
                showPercentage={false}
              />
            </div>
          )}
          {isLoading && (
            <div style={{
              padding: 16,
              background: colors.backgroundSecondary,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <Spinner size={24} />
              <div>
                <div style={{ color: colors.textColor, fontSize: 14, fontWeight: 500 }}>
                  Processing...
                </div>
                <div style={{ color: colors.textSecondary, fontSize: 12 }}>
                  This will complete in a few seconds
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Error Boundary Demo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              onClick={handleErrorDemo}
              size="small"
            >
              Trigger Error
            </Button>

          </div>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              console.error('Demo Error Boundary:', error, errorInfo);
              ToastService.error('Error boundary caught an error!');
            }}
          >
            <div style={{
              padding: 12,
              background: colors.backgroundSecondary,
              borderRadius: 6,
              border: `1px solid ${colors.border}`
            }}>
              <ErrorComponent />
            </div>
          </ErrorBoundary>
        </div>
      </Panel>

      {showProgressModal && (
        <ProgressModal
          isVisible={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          progress={progress}
          title="Processing"
          description="Please wait while we process your request"
        />
      )}
    </div>
  );
}
