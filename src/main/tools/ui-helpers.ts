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

export class UIHelpers {

  /**
   * Send message to UI thread
   */
  sendToUI(type: string, data?: any): void {
    try {
      data = data || {};
      data.type = type;

      figma.ui.postMessage(data);
      if (isDebugMode) {
        console.log(`📤 Sent to UI:`, type, data ? `(${JSON.stringify(data).length} chars)` : '');
      }
    } catch (error) {
      console.error('❌ Failed to send message to UI:', error);
    }
  }

  /**
   * Send error message to UI
   */
  sendError(title: string, message: string, code?: string): void {
    this.sendToUI('ERROR', {
      title,
      message,
      code
    });
  }

  /**
   * Send progress update to UI
   */
  sendProgress(current: number, total: number, message?: string): void {
    this.sendToUI('PROGRESS', {
      current,
      total,
      percentage: Math.round((current / total) * 100),
      message
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
}
