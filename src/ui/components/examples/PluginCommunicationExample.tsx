import { Button } from '@ui/components/base/Button';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Panel } from '@ui/components/base/Panel';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { useTheme } from '@ui/contexts/ThemeContext';
import { usePluginMessages } from '@ui/hooks/usePluginMessages';
import { useToast } from '@ui/hooks/useToast';
import { useState } from 'preact/hooks';

/**
 * Example component demonstrating how to use the usePluginMessages hook.
 *
 * This component shows real communication with the Figma main thread. When you click
 * the buttons, actual messages are sent to the main thread which processes them and
 * sends back results. This demonstrates the complete message flow in a Figma plugin.
 *
 * @returns The plugin communication example component
 */
export function PluginCommunicationExample() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Use the usePluginMessages hook
  const { sendMessage } = usePluginMessages({
    onMessage: (type, data) => {
      switch (type) {
        case 'SCAN_RESULT':
          console.log('Scan completed:', data);
          setLastResult(data);
          setIsScanning(false);
          showToast('Scan completed successfully!', 'success');
          break;

        case 'SCAN_PROGRESS':
          console.log('Scan progress:', data);
          setScanProgress(data);
          if (data === 0) setIsScanning(true);
          if (data === 100) setIsScanning(false);
          break;

        case 'ERROR':
          console.error('Plugin error:', data);
          showToast(`Error: ${data.message || 'Unknown error'}`, 'error');
          setIsScanning(false);
          break;

        default:
          console.log('Unknown message type:', type, data);
      }
    }
  });

  const handleScan = () => {
    setScanProgress(0);
    setIsScanning(true);
    sendMessage('SCAN');
  };

  const handleReset = () => {
    setScanProgress(0);
    setIsScanning(false);
    setLastResult(null);
    showToast('Example reset', 'info');
  };

  return (
    <Panel title="Plugin Communication Example">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
            This example demonstrates <strong>real communication</strong> with the Figma main thread.
            Select some layers in Figma, then click the buttons below to see actual plugin messages in action.
          </p>
          <div style={{
            background: colors.darkBg,
            padding: 12,
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
            fontSize: 12,
            lineHeight: 1.4
          }}>
            <strong style={{ color: colors.textColor }}>What happens when you click:</strong><br />
            <span style={{ color: colors.textSecondary }}>
              • <strong>Start Scan:</strong> Analyzes your current Figma selection and returns details<br />
              • <strong>Reset:</strong> Clears the example state to start over
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Button>
          <Button onClick={handleReset} variant="secondary">
            Reset
          </Button>
        </div>

        {/* Progress Display */}
        {isScanning && (
          <div>
            <div style={{
              color: colors.textColor,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8
            }}>
              Scan Progress
            </div>
            <ProgressBar
              progress={scanProgress}
              label="Scanning Figma selection..."
              showPercentage={true}
              height={12}
            />
          </div>
        )}

        {/* Status Messages */}
        {!lastResult && !isScanning && (
          <InfoBox title="Ready to Test" variant="info" icon="🎯">
            Select some layers in Figma first, then click "Start Scan" to see real plugin communication in action!
          </InfoBox>
        )}

        {lastResult && !isScanning && (
          <InfoBox title="Communication Success" variant="success">
            Message successfully sent to main thread and response received!
            The scan found {lastResult.data?.selectionCount || 0} selected items.
          </InfoBox>
        )}

        {/* Last Result Display */}
        {lastResult && (
          <div>
            <div style={{
              color: colors.textColor,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8
            }}>
              Last Result
            </div>
            <div style={{
              background: colors.darkBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: 12,
              fontSize: 11,
              fontFamily: 'monospace',
              color: colors.textSecondary,
              maxHeight: 200,
              overflow: 'auto'
            }}>
              <pre>{JSON.stringify(lastResult, null, 2)}</pre>
            </div>
          </div>
        )}


        {/* Code Example */}
        <div>
          <div style={{
            color: colors.textColor,
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 8
          }}>
            Usage Code
          </div>
          <div style={{
            background: colors.darkBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            padding: 12,
            fontSize: 11,
            fontFamily: 'monospace',
            color: colors.textSecondary,
            overflow: 'auto'
          }}>
            <pre>{`// Real Figma Plugin Communication Example
const { sendMessage } = usePluginMessages({
  onMessage: (type, data) => {
    switch(type) {
      case 'SCAN_RESULT':
        // Main thread scanned selection and sent back results
        console.log('Scan completed:', data);
        setLastResult(data);
        setIsScanning(false);
        showToast('Scan completed successfully!', 'success');
        break;

      case 'SCAN_PROGRESS':
        // Main thread sending progress updates (0-100)
        setScanProgress(data);
        break;

      case 'ERROR':
        // Handle any errors from main thread
        console.error('Plugin error:', data);
        showToast('Error: ' + data.message, 'error');
        setIsScanning(false);
        break;

      default:
        console.log('Unknown message:', type, data);
    }
  }
});

// Send scan message to main thread
const handleScan = () => {
  setScanProgress(0);
  setIsScanning(true);
  sendMessage('SCAN'); // → Main thread analyzes Figma selection
};`}</pre>
          </div>
        </div>
      </div>
    </Panel>
  );
}
