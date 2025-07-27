# 🛠️ Figma Plugin Toolkit

A robust, production-ready toolkit for building WASM-safe Figma plugins. Built with proven patterns that prevent memory errors and provide reliable functionality.

## 🚀 Features

### 🔍 Node Scanner Tools
- **Safe node analysis** with immediate primitive extraction
- **WASM-safe traversal** that never holds external object references
- **Batch processing** with progress updates
- **Flexible filtering** by type, name patterns, visibility

### 📸 Image Exporter Tools
- **WASM-safe image export** using proven timeout patterns
- **Component state export** (multiple variants at once)
- **Batch export** with progress tracking
- **Multiple formats** (PNG, JPG, SVG) with scaling options

### 🎨 Content Creator Tools
- **Safe content creation** with immediate selection management
- **Sample generation** for testing and demos
- **Multiple shape types** (frames, rectangles, ellipses, text)
- **Batch creation** with spacing and positioning

### 💬 UI Helpers
- **Message routing** with format normalization
- **Progress tracking** and notifications
- **Error handling** with user-friendly messages
- **Window resizing** and UI management

## 🏗️ Architecture

### Clean Separation
```
src/main/
├── index.ts          # Thin routing layer only
├── messaging.ts      # Message router with clean handlers
└── tools/            # All functionality in focused modules
    ├── ui-helpers.ts      # UI management and messaging
    ├── node-scanner.ts    # Safe node analysis
    ├── image-exporter.ts  # WASM-safe image export
    └── content-creator.ts # Content creation tools
```

### WASM-Safe Patterns
- ✅ **Immediate primitive extraction** from Figma objects
- ✅ **No external object references** held across async boundaries
- ✅ **Timeout handling** for all async operations
- ✅ **Safe traversal methods** using findAll/findOne patterns
- ✅ **Base64 conversion** with fallback encoding

## 🎯 Usage Examples

### Node Scanning
```typescript
// Get current selection with safe data extraction
sendToMain('GET_SELECTION', {});

// Scan all nodes with filters
sendToMain('SCAN_NODES', {
  types: ['FRAME', 'RECTANGLE', 'TEXT'],
  includeHidden: false,
  maxDepth: 5
});

// Analyze frames specifically
sendToMain('ANALYZE_FRAMES', {
  includeComponentSets: true,
  analyzeChildren: true
});
```

### Image Export
```typescript
// Export current selection
sendToMain('EXPORT_SELECTION', {
  format: 'PNG',
  scale: 2,
  useAbsoluteBounds: true
});

// Export component in multiple states
sendToMain('EXPORT_COMPONENT_STATES', {
  nodeId: 'component-instance-id',
  states: ['locked', 'active', 'unclaimed', 'completed']
});
```

### Content Creation
```typescript
// Create sample content
sendToMain('CREATE_SAMPLES', {
  count: 4,
  type: 'frames',
  spacing: 200
});

// Create custom frame
sendToMain('CREATE_FRAME', {
  name: 'Custom Frame',
  width: 300,
  height: 200,
  backgroundColor: '#4ECDC4'
});
```

## 🧪 Testing

The toolkit includes a comprehensive demo interface accessible via the "Plugin Toolkit" tab:

- **Live testing** of all tools with real Figma data
- **Progress tracking** and result display
- **Error handling** demonstration
- **JSON result viewer** for debugging

## 🔧 Based on Proven Patterns

This toolkit is built using patterns extracted from a working Figma plugin that successfully:
- Scanned 20+ nodes with complex component variants
- Exported base64 images in 4 different states per component
- Processed large amounts of data without WASM memory errors
- Handled timeout scenarios gracefully

## 📚 Key Learnings

### ❌ What Causes WASM Errors
- Holding references to Figma objects across async boundaries
- Direct array access on objects from WASM memory
- Complex object structures in message passing
- Lack of timeout handling on async operations

### ✅ What Works Reliably
- Immediate primitive extraction: `const id = node.id`
- Safe traversal: `node.findAll()` and `node.findOne()`
- Timeout wrappers around `exportAsync()` and `getBytesAsync()`
- Base64 conversion with fallback encoding
- Message format normalization

## 🚀 Getting Started

1. Open the plugin in Figma
2. Navigate to the "🛠️ Plugin Toolkit" tab
3. Test each tool category with your Figma content
4. Check the console for detailed logging
5. View results in the JSON viewer

The toolkit is ready to use as a foundation for building robust Figma plugins!
