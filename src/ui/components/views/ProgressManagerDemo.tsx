import { Button } from '@ui/components/base/Button';
import { Panel } from '@ui/components/base/Panel';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { usePluginMessages } from '@ui/messaging';
import { ProgressManagerService } from '@ui/services/progressManager';
import { Toast as ToastService } from '@ui/services/toast';
import { useState } from 'preact/hooks';

export function ProgressManagerDemo() {
  const { colors } = useTheme();
  const [lastOperationId, setLastOperationId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Handle progress updates from main thread
  useProgressManager(
    (operationId) => {
      console.log(`Operation ${operationId} completed successfully`);
      setLastOperationId(operationId);
    },
    (operationId, error) => {
      console.error(`Operation ${operationId} failed:`, error);
      setLastOperationId(operationId);
      ToastService.error(`Operation failed: ${error}`);
    }
  );

  // Handle specific completion messages for detailed results
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
        cancellable: false // Scanning can't be safely cancelled mid-process
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
    console.log('🚀 UI: Starting export operation');
    const { operationId } = ProgressManagerService.start(
      {
        title: 'Exporting Components',
        description: 'Preparing export...',
        cancellable: true // Exports can be cancelled
      },
      'EXPORT_COMPONENTS',
      {
        format: 'PNG',
        scale: 2,
        includeBackground: true
      }
    );

    console.log(`📤 UI: Started export operation: operationId=${operationId}`);
  };

  const startLongOperation = () => {
    console.log('🚀 UI: Starting long operation');
    const { operationId } = ProgressManagerService.start(
      {
        title: 'Processing Data',
        description: 'This will take a while...',
        cancellable: true, // Long operations should be cancellable
        total: 50 // We know it will process 50 steps
      },
      'LONG_OPERATION',
      {
        duration: 10000,
        steps: 50
      }
    );

    console.log(`📤 UI: Started long operation: operationId=${operationId}`);
  };

  const startMultipleOperations = () => {
    console.log('🚀 UI: Starting multiple operations');

    // Start 3 operations simultaneously to show the progress manager
    ProgressManagerService.start(
      {
        title: 'Operation A',
        description: 'First operation...',
        cancellable: true
      },
      'SCAN_NODES',
      { nodeTypes: ['FRAME'], includeHidden: false }
    );

    ProgressManagerService.start(
      {
        title: 'Operation B',
        description: 'Second operation...',
        cancellable: false
      },
      'EXPORT_COMPONENTS',
      { format: 'SVG', scale: 1 }
    );

    ProgressManagerService.start(
      {
        title: 'Operation C',
        description: 'Third operation...',
        cancellable: true,
        total: 25
      },
      'LONG_OPERATION',
      { duration: 5000, steps: 25 }
    );

    console.log('📤 UI: Started 3 concurrent operations');
  };

  return (
    <Panel title="Progress Manager Demo">
      <div>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '24px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          This demo shows the new Progress Manager system:
          <br />• Single modal for all operations (like Windows/macOS file operations)
          <br />• Each operation gets its own progress bar within the modal
          <br />• Cancellable operations have Cancel buttons
          <br />• Completed operations stay visible until cleared
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
            Start Node Scan (Non-cancellable)
          </Button>

          <Button
            onClick={startExportOperation}
            variant="secondary"
            fullWidth
          >
            Start Component Export (Cancellable)
          </Button>

          <Button
            onClick={startLongOperation}
            variant="secondary"
            fullWidth
          >
            Start Long Operation (Cancellable)
          </Button>

          <Button
            onClick={startMultipleOperations}
            variant="danger"
            fullWidth
          >
            Start Multiple Operations
          </Button>

          <Button
            onClick={() => ProgressManagerService.show()}
            variant="secondary"
            fullWidth
          >
            Show Progress Manager
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
          <strong>Progress Manager Benefits:</strong>
          <br />• Single modal for all operations (cleaner UI)
          <br />• Real cancellation support (when properly implemented)
          <br />• Operation history (completed operations remain visible)
          <br />• Better UX for multiple concurrent operations
          <br />• Duration tracking and status indicators
        </div>
      </div>
    </Panel>
  );
}
