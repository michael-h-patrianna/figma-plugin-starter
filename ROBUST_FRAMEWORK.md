# Robust Figma Plugin Framework

## 🎯 Problem Solved

You were experiencing WASM memory out of bounds errors because your code was holding references to external Figma objects (like `frame.fills`, `fill.imageHash`, etc.) that exist outside the sandboxed WASM environment. When the WASM runtime tried to access these external references during garbage collection or property access, it hit memory boundary violations.

## ✅ Root Cause Identified

The issue wasn't the message passing or data complexity - it was **external object references**:

```typescript
// ❌ DANGEROUS: Holds references to external Figma objects
for (const fill of frame.fills) {  // External Fill objects
  if (fill.type === 'IMAGE' && fill.imageHash) {  // External properties
    const image = figma.getImageByHash(fill.imageHash);  // External Image object
  }
}
```

## 🛡️ Robust Solution

I've created a production-ready framework with WASM-safe utilities:

### 1. Safe Figma Utilities (`src/shared/figmaUtils.ts`)

```typescript
// ✅ SAFE: Immediately extract primitives, no external references
export function extractSafeFillData(fill: any): SafeFillData {
  return {
    type: String(fill.type || 'UNKNOWN'),
    visible: Boolean(fill.visible !== false),
    imageHash: fill.imageHash ? String(fill.imageHash) : null  // Primitive only
  };
}
```

### 2. Bulletproof Messaging (`src/shared/messaging.ts`)

```typescript
// ✅ SAFE: Automatic serialization testing
export function sendToUI<T = any>(type: string, data?: T): void {
  try {
    // Test serialization to catch problematic objects
    const testSerialization = JSON.stringify(data);
    const safeData = JSON.parse(testSerialization);
    figma.ui.postMessage({ type, data: safeData, timestamp: Date.now() });
  } catch (error) {
    // Send error message instead of crashing
    figma.ui.postMessage({ type: 'ERROR', data: { error: 'Serialization failed' }});
  }
}
```

### 3. Safe Operations (`src/main/operations.ts`)

```typescript
// ✅ SAFE: Batch processing with memory management
export async function handleAnalyzeFrames() {
  const frames = getSafeFrames(includeHidden);

  const processor = new SafeBatchProcessor(
    frames,
    async (frame) => await analyzeFrameSafely(frame),  // No external refs
    { batchSize: 5, onProgress: sendProgress }
  );

  const results = await processor.process();
  sendSuccess('ANALYZE_FRAMES', results);
}
```

### 4. Robust Main Thread (`src/main/index.ts`)

- Comprehensive error handling
- Safe message extraction
- WASM-safe operations only
- Production-ready error recovery

### 5. UI Hook (`src/ui/hooks/useRobustPluginMessages.ts`)

- Bulletproof message handling
- Automatic error recovery
- Memory leak prevention

## 🚀 Usage

The robust framework is now available as the first tab "🚀 Robust Framework" in your plugin. It provides:

1. **Get Selection** - Safe selection analysis
2. **Scan Nodes** - WASM-safe node scanning with progress
3. **Analyze Frames** - Image processing without memory issues
4. **Create Content** - Safe content creation
5. **Export Data** - Bulletproof data export

## 📋 Key Benefits

1. **No More WASM Errors** - All operations use primitive snapshots
2. **Production Ready** - Comprehensive error handling
3. **Scalable** - Batch processing for large datasets
4. **Robust** - Continues working even if individual operations fail
5. **Clear Patterns** - Easy to extend with new operations

## 🔧 Framework Pattern

For any new operation:

1. Use utilities from `figmaUtils.ts` to extract safe data
2. Use `SafeBatchProcessor` for large datasets
3. Use `sendToUI()` for bulletproof messaging
4. Handle errors gracefully with fallbacks

## 🎉 Result

Your frame analysis (and any other operations) will now work without WASM memory errors because:

- No external Figma object references are held
- All data is immediately converted to primitives
- Batch processing prevents memory buildup
- Comprehensive error handling prevents crashes

The framework is designed as a robust starter template for building production Figma plugins!
