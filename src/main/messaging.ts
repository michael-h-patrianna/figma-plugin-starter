/**
 * Message Router - Clean Routing System
 *
 * Handles all incoming messages and routes them to appropriate handlers.
 * Provides message format normalization and error handling.
 */

import { ContentCreator } from './tools/content-creator';
import { ImageExporter } from './tools/image-exporter';
import { NodeScanner } from './tools/node-scanner';
import { UIHelpers } from './tools/ui-helpers';

export class MessageRouter {
  private uiHelpers = new UIHelpers();
  private nodeScanner = new NodeScanner();
  private imageExporter = new ImageExporter();
  private contentCreator = new ContentCreator();

  /**
   * Handle incoming message from UI
   */
  async handleMessage(msg: any): Promise<void> {
    try {
      console.log('📥 Received message:', msg);

      // Extract message safely
      const message = this.extractMessage(msg);
      if (!message) {
        console.warn('❌ Invalid message format, ignoring');
        return;
      }

      const { type, data } = message;

      // Route to appropriate handler
      await this.routeMessage(type, data);

    } catch (error) {
      console.error('❌ Message handling failed:', error);
      this.uiHelpers.sendError(
        'Message processing failed',
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Route message to appropriate handler
   */
  private async routeMessage(type: string, data?: any): Promise<void> {
    switch (type) {
      // UI Operations
      case 'PING':
        await this.uiHelpers.handlePing(data);
        break;

      case 'RESIZE':
        await this.uiHelpers.handleResize(data);
        break;

      // Node Operations
      case 'GET_SELECTION':
        await this.nodeScanner.getSelection();
        break;

      case 'SCAN_NODES':
        await this.nodeScanner.scanNodes(data);
        break;

      case 'ANALYZE_FRAMES':
        await this.nodeScanner.analyzeFrames(data);
        break;

      // Export Operations
      case 'EXPORT_SELECTION':
        await this.imageExporter.exportSelection(data);
        break;

      case 'EXPORT_NODE':
        await this.imageExporter.exportNode(data);
        break;

      case 'EXPORT_COMPONENT_STATES':
        await this.imageExporter.exportComponentStates(data);
        break;

      // Content Creation
      case 'CREATE_FRAME':
        await this.contentCreator.createFrame(data);
        break;

      case 'CREATE_SAMPLES':
        await this.contentCreator.createSamples(data);
        break;

      case 'CREATE_RECTANGLE':
        await this.contentCreator.createRectangle(data);
        break;

      case 'CREATE_ELLIPSE':
        await this.contentCreator.createEllipse(data);
        break;

      case 'CREATE_TEXT':
        await this.contentCreator.createText(data);
        break;

      default:
        console.warn(`❓ Unknown message type: ${type}`);
        this.uiHelpers.sendError(`Unknown operation: ${type}`, 'This operation is not supported');
    }
  }

  /**
   * Extract message from various Figma message formats safely
   */
  private extractMessage(msg: any): { type: string; data?: any } | null {
    try {
      // Handle direct format
      if (msg && typeof msg.type === 'string') {
        return { type: msg.type, data: msg.data };
      }

      // Handle wrapped format (from messaging-simple.ts)
      if (msg && msg.pluginMessage && typeof msg.pluginMessage.type === 'string') {
        return { type: msg.pluginMessage.type, data: msg.pluginMessage };
      }

      // Handle nested format
      if (msg && msg.data && msg.data.pluginMessage && typeof msg.data.pluginMessage.type === 'string') {
        return { type: msg.data.pluginMessage.type, data: msg.data.pluginMessage.data };
      }

      return null;
    } catch (error) {
      console.error('Failed to extract message:', error);
      return null;
    }
  }
}
