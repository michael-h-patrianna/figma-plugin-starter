import { showUI } from '@create-figma-plugin/utilities';
import { setDebugMode } from '@main/debug';
import { UIHelpers } from '@main/tools/ui-helpers';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@shared/constants';

const uiHelpers = new UIHelpers();

// Track cancellation requests
const cancelledOperations = new Set<string>();

// Utility to check if operation is cancelled
function isCancelled(operationId: string): boolean {
  return cancelledOperations.has(operationId);
}

// Utility to clean up completed operation
function cleanupOperation(operationId: string): void {
  cancelledOperations.delete(operationId);
}

// Demo operation handlers for progress modal testing
async function handleScanNodes(operationId: string, options: any) {
  console.log('🚀 Starting handleScanNodes with operationId:', operationId, 'options:', options);
  const { includeHidden = false, nodeTypes = [] } = options;

  try {
    // Find all nodes on the current page
    const allNodes = figma.currentPage.findAll((node) => {
      if (!includeHidden && !node.visible) return false;
      if (nodeTypes.length > 0 && !nodeTypes.includes(node.type)) return false;
      return true;
    });

    const total = allNodes.length;
    console.log(`📊 Found ${total} nodes to scan`);

    // Simulate processing with progress updates
    for (let i = 0; i < total; i++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        console.log('🚫 Operation cancelled:', operationId);
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      const node = allNodes[i];

      // Send progress update
      console.log(`📈 Sending progress: ${i + 1}/${total} for operationId: ${operationId}`);
      uiHelpers.sendProgress(i + 1, total, `Scanning ${node.name || node.type}...`, operationId);

      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('✅ Scan complete, sending completion messages');
    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('SCAN_COMPLETE', {
      operationId,
      scannedCount: total,
      nodeTypes: Array.from(new Set(allNodes.map(n => n.type)))
    });

  } catch (error) {
    console.error('❌ Error in handleScanNodes:', error);
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

async function handleExportComponents(operationId: string, options: any) {
  const { format = 'PNG', scale = 1, includeBackground = true } = options;

  try {
    const selection = uiHelpers.getSelection();
    const total = selection.length;

    if (total === 0) {
      throw new Error('No components selected for export');
    }

    for (let i = 0; i < total; i++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        console.log('🚫 Export operation cancelled:', operationId);
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      const node = selection[i];

      // Send progress update
      uiHelpers.sendProgress(i + 1, total, `Exporting ${node.name || 'Unnamed'}...`, operationId);

      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('EXPORT_COMPLETE', {
      operationId,
      exportedCount: total,
      format,
      scale
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Export failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

async function handleLongOperation(operationId: string, options: any) {
  const { duration = 5000, steps = 20 } = options;
  const stepDuration = duration / steps;

  try {
    for (let i = 0; i < steps; i++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        console.log('🚫 Long operation cancelled:', operationId);
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      // Send progress update
      uiHelpers.sendProgress(i + 1, steps, `Processing step ${i + 1} of ${steps}...`, operationId);

      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Send completion
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('LONG_OPERATION_COMPLETE', {
      operationId,
      duration,
      steps
    });

  } catch (error) {
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Long operation failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

// Generate random color in RGB format
function generateRandomColor(): RGB {
  return {
    r: Math.random(),
    g: Math.random(),
    b: Math.random()
  };
}

async function handleCreateColorGrid(operationId: string, options: any) {
  console.log('🎨 Starting handleCreateColorGrid with operationId:', operationId);

  try {
    // Send initial progress
    uiHelpers.sendProgress(0, 25, 'Creating parent frame with auto layout...', operationId);

    // Create parent frame
    const parentFrame = figma.createFrame();
    parentFrame.name = 'Color Grid 5x5';
    parentFrame.resize(250, 250); // 5x5 grid of 50x50 (including gaps)

    // Set up auto layout
    parentFrame.layoutMode = 'VERTICAL';
    parentFrame.primaryAxisSizingMode = 'FIXED';
    parentFrame.counterAxisSizingMode = 'FIXED';
    parentFrame.itemSpacing = 0;
    parentFrame.paddingLeft = 0;
    parentFrame.paddingRight = 0;
    parentFrame.paddingTop = 0;
    parentFrame.paddingBottom = 0;

    // Add to current page
    figma.currentPage.appendChild(parentFrame);
    uiHelpers.setSelection([parentFrame]);
    figma.viewport.scrollAndZoomIntoView([parentFrame]);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Create 5 rows
    for (let row = 0; row < 5; row++) {
      // Check for cancellation
      if (isCancelled(operationId)) {
        console.log('🚫 Color grid creation cancelled:', operationId);
        uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
        cleanupOperation(operationId);
        return;
      }

      // Create row frame
      const rowFrame = figma.createFrame();
      rowFrame.name = `Row ${row + 1}`;
      rowFrame.resize(250, 50);
      rowFrame.layoutMode = 'HORIZONTAL';
      rowFrame.primaryAxisSizingMode = 'FIXED';
      rowFrame.counterAxisSizingMode = 'FIXED';
      rowFrame.itemSpacing = 0;
      rowFrame.paddingLeft = 0;
      rowFrame.paddingRight = 0;
      rowFrame.paddingTop = 0;
      rowFrame.paddingBottom = 0;

      parentFrame.appendChild(rowFrame);

      // Create 5 rectangles in this row
      for (let col = 0; col < 5; col++) {
        const rectIndex = row * 5 + col + 1;

        // Check for cancellation
        if (isCancelled(operationId)) {
          console.log('🚫 Color grid creation cancelled:', operationId);
          uiHelpers.sendToUI('OPERATION_CANCELLED', { operationId });
          cleanupOperation(operationId);
          return;
        }

        // Send progress update
        uiHelpers.sendProgress(rectIndex, 25, `Creating rectangle ${rectIndex}/25...`, operationId);

        // Create rectangle
        const rect = figma.createRectangle();
        rect.name = `Color Rect ${rectIndex}`;
        rect.resize(50, 50);

        // Generate random fill color
        const fillColor = generateRandomColor();
        rect.fills = [{
          type: 'SOLID',
          color: fillColor
        }];

        // Generate random stroke color
        const strokeColor = generateRandomColor();
        rect.strokes = [{
          type: 'SOLID',
          color: strokeColor
        }];
        rect.strokeWeight = 1;

        // Add to row
        rowFrame.appendChild(rect);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Send completion
    console.log('✅ Color grid creation complete');
    uiHelpers.sendToUI('OPERATION_COMPLETE', { operationId });
    uiHelpers.sendToUI('COLOR_GRID_COMPLETE', {
      operationId,
      message: 'Created 5x5 color grid with random colors!',
      frameId: parentFrame.id,
      totalRectangles: 25
    });

  } catch (error) {
    console.error('❌ Error in handleCreateColorGrid:', error);
    uiHelpers.sendToUI('OPERATION_ERROR', {
      operationId,
      error: error instanceof Error ? error.message : 'Color grid creation failed'
    });
  } finally {
    cleanupOperation(operationId);
  }
}

export default function () {
  showUI({
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH,
    title: 'Figma Plugin'
  });

  // Setup message handling with the UIHelpers wrapper
  uiHelpers.setupMessageHandler({
    PING: () => {
      uiHelpers.sendToUI('PONG', { message: 'Hello from main thread!' });
    },

    GET_SELECTION: () => {
      const { selection, allNodes, hierarchicalNodes } = uiHelpers.getSelectionWithDescendants();
      uiHelpers.sendToUI('SELECTION_RESULT', {
        count: selection.length,
        totalWithChildren: allNodes.length,
        selectedNodes: selection.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type
        })),
        // Flat array of all nodes (legacy format)
        allNodes: allNodes.map((node: SceneNode) => ({
          id: node.id,
          name: node.name,
          type: node.type,
          parent: 'parent' in node ? node.parent?.name || 'Page' : 'Page'
        })),
        // Hierarchical tree structure with children
        hierarchicalNodes: hierarchicalNodes
      });
    },

    RESIZE: (data) => {
      figma.ui.resize(Math.floor(data.width) || DEFAULT_WIDTH, Math.floor(data.height) || DEFAULT_HEIGHT);
    },

    SET_DEBUG_MODE: (data) => {
      setDebugMode(data.enabled);
    },

    SCAN_NODES: (data) => {
      console.log('📥 Main thread received SCAN_NODES message:', data);
      handleScanNodes(data.operationId, data);
    },

    EXPORT_COMPONENTS: (data) => {
      console.log('📥 Main thread received EXPORT_COMPONENTS message:', data);
      handleExportComponents(data.operationId, data);
    },

    LONG_OPERATION: (data) => {
      console.log('📥 Main thread received LONG_OPERATION message:', data);
      handleLongOperation(data.operationId, data);
    },

    CREATE_COLOR_GRID: (data) => {
      console.log('📥 Main thread received CREATE_COLOR_GRID message:', data);
      handleCreateColorGrid(data.operationId, data);
    },

    CANCEL_OPERATION: (data) => {
      console.log('🚫 Main thread received CANCEL_OPERATION message:', data);
      if (data.operationId) {
        cancelledOperations.add(data.operationId);
        console.log(`🚫 Added ${data.operationId} to cancelled operations`);
      }
    }
  });
}
