# Complete Communication Flow Examples

This document shows **complete, practical communication flows** between UI thread and main thread. Every example includes both sides: the sender, the handler, and any response back.

## Table of Contents

- [Simple Request-Response](#simple-request-response)
- [Progress Manager Operations](#progress-manager-operations)
- [Cancelable Operations](#cancelable-operations)
- [Selection & Data Retrieval](#selection--data-retrieval)
- [Color Scanning Operations](#color-scanning-operations)
- [Creation Operations](#creation-operations)
- [Export Operations](#export-operations)
- [Error Handling Flows](#error-handling-flows)

## Simple Request-Response

### Get Selection Flow

**UI Thread → Main Thread:**
```tsx
// UI: Button click triggers selection request
import { sendToMain } from '@ui/messaging';

function SelectionButton() {
  const handleGetSelection = () => {
    sendToMain('GET_SELECTION');
  };

  return <button onClick={handleGetSelection}>Get Selection</button>;
}
```

**Main Thread Handler:**
```typescript
// Main: Handle selection request and send back data
import { UIHelpers } from '@main/tools/ui-helpers';

const uiHelpers = new UIHelpers();

uiHelpers.setupMessageHandler({
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
      allNodes: selectionData.allNodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      })),
      hierarchicalNodes: selectionData.hierarchicalNodes
    });
  }
});
```

**UI Thread Response Handler:**
```tsx
// UI: Handle selection results
import { usePluginMessages } from '@ui/messaging';

function SelectionDisplay() {
  const [selectionData, setSelectionData] = useState(null);

  usePluginMessages({
    'SELECTION_RESULT': (data) => {
      setSelectionData(data);
      console.log(`Selected ${data.count} items, ${data.totalWithChildren} total`);
    }
  });

  return (
    <div>
      {selectionData && (
        <div>
          <p>Selected: {selectionData.count} items</p>
          <p>Total with children: {selectionData.totalWithChildren}</p>
          <ul>
            {selectionData.selectedNodes.map(node => (
              <li key={node.id}>{node.name} ({node.type})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Progress Manager Operations

### Complete Node Scanner Flow

**UI Thread → Initiate with Progress:**
```tsx
// UI: Start operation with ProgressManager
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { sendToMain } from '@ui/messaging';

function NodeScanner() {
  const [scanResults, setScanResults] = useState(null);

  // Handle progress completion/error
  useProgressManager(
    (operationId) => {
      console.log('Scan completed:', operationId);
    },
    (operationId, error) => {
      console.error('Scan failed:', error);
    }
  );

  // Handle scan results
  usePluginMessages({
    'SCAN_COMPLETE': (data) => {
      setScanResults(data);
    }
  });

  const handleScan = async () => {
    // Start progress operation
    const operationId = await ProgressManagerService.start({
      title: 'Scanning Document',
      message: 'Analyzing nodes...',
      showProgress: true,
      cancellable: true
    });

    // Send scan request to main thread
    sendToMain('SCAN_NODES', {
      operationId,
      options: {
        types: ['FRAME', 'COMPONENT'],
        includeHidden: false,
        maxDepth: 10
      }
    });
  };

  return (
    <div>
      <button onClick={handleScan}>Scan Document</button>
      {scanResults && (
        <div>
          <h4>Scan Results</h4>
          <p>Found {scanResults.summary.totalNodes} nodes</p>
          <p>Processing time: {scanResults.summary.processingTime}ms</p>
        </div>
      )}
    </div>
  );
}
```

**Main Thread Handler with Progress Updates:**
```typescript
// Main: Handle scan with progress updates
import { NodeScanner } from '@main/tools/node-scanner';

const uiHelpers = new UIHelpers();
const nodeScanner = new NodeScanner();

uiHelpers.setupMessageHandler({
  'SCAN_NODES': async (data) => {
    const { operationId, options } = data;

    try {
      // Start scanning (NodeScanner sends progress updates internally)
      await nodeScanner.scanNodes(options);

      // Progress updates are sent automatically by NodeScanner via:
      // uiHelpers.sendProgress(current, total, message, operationId);

      // When scan completes, NodeScanner sends SCAN_RESULT
      // We also send operation completion for ProgressManager
      uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });

    } catch (error) {
      uiHelpers.sendError('Scan Failed', error.message);
      uiHelpers.sendToUI('OPERATION_ERROR', {
        operationId,
        error: error.message
      });
    }
  }
});
```

**NodeScanner Implementation (shows internal progress):**
```typescript
// Inside NodeScanner.scanNodes() method
async scanNodes(options = {}) {
  try {
    const startTime = Date.now();
    const allNodes = this.getStartingNodes(options.startFrom || 'page');
    const results = [];
    const total = allNodes.length;

    for (let i = 0; i < total; i++) {
      // Send progress update
      this.uiHelpers.sendProgress(
        i + 1,
        total,
        `Scanning ${allNodes[i].name || allNodes[i].type}...`
      );

      // Process node
      const nodeData = this.extractNodeData(allNodes[i]);
      results.push(nodeData);

      // Prevent blocking
      if (i % 10 === 0) {
        await sleep(1);
      }
    }

    // Send final results
    this.uiHelpers.sendToUI('SCAN_COMPLETE', {
      summary: {
        totalNodes: results.length,
        processingTime: Date.now() - startTime,
        nodesByType: this.groupNodesByType(results)
      },
      nodes: results
    });

  } catch (error) {
    this.uiHelpers.sendError('Scan failed', error.message);
    throw error;
  }
}
```

## Cancelable Operations

### Complete Export Flow with Cancellation

**UI Thread → Start Cancelable Export:**
```tsx
// UI: Export with cancellation support
function ImageExporter() {
  const [exportResults, setExportResults] = useState(null);
  const [currentOperationId, setCurrentOperationId] = useState(null);

  useProgressManager(
    (operationId) => {
      console.log('Export completed:', operationId);
      setCurrentOperationId(null);
    },
    (operationId, error) => {
      console.error('Export failed:', error);
      setCurrentOperationId(null);
    }
  );

  usePluginMessages({
    'EXPORT_COMPLETE': (data) => {
      setExportResults(data);
    },
    'EXPORT_CANCELLED': (data) => {
      console.log('Export was cancelled:', data.operationId);
      setCurrentOperationId(null);
    }
  });

  const handleExport = async () => {
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
      <button onClick={handleExport} disabled={!!currentOperationId}>
        Export Selection
      </button>
      {currentOperationId && (
        <button onClick={handleCancel}>Cancel Export</button>
      )}
      {exportResults && (
        <div>
          <h4>Export Results</h4>
          <p>Successful: {exportResults.summary.successful}</p>
          <p>Failed: {exportResults.summary.failed}</p>
        </div>
      )}
    </div>
  );
}
```

**Main Thread Handlers for Export and Cancellation:**
```typescript
// Main: Handle export and cancellation
import { ImageExporter } from '@main/tools/image-exporter';

const uiHelpers = new UIHelpers();
const imageExporter = new ImageExporter();
const activeOperations = new Map(); // Track active operations

uiHelpers.setupMessageHandler({
  'EXPORT_SELECTION': async (data) => {
    const { operationId, options } = data;

    // Track operation for cancellation
    const abortController = new AbortController();
    activeOperations.set(operationId, abortController);

    try {
      // Start export with abort signal
      await imageExporter.exportSelection(options, abortController.signal);

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
    const operation = activeOperations.get(operationId);

    if (operation) {
      operation.abort();
      activeOperations.delete(operationId);
      uiHelpers.sendToUI('EXPORT_CANCELLED', { operationId });
    }
  }
});
```

**ImageExporter Implementation with Cancellation:**
```typescript
// Inside ImageExporter.exportSelection() method
async exportSelection(options = {}, abortSignal) {
  const selection = this.uiHelpers.getSelection();
  const total = selection.length;
  const results = [];

  for (let i = 0; i < total; i++) {
    // Check for cancellation
    if (abortSignal?.aborted) {
      throw new Error('Operation cancelled');
    }

    const node = selection[i];

    // Send progress
    this.uiHelpers.sendProgress(
      i + 1,
      total,
      `Exporting ${node.name}...`
    );

    try {
      const imageUrl = await this.exportNodeSafely(node, options);
      results.push({
        nodeId: node.id,
        nodeName: node.name,
        imageUrl,
        success: true
      });
    } catch (error) {
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
```

## Color Scanning Operations

### Complete Color Scanning Flow

**UI Thread → Start Color Scan:**
```tsx
// UI: Color scanning with progress manager
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { sendToMain, usePluginMessages } from '@ui/messaging';

function ColorScanner() {
  const [scanResults, setScanResults] = useState(null);

  // Handle progress completion/error
  useProgressManager(
    (operationId) => {
      console.log('Color scan completed:', operationId);
    },
    (operationId, error) => {
      console.error('Color scan failed:', error);
    }
  );

  // Handle scan results
  usePluginMessages({
    'COLOR_SCAN_COMPLETE': (data) => {
      setScanResults(data);
      console.log(`Found ${data.totalColors} unique colors:`, data.colors);
    }
  });

  const handleScanColors = () => {
    ProgressManagerService.start(
      {
        title: 'Scanning Colors',
        description: 'Analyzing selected nodes for colors...',
        cancellable: true
      },
      'SCAN_COLORS'
    );
  };

  return (
    <div>
      <button onClick={handleScanColors}>Scan Colors</button>
      {scanResults && (
        <div>
          <h4>Color Scan Results</h4>
          <p>Found {scanResults.totalColors} unique colors</p>
          <p>Scanned {scanResults.scannedNodes} nodes</p>
          <div>
            Colors: {scanResults.colors.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Main Thread Handler with Color Extraction:**
```typescript
// Main: Handle color scanning with progress
import { UIHelpers } from '@main/tools/ui-helpers';

const uiHelpers = new UIHelpers();

// Utility functions for color extraction
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function extractColorsFromPaint(paint: Paint): string[] {
  const colors: string[] = [];
  
  if (paint.type === 'SOLID') {
    const solidPaint = paint as SolidPaint;
    if (solidPaint.visible !== false && solidPaint.color) {
      const hex = rgbToHex(solidPaint.color.r, solidPaint.color.g, solidPaint.color.b);
      colors.push(hex);
    }
  }
  
  return colors;
}

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

  // Traverse children
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractColorsFromNode(child, colors);
    }
  }
}

uiHelpers.setupMessageHandler({
  'SCAN_COLORS': async (data) => {
    const { operationId } = data;

    try {
      const selection = uiHelpers.getSelection();
      
      if (selection.length === 0) {
        throw new Error('No elements selected. Please select at least one element to scan for colors.');
      }

      // Send initial progress
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
});
```

**Example Output:**
```json
{
  "operationId": "scan_123",
  "message": "Found 8 unique colors in selected elements",
  "totalColors": 8,
  "colors": [
    "#FF0000",
    "#00FF00", 
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF"
  ],
  "scannedNodes": 3,
  "nodeDetails": [
    {"id": "123:1", "name": "Button", "type": "FRAME"},
    {"id": "123:2", "name": "Icon", "type": "COMPONENT"},
    {"id": "123:3", "name": "Background", "type": "RECTANGLE"}
  ]
}
```

**Key Features:**
- ✅ **Tree Traversal**: Scans selected nodes and all descendants
- ✅ **Progress Tracking**: Shows scanning progress per node
- ✅ **Cancellation**: Can be cancelled mid-operation
- ✅ **Deduplication**: Returns unique colors only
- ✅ **Both Fills & Strokes**: Extracts from both paint types
- ✅ **Hex Format**: Colors returned as uppercase hex values
- ✅ **Error Handling**: Validates selection and handles failures

## Creation Operations

### Complete Frame Creation Flow

**UI Thread → Create Frame:**
```tsx
// UI: Frame creation form
function FrameCreator() {
  const [frameOptions, setFrameOptions] = useState({
    name: 'New Frame',
    width: 300,
    height: 200,
    fillColor: '#FF6B6B'
  });

  usePluginMessages({
    'FRAME_CREATED': (data) => {
      console.log('Frame created:', data);
      // Maybe update UI state, show success message
    }
  });

  const handleCreate = () => {
    sendToMain('CREATE_FRAME', { options: frameOptions });
  };

  return (
    <div>
      <input
        value={frameOptions.name}
        onChange={(e) => setFrameOptions(prev => ({...prev, name: e.target.value}))}
        placeholder="Frame name"
      />
      <input
        type="number"
        value={frameOptions.width}
        onChange={(e) => setFrameOptions(prev => ({...prev, width: Number(e.target.value)}))}
      />
      <input
        type="color"
        value={frameOptions.fillColor}
        onChange={(e) => setFrameOptions(prev => ({...prev, fillColor: e.target.value}))}
      />
      <button onClick={handleCreate}>Create Frame</button>
    </div>
  );
}
```

**Main Thread Handler:**
```typescript
// Main: Handle frame creation
import { ContentCreator } from '@main/tools/content-creator';

const uiHelpers = new UIHelpers();
const contentCreator = new ContentCreator();

uiHelpers.setupMessageHandler({
  'CREATE_FRAME': async (data) => {
    const { options } = data;

    try {
      // ContentCreator.createFrame() automatically:
      // 1. Creates the frame
      // 2. Selects it
      // 3. Sends FRAME_CREATED message
      // 4. Shows notification
      await contentCreator.createFrame(options);

    } catch (error) {
      uiHelpers.sendError('Frame Creation Failed', error.message);
    }
  }
});
```

## Error Handling Flows

### Complete Error Flow

**UI Thread → Trigger Operation that May Fail:**
```tsx
// UI: Operation that might fail
function RiskyOperation() {
  const [error, setError] = useState(null);

  usePluginMessages({
    'ERROR': (data) => {
      setError(data);
      console.error('Main thread error:', data);
    },
    'OPERATION_SUCCESS': (data) => {
      setError(null);
      console.log('Operation succeeded:', data);
    }
  });

  const handleRiskyAction = () => {
    sendToMain('RISKY_OPERATION', {
      someParameter: 'value'
    });
  };

  return (
    <div>
      <button onClick={handleRiskyAction}>Perform Risky Operation</button>
      {error && (
        <div style={{ color: 'red' }}>
          <h4>{error.title}</h4>
          <p>{error.message}</p>
          {error.code && <small>Code: {error.code}</small>}
        </div>
      )}
    </div>
  );
}
```

**Main Thread Handler with Error Handling:**
```typescript
// Main: Handle operation with proper error handling
uiHelpers.setupMessageHandler({
  'RISKY_OPERATION': async (data) => {
    try {
      // Validate input
      if (!data.someParameter) {
        throw new Error('Missing required parameter');
      }

      // Perform risky operation
      const result = await performSomeRiskyTask(data.someParameter);

      // Send success
      uiHelpers.sendToUI('OPERATION_SUCCESS', {
        result,
        message: 'Operation completed successfully'
      });

    } catch (error) {
      // Send structured error
      uiHelpers.sendError(
        'Operation Failed',
        error.message,
        'RISKY_OP_FAILED'
      );
    }
  }
});
```

## Key Patterns

### 1. Every UI Action Has a Main Handler
```typescript
// UI sends message
sendToMain('ACTION_NAME', data);

// Main handles it
uiHelpers.setupMessageHandler({
  'ACTION_NAME': async (data) => {
    // Handle the action
    // Send response back
  }
});
```

### 2. Progress Operations Need 3 Messages
```typescript
// UI → Main: Start operation
sendToMain('START_OPERATION', { operationId, options });

// Main → UI: Progress updates (multiple)
uiHelpers.sendProgress(current, total, message, operationId);

// Main → UI: Completion
uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
// OR
uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error });
```

### 3. Cancelable Operations Need Cancel Handler
```typescript
// UI can send cancel
sendToMain('CANCEL_OPERATION', { operationId });

// Main must handle cancel
uiHelpers.setupMessageHandler({
  'CANCEL_OPERATION': (data) => {
    const operation = activeOperations.get(data.operationId);
    if (operation) {
      operation.abort();
    }
  }
});
```

### 4. Always Handle Responses in UI
```typescript
// If main sends data back, UI must handle it
usePluginMessages({
  'RESULT_MESSAGE': (data) => {
    // Handle the result
  },
  'ERROR': (data) => {
    // Handle errors
  }
});
```

  usePluginMessages({
    PONG: (data) => {
      setLastResponse(data);
      console.log('Received pong:', data.message);
    }
  });

  return (
    <div>
      <button onClick={handlePing}>Send Ping</button>
      {lastResponse && (
        <div>Response: {lastResponse.message}</div>
      )}
    </div>
  );
}
```

## Reading from Figma

### Get Current Selection

Get the currently selected nodes along with all their children, grandchildren, and descendants.

**UI Thread:**
```tsx
const handleGetSelection = () => {
  sendToMain('GET_SELECTION');
};

usePluginMessages({
  SELECTION_RESULT: (data) => {
    console.log(`Selected ${data.count} items, ${data.totalWithChildren} total with children`);
    console.log('Selected nodes:', data.selectedNodes);
    console.log('All nodes (flat):', data.allNodes);
    console.log('Hierarchical structure:', data.hierarchicalNodes);
    setSelectionData(data);
  }
});
```

**Main Thread:**
```typescript
// Import the utility functions for traversing children
import { getAllDescendants, getNodesWithHierarchy } from '@shared/selectionUtils';

case 'GET_SELECTION':
  const selection = figma.currentPage.selection;
  const allNodes = getAllDescendants(selection);
  const hierarchicalNodes = getNodesWithHierarchy(selection);

  figma.ui.postMessage({
    type: 'SELECTION_RESULT',
    count: selection.length,
    totalWithChildren: allNodes.length,
    selectedNodes: selection.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      x: 'x' in node ? node.x : undefined,
      y: 'y' in node ? node.y : undefined,
      width: 'width' in node ? node.width : undefined,
      height: 'height' in node ? node.height : undefined,
      visible: node.visible
    })),
    allNodes: allNodes.map((node: SceneNode) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      parent: 'parent' in node ? node.parent?.name || 'Page' : 'Page'
    })),
    hierarchicalNodes: hierarchicalNodes
  });
  break;
```

### Data Structures Explained

The selection results include two different data formats:

- **`allNodes`** (flat array): All descendants in a single list, useful for counting or iterating
- **`hierarchicalNodes`** (tree structure): Preserves parent-child relationships, ideal for UI trees

**Example hierarchical structure:**
```typescript
// If you select a Frame with nested components:
const hierarchicalNodes = [
  {
    id: "frame-1",
    name: "My Frame",
    type: "FRAME",
    children: [
      {
        id: "text-1",
        name: "Title",
        type: "TEXT",
        children: []
      },
      {
        id: "group-1",
        name: "Button Group",
        type: "GROUP",
        children: [
          {
            id: "rect-1",
            name: "Background",
            type: "RECTANGLE",
            children: []
          }
        ]
      }
    ]
  }
];
```

### Scan All Nodes with Progress

**UI Thread:**
```tsx
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';

function NodeScanner() {
  // Handle progress updates automatically
  useProgressManager(
    (operationId) => {
      console.log('Scan completed:', operationId);
    },
    (operationId, error) => {
      console.error('Scan failed:', error);
    }
  );

  // Listen for scan completion details
  usePluginMessages({
    SCAN_COMPLETE: (data) => {
      const { scannedCount, nodeTypes } = data;
      setResults(`Scanned ${scannedCount} nodes of types: ${nodeTypes.join(', ')}`);
    }
  });

  const handleScanNodes = () => {
    ProgressManagerService.start(
      {
        title: 'Scanning Nodes',
        description: 'Analyzing all nodes in the current page...',
        cancellable: true
      },
      'SCAN_NODES',
      {
        includeHidden: false,
        nodeTypes: ['FRAME', 'TEXT', 'RECTANGLE', 'ELLIPSE']
      }
    );
  };

  return (
    <button onClick={handleScanNodes}>
      Scan All Nodes
    </button>
  );
}
```

**Main Thread:**
```typescript
async function handleScanNodes(operationId: string, options: any) {
  const { includeHidden = false, nodeTypes = [] } = options;

  try {
    // Find all matching nodes
    const allNodes = figma.currentPage.findAll((node) => {
      if (!includeHidden && !node.visible) return false;
      if (nodeTypes.length > 0 && !nodeTypes.includes(node.type)) return false;
      return true;
    });

    const total = allNodes.length;

    // Process with progress updates
    for (let i = 0; i < total; i++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      const node = allNodes[i];

      // Send progress update
      uiHelpers.sendProgress(
        i + 1,
        total,
        `Scanning ${node.name || node.type}...`,
        operationId
      );

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('SCAN_COMPLETE', {
      operationId,
      scannedCount: total,
      nodeTypes: Array.from(new Set(allNodes.map(n => n.type)))
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Scan failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

case 'SCAN_NODES':
  handleScanNodes(data.operationId, data);
  break;
```

## Manipulating Figma

### Create Components with Progress

**UI Thread:**
```tsx
const handleCreateColorGrid = () => {
  ProgressManagerService.start(
    {
      title: 'Creating 5x5 Color Grid',
      description: 'Setting up frame with auto layout...',
      cancellable: true,
      total: 25 // Will create 25 rectangles
    },
    'CREATE_COLOR_GRID',
    {
      gridSize: 5,
      cellSize: 50,
      randomColors: true
    }
  );
};

usePluginMessages({
  COLOR_GRID_COMPLETE: (data) => {
    console.log(`Created grid with ${data.totalRectangles} rectangles`);
    setResult(`Grid created successfully! Frame ID: ${data.frameId}`);
  }
});
```

**Main Thread:**
```typescript
async function handleCreateColorGrid(operationId: string, options: any) {
  const { gridSize = 5, cellSize = 50, randomColors = true } = options;

  try {
    // Send initial progress
    uiHelpers.sendProgress(0, gridSize * gridSize, 'Creating parent frame...', operationId);

    // Create parent frame with auto layout
    const parentFrame = figma.createFrame();
    parentFrame.name = `Color Grid ${gridSize}x${gridSize}`;
    parentFrame.resize(gridSize * cellSize, gridSize * cellSize);

    parentFrame.layoutMode = 'VERTICAL';
    parentFrame.primaryAxisSizingMode = 'FIXED';
    parentFrame.counterAxisSizingMode = 'FIXED';
    parentFrame.itemSpacing = 0;

    // Add to page and select
    figma.currentPage.appendChild(parentFrame);
    figma.currentPage.selection = [parentFrame];
    figma.viewport.scrollAndZoomIntoView([parentFrame]);

    let rectCount = 0;

    // Create rows
    for (let row = 0; row < gridSize; row++) {
      const rowFrame = figma.createFrame();
      rowFrame.name = `Row ${row + 1}`;
      rowFrame.resize(gridSize * cellSize, cellSize);
      rowFrame.layoutMode = 'HORIZONTAL';
      rowFrame.itemSpacing = 0;

      parentFrame.appendChild(rowFrame);

      // Create rectangles in row
      for (let col = 0; col < gridSize; col++) {
        rectCount++;

        // Check for cancellation
        if (isCancelled(operationId)) {
          uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
          cleanupOperation(operationId);
          return;
        }

        // Send progress
        uiHelpers.sendProgress(
          rectCount,
          gridSize * gridSize,
          `Creating rectangle ${rectCount}/${gridSize * gridSize}...`,
          operationId
        );

        // Create rectangle
        const rect = figma.createRectangle();
        rect.name = `Color Rect ${rectCount}`;
        rect.resize(cellSize, cellSize);

        // Apply random colors if requested
        if (randomColors) {
          rect.fills = [{
            type: 'SOLID',
            color: {
              r: Math.random(),
              g: Math.random(),
              b: Math.random()
            }
          }];
        }

        rowFrame.appendChild(rect);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('COLOR_GRID_COMPLETE', {
      operationId,
      frameId: parentFrame.id,
      totalRectangles: rectCount,
      gridSize,
      message: `Created ${gridSize}x${gridSize} color grid!`
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Grid creation failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

case 'CREATE_COLOR_GRID':
  handleCreateColorGrid(data.operationId, data);
  break;
```

### Batch Operations

**UI Thread:**
```tsx
const handleBatchRename = () => {
  ProgressManagerService.start(
    {
      title: 'Batch Renaming',
      description: 'Renaming selected elements...',
      cancellable: true
    },
    'BATCH_RENAME',
    {
      prefix: 'Component_',
      suffix: '_v1',
      includeIndex: true
    }
  );
};
```

**Main Thread:**
```typescript
async function handleBatchRename(operationId: string, options: any) {
  const { prefix = '', suffix = '', includeIndex = false } = options;

  try {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      throw new Error('No elements selected');
    }

    const total = selection.length;

    for (let i = 0; i < total; i++) {
      if (isCancelled(operationId)) {
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      const node = selection[i];
      const originalName = node.name;

      let newName = prefix;
      if (includeIndex) {
        newName += `${i + 1}_`;
      }
      newName += originalName + suffix;

      node.name = newName;

      uiHelpers.sendProgress(
        i + 1,
        total,
        `Renamed "${originalName}" to "${newName}"`,
        operationId
      );

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('RENAME_COMPLETE', {
      operationId,
      renamedCount: total,
      message: `Successfully renamed ${total} elements`
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Rename failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}
```

## Progress Manager System

### Understanding the Progress Manager

The Progress Manager provides a unified interface for tracking long-running operations:

```tsx
// Single modal shows ALL operations
// ┌─────────────────────────────────┐
// │ Operations                    × │
// ├─────────────────────────────────┤
// │ 🔄 Active Operations            │
// │   Scanning Nodes... [████▒▒] 67%│
// │   Creating Grid... [██▒▒▒▒] 33% │
// │                                 │
// │ ✅ Completed Operations         │
// │   Export Complete (2.3s)        │
// │   Batch Rename (1.1s)           │
// └─────────────────────────────────┘
```

### Starting Operations

```tsx
import { ProgressManagerService } from '@ui/services/progressManager';

// Basic operation
const { operationId } = ProgressManagerService.start(
  {
    title: 'Processing Data',
    description: 'Starting operation...',
    cancellable: true,
    total: 100 // Optional: if you know the total steps
  },
  'PROCESS_DATA', // Message type sent to main thread
  {
    // Additional data for main thread
    option1: 'value1',
    option2: 'value2'
  }
);

// The returned operationId can be used for manual control
console.log('Started operation:', operationId);
```

### Handling Progress Updates

**UI Thread:**
```tsx
import { useProgressManager } from '@ui/hooks/useProgressManager';

function MyComponent() {
  useProgressManager(
    // Success callback
    (operationId: string) => {
      console.log(`Operation ${operationId} completed`);
      showToast('Operation completed!', 'success');
    },
    // Error callback
    (operationId: string, error: any) => {
      console.error(`Operation ${operationId} failed:`, error);
      showToast(`Operation failed: ${error}`, 'error');
    }
  );

  // Handle specific completion messages
  usePluginMessages({
    CUSTOM_OPERATION_COMPLETE: (data) => {
      console.log('Custom operation finished:', data);
      setCustomResults(data.results);
    }
  });
}
```

**Main Thread:**
```typescript
import { UIHelpers } from './tools/ui-helpers';

const uiHelpers = new UIHelpers();

async function handleCustomOperation(operationId: string, options: any) {
  try {
    const steps = options.steps || 10;

    for (let i = 0; i < steps; i++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      // Send progress update
      uiHelpers.sendProgress(
        i + 1,           // current step
        steps,           // total steps
        `Step ${i + 1} of ${steps}...`, // status message
        operationId      // operation ID
      );

      // Do actual work
      await performStep(i);
    }

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('CUSTOM_OPERATION_COMPLETE', {
      operationId,
      results: { /* operation results */ }
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Operation failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}
```

### Manual Progress Manager Control

```tsx
// Show the progress manager modal manually
ProgressManagerService.show();

// Hide the progress manager modal
ProgressManagerService.hide();

// Cancel a specific operation (if cancellable)
ProgressManagerService.cancel(operationId);

// Clear completed operations
ProgressManagerService.clearCompleted();
```

### Multiple Concurrent Operations

```tsx
const handleMultipleOperations = () => {
  // Start multiple operations simultaneously
  ProgressManagerService.start(
    { title: 'Scanning Nodes', cancellable: true },
    'SCAN_NODES',
    { includeHidden: false }
  );

  ProgressManagerService.start(
    { title: 'Exporting Components', cancellable: false },
    'EXPORT_COMPONENTS',
    { format: 'PNG', scale: 2 }
  );

  ProgressManagerService.start(
    { title: 'Processing Data', cancellable: true, total: 50 },
    'PROCESS_DATA',
    { mode: 'batch' }
  );

  // All operations appear in the same modal
  // Users can track progress and cancel individual operations
};
```

## Error Handling

### UI Thread Error Handling

```tsx
import { showToast } from '@ui/services/toast';
import { MessageBox } from '@ui/services/messageBox';

usePluginMessages({
  OPERATION_ERROR: (data) => {
    const { operationId, error } = data;

    // Show user-friendly error
    showToast(`Operation failed: ${error}`, 'error');

    // Or show detailed error dialog
    MessageBox.error(
      'Operation Failed',
      `The operation ${operationId} encountered an error:\n\n${error}`
    );
  },

  OPERATION_CANCELLED: (data) => {
    showToast('Operation was cancelled', 'warning');
  }
});
```

### Main Thread Error Handling

```typescript
async function handleRiskyOperation(operationId: string, options: any) {
  try {
    // Validate inputs
    if (!options.requiredParam) {
      throw new Error('Missing required parameter: requiredParam');
    }

    // Check Figma state
    if (figma.currentPage.selection.length === 0) {
      throw new Error('No elements selected. Please select at least one element.');
    }

    // Perform operation with error checking
    await performOperation(options);

    // Success
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });

  } catch (error) {
    console.error('Operation failed:', error);

    let userMessage = 'An unknown error occurred';

    if (error instanceof Error) {
      userMessage = error.message;
    }

    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: userMessage,
      details: error instanceof Error ? error.stack : undefined
    });
  } finally {
    cleanupOperation(operationId);
  }
}
```

## Advanced Patterns

### Data Streaming

For large datasets, stream data in chunks:

**Main Thread:**
```typescript
async function handleLargeDataExport(operationId: string, options: any) {
  try {
    const allNodes = figma.currentPage.findAll();
    const chunkSize = 50;
    const totalChunks = Math.ceil(allNodes.length / chunkSize);

    for (let chunk = 0; chunk < totalChunks; chunk++) {
      if (isCancelled(operationId)) return;

      const start = chunk * chunkSize;
      const end = Math.min(start + chunkSize, allNodes.length);
      const chunkData = allNodes.slice(start, end).map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }));

      // Send chunk data
      uiHelpers.sendToUI('DATA_CHUNK', {
        operationId,
        chunk: chunk + 1,
        totalChunks,
        data: chunkData
      });

      uiHelpers.sendProgress(chunk + 1, totalChunks, `Processing chunk ${chunk + 1}...`, operationId);
    }

    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error: error.message });
  }
}
```

**UI Thread:**
```tsx
const [accumulatedData, setAccumulatedData] = useState([]);

usePluginMessages({
  DATA_CHUNK: (data) => {
    const { chunk, totalChunks, data: chunkData } = data;

    setAccumulatedData(prev => [...prev, ...chunkData]);

    if (chunk === totalChunks) {
      console.log('All data received:', accumulatedData);
    }
  }
});
```

### Conditional Operations

```tsx
const handleSmartOperation = async () => {
  // First, check what's selected
  sendToMain('CHECK_SELECTION');
};

usePluginMessages({
  SELECTION_INFO: (data) => {
    if (data.hasFrames) {
      // Start frame-specific operation
      ProgressManagerService.start(
        { title: 'Processing Frames' },
        'PROCESS_FRAMES',
        { mode: 'advanced' }
      );
    } else if (data.hasText) {
      // Start text-specific operation
      ProgressManagerService.start(
        { title: 'Processing Text' },
        'PROCESS_TEXT',
        { mode: 'typography' }
      );
    } else {
      showToast('Please select frames or text elements', 'warning');
    }
  }
});
```

### Operation Chaining

```tsx
const handleComplexWorkflow = () => {
  // Start first operation
  const scanOperation = ProgressManagerService.start(
    { title: 'Scanning Elements' },
    'SCAN_ELEMENTS'
  );

  // Chain operations using completion handlers
  usePluginMessages({
    SCAN_ELEMENTS_COMPLETE: (data) => {
      if (data.foundElements > 0) {
        ProgressManagerService.start(
          { title: 'Processing Elements' },
          'PROCESS_ELEMENTS',
          { scanResults: data }
        );
      }
    },

    PROCESS_ELEMENTS_COMPLETE: (data) => {
      ProgressManagerService.start(
        { title: 'Generating Report' },
        'GENERATE_REPORT',
        { processResults: data }
      );
    }
  });
};
```

## Best Practices

### 1. Progress Granularity

```typescript
// ✅ Good: Meaningful progress steps
uiHelpers.sendProgress(nodeIndex + 1, totalNodes, `Processing ${node.name}...`, operationId);

// ❌ Bad: Too frequent updates
uiHelpers.sendProgress(byteIndex, totalBytes, 'Processing...', operationId);
```

### 2. Cancellation Support

```typescript
// ✅ Good: Check for cancellation in loops
for (let i = 0; i < items.length; i++) {
  if (isCancelled(operationId)) {
    uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
    cleanupOperation(operationId);
    return;
  }
  // Process item
}

// ❌ Bad: No cancellation support
for (let i = 0; i < items.length; i++) {
  // Process item (unstoppable)
}
```

### 3. Error Messages

```typescript
// ✅ Good: User-friendly errors
throw new Error('Please select at least one text element to continue.');

// ❌ Bad: Technical errors
throw new Error('TypeError: Cannot read property "characters" of undefined');
```

### 4. Resource Cleanup

```typescript
// ✅ Good: Always clean up
try {
  await performOperation();
} catch (error) {
  uiHelpers.sendToUI('OPERATION_ERROR', { operationId, error: error.message });
} finally {
  cleanupOperation(operationId); // Always cleanup
}
```

### 5. Message Naming

```typescript
// ✅ Good: Clear, descriptive names
'SCAN_NODES_COMPLETE'
'EXPORT_COMPONENTS_ERROR'
'BATCH_RENAME_PROGRESS'

// ❌ Bad: Vague names
'DONE'
'ERROR'
'UPDATE'
```

### 6. Data Validation

```typescript
// ✅ Good: Validate inputs
function handleOperation(operationId: string, options: any) {
  if (!operationId) {
    throw new Error('Operation ID is required');
  }

  if (!options.requiredField) {
    throw new Error('Missing required field: requiredField');
  }

  // Proceed with operation
}
```

### 7. Progress Descriptions

```typescript
// ✅ Good: Specific descriptions
uiHelpers.sendProgress(3, 10, 'Applying color styles to rectangles...', operationId);
uiHelpers.sendProgress(7, 10, 'Updating text content...', operationId);

// ❌ Bad: Generic descriptions
uiHelpers.sendProgress(3, 10, 'Processing...', operationId);
uiHelpers.sendProgress(7, 10, 'Processing...', operationId);
```

This messaging system provides a robust foundation for building complex Figma plugins with excellent user experience through progress tracking, error handling, and responsive feedback.
