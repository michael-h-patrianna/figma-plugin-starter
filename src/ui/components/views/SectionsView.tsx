import { OperationResult } from '@main/types';
import { copyToClipboard } from '@shared/utils';
import { Button } from '@ui/components/base/Button';
import { DataTable } from '@ui/components/base/DataTable';
import { NotificationBanner } from '@ui/components/base/NotificationBanner';
import { Panel } from '@ui/components/base/Panel';
import { HowToUsePanel } from '@ui/components/panels/HowToUsePanel';
import { ProgressManagerDemo } from '@ui/components/views/ProgressManagerDemo';
import { useTheme } from '@ui/contexts/ThemeContext';
import { Toast as ToastService } from '@ui/services/toast';
import { useState } from 'preact/hooks';

/**
 * Renders a demonstration view for sectioned panels, including scan and process results, action buttons, and usage instructions.
 * This view manages its own state for demo data and demonstrates various plugin features including data tables and the new Progress Manager system.
 *
 * @returns The rendered sections view React element.
 */
export function SectionsView() {
  const { colors } = useTheme();

  // Local state for demo data
  const [scanResult, setScanResult] = useState<OperationResult | null>(null);
  const [processResult, setProcessResult] = useState<OperationResult | null>(null);

  // Handle demo data loading
  const handleLoadDemoData = () => {
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
    ToastService.success('Demo data loaded successfully!');
  };

  // Handle copying demo data
  const handleCopyData = async () => {
    if (processResult && processResult.data) {
      const success = await copyToClipboard(JSON.stringify(processResult.data, null, 2));
      if (success) {
        ToastService.success('Data copied to clipboard!');
      } else {
        ToastService.error('Copy failed - try again');
      }
    } else {
      ToastService.warning('No processed data available');
    }
  };

  // Handle clearing demo data
  const handleClearData = () => {
    setScanResult(null);
    setProcessResult(null);
    ToastService.info('Demo data cleared');
  };

  // Demo data for table - more rows to test scrolling
  const tableData = scanResult?.data ? [
    { id: 1, name: 'Layer 1', type: 'Rectangle', visible: true, x: 0, y: 0 },
    { id: 2, name: 'Layer 2', type: 'Text', visible: true, x: 100, y: 50 },
    { id: 3, name: 'Layer 3', type: 'Ellipse', visible: false, x: 200, y: 100 },
    { id: 4, name: 'Layer 4', type: 'Group', visible: true, x: 150, y: 75 },
    { id: 5, name: 'Layer 5', type: 'Rectangle', visible: true, x: 300, y: 150 },
    { id: 6, name: 'Layer 6', type: 'Text', visible: false, x: 50, y: 200 },
    { id: 7, name: 'Layer 7', type: 'Ellipse', visible: true, x: 250, y: 125 },
    { id: 8, name: 'Layer 8', type: 'Group', visible: true, x: 400, y: 225 },
    { id: 9, name: 'Layer 9', type: 'Rectangle', visible: false, x: 175, y: 300 },
    { id: 10, name: 'Layer 10', type: 'Text', visible: true, x: 325, y: 275 },
    { id: 11, name: 'Layer 11', type: 'Ellipse', visible: true, x: 125, y: 350 },
    { id: 12, name: 'Layer 12', type: 'Group', visible: false, x: 475, y: 400 }
  ] : [];

  const tableColumns = [
    { key: 'name', label: 'Name', width: '40%' },
    { key: 'type', label: 'Type', width: '25%' },
    { key: 'visible', label: 'Visible', width: '20%' },
    { key: 'x', label: 'X', width: '15%' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Action Buttons */}
      <Panel title="Actions">
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          <Button onClick={handleLoadDemoData}>
            Load Demo Data
          </Button>
          <Button onClick={handleCopyData} disabled={!processResult?.data}>
            Copy Demo Result
          </Button>
          <Button onClick={handleClearData} disabled={!scanResult && !processResult}>
            Clear Data
          </Button>
        </div>
      </Panel>

      {/* How To Use Panel (only visible when no scanResult) */}
      {!scanResult && <HowToUsePanel />}

      {/* Progress Manager Demo */}
      <ProgressManagerDemo />

      {/* Scan Results Panel */}
      <Panel
        title="Scan Results"
        subtitle={scanResult ? undefined : "Click 'Load Demo Data' to see this panel in action with sample data"}
        status={scanResult ? {
          label: scanResult.success ? 'Success' : 'Issues Found',
          type: scanResult.success ? 'success' : 'error'
        } : undefined}
      >
        {scanResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <NotificationBanner issues={scanResult.issues || []} />
            {scanResult.data && (
              <div>
                <div style={{ marginBottom: 12, fontSize: 13, color: colors.textSecondary }}>
                  Selection: {scanResult.data.selectionCount} objects from page "{scanResult.data.pageInfo?.name}"
                </div>
                <DataTable
                  data={tableData}
                  columns={tableColumns}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            padding: 20
          }}>
            Try 'Load Demo Data' to see components in action
          </div>
        )}
      </Panel>

      {/* Process Results Panel */}
      <Panel
        title="Process Results"
        subtitle="Processed demo data showing the JSON output format"
        status={processResult ? {
          label: processResult.success ? 'Ready' : 'Failed',
          type: processResult.success ? 'success' : 'error'
        } : undefined}
      >
        {processResult ? (
          <div style={{
            maxHeight: '200px',
            overflow: 'auto',
            background: colors.darkBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            padding: 12
          }}>
            <pre style={{
              background: 'transparent',
              color: colors.textColor,
              fontSize: 11,
              margin: 0,
              lineHeight: 1.4,
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              maxWidth: '100%'
            }}>
              {JSON.stringify(processResult, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{
            color: colors.textSecondary,
            fontSize: 14,
            textAlign: 'center',
            padding: 20
          }}>
            Load demo data to see JSON output here
          </div>
        )}
      </Panel>
    </div>
  );
}
