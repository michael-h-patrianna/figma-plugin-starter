# ProgressManager System - Complete Implementation Guide

This document shows the **complete implementation flow** for the ProgressManager system, from UI button click to main thread operation with progress updates and completion.

## Overview

The ProgressManager system handles long-running operations with these components:
- **UI Thread**: ProgressManagerService, useProgressManager hook
- **Main Thread**: Progress updates via UIHelpers
- **Communication**: Structured message flow with operation IDs

## Complete Flow Example: Node Scanner

### 1. UI Component Setup

```tsx
// Complete UI component with ProgressManager integration
import React, { useState } from 'react';
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { sendToMain } from '@ui/messaging';
import { usePluginMessages } from '@ui/messaging';

function NodeScanner() {
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Handle progress lifecycle
  useProgressManager(
    (operationId) => {
      console.log('Scan completed:', operationId);
      setIsScanning(false);
    },
    (operationId, error) => {
      console.error('Scan failed:', error);
      setIsScanning(false);
    }
  );

  // Handle scan results from main thread
  usePluginMessages({
    'SCAN_COMPLETE': (data) => {
      setScanResults(data);
      console.log(`Scan found ${data.summary.totalNodes} nodes`);
    }
  });

  const handleScan = async () => {
    setIsScanning(true);

    // Start progress operation
    const operationId = await ProgressManagerService.start({
      title: 'Scanning Document',
      message: 'Initializing scan...',
      showProgress: true,
      cancellable: true
    });

    // Send request to main thread with operation ID
    sendToMain('SCAN_NODES', {
      operationId,
      options: {
        types: ['FRAME', 'COMPONENT', 'TEXT'],
        includeHidden: false,
        maxDepth: 10
      }
    });
  };

  return (
    <div>
      <button onClick={handleScan} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Scan Document'}
      </button>

      {scanResults && (
        <div>
          <h4>Scan Results</h4>
          <p>Total nodes: {scanResults.summary.totalNodes}</p>
          <p>Processing time: {scanResults.summary.processingTime}ms</p>
          <p>Node types: {Object.keys(scanResults.summary.nodesByType).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Main Thread Handler

```typescript
// Main thread handler in src/main/index.ts
import { UIHelpers } from '@main/tools/ui-helpers';
import { NodeScanner } from '@main/tools/node-scanner';

const uiHelpers = new UIHelpers();
const nodeScanner = new NodeScanner();

uiHelpers.setupMessageHandler({
  'SCAN_NODES': async (data) => {
    const { operationId, options } = data;

    try {
      // NodeScanner will send progress updates and final results
      await nodeScanner.scanNodes(options, operationId);

      // Send operation completion for ProgressManager
      uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });

    } catch (error) {
      console.error('Scan failed:', error);
      uiHelpers.sendError('Scan Failed', error.message);
      uiHelpers.sendToUI('OPERATION_ERROR', {
        operationId,
        error: error.message
      });
    }
  }
});
```

### 3. NodeScanner Implementation with Progress

```typescript
// Enhanced NodeScanner with progress reporting
export class NodeScanner {
  private uiHelpers = new UIHelpers();

  async scanNodes(options = {}, operationId?: string) {
    try {
      const startTime = Date.now();
      const startNodes = this.getStartingNodes(options.startFrom || 'page');

      // Initial progress
      this.uiHelpers.sendProgress(0, 1, 'Starting scan...', operationId);

      const allNodes = [];
      const errors = [];

      // Traverse all nodes
      let processed = 0;
      const total = this.estimateNodeCount(startNodes);

      for (const startNode of startNodes) {
        await this.traverseNodeWithProgress(
          startNode,
          allNodes,
          errors,
          options,
          (current) => {
            processed = current;
            this.uiHelpers.sendProgress(
              processed,
              total,
              `Scanned ${processed} of ~${total} nodes...`,
              operationId
            );
          }
        );
      }

      // Final progress
      this.uiHelpers.sendProgress(total, total, 'Finalizing results...', operationId);

      const result = {
        summary: {
          totalNodes: allNodes.length,
          selectedNodes: 0,
          nodesByType: this.groupNodesByType(allNodes),
          processingTime: Date.now() - startTime
        },
        nodes: allNodes.slice(0, 100), // Limit for UI display
        errors
      };

      // Send final results
      this.uiHelpers.sendToUI('SCAN_COMPLETE', result);

    } catch (error) {
      console.error('❌ Node scan failed:', error);
      throw error;
    }
  }

  private async traverseNodeWithProgress(
    node: SceneNode,
    results: any[],
    errors: string[],
    options: any,
    progressCallback: (current: number) => void,
    currentCount = { value: 0 }
  ) {
    try {
      currentCount.value++;

      // Report progress every 10 nodes
      if (currentCount.value % 10 === 0) {
        progressCallback(currentCount.value);
        // Yield control to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Process current node
      const nodeData = this.extractNodeData(node);
      results.push(nodeData);

      // Traverse children
      if ('children' in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          await this.traverseNodeWithProgress(
            child,
            results,
            errors,
            options,
            progressCallback,
            currentCount
          );
        }
      }

    } catch (error) {
      errors.push(`Failed to process node ${node.id}: ${error}`);
    }
  }

  private estimateNodeCount(startNodes: readonly SceneNode[]): number {
    // Quick estimation for progress bar
    let estimate = 0;
    for (const node of startNodes) {
      estimate += this.countNodeRecursive(node, 0, 3); // Max depth 3 for estimation
    }
    return Math.max(estimate, 100); // Minimum estimate
  }

  private countNodeRecursive(node: SceneNode, currentDepth: number, maxDepth: number): number {
    if (currentDepth >= maxDepth) return 1;

    let count = 1;
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        count += this.countNodeRecursive(child, currentDepth + 1, maxDepth);
      }
    }
    return count;
  }
}
```

## Cancelable Operation Example: Image Export

### 1. UI Component with Cancellation

```tsx
function ImageExporter() {
  const [isExporting, setIsExporting] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState(null);
  const [exportResults, setExportResults] = useState(null);

  useProgressManager(
    (operationId) => {
      console.log('Export completed:', operationId);
      setIsExporting(false);
      setCurrentOperationId(null);
    },
    (operationId, error) => {
      console.error('Export failed:', error);
      setIsExporting(false);
      setCurrentOperationId(null);
    }
  );

  usePluginMessages({
    'EXPORT_COMPLETE': (data) => {
      setExportResults(data);
    },
    'EXPORT_CANCELLED': (data) => {
      console.log('Export cancelled:', data.operationId);
      setIsExporting(false);
      setCurrentOperationId(null);
    }
  });

  const handleExport = async () => {
    setIsExporting(true);

    const operationId = await ProgressManagerService.start({
      title: 'Exporting Images',
      message: 'Preparing export...',
      showProgress: true,
      cancellable: true
    });

    setCurrentOperationId(operationId);

    sendToMain('EXPORT_SELECTION', {
      operationId,
      options: {
        format: 'PNG',
        scale: 2,
        useAbsoluteBounds: true
      }
    });
  };

  const handleCancel = () => {
    if (currentOperationId) {
      sendToMain('CANCEL_OPERATION', { operationId: currentOperationId });
    }
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isExporting}>
        Export Selection
      </button>

      {isExporting && (
        <button onClick={handleCancel}>Cancel Export</button>
      )}

      {exportResults && (
        <div>
          <h4>Export Complete</h4>
          <p>Successful: {exportResults.summary.successful}</p>
          <p>Failed: {exportResults.summary.failed}</p>
        </div>
      )}
    </div>
  );
}
```

### 2. Main Thread with Cancellation Support

```typescript
// Main thread handlers with cancellation
const activeOperations = new Map<string, AbortController>();

uiHelpers.setupMessageHandler({
  'EXPORT_SELECTION': async (data) => {
    const { operationId, options } = data;

    // Create abort controller for cancellation
    const abortController = new AbortController();
    activeOperations.set(operationId, abortController);

    try {
      await imageExporter.exportSelection(options, abortController.signal, operationId);

      // Clean up
      activeOperations.delete(operationId);
      uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });

    } catch (error) {
      activeOperations.delete(operationId);

      if (error.name === 'AbortError') {
        uiHelpers.sendToUI('EXPORT_CANCELLED', { operationId });
      } else {
        uiHelpers.sendError('Export Failed', error.message);
        uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error: error.message });
      }
    }
  },

  'CANCEL_OPERATION': (data) => {
    const { operationId } = data;
    const abortController = activeOperations.get(operationId);

    if (abortController) {
      abortController.abort();
      activeOperations.delete(operationId);
      uiHelpers.sendToUI('EXPORT_CANCELLED', { operationId });
    }
  }
});
```

### 3. ImageExporter with Cancellation and Progress

```typescript
export class ImageExporter {
  private uiHelpers = new UIHelpers();

  async exportSelection(options = {}, abortSignal?: AbortSignal, operationId?: string) {
    const selection = this.uiHelpers.getSelection();

    if (selection.length === 0) {
      throw new Error('No nodes selected for export');
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
        const imageUrl = await this.exportNodeSafely(node, options, abortSignal);
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
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    this.uiHelpers.sendToUI('EXPORT_COMPLETE', {
      results,
      summary
    });
  }

  private async exportNodeSafely(node: SceneNode, options: any, abortSignal?: AbortSignal): Promise<string> {
    // Check cancellation before starting
    if (abortSignal?.aborted) {
      throw new DOMException('Export cancelled', 'AbortError');
    }

    if (!('exportAsync' in node)) {
      throw new Error(`Node type ${node.type} cannot be exported`);
    }

    const exportNode = node as SceneNode & ExportMixin;

    try {
      const bytes = await exportNode.exportAsync({
        format: options.format || 'PNG',
        constraint: { type: 'SCALE', value: options.scale || 1 },
        useAbsoluteBounds: options.useAbsoluteBounds !== false
      });

      // Check cancellation after export
      if (abortSignal?.aborted) {
        throw new DOMException('Export cancelled', 'AbortError');
      }

      const base64 = this.bytesToBase64(bytes);
      const mimeType = options.format === 'PNG' ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${base64}`;

    } catch (error) {
      if (abortSignal?.aborted) {
        throw new DOMException('Export cancelled', 'AbortError');
      }
      throw error;
    }
  }
}
```

## Message Flow Summary

### For Any Progress Operation:

1. **UI → Main**: Start operation
   ```typescript
   sendToMain('OPERATION_NAME', { operationId, options });
   ```

2. **Main → UI**: Progress updates (multiple)
   ```typescript
   uiHelpers.sendProgress(current, total, message, operationId);
   ```

3. **Main → UI**: Operation completion
   ```typescript
   uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
   // OR
   uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error });
   ```

4. **Main → UI**: Operation results (optional)
   ```typescript
   uiHelpers.sendToUI('OPERATION_RESULT', { data });
   ```

### For Cancelable Operations:

5. **UI → Main**: Cancel request
   ```typescript
   sendToMain('CANCEL_OPERATION', { operationId });
   ```

6. **Main → UI**: Cancel confirmation
   ```typescript
   uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
   ```

## Required Components for Each Operation

### UI Side:
- ✅ ProgressManagerService.start() call
- ✅ useProgressManager() hook
- ✅ sendToMain() for operation request
- ✅ usePluginMessages() for results
- ✅ sendToMain() for cancellation (if cancelable)

### Main Side:
- ✅ Message handler for operation
- ✅ Progress updates via uiHelpers.sendProgress()
- ✅ Completion message via sendToUI()
- ✅ Error handling with sendError()
- ✅ Cancel handler (if cancelable)
- ✅ AbortController tracking (if cancelable)
