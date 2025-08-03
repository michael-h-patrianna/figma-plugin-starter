# UI Helpers Documentation

This document provides comprehensive documentation for all UI thread helper tools, services, hooks, and utilities used in the Figma plugin's React/Preact interface.

## Architecture Overview

The UI thread operates in an iframe with the following characteristics:
- **Full DOM access** - Can manipulate HTML/CSS and use browser APIs
- **No Figma API access** - Cannot directly interact with Figma objects
- **Message-based Communication** - Communicates with main thread via `parent.postMessage()`
- **React/Preact Environment** - Uses modern React patterns with hooks and contexts

All UI helpers follow these patterns:
- Hook-based state management
- Context providers for global state
- Service classes for complex operations
- Automatic cleanup and memory management

## Services

### ProgressManagerService

Central service for managing progress operations with automatic UI updates.

#### Features
- Automatic progress modal display
- Operation tracking and cleanup
- Error handling and recovery
- Background operation support

#### Usage

```typescript
import { ProgressManagerService } from '@ui/services/progressManager';

// Start a progress operation
const operationId = await ProgressManagerService.start({
  title: 'Scanning Nodes',
  message: 'Analyzing document structure...',
  showProgress: true,
  cancellable: true
});

// The service automatically handles progress updates from main thread
// Operation completes automatically when main thread sends completion message
```

# UI Helpers - Practical Implementation Guide

This document shows **practical implementation patterns** for UI thread services and hooks, focusing on complete workflows with the main thread.

## Quick Reference

### Services
- **ProgressManagerService** - Manages progress operations with main thread
- **MessageBoxService** - User prompts and confirmations
- **ToastService** - Non-blocking notifications

### Hooks
- **useProgressManager()** - Handle progress operation lifecycle
- **usePluginMessages()** - Receive messages from main thread
- **useSettings()** - Persistent settings with auto-save

### Messaging
- **sendToMain()** - Send messages to main thread
- Message patterns require handlers on both sides

## Complete ProgressManager Implementation

### Basic Progress Operation

```tsx
// Complete component for main thread operation with progress
import React, { useState } from 'react';
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { sendToMain } from '@ui/messaging';
import { usePluginMessages } from '@ui/messaging';

function NodeScanner() {
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Handle progress completion/errors
  useProgressManager(
    (operationId) => {
      console.log('Operation completed:', operationId);
      setIsScanning(false);
    },
    (operationId, error) => {
      console.error('Operation failed:', error);
      setIsScanning(false);
    }
  );

  // Handle results from main thread
  usePluginMessages({
    'SCAN_COMPLETE': (data) => {
      setScanResults(data);
    }
  });

  const handleScan = async () => {
    setIsScanning(true);

    // Start progress operation
    const operationId = await ProgressManagerService.start({
      title: 'Scanning Document',
      message: 'Analyzing nodes...',
      showProgress: true,
      cancellable: false
    });

    // Send to main thread
    sendToMain('SCAN_NODES', {
      operationId,
      options: { types: ['FRAME', 'COMPONENT'] }
    });
  };

  return (
    <div>
      <button onClick={handleScan} disabled={isScanning}>
        {isScanning ? 'Scanning...' : 'Scan Document'}
      </button>
      {scanResults && (
        <div>Found {scanResults.summary.totalNodes} nodes</div>
      )}
    </div>
  );
}
```

**Required Main Thread Handler:**
```typescript
// Main thread must handle 'SCAN_NODES' and send progress updates
uiHelpers.setupMessageHandler({
  'SCAN_NODES': async (data) => {
    const { operationId, options } = data;

    // Send progress updates
    uiHelpers.sendProgress(50, 100, 'Processing...', operationId);

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });

    // Send results
    uiHelpers.sendToUI('SCAN_COMPLETE', { summary: { totalNodes: 42 } });
  }
});
```

### Cancelable Operation

```tsx
// Cancelable export operation
function ImageExporter() {
  const [isExporting, setIsExporting] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState(null);

  useProgressManager(
    (operationId) => {
      setIsExporting(false);
      setCurrentOperationId(null);
    },
    (operationId, error) => {
      setIsExporting(false);
      setCurrentOperationId(null);
    }
  );

  const handleExport = async () => {
    setIsExporting(true);

    const operationId = await ProgressManagerService.start({
      title: 'Exporting Images',
      message: 'Preparing export...',
      showProgress: true,
      cancellable: true  // Enable cancel button
    });

    setCurrentOperationId(operationId);

    sendToMain('EXPORT_SELECTION', { operationId });
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
        <button onClick={handleCancel}>Cancel</button>
      )}
    </div>
  );
}
```

**Required Main Thread Handlers:**
```typescript
// Main thread needs both operation and cancel handlers
const activeOperations = new Map();

uiHelpers.setupMessageHandler({
  'EXPORT_SELECTION': async (data) => {
    const { operationId } = data;
    const abortController = new AbortController();
    activeOperations.set(operationId, abortController);

    try {
      // Do export with abort signal
      await performExport(abortController.signal);
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

  'CANCEL_OPERATION': (data) => {
    const controller = activeOperations.get(data.operationId);
    if (controller) {
      controller.abort();
    }
  }
});
```

## Message Handling Patterns

### Simple Request-Response

```tsx
// UI: Send request and handle response
function SelectionViewer() {
  const [selection, setSelection] = useState(null);

  usePluginMessages({
    'SELECTION_RESULT': (data) => {
      setSelection(data);
    }
  });

  const getSelection = () => {
    sendToMain('GET_SELECTION');
  };

  return (
    <div>
      <button onClick={getSelection}>Get Selection</button>
      {selection && <div>Selected: {selection.count} items</div>}
    </div>
  );
}
```

**Required Main Handler:**
```typescript
uiHelpers.setupMessageHandler({
  'GET_SELECTION': () => {
    const selectionData = uiHelpers.getSelectionWithDescendants();
    uiHelpers.sendToUI('SELECTION_RESULT', {
      count: selectionData.selection.length,
      nodes: selectionData.selection.map(n => ({ id: n.id, name: n.name }))
    });
  }
});
```

### Error Handling

```tsx
// UI: Handle errors from main thread
function RiskyOperation() {
  const [error, setError] = useState(null);

  usePluginMessages({
    'ERROR': (data) => {
      setError(`${data.title}: ${data.message}`);
    },
    'OPERATION_SUCCESS': () => {
      setError(null);
    }
  });

  const performRiskyAction = () => {
    sendToMain('RISKY_ACTION', { someParam: 'value' });
  };

  return (
    <div>
      <button onClick={performRiskyAction}>Perform Action</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
```

**Required Main Handler:**
```typescript
uiHelpers.setupMessageHandler({
  'RISKY_ACTION': async (data) => {
    try {
      await performRiskyTask(data.someParam);
      uiHelpers.sendToUI('OPERATION_SUCCESS');
    } catch (error) {
      uiHelpers.sendError('Action Failed', error.message);
    }
  }
});
```

## Settings Management

### Persistent Settings

```tsx
// Settings panel with auto-save
import { useSettings } from '@ui/hooks/useSettings';

function SettingsPanel() {
  const [settings, updateSettings] = useSettings();

  return (
    <div>
      <select
        value={settings.theme}
        onChange={(e) => updateSettings({ theme: e.target.value })}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="number"
        value={settings.exportScale}
        onChange={(e) => updateSettings({ exportScale: Number(e.target.value) })}
      />

      <label>
        <input
          type="checkbox"
          checked={settings.autoSave}
          onChange={(e) => updateSettings({ autoSave: e.target.checked })}
        />
        Auto-save
      </label>
    </div>
  );
}
```

Settings automatically save to `figma.clientStorage` and are available immediately.

## User Interaction Services

### MessageBox (Prompts)

```tsx
// User confirmations and prompts
import { MessageBoxService } from '@ui/services/messageBox';

function DeleteComponent() {
  const handleDelete = async () => {
    const confirmed = await MessageBoxService.confirm(
      'Delete Component',
      'Are you sure you want to delete this component?'
    );

    if (confirmed) {
      sendToMain('DELETE_COMPONENT', { componentId: '123' });
    }
  };

  const handleRename = async () => {
    const newName = await MessageBoxService.prompt(
      'Rename Component',
      'Enter new name:',
      'Default Name'
    );

    if (newName) {
      sendToMain('RENAME_COMPONENT', { componentId: '123', name: newName });
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleRename}>Rename</button>
    </div>
  );
}
```

### Toast Notifications

```tsx
// Non-blocking status messages
import { ToastService } from '@ui/services/toast';

function FileOperations() {
  usePluginMessages({
    'EXPORT_COMPLETE': (data) => {
      ToastService.success(`Exported ${data.count} files successfully`);
    },
    'EXPORT_ERROR': (data) => {
      ToastService.error(`Export failed: ${data.error}`);
    },
    'EXPORT_WARNING': (data) => {
      ToastService.warning(`${data.skipped} files were skipped`);
    }
  });

  const handleExport = () => {
    ToastService.info('Starting export...');
    sendToMain('START_EXPORT');
  };

  return <button onClick={handleExport}>Export Files</button>;
}
```

## Required Patterns Summary

### For Progress Operations:
1. **UI**: `ProgressManagerService.start()` + `useProgressManager()` + `sendToMain()`
2. **Main**: Message handler + `uiHelpers.sendProgress()` + completion message

### For Cancelable Operations:
1. **UI**: Add cancel button + `sendToMain('CANCEL_OPERATION')`
2. **Main**: Track `AbortController` + handle cancel message

### For Any UI Action:
1. **UI**: `sendToMain('ACTION_NAME', data)`
2. **Main**: Handler in `uiHelpers.setupMessageHandler()`

### For Data Display:
1. **UI**: `usePluginMessages()` to receive data
2. **Main**: `uiHelpers.sendToUI()` to send data

### For User Interaction:
1. **Confirmations**: `MessageBoxService.confirm()`
2. **Status Updates**: `ToastService.success/error/warning()`
3. **Settings**: `useSettings()` hook

#### Usage

```typescript
import { MessageBoxService } from '@ui/services/messageBox';

// Show confirmation dialog
const confirmed = await MessageBoxService.confirm(
  'Delete Items',
  'Are you sure you want to delete the selected items?'
);

if (confirmed) {
  // Proceed with deletion
}

// Show information dialog
await MessageBoxService.info(
  'Export Complete',
  'All images have been exported successfully.'
);

// Show error dialog
await MessageBoxService.error(
  'Operation Failed',
  'Unable to connect to the server. Please try again.'
);
```

#### API Methods

**confirm(title, message)**
- Returns Promise<boolean>
- Shows confirmation dialog with OK/Cancel buttons

**info(title, message)**
- Returns Promise<void>
- Shows information dialog with OK button

**error(title, message)**
- Returns Promise<void>
- Shows error dialog with red styling

**prompt(title, message, defaultValue?)**
- Returns Promise<string | null>
- Shows input dialog for text entry

### ToastService

Service for non-blocking notifications and status messages.

#### Usage

```typescript
import { ToastService } from '@ui/services/toast';

// Success notification
ToastService.success('Export completed successfully');

// Error notification
ToastService.error('Failed to save settings');

// Warning notification
ToastService.warning('Some items were skipped');

// Info notification
ToastService.info('Processing in background...');

// Custom toast with options
ToastService.show({
  message: 'Custom message',
  type: 'success',
  duration: 5000,
  action: {
    label: 'Undo',
    handler: () => console.log('Undo clicked')
  }
});
```

#### API Methods

**success(message, options?)**
**error(message, options?)**
**warning(message, options?)**
**info(message, options?)**
- Quick methods for common toast types

**show(options)**
```typescript
interface ToastOptions {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}
```

**dismiss(toastId)**
- Manually dismiss specific toast

**clear()**
- Clear all active toasts

## Hooks

### useProgressManager

Hook for handling progress operations with automatic lifecycle management.

#### Usage

```typescript
import { useProgressManager } from '@ui/hooks/useProgressManager';

function MyComponent() {
  // Handle progress operations
  useProgressManager(
    (operationId) => {
      console.log('Operation completed:', operationId);
      // Handle completion
    },
    (operationId, error) => {
      console.error('Operation failed:', error);
      // Handle error
    }
  );

  const handleScan = async () => {
    const operationId = await ProgressManagerService.start({
      title: 'Scanning',
      message: 'Please wait...'
    });

    // Send request to main thread
    sendToMain('SCAN_NODES');
  };

  return <button onClick={handleScan}>Start Scan</button>;
}
```

#### Parameters

- **onComplete**: `(operationId: string) => void` - Called when operation succeeds
- **onError**: `(operationId: string, error: string) => void` - Called when operation fails

### useProgressFromMainThread

Lower-level hook for direct progress updates from main thread.

#### Usage

```typescript
import { useProgressFromMainThread } from '@ui/hooks/useProgressFromMainThread';

function ProgressDisplay() {
  const { progress, isActive, message } = useProgressFromMainThread();

  if (!isActive) return null;

  return (
    <div>
      <div>Progress: {progress.percentage}%</div>
      <div>{progress.message}</div>
      <div>{progress.current} / {progress.total}</div>
    </div>
  );
}
```

#### Returns

```typescript
interface ProgressState {
  progress: {
    current: number;
    total: number;
    percentage: number;
    message?: string;
    operationId?: string;
  };
  isActive: boolean;
  message?: string;
}
```

### useSettings

Hook for persistent settings management with automatic saving.

#### Usage

```typescript
import { useSettings } from '@ui/hooks/useSettings';

function SettingsPanel() {
  const [settings, updateSettings] = useSettings();

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
  };

  const handleScaleChange = (exportScale: number) => {
    updateSettings({ exportScale });
  };

  return (
    <div>
      <select value={settings.theme} onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="number"
        value={settings.exportScale}
        onChange={(e) => handleScaleChange(Number(e.target.value))}
      />
    </div>
  );
}
```

#### Features

- **Automatic Persistence**: Settings save to `figma.clientStorage`
- **Debounced Saves**: Prevents excessive save operations
- **Type Safety**: Full TypeScript support with `PluginSettings` interface
- **Default Values**: Provides sensible defaults for all settings

#### Settings Interface

```typescript
interface PluginSettings {
  theme: 'light' | 'dark';
  exportFormat: 'PNG' | 'JPG' | 'SVG';
  exportScale: number;
  showAdvanced: boolean;
  autoSave: boolean;
  debugMode: boolean;
}
```

### useAnimation

Hook for managing CSS-based animations with lifecycle control.

#### Usage

```typescript
import { useAnimation } from '@ui/hooks/useAnimation';

function AnimatedModal({ isOpen }: { isOpen: boolean }) {
  const { animationRef, triggerAnimation } = useAnimation();

  useEffect(() => {
    if (isOpen) {
      triggerAnimation('modal-enter');
    }
  }, [isOpen, triggerAnimation]);

  return (
    <div
      ref={animationRef}
      className={`modal ${isOpen ? 'open' : 'closed'}`}
    >
      Modal content
    </div>
  );
}
```

#### Returns

```typescript
interface AnimationControls {
  animationRef: RefObject<HTMLElement>;
  triggerAnimation: (className: string, duration?: number) => Promise<void>;
  isAnimating: boolean;
}
```

### useWindowResize

Hook for responsive window size handling.

#### Usage

```typescript
import { useWindowResize } from '@ui/hooks/useWindowResize';

function ResponsiveComponent() {
  const { width, height, isSmall, isMedium, isLarge } = useWindowResize();

  return (
    <div>
      <div>Window: {width} x {height}</div>
      {isSmall && <div>Small layout</div>}
      {isMedium && <div>Medium layout</div>}
      {isLarge && <div>Large layout</div>}
    </div>
  );
}
```

#### Returns

```typescript
interface WindowSize {
  width: number;
  height: number;
  isSmall: boolean;   // < 600px
  isMedium: boolean;  // 600-1200px
  isLarge: boolean;   // > 1200px
}
```

## Contexts

### ThemeContext

Provides centralized theme management with automatic CSS custom property updates.

#### Features

- Light/dark mode support
- CSS custom properties automatically applied to document
- Consistent color tokens across components
- Typography and spacing scales

#### Usage

```typescript
import { useTheme } from '@ui/contexts/ThemeContext';

function ThemedComponent() {
  const { colors, typography, spacing, toggleTheme, isDark } = useTheme();

  return (
    <div style={{
      backgroundColor: colors.background.primary,
      color: colors.text.primary,
      fontSize: typography.body.fontSize
    }}>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

#### Theme Structure

```typescript
interface Theme {
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
    accent: {
      primary: string;
      secondary: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    heading: { fontSize: string; lineHeight: string; fontWeight: string; };
    body: { fontSize: string; lineHeight: string; fontWeight: string; };
    caption: { fontSize: string; lineHeight: string; fontWeight: string; };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animationDuration: string;
}
```

### DebugContext

Provides debugging utilities and development tools.

#### Usage

```typescript
import { useDebug } from '@ui/contexts/DebugContext';

function ComponentWithDebug() {
  const { isDebugMode, log, logGroup, debugData } = useDebug();

  const handleAction = () => {
    log('Action performed', { timestamp: Date.now() });
  };

  if (isDebugMode) {
    logGroup('Component State', {
      props: { /* component props */ },
      state: { /* component state */ }
    });
  }

  return (
    <div>
      {isDebugMode && (
        <div className="debug-info">
          Debug mode enabled
        </div>
      )}
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}
```

## Messaging Utilities

### UI Messaging (messaging.ts)

Utilities for communication with the main thread.

#### sendToMain

Sends messages to main thread with proper formatting.

```typescript
import { sendToMain } from '@ui/messaging';

// Send simple message
sendToMain('GET_SELECTION');

// Send message with data
sendToMain('SCAN_NODES', {
  options: {
    types: ['FRAME'],
    includeHidden: false
  }
});
```

#### usePluginMessages

Hook for receiving messages from main thread.

```typescript
import { usePluginMessages } from '@ui/messaging';

function MessageHandler() {
  usePluginMessages({
    'SCAN_RESULT': (data) => {
      console.log('Received scan results:', data);
      // Handle scan results
    },
    'COLOR_SCAN_COMPLETE': (data) => {
      console.log('Color scan completed:', data);
      console.log(`Found ${data.totalColors} unique colors:`, data.colors);
      // Handle color scan results
    },
    'EXPORT_COMPLETE': (data) => {
      console.log('Export completed:', data);
      // Handle export completion
    },
    'ERROR': (data) => {
      console.error('Error from main thread:', data);
      // Handle errors
    }
  });

  return null; // This is a message handler component
}
```

## Component Examples

### Progress-Enabled Component

```typescript
import React from 'react';
import { ProgressManagerService } from '@ui/services/progressManager';
import { useProgressManager } from '@ui/hooks/useProgressManager';
import { sendToMain } from '@ui/messaging';

function NodeScanner() {
  useProgressManager(
    (operationId) => {
      console.log('Scan completed:', operationId);
    },
    (operationId, error) => {
      console.error('Scan failed:', error);
    }
  );

  const handleScan = async () => {
    const operationId = await ProgressManagerService.start({
      title: 'Scanning Nodes',
      message: 'Analyzing document structure...',
      showProgress: true,
      cancellable: true
    });

    sendToMain('SCAN_NODES', {
      options: {
        types: ['FRAME', 'COMPONENT'],
        includeHidden: false
      }
    });
  };

  const handleScanColors = () => {
    ProgressManagerService.start(
      {
        title: 'Scanning Colors',
        description: 'Analyzing selected nodes for colors...',
        cancellable: true
      },
      'SCAN_COLORS' // Message type sent to main thread
    );
  };

  return (
    <div>
      <button onClick={handleScan}>
        Scan Document
      </button>
      <button onClick={handleScanColors}>
        Scan Colors
      </button>
    </div>
    </button>
  );
}
```

### Settings-Enabled Component

```typescript
import React from 'react';
import { useSettings } from '@ui/hooks/useSettings';
import { useTheme } from '@ui/contexts/ThemeContext';

function SettingsPanel() {
  const [settings, updateSettings] = useSettings();
  const { colors } = useTheme();

  return (
    <div style={{ backgroundColor: colors.background.secondary }}>
      <h3>Export Settings</h3>

      <label>
        Format:
        <select
          value={settings.exportFormat}
          onChange={(e) => updateSettings({ exportFormat: e.target.value })}
        >
          <option value="PNG">PNG</option>
          <option value="JPG">JPG</option>
          <option value="SVG">SVG</option>
        </select>
      </label>

      <label>
        Scale:
        <input
          type="number"
          min="1"
          max="4"
          value={settings.exportScale}
          onChange={(e) => updateSettings({ exportScale: Number(e.target.value) })}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.autoSave}
          onChange={(e) => updateSettings({ autoSave: e.target.checked })}
        />
        Auto-save settings
      </label>
    </div>
  );
}
```

### Message-Handling Component

```typescript
import React, { useState } from 'react';
import { usePluginMessages } from '@ui/messaging';
import { sendToMain } from '@ui/messaging';
import { ToastService } from '@ui/services/toast';

function ExportPanel() {
  const [exportResults, setExportResults] = useState(null);

  usePluginMessages({
    'EXPORT_COMPLETE': (data) => {
      setExportResults(data);
      ToastService.success(`Exported ${data.summary.successful} images`);
    },
    'ERROR': (data) => {
      ToastService.error(data.message);
    }
  });

  const handleExport = () => {
    sendToMain('EXPORT_SELECTION', {
      options: {
        format: 'PNG',
        scale: 2
      }
    });
  };

  return (
    <div>
      <button onClick={handleExport}>Export Selection</button>

      {exportResults && (
        <div>
          <h4>Export Results</h4>
          <p>Successful: {exportResults.summary.successful}</p>
          <p>Failed: {exportResults.summary.failed}</p>
          <p>Total time: {exportResults.summary.totalTime}ms</p>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### Memory Management

- Always clean up event listeners in `useEffect` cleanup functions
- Use `useCallback` and `useMemo` for expensive computations
- Avoid creating objects in render functions

```typescript
// ❌ Creates new object on every render
<Component style={{ backgroundColor: 'red' }} />

// ✅ Stable reference
const styles = { backgroundColor: 'red' };
<Component style={styles} />
```

### Error Handling

- Use error boundaries for component-level error handling
- Display user-friendly error messages via ToastService
- Log detailed errors for debugging

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  ToastService.error('Operation failed. Please try again.');
}
```

### Performance

- Use `React.memo` for pure components
- Implement proper dependency arrays in hooks
- Avoid unnecessary re-renders with stable references

```typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

const handleClick = useCallback(() => {
  // Handle click
}, [dependency1, dependency2]);
```

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA attributes
- Ensure keyboard navigation support
- Maintain proper focus management

```typescript
<button
  aria-label="Export selected nodes"
  aria-describedby="export-help"
  onClick={handleExport}
>
  Export
</button>
<div id="export-help">Exports all selected nodes as PNG images</div>
```

## Related Documentation

- [Main Thread Helpers](./main-thread-helpers.md) - Main thread counterparts
- [Messaging Examples](./messaging-examples.md) - Communication patterns
- [Component Examples](./component-examples.md) - UI component usage
