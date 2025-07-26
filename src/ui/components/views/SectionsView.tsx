import { Button } from '@create-figma-plugin/ui';
import { OperationResult } from '@main/types';
import { COLORS } from '@shared/constants';
import { DataTable } from '../base/DataTable';
import { NotificationBanner } from '../base/NotificationBanner';
import { Panel } from '../base/Panel';
import { HowToUsePanel } from '../panels/HowToUsePanel';

interface SectionsViewProps {
  scanResult: OperationResult | null;
  processResult: OperationResult | null;
  onLoadDemoData: () => void;
  onCopyData: () => void;
}

export function SectionsView({
  scanResult,
  processResult,
  onLoadDemoData,
  onCopyData
}: SectionsViewProps) {
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
          <Button onClick={onLoadDemoData}>
            Load Demo Data
          </Button>
          <Button onClick={onCopyData} disabled={!processResult?.data}>
            Copy Demo Result
          </Button>
        </div>
      </Panel>

      {/* How To Use Panel (only visible when no scanResult) */}
      {!scanResult && <HowToUsePanel />}

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
                <div style={{ marginBottom: 12, fontSize: 13, color: COLORS.textSecondary }}>
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
            color: COLORS.textSecondary,
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
            background: COLORS.darkBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            padding: 12
          }}>
            <pre style={{
              background: 'transparent',
              color: COLORS.textColor,
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
            color: COLORS.textSecondary,
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
