/**
 * Hook for handling progress manager updates from main thread
 */

import { usePluginMessages } from '@ui/messaging';
import { ProgressManagerService } from '@ui/services/progressManager';

/**
 * Hook to handle progress messages from the main thread for the Progress Manager.
 * Automatically updates operations when messages arrive.
 *
 * @param onComplete - Optional callback when operation completes
 * @param onError - Optional callback when operation fails
 */
export function useProgressManager(
  onComplete?: (operationId: string) => void,
  onError?: (operationId: string, error: any) => void
) {
  usePluginMessages({
    PROGRESS: (data: any) => {
      const { operationId, current, total, message } = data;
      console.log('📈 Progress Manager received PROGRESS:', { operationId, current, total, message });

      if (operationId) {
        const progress = total > 0 ? Math.round((current / total) * 100) : 0;
        ProgressManagerService.update(operationId, progress, {
          description: message,
          current,
          total
        });
      }
    },

    OPERATION_COMPLETE: (data: any) => {
      const { operationId, ...completionData } = data;
      console.log('✅ Progress Manager received OPERATION_COMPLETE:', { operationId, completionData });

      if (operationId) {
        // Extract completion message if available
        const description = completionData.message ||
          completionData.description ||
          'Operation completed successfully';

        ProgressManagerService.complete(operationId, { description });
        onComplete?.(operationId);
      }
    },

    OPERATION_ERROR: (data: any) => {
      const { operationId, error } = data;
      console.log('❌ Progress Manager received OPERATION_ERROR:', { operationId, error });

      if (operationId) {
        ProgressManagerService.fail(operationId, error || 'Operation failed');
        onError?.(operationId, error);
      }
    },

    OPERATION_CANCELLED: (data: any) => {
      const { operationId } = data;
      console.log('🚫 Progress Manager received OPERATION_CANCELLED:', { operationId });

      if (operationId) {
        ProgressManagerService.fail(operationId, 'Operation was cancelled');
      }
    }
  });
}
