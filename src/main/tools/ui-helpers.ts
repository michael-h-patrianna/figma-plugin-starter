/**
 * UI Helpers - Reusable UI Management Tools
 *
 * Handles all UI-related operations:
 * - Resizing
 * - Message sending
 * - Error handling
 * - Progress updates
 */

import { isDebugMode } from '@main/debug';
import { analyzeSelection, getAllDescendants, getNodesWithHierarchy } from '@shared/selectionUtils';

export class UIHelpers {

  /**
   * Set up message handler with type safety and error handling
   */
  setupMessageHandler(handlers: Record<string, (data: any) => void | Promise<void>>): void {
    figma.ui.onmessage = async (msg) => {
      try {
        // Extract message type and data safely
        const { type, ...data } = msg.pluginMessage || msg;

        if (isDebugMode) {
          console.log(`📥 Received from UI:`, type, data ? `(${JSON.stringify(data).length} chars)` : '');
        }

        // Find and execute handler
        const handler = handlers[type];
        if (handler) {
          await handler(data);
        } else {
          console.warn(`⚠️ No handler found for message type: ${type}`);
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
        this.sendError('Message Handler Error',
          error instanceof Error ? error.message : 'Unknown error');
      }
    };
  }

  /**
   * Send message to UI thread with backward compatibility
   */
  sendToUI(type: string, data?: any): void {
    try {
      // Maintain backward compatibility by using the old format
      const message = data ? { type, ...data } : { type };

      figma.ui.postMessage(message);
      if (isDebugMode) {
        console.log(`📤 Sent to UI:`, type, data ? `(${JSON.stringify(data).length} chars)` : '');
      }
    } catch (error) {
      console.error('❌ Failed to send message to UI:', error);
    }
  }

  /**
   * Send error message to UI using WASM-safe shared utility
   */
  sendError(title: string, message: string, code?: string): void {
    // For backward compatibility, we'll send it in the old format via sendToUI
    // rather than using sharedSendError which has a different format
    this.sendToUI('ERROR', {
      title,
      message,
      code
    });
  }

  /**
   * Send progress update to UI using WASM-safe shared utility
   */
  sendProgress(current: number, total: number, message?: string, operationId?: string): void {
    // For backward compatibility, we'll send it in the old format via sendToUI
    // rather than using sharedSendProgress which has a different format
    this.sendToUI('PROGRESS', {
      current,
      total,
      percentage: Math.round((current / total) * 100),
      message,
      operationId
    });
  }


  /**
   * Show notification in Figma UI
   */
  showNotification(message: string, options?: NotificationOptions): void {
    try {
      figma.notify(message, options);
      if (isDebugMode) {
        console.log(`📢 Notification:`, message);
      }
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }

  /**
   * Get current selection with analysis
   */
  getSelection(): readonly SceneNode[] {
    return figma.currentPage.selection;
  }

  /**
   * Get current selection with all descendants
   */
  getSelectionWithDescendants(): {
    selection: readonly SceneNode[],
    allNodes: SceneNode[],
    hierarchicalNodes: ReturnType<typeof getNodesWithHierarchy>,
    analysis: ReturnType<typeof analyzeSelection>
  } {
    const selection = figma.currentPage.selection;
    const allNodes = getAllDescendants(selection);
    const hierarchicalNodes = getNodesWithHierarchy(selection);
    const analysis = analyzeSelection(selection);

    return { selection, allNodes, hierarchicalNodes, analysis };
  }

  /**
   * Set the current selection
   */
  setSelection(nodes: SceneNode[]): void {
    figma.currentPage.selection = nodes;
  }
}
