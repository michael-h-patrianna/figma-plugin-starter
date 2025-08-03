# Main Thread Helpers - Practical Implementation Guide

This document shows **practical implementation patterns** for main thread tools that respond to UI requests and send data back.

## Quick Reference

### UIHelpers Class
- **setupMessageHandler()** - Handle messages from UI thread
- **sendToUI()** - Send responses back to UI thread
- **sendProgress()** - Send progress updates for long operations
- **sendError()** - Send error messages to UI

### Tool Classes
- **NodeScanner** - Scan and analyze Figma nodes with progress
- **ContentCreator** - Create frames, shapes, text with feedback
- **ImageExporter** - Export images with progress and cancellation

## Complete Message Handler Setup

### Basic Handler Pattern

```typescript
// Main thread entry point - src/main/index.ts
import { UIHelpers } from '@main/tools/ui-helpers';
import { NodeScanner } from '@main/tools/node-scanner';
import { ContentCreator } from '@main/tools/content-creator';
import { ImageExporter } from '@main/tools/image-exporter';

const uiHelpers = new UIHelpers();
const nodeScanner = new NodeScanner();
const contentCreator = new ContentCreator();
const imageExporter = new ImageExporter();

// Handle all UI messages
uiHelpers.setupMessageHandler({
  // Selection operations
  'GET_SELECTION': async () => {
    const selectionData = uiHelpers.getSelectionWithDescendants();
    uiHelpers.sendToUI('SELECTION_RESULT', {
      count: selectionData.selection.length,
      totalWithChildren: selectionData.allNodes.length,
      selectedNodes: selectionData.selection.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      })),
      hierarchicalNodes: selectionData.hierarchicalNodes
    });
  },

  // Scanning with progress
  'SCAN_NODES': async (data) => {
    const { operationId, options } = data;
    try {
      await nodeScanner.scanNodes(options, operationId);
      uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    } catch (error) {
      uiHelpers.sendError('Scan Failed', error.message);
      uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error: error.message });
    }
  },

  // Creation operations
  'CREATE_FRAME': async (data) => {
    await contentCreator.createFrame(data.options);
  },

  // Export with cancellation
  'EXPORT_SELECTION': async (data) => {
    const { operationId, options } = data;
    const abortController = new AbortController();
    activeOperations.set(operationId, abortController);

    try {
      await imageExporter.exportSelection(options, abortController.signal, operationId);
      uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    } catch (error) {
      if (error.name === 'AbortError') {
        uiHelpers.sendToUI('EXPORT_CANCELLED', { operationId });
      } else {
        uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error: error.message });
      }
    }
    activeOperations.delete(operationId);
  },

  // Cancellation support
  'CANCEL_OPERATION': (data) => {
    const controller = activeOperations.get(data.operationId);
    if (controller) {
      controller.abort();
    }
  }
});

// Track active operations for cancellation
const activeOperations = new Map<string, AbortController>();
```

## NodeScanner with Progress Updates

### Implementation with Progress Reporting

```typescript
// Enhanced NodeScanner that sends progress updates
export class NodeScanner {
  private uiHelpers = new UIHelpers();

  async scanNodes(options = {}, operationId?: string) {
    try {
      const startTime = Date.now();

      // Get starting nodes
      const startNodes = this.getStartingNodes(options.startFrom || 'page');
      const allNodes = [];
      const errors = [];

      // Estimate total for progress
      const estimatedTotal = this.estimateNodeCount(startNodes);
      let processed = 0;

      // Initial progress
      this.uiHelpers.sendProgress(0, estimatedTotal, 'Starting scan...', operationId);

      // Process all nodes with progress updates
      for (const startNode of startNodes) {
        await this.traverseWithProgress(
          startNode,
          allNodes,
          errors,
          options,
          (current) => {
            processed = current;
            this.uiHelpers.sendProgress(
              processed,
              estimatedTotal,
              `Scanned ${processed} of ~${estimatedTotal} nodes`,
              operationId
            );
          }
        );
      }

      // Final progress
      this.uiHelpers.sendProgress(
        allNodes.length,
        allNodes.length,
        'Finalizing results...',
        operationId
      );

      // Send results to UI
      const result = {
        summary: {
          totalNodes: allNodes.length,
          processingTime: Date.now() - startTime,
          nodesByType: this.groupNodesByType(allNodes)
        },
        nodes: allNodes.slice(0, 100), // Limit for UI
        errors
      };

      this.uiHelpers.sendToUI('SCAN_COMPLETE', result);

    } catch (error) {
      console.error('❌ Scan failed:', error);
      throw error;
    }
  }

  private async traverseWithProgress(
    node: SceneNode,
    results: any[],
    errors: string[],
    options: any,
    progressCallback: (count: number) => void,
    processedCount = { value: 0 }
  ) {
    try {
      processedCount.value++;

      // Report progress every 10 nodes
      if (processedCount.value % 10 === 0) {
        progressCallback(processedCount.value);
        // Yield to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Extract node data safely
      const nodeData = this.extractNodeData(node);
      results.push(nodeData);

      // Process children
      if ('children' in node && node.children) {
        for (const child of node.children) {
          await this.traverseWithProgress(
            child, results, errors, options, progressCallback, processedCount
          );
        }
      }

    } catch (error) {
      errors.push(`Failed to process ${node.id}: ${error}`);
    }
  }
}
```

## ImageExporter with Cancellation

### Export with Progress and Abort Support

```typescript
export class ImageExporter {
  private uiHelpers = new UIHelpers();

  async exportSelection(options = {}, abortSignal?: AbortSignal, operationId?: string) {
    const selection = this.uiHelpers.getSelection();

    if (selection.length === 0) {
      throw new Error('No nodes selected');
    }

    const results = [];
    const total = selection.length;

    for (let i = 0; i < total; i++) {
      // Check for cancellation
      if (abortSignal?.aborted) {
        throw new DOMException('Export cancelled', 'AbortError');
      }

      const node = selection[i];

      // Send progress update
      this.uiHelpers.sendProgress(
        i + 1,
        total,
        `Exporting ${node.name || node.type} (${i + 1}/${total})`,
        operationId
      );

      try {
        const imageUrl = await this.exportNode(node, options, abortSignal);
        results.push({
          nodeId: node.id,
          nodeName: node.name,
          imageUrl,
          success: true
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          throw error; // Re-throw cancellation
        }
        results.push({
          nodeId: node.id,
          nodeName: node.name,
          error: error.message,
          success: false
        });
      }
    }

    // Send final results
    this.uiHelpers.sendToUI('EXPORT_COMPLETE', {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  }

  private async exportNode(node: SceneNode, options: any, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError');
    }

    if (!('exportAsync' in node)) {
      throw new Error(`Cannot export ${node.type}`);
    }

    const exportNode = node as SceneNode & ExportMixin;

    const bytes = await exportNode.exportAsync({
      format: options.format || 'PNG',
      constraint: { type: 'SCALE', value: options.scale || 1 },
      useAbsoluteBounds: options.useAbsoluteBounds !== false
    });

    if (abortSignal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError');
    }

    const base64 = this.bytesToBase64(bytes);
    const mimeType = options.format === 'PNG' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }
}
```

## ContentCreator with UI Feedback

### Creation Tools that Notify UI

```typescript
export class ContentCreator {
  private uiHelpers = new UIHelpers();

  async createFrame(options = {}) {
    try {
      const {
        name = 'New Frame',
        x = 0,
        y = 0,
        width = 200,
        height = 200,
        fillColor
      } = options;

      // Create frame
      const frame = figma.createFrame();
      frame.name = name;
      frame.x = x;
      frame.y = y;
      frame.resize(width, height);

      // Set fill if provided
      if (fillColor) {
        const color = this.hexToRgb(fillColor);
        if (color) {
          frame.fills = [{ type: 'SOLID', color }];
        }
      }

      // Select and focus
      this.uiHelpers.setSelection([frame]);
      figma.viewport.scrollAndZoomIntoView([frame]);

      // Notify UI
      this.uiHelpers.sendToUI('FRAME_CREATED', {
        id: frame.id,
        name: frame.name,
        type: frame.type,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height
      });

      // Show notification
      this.uiHelpers.showNotification(`Created frame: ${name}`);

    } catch (error) {
      this.uiHelpers.sendError('Frame Creation Failed', error.message);
      throw error;
    }
  }

  async createSamples(options = {}) {
    const { count = 5, type = 'mixed', spacing = 250 } = options;
    const samples = [];

    for (let i = 0; i < count; i++) {
      // Send progress
      this.uiHelpers.sendProgress(i + 1, count, `Creating sample ${i + 1}...`);

      const element = this.createSampleElement(i, type, spacing);
      samples.push({
        id: element.id,
        name: element.name,
        type: element.type
      });
    }

    // Select all created
    const createdElements = samples.map(s => figma.getNodeById(s.id)).filter(Boolean);
    this.uiHelpers.setSelection(createdElements);

    // Notify UI
    this.uiHelpers.sendToUI('SAMPLES_CREATED', {
      samples,
      summary: `Created ${count} ${type} samples`
    });

    this.uiHelpers.showNotification(`Created ${count} samples`);
  }
}
```

## Error Handling Patterns

### Structured Error Responses

```typescript
// Example error handling in any tool
uiHelpers.setupMessageHandler({
  'RISKY_OPERATION': async (data) => {
    try {
      // Validate input
      if (!data.requiredParam) {
        throw new Error('Missing required parameter');
      }

      // Perform operation
      const result = await performOperation(data);

      // Send success
      uiHelpers.sendToUI('OPERATION_SUCCESS', { result });

    } catch (error) {
      console.error('Operation failed:', error);

      // Send structured error
      uiHelpers.sendError(
        'Operation Failed',
        error.message,
        'OP_FAILED'
      );
    }
  }
});
```

## Color Scanning Utilities

### RGB to Hex Conversion

```typescript
/**
 * Convert RGB color values to hex format
 * @param r - Red component (0-1)
 * @param g - Green component (0-1) 
 * @param b - Blue component (0-1)
 * @returns Uppercase hex color string (e.g., "#FF0000")
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
```

### Paint Color Extraction

```typescript
/**
 * Extract solid colors from Figma paint objects
 * @param paint - Figma Paint object (fill or stroke)
 * @returns Array of hex color strings
 */
function extractColorsFromPaint(paint: Paint): string[] {
  const colors: string[] = [];
  
  if (paint.type === 'SOLID') {
    const solidPaint = paint as SolidPaint;
    if (solidPaint.visible !== false && solidPaint.color) {
      const hex = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
      colors.push(hex);
    }
  }
  // Note: Only extracts solid colors
  // Other paint types (gradients, images) are ignored
  
  return colors;
}
```

### Node Tree Color Traversal

```typescript
/**
 * Recursively traverse node tree and extract all colors
 * @param node - Starting Figma node
 * @param colors - Set to collect unique colors
 */
function extractColorsFromNode(node: SceneNode, colors: Set<string>): void {
  // Extract fill colors
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      const nodeColors = extractColorsFromPaint(fill);
      nodeColors.forEach(color => colors.add(color));
    }
  }

  // Extract stroke colors
  if ('strokes' in node && Array.isArray(node.strokes)) {
    for (const stroke of node.strokes) {
      const nodeColors = extractColorsFromPaint(stroke);
      nodeColors.forEach(color => colors.add(color));
    }
  }

  // Traverse children recursively
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractColorsFromNode(child, colors);
    }
  }
}
```

### Complete Color Scanning Handler

```typescript
/**
 * Handle color scanning operation with progress tracking
 * @param operationId - Progress manager operation ID
 * @param options - Scanning options (currently unused)
 */
async function handleScanColors(operationId: string, options: any) {
  try {
    const selection = uiHelpers.getSelection();
    
    // Validate selection
    if (selection.length === 0) {
      throw new Error('No elements selected. Please select at least one element to scan for colors.');
    }

    // Initialize progress
    uiHelpers.sendProgress(0, selection.length, 'Starting color analysis...', operationId);

    const allColors = new Set<string>();
    let processedNodes = 0;

    // Process each selected node and descendants
    for (const selectedNode of selection) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      processedNodes++;
      
      // Update progress
      uiHelpers.sendProgress(
        processedNodes, 
        selection.length, 
        `Scanning colors in ${selectedNode.name || selectedNode.type}...`, 
        operationId
      );

      // Extract colors from node tree
      extractColorsFromNode(selectedNode, allColors);

      // Prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Prepare results
    const uniqueColors = Array.from(allColors).sort();

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('COLOR_SCAN_COMPLETE', {
      operationId,
      message: `Found ${uniqueColors.length} unique colors in selected elements`,
      totalColors: uniqueColors.length,
      colors: uniqueColors,
      scannedNodes: selection.length,
      nodeDetails: selection.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }))
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Color scan failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}
```

### Usage in Message Handler

```typescript
// Add to main thread message handler setup
uiHelpers.setupMessageHandler({
  'SCAN_COLORS': (data) => {
    handleScanColors(data.operationId, data);
  },
  // ... other handlers
});
```

## Required Implementation Checklist

### For Any UI Request:
- ✅ Handler in `uiHelpers.setupMessageHandler()`
- ✅ Response via `uiHelpers.sendToUI()`
- ✅ Error handling via `uiHelpers.sendError()`

### For Progress Operations:
- ✅ Accept `operationId` parameter
- ✅ Send progress via `uiHelpers.sendProgress()`
- ✅ Send completion via `OPERATION_COMPLETE`
- ✅ Send errors via `OPERATION_ERROR`

### For Cancelable Operations:
- ✅ Track `AbortController` in `activeOperations`
- ✅ Handle `CANCEL_OPERATION` message
- ✅ Check `abortSignal.aborted` in loops
- ✅ Send `OPERATION_CANCELLED` on abort

### For Data Operations:
- ✅ Extract primitives immediately from Figma objects
- ✅ Never store Figma object references
- ✅ Use `sleep()` instead of `setTimeout()`
- ✅ Send results via specific message types
