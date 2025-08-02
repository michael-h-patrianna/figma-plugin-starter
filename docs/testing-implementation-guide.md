# Testing Implementation Guide

## Quick Start

1. **Install Testing Dependencies**:
```bash
npm install --save-dev \
  @jest/globals \
  jest \
  jest-environment-jsdom \
  @testing-library/preact \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  ts-jest \
  identity-obj-proxy
```

2. **Add Testing Scripts to package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ui": "jest --selectProjects ui-components",
    "test:main": "jest --selectProjects main-thread",
    "test:integration": "jest --selectProjects integration",
    "test:ci": "jest --coverage --watchAll=false"
  }
}
```

3. **Run Tests**:
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:ui            # Run only UI component tests
npm run test:main          # Run only main thread tests
npm run test:integration   # Run only integration tests
npm run test:coverage      # Run tests with coverage report
```

## Key Testing Strategies for Figma Plugins

### 1. **Component Testing (UI Thread)**
- Use `@testing-library/preact` for component testing
- Mock theme context and other providers
- Test props, events, accessibility, and rendering
- Focus on user interactions and component behavior

### 2. **Main Thread Testing**
- Mock the entire Figma API using setup files
- Test node scanning, creation, and manipulation logic
- Test data processing and export functionality
- Verify proper error handling

### 3. **Integration Testing**
- Mock message passing between threads
- Test complete workflows (scan → process → export)
- Verify settings synchronization
- Test error boundaries and recovery

### 4. **Accessibility Testing**
- Verify ARIA attributes and roles
- Test keyboard navigation
- Check focus management
- Validate screen reader compatibility

## Example Test Structure

```
tests/
├── setup/
│   ├── ui.setup.ts         # UI thread mocks and globals
│   ├── main.setup.ts       # Figma API mocks
│   └── integration.setup.ts # Cross-thread testing setup
├── unit/
│   ├── components/         # UI component unit tests
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Modal.test.tsx
│   ├── main/              # Main thread logic tests
│   │   ├── nodeScanner.test.ts
│   │   └── imageExporter.test.ts
│   └── shared/            # Shared utility tests
│       ├── validation.test.ts
│       └── messagePool.test.ts
└── integration/           # Cross-component tests
    ├── messaging.test.ts
    ├── theming.test.ts
    └── workflows.test.ts
```

## Benefits of This Testing Approach

### ✅ **Confidence**
- Catch bugs before they reach users
- Ensure accessibility requirements are met
- Validate complex plugin workflows work correctly

### ✅ **Developer Experience**
- Fast feedback during development
- Safe refactoring with comprehensive test coverage
- Living documentation through test examples

### ✅ **Production Ready**
- Comprehensive error handling validation
- Memory leak detection for long-running sessions
- Performance regression detection

### ✅ **Figma-Specific**
- Mock Figma API for reliable testing
- Test message passing between plugin threads
- Validate node manipulation and export workflows

## Implementation Priority

1. **Phase 1**: Set up Jest configuration and basic infrastructure
2. **Phase 2**: Implement UI component unit tests (Button, Input, Modal)
3. **Phase 3**: Add main thread logic tests (node scanning, image export)
4. **Phase 4**: Build integration test suite (messaging, workflows)
5. **Phase 5**: Add accessibility and performance testing

This testing strategy provides comprehensive coverage for the unique challenges of Figma plugin development while maintaining excellent developer experience and production confidence.
