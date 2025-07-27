# Smart Toast System - Usage Examples

The enhanced toast system now includes smart message management with consolidation, queuing, and priority-based display. Here are examples of how to use the new features:

## Basic Usage (unchanged)

```typescript
import { Toast } from '@ui/services/toast';

// Standard toast messages
Toast.success('Layer exported successfully');
Toast.error('Failed to connect to API');
Toast.warning('Layer might be too small');
Toast.info('Processing your request...');
```

## New Smart Features

### 1. Message Consolidation
```typescript
// These will automatically consolidate into "Layer exported successfully (3)"
Toast.consolidated('Layer exported successfully', 'success');
Toast.consolidated('Layer exported successfully', 'success');
Toast.consolidated('Layer exported successfully', 'success');

// Similar messages get grouped by type and normalized text
Toast.consolidated('File "design1.png" exported', 'success');
Toast.consolidated('File "design2.png" exported', 'success');
// Results in: "File exported (2)"
```

### 2. Priority-Based Display
```typescript
// High-priority errors bypass the queue and dismiss lower-priority toasts
Toast.priority('Critical error: Plugin crashed', 'error');

// Standard priority follows normal queue behavior
Toast.info('Background process completed');
```

### 3. Bulk Operations
```typescript
// Efficiently handle multiple messages
const messages = ['Layer 1 processed', 'Layer 2 processed', 'Layer 3 processed'];
Toast.bulk(messages, 'success');

// Or use summary for bulk operations
Toast.summary(5, 'layer exported', 'success'); // "5 layer exporteds completed"
```

### 4. Persistent Messages
```typescript
// Messages that don't auto-dismiss
Toast.persistentError('Please check your internet connection');

// Or use the persist option
Toast.error('Action failed', { persist: true });
```

### 5. Advanced Options
```typescript
// Custom duration and priority
Toast.error('Custom error', {
  duration: 8000,
  priority: 2,
  consolidate: false // Disable consolidation for this message
});

// Quick actions with shorter duration
Toast.quickSuccess('Copied to clipboard'); // 2 second duration
```

### 6. Queue Management
```typescript
// The system automatically:
// - Shows max 3 toasts at once
// - Queues additional toasts by priority
// - Shows "+X queued" indicator when queue has items
// - Provides "Dismiss All" button when there are many toasts

// Access queue state for debugging
const state = Toast.getState();
console.log(`${state.toasts.length} visible, ${state.queue.length} queued`);
```

### 7. Configuration
```typescript
// Customize global behavior
Toast.configure({
  maxVisible: 2,        // Show only 2 toasts at once
  consolidationWindow: 3000, // 3 second window for grouping
  defaultDuration: 4000 // 4 second default duration
});
```

## Smart Consolidation Rules

The system automatically groups messages based on:
- **Exact match**: Same message and type within time window
- **Semantic similarity**: Messages with same action verbs ("exported", "saved", "applied")
- **Number normalization**: "Layer 1 exported" and "Layer 5 exported" become "Layer exported (2)"

## Priority System

1. **Priority 3 (High)**: Errors - Always shown immediately, may dismiss lower priority
2. **Priority 2 (Medium)**: Warnings - Normal queue behavior
3. **Priority 1 (Low)**: Success/Info - Can be dismissed by higher priority messages

## User Experience Features

- **Hover to pause**: Auto-dismiss timer pauses when hovering over toast
- **Click to dismiss**: Click any toast to dismiss it immediately
- **Count badges**: Consolidated messages show count in a badge
- **Queue indicator**: Shows "+X queued" when messages are waiting
- **Smooth animations**: Enhanced visual feedback with hover effects
- **Persistent indicator**: Small dot shows which toasts won't auto-dismiss

## Best Practices

1. **Use consolidation for repetitive actions** like batch processing
2. **Use priority for truly critical errors** that need immediate attention
3. **Use bulk/summary methods** for multiple related operations
4. **Use persistent messages** only for errors requiring user action
5. **Test with rapid actions** to ensure the system handles high-frequency toasts well
