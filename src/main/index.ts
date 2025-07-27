import { showUI } from '@create-figma-plugin/utilities';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@shared/constants';

export default function () {
  showUI({
    height: DEFAULT_HEIGHT,
    width: DEFAULT_WIDTH,
    title: 'Figma Plugin'
  });

  figma.ui.onmessage = (msg) => {
    const { type, ...data } = msg.pluginMessage || msg;

    switch (type) {
      case 'PING':
        figma.ui.postMessage({ type: 'PONG', message: 'Hello from main thread!' });
        break;

      case 'GET_SELECTION':
        const selection = figma.currentPage.selection;
        figma.ui.postMessage({
          type: 'SELECTION_RESULT',
          count: selection.length,
          nodes: selection.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type
          }))
        });
        break;

      case 'RESIZE':
        figma.ui.resize(Math.floor(data.width) || DEFAULT_WIDTH, Math.floor(data.height) || DEFAULT_HEIGHT);
        break;

      default:
        console.log('Unknown message type:', type);
    }
  };
}
