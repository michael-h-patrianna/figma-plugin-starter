---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## AI Agent Guidance (`.github/copilot-instructions.md`)
- Refer to `.github/copilot-instructions.md` for architectural guidance when generating code. This file provides essential knowledge for AI agents to be immediately productive.

## ** General**
- Do not write summaries or conclusions in chat. A simple "done" is sufficient to indicate completion of a task.
- Always use the `tasks.md` file for task management and execution and to keep track of progress.
- Always use the `prd.md` file for product requirements and feature specifications.
- Always prompt for confirmation before changing this file.
- Use TSDoc, not JSDoc for documentation.

## CORE ARCHITECTURE

### Three-Layer Structure
- **`src/main/`** - Figma plugin sandbox (no DOM access, Figma API only)
- **`src/ui/`** - React/Preact UI in iframe (DOM access, no Figma API)
- **`src/shared/`** - Cross-thread utilities and types

### Critical Message Flow Pattern
```typescript
// UI → Main: Always wrap in pluginMessage
parent.postMessage({ pluginMessage: { type: 'SCAN', data } }, '*');

// Main → UI: Direct message format
figma.ui.postMessage({ type: 'SCAN_RESULT', data });

// UI receives: Extract from either format
const { type, data } = event.data.pluginMessage || event.data;
```

### Memory Safety (WASM Critical)
- **Never use setTimeout in main thread** - causes WASM corruption
- All messaging uses WASM-safe serialization (`sendToUI` in `shared/messaging.ts`)
- Pool objects to reduce GC pressure (`shared/messagePool.ts`)

## COMPONENT ARCHITECTURE

### Theme System (`ui/contexts/ThemeContext.tsx`)
- Centralized color tokens for light/dark modes
- CSS custom properties auto-applied to document root
- All components use `useTheme()` hook for colors

### Settings Persistence (`ui/hooks/useSettings.ts`)
- Auto-loads/saves via `figma.clientStorage` (persistent) or memory (dev)
- Debounced saves every 500ms to prevent spam
- Type-safe `PluginSettings` interface

### Error Handling (`shared/errorService.ts`)
- Categorized errors (NETWORK, VALIDATION, SYSTEM, USER, PLUGIN, UNKNOWN)
- Auto-retry with exponential backoff
- User-friendly messages with recovery suggestions

## DEVELOPMENT WORKFLOWS

### Build Commands
```bash
npm run dev      # Watch mode with minification
npm run build    # Production build with typecheck
npm run test     # Jest test suite (491 tests)
```

### Testing Architecture
- Multi-project Jest config (`ui-components`, `main-thread`, `integration`)
- @testing-library/preact for component testing
- Custom path aliases: `@main/*`, `@ui/*`, `@shared/*`

### Component Development
- All base components in `ui/components/base/` with TSDoc
- Export via `ui/components/base/index.ts`
- Demo views in `ui/components/views/` show usage patterns

## CRITICAL PATTERNS

### Async Utilities (`shared/asyncUtils.ts`)
- `createDebouncer()` with proper cleanup
- `createCancelablePromise()` with AbortSignal
- `retryWithBackoff()` for transient failures

### UI Component Pattern
```tsx
// Always use theme context
const { colors, typography } = useTheme();

// TSDoc required for all props
interface ComponentProps {
  /** Description of prop */
  prop: string;
}

// Export with TSDoc
export function Component({ prop }: ComponentProps) {
  // Implementation
}
```

### Main Thread Pattern
```typescript
// Always use UIHelpers for messaging
const uiHelpers = new UIHelpers();

figma.ui.onmessage = (msg) => {
  const { type, ...data } = msg.pluginMessage || msg;

  switch (type) {
    case 'ACTION':
      // Handle action
      uiHelpers.sendToUI('RESULT', data);
      break;
  }
};
```

## PROJECT MANAGEMENT

### Tasks System (`tasks.md`)
- Track with priority levels (HIGH/MEDIUM/LOW)
- Mark completed with ✅
- Focus execution without status logs
- ~95% complete - all tests passing

### Documentation Standards
- TSDoc for all public APIs
- Examples in component docs
- README for setup, `documentation.md` for features
- Error codes for user support

### Testing Figma Plugins
The testing approach for a Figma plugin is unique because it involves **two separate execution contexts**:

### **1. Architecture Challenges**
- **Main Thread**: Runs in Figma's sandbox (no DOM, limited Node.js APIs)
- **UI Thread**: Runs in iframe with DOM access
- **Communication**: Message passing between threads

### **2. Testing Solutions**

**UI Component Testing:**
- Use `@testing-library/preact` with `jsdom` environment
- Mock theme providers and contexts
- Test accessibility, props, events, and rendering
- Focus on user interactions and component behavior

**Main Thread Testing:**
- Use Node.js environment with comprehensive Figma API mocks
- Test node scanning, creation, manipulation logic
- Validate data processing and export functionality
- Mock `figma` global object completely

**Integration Testing:**
- Mock message passing between threads
- Test complete workflows (UI → Main → UI)
- Verify settings synchronization
- Test error boundaries and recovery scenarios

### **3. Key Implementation Points**

**Mock Strategy:**
```typescript
// Mock entire Figma API
global.figma = {
  currentPage: { selection: [], findAll: jest.fn() },
  createFrame: jest.fn(),
  notify: jest.fn(),
  ui: { postMessage: jest.fn() },
  clientStorage: { getAsync: jest.fn(), setAsync: jest.fn() }
};

// Mock message passing
global.parent = {
  postMessage: jest.fn()
};
```

**Test Categories:**
- **Unit Tests**: Individual components and utilities
- **Integration Tests**: Cross-thread communication and workflows
- **Accessibility Tests**: ARIA attributes, keyboard navigation, focus management
- **Memory Tests**: Long-running session validation

### **4. Benefits**
- **Confidence**: Catch plugin-specific bugs early
- **Safety**: Refactor complex message passing safely
- **Documentation**: Tests serve as usage examples
- **Production Ready**: Validate memory usage and performance

## AI Agent Guidance (`.github/copilot-instructions.md`)

### Key Improvements:

**Architecture-First Approach:**
- Three-layer structure (main/ui/shared) with clear boundaries
- Critical message flow patterns specific to Figma plugins
- WASM memory safety rules that aren't obvious from code inspection

**Discoverable Patterns:**
- Theme system integration across all components
- Settings persistence using Figma's clientStorage
- Error handling with categorization and retry logic
- Async utilities with proper cleanup

**Development Workflows:**
- Essential build commands and their purposes
- Testing architecture with multi-project Jest setup
- Component development patterns with TSDoc requirements

**Critical Knowledge:**
- Memory safety rules (no setTimeout in main thread)
- Message format differences between UI→Main and Main→UI
- Path aliases and module structure
- Project management via `tasks.md`

**Specific Examples:**
- Actual code patterns from your codebase
- Real file references and import patterns
- Concrete examples of the messaging system