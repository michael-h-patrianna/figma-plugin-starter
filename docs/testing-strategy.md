# Testing Strategy for Figma Plugin

## Testing Architecture Overview

### Environment Separation
- **Main Thread Testing**: Node.js environment with Figma API mocks
- **UI Thread Testing**: JSDOM/Happy-DOM for component testing
- **Integration Testing**: Mock message passing between threads
- **E2E Testing**: Figma plugin development mode

## Testing Stack

### Core Testing Tools
```bash
npm install --save-dev \
  @jest/globals \
  jest \
  jest-environment-jsdom \
  @testing-library/preact \
  @testing-library/jest-dom \
  @testing-library/user-event \
  msw \
  figma-api-stub
```

### Test Structure
```
tests/
├── __mocks__/           # Figma API mocks
├── setup/               # Test configuration
├── unit/
│   ├── components/      # UI component tests
│   ├── main/           # Main thread logic tests
│   └── shared/         # Shared utility tests
├── integration/        # Cross-thread tests
└── e2e/               # End-to-end tests
```

## 1. Unit Tests

### UI Component Testing
```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/preact';
import { Button } from '@ui/components/base/Button';

describe('Button Component', () => {
  test('renders with correct variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Main Thread Testing
```typescript
// tests/unit/main/nodeScanner.test.ts
import { scanNodes } from '@main/tools/node-scanner';

// Mock Figma API
const mockFigmaNode = {
  type: 'FRAME',
  name: 'Test Frame',
  children: [],
  id: 'test-id'
};

describe('Node Scanner', () => {
  beforeEach(() => {
    global.figma = {
      currentPage: {
        selection: [mockFigmaNode]
      }
    } as any;
  });

  test('scans selected nodes correctly', () => {
    const result = scanNodes();
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].name).toBe('Test Frame');
  });
});
```

### Shared Utilities Testing
```typescript
// tests/unit/shared/validation.test.ts
import { validateProps, commonRules } from '@shared/propValidation';

describe('Prop Validation', () => {
  test('validates required props correctly', () => {
    const schema = { name: commonRules.required('string') };
    const result = validateProps({}, schema, 'TestComponent');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('name is required but was undefined');
  });
});
```

## 2. Integration Tests

### Message Passing Tests
```typescript
// tests/integration/messaging.test.ts
import { MessagePool } from '@shared/messagePool';

describe('UI to Main Communication', () => {
  let messagePool: MessagePool;

  beforeEach(() => {
    messagePool = new MessagePool();

    // Mock postMessage
    global.parent = {
      postMessage: jest.fn()
    } as any;
  });

  test('sends messages from UI to main thread', async () => {
    const message = { type: 'SCAN_NODES', data: {} };

    messagePool.send(message);

    expect(global.parent.postMessage).toHaveBeenCalledWith({
      pluginMessage: message
    }, '*');
  });
});
```

### Theme Integration Tests
```typescript
// tests/integration/theming.test.ts
import { render } from '@testing-library/preact';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { Button } from '@ui/components/base/Button';

describe('Theme Integration', () => {
  test('components use theme colors correctly', () => {
    const { container } = render(
      <ThemeProvider theme="dark">
        <Button variant="primary">Test</Button>
      </ThemeProvider>
    );

    const button = container.querySelector('button');
    // Test that dark theme colors are applied
    expect(button).toHaveStyle({ color: expect.stringMatching(/rgb\(255/) });
  });
});
```

## 3. Mock Setup

### Figma API Mocks
```typescript
// tests/__mocks__/figma.ts
export const createFigmaMock = () => ({
  currentPage: {
    selection: [],
    findAll: jest.fn(() => []),
  },

  createFrame: jest.fn(() => ({
    id: 'mock-frame-id',
    name: 'Mock Frame',
    resize: jest.fn(),
    appendChild: jest.fn(),
  })),

  notify: jest.fn(),

  ui: {
    postMessage: jest.fn(),
    onmessage: null,
    resize: jest.fn(),
  },

  clientStorage: {
    getAsync: jest.fn(() => Promise.resolve(null)),
    setAsync: jest.fn(() => Promise.resolve()),
  }
});

global.figma = createFigmaMock() as any;
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],

  // Module mapping to match tsconfig paths
  moduleNameMapping: {
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },

  // Test environments for different contexts
  projects: [
    {
      displayName: 'ui',
      testMatch: ['<rootDir>/tests/unit/components/**/*.test.*'],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'main',
      testMatch: ['<rootDir>/tests/unit/main/**/*.test.*'],
      testEnvironment: 'node',
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/tests/unit/shared/**/*.test.*'],
      testEnvironment: 'node',
    }
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

## 4. End-to-End Testing

### Figma Plugin E2E
```typescript
// tests/e2e/plugin-workflow.test.ts
describe('Plugin E2E Workflow', () => {
  test('complete scan and export workflow', async () => {
    // This would require running in actual Figma environment
    // or using Figma's plugin testing tools when available

    // 1. Load plugin in Figma
    // 2. Select nodes
    // 3. Trigger scan
    // 4. Verify results
    // 5. Test export functionality
  });
});
```

## 5. Test Utilities

### Component Test Helpers
```typescript
// tests/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/preact';
import { ThemeProvider } from '@ui/contexts/ThemeContext';

// Custom render with theme provider
export function renderWithTheme(
  ui: ComponentChildren,
  options?: RenderOptions & { theme?: 'light' | 'dark' }
) {
  const { theme = 'light', ...renderOptions } = options || {};

  const Wrapper = ({ children }: { children: ComponentChildren }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock Figma node factory
export function createMockFigmaNode(overrides = {}) {
  return {
    id: 'mock-id',
    name: 'Mock Node',
    type: 'FRAME',
    children: [],
    ...overrides
  };
}
```

## 6. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ui": "jest --selectProjects ui",
    "test:main": "jest --selectProjects main",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e"
  }
}
```

## Implementation Priority

1. **Phase 1**: Set up basic testing infrastructure
2. **Phase 2**: Implement UI component unit tests
3. **Phase 3**: Add main thread logic tests
4. **Phase 4**: Build integration test suite
5. **Phase 5**: E2E testing setup

## Benefits

- **Confidence**: Catch bugs before they reach users
- **Refactoring Safety**: Make changes without fear
- **Documentation**: Tests serve as living documentation
- **Quality Assurance**: Maintain code quality standards
- **CI/CD Integration**: Automated testing in build pipeline
