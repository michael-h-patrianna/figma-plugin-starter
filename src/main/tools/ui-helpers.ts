/**
 * UI Helpers - Reusable UI Management Tools
 *
 * Handles all UI-related operations:
 * - Resizing
 * - Message sending
 * - Error handling
 * - Progress updates
 */

import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@shared/constants';
import { clamp } from '@shared/utils';

export class UIHelpers {

  /**
   * Send message to UI thread
   */
  sendToUI(type: string, data?: any): void {
    try {
      const message = { type, data, timestamp: Date.now() };
      figma.ui.postMessage(message);
      console.log(`📤 Sent to UI:`, type, data ? `(${JSON.stringify(data).length} chars)` : '');
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
      code,
      timestamp: Date.now()
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
   * Handle ping request
   */
  async handlePing(data?: any): Promise<void> {
    console.log('🏓 Ping received:', data);
    this.sendToUI('PONG', {
      message: 'Plugin is alive',
      timestamp: Date.now(),
      echo: data
    });
  }

  /**
   * Handle UI resize requests safely
   */
  async handleResize(data: { width?: number; height?: number } = {}): Promise<void> {
    try {
      const width = typeof data.width === 'number'
        ? clamp(data.width, 200, 800)
        : DEFAULT_WIDTH;
      const height = typeof data.height === 'number'
        ? clamp(data.height, 150, 600)
        : DEFAULT_HEIGHT;

      figma.ui.resize(width, height);
      console.log(`📐 Resized UI to ${width}x${height}`);

      this.sendToUI('RESIZE_COMPLETE', { width, height });
    } catch (error) {
      console.error('❌ Resize failed:', error);
      this.sendError('Resize failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Show notification in Figma UI
   */
  showNotification(message: string, options?: NotificationOptions): void {
    try {
      figma.notify(message, options);
      console.log(`📢 Notification:`, message);
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
    }
  }
}
