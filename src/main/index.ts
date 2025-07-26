import { showUI } from '@create-figma-plugin/utilities';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@shared/constants';
import { ErrorHelpers, hasErrors } from './errors';
import { Issue, OperationResult } from './types';

export default function () {
  showUI({ height: DEFAULT_HEIGHT, width: DEFAULT_WIDTH });

  figma.ui.onmessage = async (msg) => {
    console.log('Main received message:', msg.type);

    if (msg.type === 'SCAN') {
      // Send initial progress
      figma.ui.postMessage({ type: 'SCAN_PROGRESS', progress: 10 });

      const result = await performScan();

      // Send completion progress
      figma.ui.postMessage({ type: 'SCAN_PROGRESS', progress: 100 });

      figma.ui.postMessage({ type: 'SCAN_RESULT', data: result });
    }
    else if (msg.type === 'PROCESS') {
      try {
        const result = await performProcess(msg.data);
        figma.ui.postMessage({ type: 'PROCESS_RESULT', data: result });
      } catch (error) {
        console.error('Process failed:', error);
        figma.ui.postMessage({
          type: 'PROCESS_RESULT',
          data: {
            success: false,
            issues: [ErrorHelpers.unknownError(error)]
          }
        });
      }
    }
    else if (msg.type === 'RESIZE') {
      figma.ui.resize(msg.width, msg.height);
    }
  };
}

async function performScan(): Promise<OperationResult> {
  // Example scan operation - customize this for your plugin
  const selection = figma.currentPage.selection;
  const issues: Issue[] = [];

  if (selection.length === 0) {
    issues.push(ErrorHelpers.noSelection());
  }

  // Example: Check for unsupported node types
  selection.forEach(node => {
    if (node.type === 'CONNECTOR') {
      issues.push(ErrorHelpers.unsupportedNodeType(node.type, node.id));
    }
  });

  const data = {
    selectionCount: selection.length,
    selectedTypes: selection.map(node => node.type),
    pageInfo: {
      name: figma.currentPage.name,
      nodeCount: figma.currentPage.children.length
    }
  };

  return {
    success: !hasErrors(issues),
    data,
    issues,
    message: `Scanned ${selection.length} selected objects`
  };
}

async function performProcess(inputData: any): Promise<OperationResult> {
  // Example process operation - customize this for your plugin
  const issues: Issue[] = [];

  // Simulate some processing
  await new Promise(resolve => setTimeout(resolve, 500));

  const processedData = {
    processed: true,
    timestamp: Date.now(),
    input: inputData
  };

  return {
    success: true,
    data: processedData,
    issues,
    message: 'Processing completed successfully'
  };
}
