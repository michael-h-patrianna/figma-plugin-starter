import { useCallback, useEffect } from 'preact/hooks';

/**
 * Configuration for message handlers in the plugin communication hook.
 */
interface MessageHandlers {
  /** Handler for all message types from the main thread */
  onMessage: (type: string, data: any) => void;
}

/**
 * Custom hook for handling bidirectional communication between the Figma plugin UI and main thread.
 *
 * This hook provides a flexible message handling system that can be extended for different
 * plugin communication patterns. It manages message listeners and provides functions
 * to send commands back to the main thread.
 *
 * @param handlers - Object containing message handler function for all message types
 * @returns Object containing functions to send messages to the main thread
 *
 * @example
 * ```tsx
 * // Basic usage handling scan and process operations
 * const { sendMessage } = usePluginMessages({
 *   onMessage: (type, data) => {
 *     switch(type) {
 *       case 'SCAN_RESULT':
 *         console.log('Scan completed:', data);
 *         break;
 *       case 'PROCESS_RESULT':
 *         console.log('Process completed:', data);
 *         break;
 *       case 'SCAN_PROGRESS':
 *         setProgress(data); // data is the progress value for SCAN_PROGRESS
 *         break;
 *       default:
 *         console.log('Unknown message type:', type, data);
 *     }
 *   }
 * });
 *
 * // Extended usage with custom message types
 * const { sendMessage } = usePluginMessages({
 *   onMessage: (type, data) => {
 *     switch(type) {
 *       case 'SCAN_RESULT': handleScanResult(data); break;
 *       case 'PROCESS_RESULT': handleProcessResult(data); break;
 *       case 'SCAN_PROGRESS': setProgress(data); break;
 *       case 'CUSTOM_ACTION': handleCustomAction(data); break;
 *       case 'STATUS_UPDATE': updateStatus(data); break;
 *       default: console.log('Unhandled message:', type, data);
 *     }
 *   }
 * });
 *
 * // Send messages
 * sendMessage('SCAN'); // Trigger a scan operation
 * sendMessage('PROCESS', { action: 'export', format: 'json' }); // Process with data
 * sendMessage('CUSTOM_ACTION', { param: 'value' }); // Custom message
 * ```
 */
export function usePluginMessages(handlers: MessageHandlers) {
  const { onMessage } = handlers;

  useEffect(() => {
    /**
     * Handles incoming messages from the Figma plugin main thread.
     *
     * Processes different message types and routes them to the message handler.
     *
     * @param event - The message event from the main thread containing plugin message data
     */
    function handleMessage(event: MessageEvent) {
      if (event.data.pluginMessage) {
        const { type, data, progress } = event.data.pluginMessage;

        // Route all messages to the generic handler
        onMessage(type, type === 'SCAN_PROGRESS' ? progress : data);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);

  /**
   * Sends a message to the main thread with custom type and data.
   *
   * Allows for flexible communication patterns for any plugin operation.
   *
   * @param type - The message type identifier
   * @param data - Optional data payload to send with the message
   */
  const sendMessage = useCallback((type: string, data?: any) => {
    parent.postMessage({ pluginMessage: { type, data } }, '*');
  }, []);

  return { sendMessage };
}
