import { Button } from '@ui/components/base/Button';
import { Panel } from '@ui/components/base/Panel';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { usePluginMessages } from '@ui/messaging';
import { ProgressManagerService } from '@ui/services/progressManager';
import { Toast as ToastService } from '@ui/services/toast';
import { useState } from 'preact/hooks';

export function MainThreadProgressDemo() {
  const { colors } = useTheme();
  const [lastOperationId, setLastOperationId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Handle progress updates from main thread using the new Progress Manager
  useProgressManager(
    (operationId: string) => {
      console.log(`Operation ${operationId} completed successfully`);
      setLastOperationId(operationId);
    },
    (operationId: string, error: any) => {
      console.error(`Operation ${operationId} failed:`, error);
      setLastOperationId(operationId);
      ToastService.error(`Operation failed: ${error}`);
    }
  );

  // Handle specific completion messages
  usePluginMessages({
    SCAN_COMPLETE: (data: any) => {
      const { scannedCount, nodeTypes } = data;
      const message = `Scanned ${scannedCount} nodes of types: ${nodeTypes.join(', ')}`;
      setLastResult(message);
      ToastService.success(message);
    },
    EXPORT_COMPLETE: (data: any) => {
      const { exportedCount, format, scale } = data;
      const message = `Exported ${exportedCount} components as ${format} (${scale}x scale)`;
      setLastResult(message);
      ToastService.success(message);
    },
    LONG_OPERATION_COMPLETE: (data: any) => {
      const { duration, steps } = data;
      const message = `Completed ${steps} steps in ${duration}ms`;
      setLastResult(message);
      ToastService.success(message);
    }
  });

  const startScanOperation = () => {
    console.log('🚀 UI: Starting scan operation');
    const { operationId } = ProgressManagerService.start(
      {
        title: 'Scanning Nodes',
        description: 'Starting scan operation...',
        cancellable: true,
        total: 100
      },
      'SCAN_NODES', // Message type sent to main thread
      {
        // Additional data for the main thread
        includeHidden: true,
        nodeTypes: ['FRAME', 'TEXT', 'RECTANGLE']
      }
    );

    console.log(`📤 UI: Started scan operation: operationId=${operationId}`);
  };

  const startExportOperation = () => {
    const { operationId } = ProgressManagerService.start(
      {
        title: 'Exporting Components',
        description: 'Preparing export...',
        cancellable: true,
        total: 50
      },
      'EXPORT_COMPONENTS',
      {
        format: 'PNG',
        scale: 2,
        includeBackground: true
      }
    );

    console.log(`Started export: operationId=${operationId}`);
  };

  const startLongOperation = () => {
    const { operationId } = ProgressManagerService.start(
      {
        title: 'Processing Data',
        description: 'This will take a while...',
        cancellable: true,
        total: 50
      },
      'LONG_OPERATION',
      {
        duration: 10000,
        steps: 50
      }
    );

    console.log(`Started long operation: operationId=${operationId}`);
  };

  return (
    <Panel title="Main Thread Progress Demo">
      <div>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          These buttons demonstrate the new unified Progress Manager system:
          <br />• All operations appear in a SINGLE modal (file-explorer style)
          <br />• Active operations show progress bars with cancel buttons
          <br />• Completed operations show results and duration
          <br />• Click multiple buttons to see concurrent operations!
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <Button
            onClick={startScanOperation}
            variant="primary"
            fullWidth
          >
            Start Node Scan (adds to unified progress)
          </Button>

          <Button
            onClick={startExportOperation}
            variant="secondary"
            fullWidth
          >
            Start Component Export (adds to unified progress)
          </Button>

          <Button
            onClick={startLongOperation}
            variant="danger"
            fullWidth
          >
            Start Long Operation (adds to unified progress)
          </Button>
        </div>

        {lastOperationId && (
          <div style={{
            padding: '12px',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: lastResult ? '12px' : '0'
          }}>
            Last operation: {lastOperationId}
          </div>
        )}

        {lastResult && (
          <div style={{
            padding: '12px',
            backgroundColor: colors.success,
            borderRadius: '6px',
            border: `1px solid ${colors.successBorder}`,
            fontSize: '14px',
            color: colors.textInverse,
            marginBottom: '16px'
          }}>
            ✅ {lastResult}
          </div>
        )}

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: colors.backgroundSecondary,
          borderRadius: '6px',
          fontSize: '12px',
          color: colors.textSecondary,
          lineHeight: '1.4'
        }}>
          <strong>New Unified Progress Manager:</strong>
          <br />• Single modal shows ALL operations (Active + Completed sections)
          <br />• Each operation has its own progress bar and status
          <br />• Cancel buttons for active operations that support it
          <br />• Click multiple buttons above to see concurrent operations!
          <br />• Much better UX than multiple separate modal popups
        </div>
      </div>
    </Panel>
  );
}
