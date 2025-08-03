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
- When adding or changing functionality, always amend tests. This is a critical development principle.
- Always update tests whenever adding or changing functionality.
- When using the `FormRow` component, be aware of the responsive layout behavior.

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

uiHelpers.setupMessageHandler({
  ACTION: (data) => {
    // Handle action
    uiHelpers.sendToUI('RESULT', data);
  }
});
```

## PROJECT MANAGEMENT

### Tasks System (`tasks.md`)
- Track with priority levels (HIGH/MEDIUM/LOW)
- Mark completed with ✅
- Focus execution without status logs
- ~98% complete - all tests passing

### Documentation Standards
- TSDoc for all public APIs
- Examples in component docs
- README for setup, `docs/documentation.md` for features
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

## Development Principles

- When adding or changing functionality, always amend tests.
- Always update tests whenever adding or changing functionality.

### FormRow Layout Rules

- The `FormRow` component uses `flexWrap: 'wrap'` and content-aware minimum widths.
- When the content doesn't fit within the available space, it will wrap to a new row.
- The following minimum widths apply:
  - 2 columns: 300px
  - 3 columns: 200px
  - 4 columns: 150px

## Animations

### Overview

The project uses CSS transitions for UI animations. While a full JavaScript animation library could be used, CSS transitions provide a good balance of performance, simplicity, and Figma plugin compatibility.

### Key Features:

- **CSS Transitions**: All animations are implemented using CSS transitions (not JavaScript animations)
- **150ms Duration**: Standard animation duration for a snappy, responsive feel
- **`useAnimation` Hook**: Manages animation state and applies CSS classes
- **`animations.css`**: Centralized CSS keyframes and transition classes

### Built-In Component Animations:

The following components have built-in animations:

1. **Modal**
   - **Opening**: Backdrop fade and modal scale-up animation
   - **Closing**: Backdrop fade and modal scale-down animation

2. **Toast**
   - **Appearing**: Slide-in from right + opacity fade
   - **Dismissing**: Slide-out to right + opacity fade

3. **Accordion**
   - **Chevron Rotation**: Smooth rotation when expanding/collapsing

### Animation Utilities:

The `animationUtils.ts` file provides helper functions for working with animations:

```typescript
// Get animation duration from theme
const animationDuration = useTheme().animationDuration;

// Apply animation to element
const element = useRef<HTMLDivElement>(null);
useLayoutEffect(() => {
  if (isVisible) {
    const node = element.current;
    node.classList.add('animate-in');
    return () => {
      node.classList.remove('animate-in');
    };
  }
}, [isVisible]);
```

### Best Practices:

- Use CSS transitions for simple animations like fading, sliding, and scaling
- Use `animationDuration` from the theme to ensure consistent animation speeds
- Remember that Figma's plugin environment may not support all animation features

### Remember to

- Amend tests whenever adding or changing functionality

## Code Component

### Max Height and Scrollbars

The `Code` component supports a `maxHeight` prop. When the content exceeds the maximum height, scrollbars are automatically displayed.

## New Utility Functions

When creating new features, consider creating modular, single-responsibility utility functions. These functions should be:

- **WASM-Safe**: Immediate primitive extraction, no object references held
- **Modular**: Single-responsibility functions that can be reused
- **Type-Safe**: Proper TypeScript typing throughout
- **Performance**: Use efficient data structures (e.g., `Set` for O(1) deduplication)
- **Robust**: Handle edge cases (e.g., invisible paints, missing properties)
- **Testable**: Each function should have a clear input/output contract
- **Maintainable**: Well-documented and focused responsibilities
- **Extensible**: Easy to add support for new features later

### Color Conversion Utility

- When converting colors from Figma's RGB (0-1 range) to hex format, use the following utility function:

```typescript
/**
 * Converts Figma's RGB color values (0-1 range) to hex format.
 * @param r Red value (0-1)
 * @param g Green value (0-1)
 * @param b Blue value (0-1)
 * @returns Uppercase hex string (e.g., "#80FF33")
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  const hexR = toHex(r);
  const hexG = toHex(g);
  const hexB = toHex(b);

  return "#" + hexR + hexG + hexB;
}
```

### Extracting Colors from Paint

- When extracting solid colors from Figma paint objects, use the following function:

```typescript
/**
 * Extracts solid colors from Figma paint objects.
 * @param paint A Figma Paint object (fill or stroke)
 * @returns Array of hex color strings
 */
function extractColorsFromPaint(paint: Paint): string[] {
  if (paint.type === 'SOLID' && paint.visible !== false) {
    const { color } = paint;
    return [rgbToHex(color.r, color.g, color.b)];
  }
  return [];
}
```

### Tree Traversal and Color Extraction

- To recursively traverse a node tree and extract all colors, use the following approach:

```typescript
/**
 * Recursively traverses a node tree and extracts all colors.
 * @param node A Figma node
 * @param colors A Set to collect unique colors
 */
function extractColorsFromNode(node: SceneNode, colors: Set<string>): void {
  if ('fills' in node && Array.isArray(node.fills)) {
    node.fills.forEach(fill => {
      extractColorsFromPaint(fill as SolidPaint).forEach(color => colors.add(color));
    });
  }

  if ('strokes' in node && Array.isArray(node.strokes)) {
    node.strokes.forEach(stroke => {
      extractColorsFromPaint(stroke as SolidPaint).forEach(color => colors.add(color));
    });
  }

  if ('children' in node) {
    node.children.forEach(child => {
      extractColorsFromNode(child, colors);
    });
  }
}
```

### Main Operation Handler Pattern

- When creating a main operation handler, ensure it includes:
    - Progress tracking with `ProgressManager`
    - Cancellation support
    - Error handling
    - Selection validation
    - Results formatting and messaging

### New Color Scanning Utilities

The following utility functions are used for color scanning in the main thread (`index.ts`):

#### 1. `rgbToHex(r: number, g: number, b: number): string`
- **Purpose**: Converts Figma's RGB color values (0-1 range) to hex format.
- **Input**: RGB values as decimals (e.g., `r: 0.5, g: 1.0, b: 0.2`).
- **Output**: Uppercase hex string (e.g., `"#80FF33"`).
- **Logic**: Multiplies by 255, rounds, converts to hex, pads with zero if needed.

#### 2. `extractColorsFromPaint(paint: Paint): string[]`
- **Purpose**: Extracts solid colors from Figma paint objects.
- **Input**: A Figma `Paint` object (fill or stroke).
- **Output**: Array of hex color strings.
- **Logic**: Only processes `SOLID` paint types, ignores gradients/images/etc. Filters skips invisible paints (`visible: false`).

#### 3. `extractColorsFromNode(node: SceneNode, colors: Set<string>): void`
- **Purpose**: Recursively traverses a node tree and extracts all colors.
- **Input**: A Figma node and a Set to collect unique colors.
- **Logic**: Extracts colors from both `fills` and `strokes` arrays, recursively processes all child nodes, uses a Set for automatic deduplication, and handles the tree traversal pattern safely.

#### 4. `handleScanColors(operationId: string, options: any): Promise<void>`
- **Purpose**: Main operation handler for the color scanning process.
- **Features**: Progress tracking with `ProgressManager`, cancellation support, error handling, selection validation, and results formatting and messaging.