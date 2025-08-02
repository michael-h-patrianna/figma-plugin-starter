/**
 * Progress Manager Component
 *
 * A single modal that displays all progress operations in a clean list,
 * similar to Windows File Explorer or macOS Finder progress windows.
 */

import { Button } from '@ui/components/base/Button';
import { Modal } from '@ui/components/base/Modal';
import { ProgressBar } from '@ui/components/base/ProgressBar';
import { useTheme } from '@ui/contexts/ThemeContext';
import { ProgressManagerService, progressManagerState, type ProgressOperation } from '@ui/services/progressManager';

/**
 * Individual progress operation row
 */
function ProgressOperationRow({ operation }: { operation: ProgressOperation }) {
  const { colors, typography } = useTheme();

  const getStatusColor = () => {
    if (operation.failed) return colors.error;
    if (operation.completed) return colors.success;
    return colors.textColor;
  };

  const getStatusIcon = () => {
    if (operation.failed) return '❌';
    if (operation.completed) return '✅';
    return '⏳';
  };

  const getDuration = () => {
    if (operation.endTime) {
      return `${operation.endTime - operation.startTime}ms`;
    }
    const elapsed = Date.now() - operation.startTime;
    return elapsed < 1000 ? '<1s' : `${Math.floor(elapsed / 1000)}s`;
  };

  return (
    <div className="progress-operation-row">
      {/* Header row with title and controls */}
      <div className="progress-operation-header">
        <div className="progress-operation-title">
          <span className="progress-operation-icon">{getStatusIcon()}</span>
          <span
            className="progress-operation-name"
            style={{ color: getStatusColor() }}
          >
            {operation.title}
          </span>
        </div>

        <div className="progress-operation-controls">
          {/* Duration */}
          <span className="progress-operation-duration">
            {getDuration()}
          </span>

          {/* Cancel button for active cancellable operations */}
          {operation.cancellable && !operation.completed && !operation.failed && (
            <Button
              variant="danger"
              size="small"
              onClick={() => ProgressManagerService.cancel(operation.operationId)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress bar for active operations */}
      {!operation.completed && !operation.failed && (
        <div className="progress-operation-progress">
          <ProgressBar
            progress={operation.progress}
            showPercentage={true}
            label={operation.description || ''}
          />
        </div>
      )}

      {/* Current/Total indicator */}
      {operation.total && operation.current !== undefined && (
        <div className="progress-operation-counter">
          {operation.current} of {operation.total} items
        </div>
      )}

      {/* Description or error */}
      {(operation.description || operation.error) && (
        <div
          className={`progress-operation-description ${operation.error ? 'error' : ''}`}
          style={{ color: operation.error ? colors.error : colors.textSecondary }}
        >
          {operation.error || operation.description}
        </div>
      )}
    </div>
  );
}

/**
 * Main Progress Manager Modal
 */
export function ProgressManager() {
  const { colors, typography } = useTheme();
  const state = progressManagerState.value;

  if (!state.isVisible) {
    return null;
  }

  const operations = Array.from(state.operations.values());
  const activeOperations = operations.filter(op => !op.completed && !op.failed);
  const completedOperations = operations.filter(op => op.completed || op.failed);

  const hasCompleted = completedOperations.length > 0;
  const hasActive = activeOperations.length > 0;

  return (
    <Modal
      isVisible={true}
      title="Progress Manager"
      onClose={() => ProgressManagerService.hide()}
      showCloseButton={!hasActive} // Only allow closing if no active operations
    >
      <div className="progress-manager-content">
        {/* Active Operations Section */}
        {hasActive && (
          <div className="progress-section active">
            <h3 className="progress-section-title">
              Active Operations ({activeOperations.length})
            </h3>
            <div className="progress-operations-list">
              {activeOperations.map(operation => (
                <ProgressOperationRow key={operation.id} operation={operation} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Operations Section */}
        {hasCompleted && (
          <div className="progress-section completed">
            <div className="progress-section-header">
              <h3 className="progress-section-title secondary">
                Completed ({completedOperations.length})
              </h3>
              <Button
                variant="secondary"
                size="small"
                onClick={() => ProgressManagerService.clearCompleted()}
              >
                Clear All
              </Button>
            </div>
            <div className="progress-operations-list completed">
              {completedOperations.map(operation => (
                <ProgressOperationRow key={operation.id} operation={operation} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasActive && !hasCompleted && (
          <div className="progress-manager-empty">
            <div className="progress-manager-empty-icon">⏳</div>
            <p className="progress-manager-empty-title">
              No operations in progress
            </p>
            <p className="progress-manager-empty-subtitle">
              Operations will appear here when started
            </p>
          </div>
        )}
      </div>

      <style>{`
        .progress-manager-content {
          max-height: 500px;
          overflow-y: auto;
        }

        .progress-section {
          margin-bottom: 24px;
        }

        .progress-section:last-child {
          margin-bottom: 0;
        }

        .progress-section-title {
          color: ${colors.textColor};
          font-size: ${typography.subheading}px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .progress-section-title.secondary {
          color: ${colors.textSecondary};
        }

        .progress-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .progress-operations-list {
          border: 1px solid ${colors.border};
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-operations-list.completed {
          opacity: 0.7;
        }

        .progress-operation-row {
          padding: 12px;
          border-bottom: 1px solid ${colors.border};
        }

        .progress-operation-row:last-child {
          border-bottom: none;
        }

        .progress-operation-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .progress-operation-title {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-operation-icon {
          font-size: 16px;
        }

        .progress-operation-name {
          font-weight: 500;
          font-size: ${typography.body}px;
        }

        .progress-operation-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-operation-duration {
          color: ${colors.textSecondary};
          font-size: ${typography.bodySmall}px;
        }

        .progress-operation-progress {
          margin-bottom: 8px;
        }

        .progress-operation-counter {
          color: ${colors.textSecondary};
          font-size: ${typography.bodySmall}px;
          margin-bottom: 4px;
        }

        .progress-operation-description {
          color: ${colors.textSecondary};
          font-size: ${typography.bodySmall}px;
        }

        .progress-operation-description.error {
          color: ${colors.error};
        }

        .progress-manager-empty {
          text-align: center;
          padding: 48px 24px;
          color: ${colors.textSecondary};
        }

        .progress-manager-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .progress-manager-empty-title {
          font-size: ${typography.body}px;
          margin: 0;
        }

        .progress-manager-empty-subtitle {
          font-size: ${typography.bodySmall}px;
          margin: 8px 0 0 0;
        }
      `}</style>
    </Modal>
  );
}
