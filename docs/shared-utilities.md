# Shared Utilities Documentation

This document provides comprehensive documentation for all shared utilities that work across both main thread and UI thread contexts in the Figma plugin.

## Architecture Overview

Shared utilities are designed to work in both execution contexts:
- **Main Thread** - Figma's sandbox environment (limited APIs, WASM constraints)
- **UI Thread** - Browser iframe environment (full DOM access, no Figma API)

All shared utilities follow these principles:
- **Context Agnostic** - Work in both main and UI threads
- **WASM Safe** - Use memory-safe patterns for main thread compatibility
- **Type Safe** - Full TypeScript support with comprehensive interfaces
- **Performance Optimized** - Efficient algorithms and minimal memory usage

## Core Utilities

### Selection Utilities (selectionUtils.ts)

Provides safe node traversal and selection analysis functionality.

#### getAllDescendants

Returns a flat array of all descendants from the given nodes.

```typescript
import { getAllDescendants } from '@shared/selectionUtils';

const selection = figma.currentPage.selection;
const allNodes = getAllDescendants(selection);

console.log(`Selected ${selection.length} nodes, ${allNodes.length} total with children`);
```

#### getNodesWithHierarchy

Returns a hierarchical tree structure preserving parent-child relationships.

```typescript
import { getNodesWithHierarchy, NodeWithChildren } from '@shared/selectionUtils';

const selection = figma.currentPage.selection;
const hierarchicalNodes = getNodesWithHierarchy(selection);

// Use for tree displays in UI
function renderNodeTree(nodes: NodeWithChildren[]) {
  return nodes.map(node => (
    <div key={node.id}>
      <span>{node.name} ({node.type})</span>
      {node.children.length > 0 && (
        <div style={{ marginLeft: 20 }}>
          {renderNodeTree(node.children)}
        </div>
      )}
    </div>
  ));
}
```

#### analyzeSelection

Provides comprehensive analysis of selected nodes.

```typescript
import { analyzeSelection } from '@shared/selectionUtils';

const selection = figma.currentPage.selection;
const analysis = analyzeSelection(selection);

console.log('Analysis:', {
  totalNodes: analysis.totalNodes,
  totalWithChildren: analysis.totalWithChildren,
  nodesByType: analysis.nodesByType,
  hasFrames: analysis.hasFrames,
  hasComponents: analysis.hasComponents,
  hasImages: analysis.hasImages,
  hasText: analysis.hasText,
  avgDepth: analysis.avgDepth,
  maxDepth: analysis.maxDepth
});
```

#### Data Structures

```typescript
interface NodeWithChildren {
  id: string;
  name: string;
  type: string;
  children: NodeWithChildren[];
}

interface SelectionAnalysis {
  totalNodes: number;
  totalWithChildren: number;
  nodesByType: Record<string, number>;
  hasFrames: boolean;
  hasComponents: boolean;
  hasImages: boolean;
  hasText: boolean;
  avgDepth: number;
  maxDepth: number;
}
```

### Async Utilities (asyncUtils.ts)

Provides WASM-safe asynchronous operation helpers.

#### sleep

WASM-safe alternative to setTimeout for delays.

```typescript
import { sleep } from '@shared/asyncUtils';

// Instead of setTimeout (which causes WASM corruption)
await sleep(1000); // Wait 1 second
console.log('Delay completed');
```

#### createDebouncer

Creates a debounced function with proper cleanup.

```typescript
import { createDebouncer } from '@shared/asyncUtils';

const debouncedSave = createDebouncer((data) => {
  saveSettings(data);
}, 500);

// Call multiple times, only executes once after 500ms
debouncedSave(settings1);
debouncedSave(settings2);
debouncedSave(settings3); // Only this call will execute

// Cleanup when component unmounts
useEffect(() => {
  return () => {
    debouncedSave.cancel();
  };
}, []);
```

#### createCancelablePromise

Creates promises that can be cancelled to prevent memory leaks.

```typescript
import { createCancelablePromise } from '@shared/asyncUtils';

const { promise, cancel } = createCancelablePromise(async (signal) => {
  const response = await fetch('/api/data', { signal });
  return response.json();
});

// Use the promise
promise
  .then(data => console.log('Data:', data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Operation was cancelled');
    }
  });

// Cancel if needed (e.g., component unmount)
useEffect(() => {
  return () => {
    cancel();
  };
}, []);
```

#### retryWithBackoff

Retry failed operations with exponential backoff.

```typescript
import { retryWithBackoff } from '@shared/asyncUtils';

const result = await retryWithBackoff(
  async () => {
    // Potentially failing operation
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Network error');
    return response.json();
  },
  {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2
  }
);
```

### Error Service (errorService.ts)

Centralized error handling with categorization and recovery suggestions.

#### Error Categories

```typescript
enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  SYSTEM = 'SYSTEM',
  USER = 'USER',
  PLUGIN = 'PLUGIN',
  UNKNOWN = 'UNKNOWN'
}
```

#### createPluginError

Creates standardized error objects with context.

```typescript
import { createPluginError, ErrorCategory } from '@shared/errorService';

const error = createPluginError(
  ErrorCategory.VALIDATION,
  'Invalid selection',
  'Please select at least one frame or component',
  'SELECT_FRAME'
);

throw error;
```

#### handleError

Processes errors with automatic categorization and user-friendly messages.

```typescript
import { handleError } from '@shared/errorService';

try {
  await riskyOperation();
} catch (error) {
  const processedError = handleError(error, 'Export operation');

  // Send to UI with user-friendly message
  uiHelpers.sendError(
    processedError.title,
    processedError.userMessage,
    processedError.code
  );
}
```

#### Error Interface

```typescript
interface PluginError extends Error {
  category: ErrorCategory;
  code: string;
  userMessage: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: number;
}
```

### Messaging Utilities (messaging.ts)

WASM-safe message serialization and pool management.

#### sendToUI

Safely sends data from main thread to UI thread.

```typescript
import { sendToUI } from '@shared/messaging';

// Instead of direct figma.ui.postMessage (which can cause WASM issues)
sendToUI('SCAN_COMPLETE', {
  nodes: nodeData,
  summary: scanSummary
});
```

#### Message Pool (messagePool.ts)

Object pooling to reduce garbage collection pressure.

```typescript
import { MessagePool } from '@shared/messagePool';

const pool = new MessagePool();

// Get pooled object instead of creating new ones
const message = pool.get();
message.type = 'PROGRESS';
message.current = 50;
message.total = 100;

// Send message
figma.ui.postMessage(message);

// Return to pool for reuse
pool.release(message);
```

### Validation Utilities (validation.ts)

Type-safe validation helpers for user inputs and API data.

#### validateNodeSelection

Validates node selection meets requirements.

```typescript
import { validateNodeSelection } from '@shared/validation';

const validation = validateNodeSelection(selection, {
  minCount: 1,
  maxCount: 10,
  allowedTypes: ['FRAME', 'COMPONENT'],
  requireExportable: true
});

if (!validation.isValid) {
  throw new Error(validation.message);
}
```

#### validateExportOptions

Validates export configuration.

```typescript
import { validateExportOptions } from '@shared/validation';

const options = {
  format: 'PNG',
  scale: 2,
  useAbsoluteBounds: true
};

const validation = validateExportOptions(options);
if (!validation.isValid) {
  console.error('Invalid export options:', validation.errors);
}
```

#### Property Validation (propValidation.ts)

Runtime validation for component props and API parameters.

```typescript
import { validateProps, PropValidators } from '@shared/propValidation';

const validators = {
  name: PropValidators.string.required(),
  count: PropValidators.number.min(1).max(100),
  type: PropValidators.enum(['FRAME', 'RECTANGLE', 'ELLIPSE']),
  options: PropValidators.object({
    visible: PropValidators.boolean,
    locked: PropValidators.boolean.optional()
  })
};

const result = validateProps(inputData, validators);
if (!result.isValid) {
  throw new Error(`Validation failed: ${result.errors.join(', ')}`);
}
```

### Export Utilities (exportUtils.ts)

Utilities for handling export operations and data formatting.

#### formatFileSize

Human-readable file size formatting.

```typescript
import { formatFileSize } from '@shared/exportUtils';

console.log(formatFileSize(1024));       // "1 KB"
console.log(formatFileSize(1048576));    // "1 MB"
console.log(formatFileSize(1073741824)); // "1 GB"
```

#### generateExportFilename

Generates consistent filenames for exports.

```typescript
import { generateExportFilename } from '@shared/exportUtils';

const filename = generateExportFilename({
  nodeName: 'My Frame',
  format: 'PNG',
  scale: 2,
  timestamp: true
});
// Result: "my-frame@2x.png" or "my-frame@2x-20231201-123456.png"
```

#### sanitizeForExport

Prepares data for safe export serialization.

```typescript
import { sanitizeForExport } from '@shared/exportUtils';

const cleanData = sanitizeForExport(nodeData, {
  removeCircularRefs: true,
  maxDepth: 10,
  allowedTypes: ['string', 'number', 'boolean', 'object']
});
```

### Worker Utilities (workerUtils.ts)

Utilities for background processing and web worker communication.

#### createWorkerTask

Spawns background tasks for heavy processing.

```typescript
import { createWorkerTask } from '@shared/workerUtils';

const result = await createWorkerTask('processImages', {
  images: imageData,
  options: processingOptions
});
```

#### isMainThread / isUIThread

Context detection utilities.

```typescript
import { isMainThread, isUIThread } from '@shared/workerUtils';

if (isMainThread()) {
  // Main thread specific code
  const selection = figma.currentPage.selection;
} else if (isUIThread()) {
  // UI thread specific code
  const element = document.getElementById('my-element');
}
```

## Constants (constants.ts)

Shared constants used across the plugin.

```typescript
export const PLUGIN_CONSTANTS = {
  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  EXPORT_TIMEOUT: 10000,
  MESSAGE_TIMEOUT: 3000,

  // Limits
  MAX_EXPORT_COUNT: 100,
  MAX_NODE_DEPTH: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Message Types
  MESSAGE_TYPES: {
    SCAN: 'SCAN',
    EXPORT: 'EXPORT',
    CREATE: 'CREATE',
    ERROR: 'ERROR',
    PROGRESS: 'PROGRESS'
  },

  // Default Settings
  DEFAULT_SETTINGS: {
    theme: 'light',
    exportFormat: 'PNG',
    exportScale: 1,
    showAdvanced: false
  }
};
```

## Debug Utilities

### Debug Service (debug.ts)

Conditional debugging with performance monitoring.

```typescript
import { debugLog, debugGroup, debugTime } from '@shared/debug';

// Conditional logging (only in debug mode)
debugLog('Operation started', { nodeCount: 50 });

// Grouped logging
debugGroup('Processing Nodes', () => {
  debugLog('Step 1: Scanning');
  debugLog('Step 2: Filtering');
  debugLog('Step 3: Processing');
});

// Performance timing
debugTime('export-operation');
await performExport();
debugTime('export-operation'); // Logs duration
```

### Debug Examples (debug-examples.ts)

Pre-built debugging scenarios for development.

```typescript
import { DebugExamples } from '@shared/debug-examples';

// Create test data
await DebugExamples.createTestFrames(5);

// Simulate progress operation
await DebugExamples.simulateProgress('test-operation', 2000);

// Test error scenarios
await DebugExamples.triggerError('validation');
```

## Animation Utilities (animationUtils.ts)

CSS animation helpers with theme integration.

```typescript
import { createAnimation, AnimationConfig } from '@shared/animationUtils';

const slideIn = createAnimation({
  name: 'slideIn',
  keyframes: {
    '0%': { transform: 'translateX(-100%)', opacity: 0 },
    '100%': { transform: 'translateX(0)', opacity: 1 }
  },
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

// Apply to element
element.style.animation = slideIn;
```

## Usage Patterns

### Cross-Thread Communication

```typescript
// Main Thread
import { sendToUI } from '@shared/messaging';
import { validateNodeSelection } from '@shared/validation';

const validation = validateNodeSelection(selection);
if (validation.isValid) {
  sendToUI('SELECTION_VALIDATED', { nodes: selection });
} else {
  sendToUI('VALIDATION_ERROR', { message: validation.message });
}

// UI Thread
import { usePluginMessages } from '@ui/messaging';

usePluginMessages({
  'SELECTION_VALIDATED': (data) => {
    console.log('Valid selection:', data.nodes);
  },
  'VALIDATION_ERROR': (data) => {
    showError(data.message);
  }
});
```

### Error Handling

```typescript
import { handleError, ErrorCategory } from '@shared/errorService';
import { debugLog } from '@shared/debug';

try {
  await riskyOperation();
} catch (error) {
  debugLog('Operation failed', { error: error.message });

  const processedError = handleError(error, 'Operation context');

  // Send user-friendly error to UI
  sendToUI('ERROR', {
    title: processedError.title,
    message: processedError.userMessage,
    code: processedError.code
  });
}
```

### Async Operations

```typescript
import { sleep, retryWithBackoff, createCancelablePromise } from '@shared/asyncUtils';

// WASM-safe delay
await sleep(1000);

// Retry with backoff
const result = await retryWithBackoff(async () => {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Network error');
  return response.json();
});

// Cancelable operation
const { promise, cancel } = createCancelablePromise(async (signal) => {
  // Long running operation
  return await processData(signal);
});
```

### Validation

```typescript
import { validateNodeSelection, validateExportOptions } from '@shared/validation';
import { createPluginError, ErrorCategory } from '@shared/errorService';

// Validate selection
const selectionValidation = validateNodeSelection(selection, {
  minCount: 1,
  allowedTypes: ['FRAME', 'COMPONENT']
});

if (!selectionValidation.isValid) {
  throw createPluginError(
    ErrorCategory.VALIDATION,
    'Invalid Selection',
    selectionValidation.message,
    'INVALID_SELECTION'
  );
}

// Validate options
const optionsValidation = validateExportOptions(exportOptions);
if (!optionsValidation.isValid) {
  throw createPluginError(
    ErrorCategory.VALIDATION,
    'Invalid Export Options',
    optionsValidation.errors.join(', '),
    'INVALID_OPTIONS'
  );
}
```

## Best Practices

### Memory Management

- Use object pooling for frequently created objects
- Implement proper cleanup in async operations
- Avoid circular references in exported data

### WASM Safety

- Never use setTimeout in main thread context
- Extract primitives immediately from Figma objects
- Use `sleep()` instead of `setTimeout()`

### Error Handling

- Always categorize errors for proper user messaging
- Include context information for debugging
- Provide actionable recovery suggestions

### Performance

- Use debouncing for frequent operations
- Implement cancellation for long-running tasks
- Monitor memory usage in debug mode

### Type Safety

- Use comprehensive interfaces for all data structures
- Validate inputs at API boundaries
- Provide default values for optional parameters

## Related Documentation

- [Main Thread Helpers](./main-thread-helpers.md) - Main thread specific tools
- [UI Helpers Documentation](./ui-helpers.md) - UI thread specific tools
- [Messaging Examples](./messaging-examples.md) - Communication patterns
