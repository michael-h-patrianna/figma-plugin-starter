/**
 * Image Exporter - WASM-Safe Image Export Tools
 *
 * Provides safe image export using proven patterns from the backup file:
 * - Immediate byte array to base64 conversion
 * - No external object references held
 * - Timeout handling for export operations
 * - Multiple state export for components
 */

import { UIHelpers } from './ui-helpers';

export interface ExportOptions {
  format?: 'PNG' | 'JPG' | 'SVG';
  scale?: number;
  useAbsoluteBounds?: boolean;
  timeout?: number;
}

export interface ExportResult {
  nodeId: string;
  nodeName: string;
  imageUrl?: string;
  error?: string;
  format: string;
  scale: number;
  exportTime: number;
}

export interface BatchExportResult {
  results: ExportResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
  };
}

export class ImageExporter {
  private uiHelpers = new UIHelpers();
  private readonly DEFAULT_TIMEOUT = 3000;

  /**
   * Export current selection
   */
  async exportSelection(options: ExportOptions = {}): Promise<void> {
    try {
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        this.uiHelpers.sendError('No selection', 'Please select one or more nodes to export');
        return;
      }

      await this.exportNodes(selection, options);

    } catch (error) {
      console.error('❌ Export selection failed:', error);
      this.uiHelpers.sendError('Export failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Export specific node by ID
   */
  async exportNode(data: { nodeId: string; options?: ExportOptions }): Promise<void> {
    try {
      const { nodeId, options = {} } = data;

      const node = figma.getNodeById(nodeId);
      if (!node) {
        this.uiHelpers.sendError('Node not found', `Node with ID ${nodeId} not found`);
        return;
      }

      // Check if it's a scene node
      if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
        this.uiHelpers.sendError('Invalid node type', 'Cannot export document or page nodes');
        return;
      }

      await this.exportNodes([node as SceneNode], options);

    } catch (error) {
      console.error('❌ Export node failed:', error);
      this.uiHelpers.sendError('Export failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Export multiple nodes (batch export)
   */
  private async exportNodes(nodes: readonly SceneNode[], options: ExportOptions = {}): Promise<void> {
    const startTime = Date.now();
    const {
      format = 'PNG',
      scale = 1,
      useAbsoluteBounds = true,
      timeout = this.DEFAULT_TIMEOUT
    } = options;

    const results: ExportResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process nodes in parallel with progress updates
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      // Send progress update
      this.uiHelpers.sendProgress(i + 1, nodes.length, `Exporting ${node.name}...`);

      const exportStart = Date.now();
      let result: ExportResult;

      try {
        const imageUrl = await this.exportNodeSafely(node, { format, scale, useAbsoluteBounds, timeout });

        result = {
          nodeId: node.id,
          nodeName: node.name,
          imageUrl,
          format,
          scale,
          exportTime: Date.now() - exportStart
        };

        successCount++;

      } catch (error) {
        result = {
          nodeId: node.id,
          nodeName: node.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          format,
          scale,
          exportTime: Date.now() - exportStart
        };

        failCount++;
      }

      results.push(result);
    }

    // Send final result
    const batchResult: BatchExportResult = {
      results,
      summary: {
        total: nodes.length,
        successful: successCount,
        failed: failCount,
        totalTime: Date.now() - startTime
      }
    };

    this.uiHelpers.sendToUI('EXPORT_COMPLETE', batchResult);
    this.uiHelpers.showNotification(
      `Export complete: ${successCount}/${nodes.length} successful`,
      { timeout: 3000 }
    );
  }

  /**
   * Safe node export with timeout (based on working backup pattern)
   */
  private async exportNodeSafely(
    node: SceneNode,
    options: { format: string; scale: number; useAbsoluteBounds: boolean; timeout: number }
  ): Promise<string> {

    // Check if node supports export
    if (!('exportAsync' in node)) {
      throw new Error(`Node type does not support export`);
    }

    const exportNode = node as SceneNode & ExportMixin;
    const { format, scale, useAbsoluteBounds, timeout } = options;

    // Export with timeout (pattern from backup file)
    const bytes = await this.safeGetBytes(exportNode, format, scale, useAbsoluteBounds, timeout);

    if (!bytes) {
      throw new Error('Export failed - no bytes returned');
    }

    // Convert to base64 immediately (pattern from backup file)
    const base64 = this.bytesToBase64(bytes);
    const mimeType = format === 'PNG' ? 'image/png' : format === 'JPG' ? 'image/jpeg' : 'image/svg+xml';

    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Safe export with timeout (from backup file pattern)
   */
  private async safeGetBytes(
    node: SceneNode & ExportMixin,
    format: string,
    scale: number,
    useAbsoluteBounds: boolean,
    timeoutMs: number
  ): Promise<Uint8Array | null> {
    let settled = false;

    return new Promise<Uint8Array | null>((resolve) => {
      // Start export
      const exportPromise = node.exportAsync({
        format: format as 'PNG' | 'JPG' | 'SVG',
        constraint: { type: 'SCALE', value: scale },
        useAbsoluteBounds
      });

      exportPromise.then(bytes => {
        if (settled) return;
        settled = true;
        resolve(bytes);
      }).catch(err => {
        if (settled) return;
        console.log('exportAsync error:', err);
        settled = true;
        resolve(null);
      });

      // Timeout handler
      setTimeout(() => {
        if (settled) return;
        console.log('exportAsync timed out');
        settled = true;
        resolve(null);
      }, timeoutMs);
    });
  }

  /**
   * Convert bytes to base64 (from backup file)
   */
  private bytesToBase64(bytes: Uint8Array): string {
    try {
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      console.log('btoa failed, using alternative base64 encoding');
      // Fallback base64 encoding
      const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;
      while (i < bytes.length) {
        const byte1 = bytes[i++];
        const byte2 = i < bytes.length ? bytes[i++] : 0;
        const byte3 = i < bytes.length ? bytes[i++] : 0;

        const enc1 = byte1 >> 2;
        const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
        const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
        const enc4 = byte3 & 63;

        result += base64Chars[enc1] + base64Chars[enc2] +
          (i > bytes.length + 1 ? '=' : base64Chars[enc3]) +
          (i > bytes.length ? '=' : base64Chars[enc4]);
      }
      return result;
    }
  }

  /**
   * Export component in multiple states (based on backup file pattern)
   */
  async exportComponentStates(data: {
    nodeId: string;
    states: string[];
    options?: ExportOptions
  }): Promise<void> {
    try {
      const { nodeId, states, options = {} } = data;

      const node = figma.getNodeById(nodeId);
      if (!node || node.type !== 'INSTANCE') {
        this.uiHelpers.sendError('Invalid node', 'Node must be a component instance');
        return;
      }

      const instance = node as InstanceNode;
      const originalState = instance.componentProperties.State?.value;

      const stateResults: Record<string, string> = {};
      const errors: string[] = [];

      // Export each state
      for (const state of states) {
        try {
          // Set component state
          instance.setProperties({ State: state });
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait for Figma to update

          // Export current state
          const imageUrl = await this.exportNodeSafely(instance, {
            format: options.format || 'PNG',
            scale: options.scale || 1,
            useAbsoluteBounds: options.useAbsoluteBounds !== false,
            timeout: options.timeout || this.DEFAULT_TIMEOUT
          });

          stateResults[state] = imageUrl;

        } catch (error) {
          errors.push(`Failed to export state '${state}': ${error}`);
        }
      }

      // Restore original state
      if (originalState) {
        instance.setProperties({ State: originalState });
      }

      this.uiHelpers.sendToUI('COMPONENT_STATES_EXPORT_COMPLETE', {
        nodeId,
        states: stateResults,
        errors,
        originalState
      });

    } catch (error) {
      console.error('❌ Component states export failed:', error);
      this.uiHelpers.sendError('Component export failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
