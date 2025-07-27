import { Button } from '@ui/components/base/Button';
import { Code } from '@ui/components/base/Code';
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
import { Panel } from '@ui/components/base/Panel';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { ProgressModal } from '@ui/components/base/ProgressModal';
import { Spinner } from '@ui/components/base/Spinner';
import { Toast } from '@ui/components/base/Toast';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
import { sendToMain, usePluginMessages } from '@ui/messaging-simple';
import { useState } from 'preact/hooks';

export function MessagingView() {
  const { colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
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
      showToast('Received PONG!', 'success');
    },
    SELECTION_RESULT: (data) => {
      setLastMessage(data);
      showToast(`Selection: ${data.count} items`, 'success');
    },
  });

  const handlePing = () => {
    sendToMain('PING', { message: 'Hello from UI!' });
    showToast('Sent PING', 'info');
  };

  const handleGetSelection = () => {
    sendToMain('GET_SELECTION');
    showToast('Requested selection', 'info');
  };



  const handleSpinnerDemo = () => {
    setIsLoading(true);
    showToast('Loading started...', 'info');
    setTimeout(() => {
      setIsLoading(false);
      showToast('Loading completed!', 'success');
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
            showToast('Process completed!', 'success');
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
    showToast('Starting inline progress...', 'info');

    const interval = setInterval(() => {
      setInlineProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowInlineProgress(false);
            showToast('Inline process completed!', 'success');
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              onClick={() => showToast('This is an info message', 'info')}
              size="small"
            >
              Info Toast
            </Button>
            <Button
              onClick={() => showToast('Operation completed successfully!', 'success')}
              size="small"
            >
              Success Toast
            </Button>
            <Button
              onClick={() => showToast('Warning: Please check your settings', 'warning')}
              size="small"
            >
              Warning Toast
            </Button>
            <Button
              onClick={() => showToast('Error: Something went wrong', 'error')}
              size="small"
            >
              Error Toast
            </Button>
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
              showToast('Error boundary caught an error!', 'error');
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



      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}

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
