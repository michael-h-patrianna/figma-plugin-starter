import {
  createCancelablePromise,
  createDebouncer,
  createThrottler,
  retryWithBackoff
} from '@shared/asyncUtils';
import { Button } from '@ui/components/base/Button';
import { Code } from '@ui/components/base/Code';
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Input } from '@ui/components/base/Input';
import { Panel } from '@ui/components/base/Panel';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { ProgressModal } from '@ui/components/base/ProgressModal';
import { Spinner } from '@ui/components/base/Spinner';
import { useTheme } from '@ui/contexts/ThemeContext';
import { sendToMain, usePluginMessages } from '@ui/messaging';
import { Toast as ToastService } from '@ui/services/toast';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';

export function MessagingView() {
  const { colors } = useTheme();
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [inlineProgress, setInlineProgress] = useState(0);
  const [showInlineProgress, setShowInlineProgress] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Async utilities test states
  const [debounceInput, setDebounceInput] = useState('');
  const [debounceOutput, setDebounceOutput] = useState('');
  const [throttleCount, setThrottleCount] = useState(0);
  const [cancelableStatus, setCancelableStatus] = useState('idle');
  const [retryStatus, setRetryStatus] = useState('idle');
  const [retryAttempts, setRetryAttempts] = useState(0);
  const cancelableRef = useRef<any>(null);

  // Create debounced function for testing
  const debouncedUpdate = useMemo(
    () => createDebouncer((value: string) => {
      setDebounceOutput(`Debounced: ${value} at ${new Date().toLocaleTimeString()}`);
      ToastService.success(`Debounced update: ${value}`);
    }, 500),
    []
  );

  // Create throttled function for testing
  const throttledIncrement = useMemo(
    () => createThrottler(() => {
      setThrottleCount(prev => {
        const newCount = prev + 1;
        ToastService.info(`Throttled increment: ${newCount}`);
        return newCount;
      });
    }, 1000),
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
      throttledIncrement.cancel();
      if (cancelableRef.current) {
        cancelableRef.current.cancel();
      }
    };
  }, [debouncedUpdate, throttledIncrement]);

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

  // Async utilities test functions
  const handleDebounceInput = (value: string) => {
    setDebounceInput(value);
    debouncedUpdate(value);
  };

  const handleThrottleClick = () => {
    throttledIncrement();
  };

  const handleCancelableOperation = async () => {
    if (cancelableRef.current) {
      cancelableRef.current.cancel();
      setCancelableStatus('cancelled');
      ToastService.warning('Previous operation cancelled');
      return;
    }

    setCancelableStatus('running');

    const cancelable = createCancelablePromise(async (signal) => {
      ToastService.info('Starting cancelable operation...');

      // Simulate long-running operation
      for (let i = 0; i < 10; i++) {
        if (signal.aborted) {
          throw new Error('Operation was canceled');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        ToastService.info(`Step ${i + 1}/10 completed`);
      }

      return 'Operation completed successfully!';
    });

    cancelableRef.current = cancelable;

    try {
      const result = await cancelable.promise;
      setCancelableStatus('completed');
      ToastService.success(result);
    } catch (error) {
      if (cancelable.isCanceled()) {
        setCancelableStatus('cancelled');
        ToastService.warning('Operation was cancelled');
      } else {
        setCancelableStatus('error');
        ToastService.error(`Operation failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      cancelableRef.current = null;
    }
  };

  const handleRetryOperation = async () => {
    setRetryStatus('running');
    setRetryAttempts(0);

    try {
      const result = await retryWithBackoff(
        async () => {
          setRetryAttempts(prev => prev + 1);
          ToastService.info(`Retry attempt ${retryAttempts + 1}`);

          // 70% chance of failure to demonstrate retry mechanism
          if (Math.random() < 0.7) {
            throw new Error('Simulated network failure');
          }

          return 'Operation succeeded after retry!';
        },
        {
          maxRetries: 5,
          initialDelay: 1000,
          maxDelay: 5000,
          backoffFactor: 1.5
        }
      );

      setRetryStatus('completed');
      ToastService.success(result);
    } catch (error) {
      setRetryStatus('failed');
      ToastService.error(`Operation failed after ${retryAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDebouncerManualControl = () => {
    const hasQueued = debouncedUpdate.flush();
    if (hasQueued) {
      ToastService.info('Flushed pending debounced call');
    } else {
      ToastService.warning('No pending debounced calls to flush');
    }
  };

  const handleDebouncerCancel = () => {
    debouncedUpdate.cancel();
    ToastService.info('Cancelled pending debounced calls');
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

      <Panel title="Async Utilities Test">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Debouncer Test */}
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Debouncer Test</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Input
                value={debounceInput}
                onChange={handleDebounceInput}
                placeholder="Type to test debouncing (500ms delay)..."
              />
              <div style={{
                padding: 8,
                background: colors.backgroundSecondary,
                borderRadius: 4,
                fontSize: 12,
                color: colors.textSecondary,
                minHeight: 20
              }}>
                {debounceOutput || 'Output will appear here after 500ms of no typing...'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  onClick={handleDebouncerManualControl}
                  size="small"
                  variant="secondary"
                >
                  Flush Pending
                </Button>
                <Button
                  onClick={handleDebouncerCancel}
                  size="small"
                  variant="secondary"
                >
                  Cancel Pending
                </Button>
              </div>
            </div>
          </div>

          {/* Throttler Test */}
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Throttler Test</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: 8,
                background: colors.backgroundSecondary,
                borderRadius: 4,
                fontSize: 12,
                color: colors.textSecondary
              }}>
                Throttle count: {throttleCount} (max once per 1s)
              </div>
              <Button
                onClick={handleThrottleClick}
                size="small"
              >
                Click Rapidly (Throttled)
              </Button>
            </div>
          </div>

          {/* Cancelable Promise Test */}
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Cancelable Promise Test</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: 8,
                background: colors.backgroundSecondary,
                borderRadius: 4,
                fontSize: 12,
                color: colors.textSecondary
              }}>
                Status: {cancelableStatus}
              </div>
              <Button
                onClick={handleCancelableOperation}
                size="small"
                variant={cancelableStatus === 'running' ? 'danger' : 'primary'}
                disabled={cancelableStatus === 'running' ? false : cancelableStatus !== 'idle' && cancelableStatus !== 'completed' && cancelableStatus !== 'cancelled' && cancelableStatus !== 'error'}
              >
                {cancelableStatus === 'running' ? 'Cancel Operation' : 'Start Long Operation (10 steps)'}
              </Button>
            </div>
          </div>

          {/* Retry with Backoff Test */}
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Retry with Backoff Test</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                padding: 8,
                background: colors.backgroundSecondary,
                borderRadius: 4,
                fontSize: 12,
                color: colors.textSecondary
              }}>
                Status: {retryStatus} | Attempts: {retryAttempts}
              </div>
              <Button
                onClick={handleRetryOperation}
                size="small"
                disabled={retryStatus === 'running'}
              >
                {retryStatus === 'running' ? 'Retrying...' : 'Start Unreliable Operation (70% failure rate)'}
              </Button>
            </div>
          </div>

          <InfoBox variant="plain" title="Async Utilities Benefits">
            • <strong>Debouncer:</strong> Reduces API calls by delaying execution until input stops<br />
            • <strong>Throttler:</strong> Limits high-frequency events to manageable rates<br />
            • <strong>Cancelable:</strong> Prevents race conditions and memory leaks<br />
            • <strong>Retry:</strong> Handles transient failures with exponential backoff<br />
            • <strong>Cleanup:</strong> All utilities properly clean up resources on unmount
          </InfoBox>
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
