import { usePluginMessages } from '../messaging';
import { hideProgressModalByOperationId, updateProgressModalByOperationId } from '../services/progressModal';

/**
 * Hook to handle progress messages from the main thread.
 * Automatically updates the progress modal when messages arrive.
 *
 * @param onComplete - Optional callback when operation completes
 * @param onError - Optional callback when operation fails
 */
export function useProgressFromMainThread(
  onComplete?: (operationId: string) => void,
  onError?: (operationId: string, error: any) => void
) {
  usePluginMessages({
    PROGRESS: (data: any) => {
      const { operationId, current, total, message } = data;
      console.log('📈 UI received PROGRESS:', { operationId, current, total, message });
      if (operationId) {
        const progress = total > 0 ? Math.round((current / total) * 100) : 0;
        updateProgressModalByOperationId(operationId, progress, message ? { description: message } : undefined);
      }
    },
    OPERATION_COMPLETE: (data: any) => {
      const { operationId } = data;
      console.log('✅ UI received OPERATION_COMPLETE:', { operationId });
      if (operationId) {
        hideProgressModalByOperationId(operationId);
        onComplete?.(operationId);
      }
    },
    OPERATION_ERROR: (data: any) => {
      const { operationId, error } = data;
      console.log('❌ UI received OPERATION_ERROR:', { operationId, error });
      if (operationId) {
        hideProgressModalByOperationId(operationId);
        onError?.(operationId, error);
      }
    }
  });
}
