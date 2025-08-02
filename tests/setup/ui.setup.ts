import '@testing-library/jest-dom';

// Mock CSS imports
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Web Animations API
class MockAnimation {
  finished: Promise<void>;
  currentTime: number = 0;
  playbackRate: number = 1;

  constructor() {
    this.finished = Promise.resolve();
  }

  play() { }
  pause() { }
  cancel() { }
  finish() { }
  reverse() { }

  addEventListener(type: string, listener: any) { }
  removeEventListener(type: string, listener: any) { }
}

// Mock element.animate method
Element.prototype.animate = jest.fn().mockImplementation(() => new MockAnimation());

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock theme colors for testing
  mockTheme: {
    colors: {
      accent: '#3772FF',
      textColor: '#1a1a1a',
      background: '#ffffff',
      error: '#ff3333',
      success: '#00cc66',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    typography: {
      bodySmall: 12,
      caption: 11,
      subheading: 14,
      heading: 16,
    },
    borderRadius: {
      default: 4,
      medium: 6,
    }
  }
};
