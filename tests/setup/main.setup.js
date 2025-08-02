/**
 * Mock setup for Figma API in main thread tests
 */

// Create comprehensive Figma API mock
const createFigmaMock = () => ({
  // Current page and selection
  currentPage: {
    selection: [],
    findAll: jest.fn(() => []),
    findOne: jest.fn(() => null),
    children: [],
    name: 'Test Page',
    id: 'test-page-id',
  },

  // Document and file info
  root: {
    children: [],
    name: 'Test Document',
    id: 'test-doc-id',
  },

  // Node creation methods
  createFrame: jest.fn(() => ({
    id: 'mock-frame-id',
    name: 'Mock Frame',
    type: 'FRAME',
    children: [],
    resize: jest.fn(),
    appendChild: jest.fn(),
    remove: jest.fn(),
    fills: [],
    strokes: [],
  })),

  createRectangle: jest.fn(() => ({
    id: 'mock-rect-id',
    name: 'Mock Rectangle',
    type: 'RECTANGLE',
    resize: jest.fn(),
    fills: [],
    strokes: [],
  })),

  createText: jest.fn(() => ({
    id: 'mock-text-id',
    name: 'Mock Text',
    type: 'TEXT',
    characters: '',
    fontSize: 12,
    fontName: { family: 'Inter', style: 'Regular' },
    fills: [],
  })),

  // Utility methods
  notify: jest.fn(),
  closePlugin: jest.fn(),
  showUI: jest.fn(),

  // UI communication
  ui: {
    postMessage: jest.fn(),
    onmessage: null,
    resize: jest.fn(),
    close: jest.fn(),
  },

  // Client storage
  clientStorage: {
    getAsync: jest.fn((key: string) => {
      const storage = {
        'figma-plugin-settings': JSON.stringify({
          theme: 'light',
          debugMode: false,
        }),
      };
      return Promise.resolve(storage[key] || null);
    }),
    setAsync: jest.fn(() => Promise.resolve()),
    deleteAsync: jest.fn(() => Promise.resolve()),
  },

  // Plugin metadata
  command: 'default',
  parameters: {},

  // Fonts
  loadFontAsync: jest.fn(() => Promise.resolve()),
  listAvailableFontsAsync: jest.fn(() => Promise.resolve([
    { fontName: { family: 'Inter', style: 'Regular' } }
  ])),

  // Export methods
  exportAsync: jest.fn(() => Promise.resolve(new Uint8Array())),

  // Mixed utilities
  mixed: Symbol('mixed'),

  // Group/ungroup
  group: jest.fn(() => ({
    id: 'mock-group-id',
    name: 'Mock Group',
    type: 'GROUP',
    children: [],
  })),

  ungroup: jest.fn(),

  // Viewport
  viewport: {
    center: { x: 0, y: 0 },
    zoom: 1,
    scrollAndZoomIntoView: jest.fn(),
  },
});

// Set up global Figma mock
global.figma = createFigmaMock() as any;

// Console methods for test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test utilities specific to main thread
global.mainTestUtils = {
  // Reset Figma mocks
  resetFigmaMocks: () => {
    global.figma = createFigmaMock() as any;
  },

  // Create mock nodes with specific properties
  createMockNode: (type: string, overrides = {}) => ({
    id: `mock-${type.toLowerCase()}-${Date.now()}`,
    name: `Mock ${type}`,
    type,
    children: type === 'FRAME' || type === 'GROUP' ? [] : undefined,
    ...overrides,
  }),

  // Simulate selection
  setSelection: (nodes: any[]) => {
    global.figma.currentPage.selection = nodes;
  },
};
