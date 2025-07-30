# Figma Plugin Starter - Feature Guide

This documentation covers all the custom components, hooks, and features in this plugin template.

---

## TL&DR

1. **Import Components** using the @ui alias:
   ```tsx
   import { Button } from '@ui/components/base/Button';
   import { FormGroup, FormRow, FormField } from '@ui/components/base/FormLayout';
   ```

2. **Use it in your JSX** with the required props:
   ```tsx
   <Button onClick={() => alert('Hello!')}>Click Me</Button>

   <FormGroup title="User Details">
     <FormRow columns={2}>
       <FormField label="First Name" required>
         <Input value={firstName} onChange={setFirstName} />
       </FormField>
       <FormField label="Last Name" required>
         <Input value={lastName} onChange={setLastName} />
       </FormField>
     </FormRow>
   </FormGroup>
   ```

## Table of Contents

### Basic Form Components
- [Button](#button) - Clickable actions with primary/secondary/danger variants
- [Input](#input) - Native HTML input elements with theming
- [Textbox](#textbox) - Enhanced text input fields with validation
- [Dropdown](#dropdown) - Select menus and option pickers
- [Checkbox](#checkbox) - Toggle options and boolean settings
- [ToggleSwitch](#toggleswitch) - Modern on/off switches
- [RadioButton](#radiobutton) - Single choice from multiple options
- [ColorPicker](#colorpicker) - Color selection with HTML color input
- [DatePicker](#datepicker) - Date selection components
- [TimePicker](#timepicker) - Time selection components

### Form Layout Components
- [Form](#form) - Top-level form wrapper with title and spacing
- [FormGroup](#formgroup) - Groups related form elements
- [FormRow](#formrow) - Horizontal layout with responsive columns
- [FormField](#formfield) - Individual field wrapper with labels

### Display & Feedback Components
- [Alert](#alert) - Notification banners with info/success/warning/error types
- [InfoBox](#infobox) - Contextual information boxes with theming
- [Toast](#toast) - Temporary notifications and feedback
- [NotificationBanner](#notificationbanner) - Banner notifications
- [MessageBox](#messagebox) - Modal dialogs with Windows-style button configurations
- [Code](#code) - Code display with syntax highlighting
- [Spinner](#spinner) - Loading indicators
- [ProgressBar](#progressbar) - Loading and progress indicators

### Container & Navigation Components
- [Panel](#panel) - Container components with consistent styling
- [Modal](#modal) - Overlay dialogs and popups
- [ProgressModal](#progressmodal) - Progress display in modal format
- [Accordion](#accordion) - Expandable content sections
- [Tabs](#tabs) - Tabbed interfaces
- [DataTable](#datatable) - Sortable tables with theming

### Interaction Components
- [ContextMenu](#contextmenu) - Right-click menus and dropdowns
- [SettingsDropdown](#settingsdropdown) - Settings menu with cog icon

### Performance & Loading Components
- [LazyLoader](#lazyloader) - Dynamic component loading with fallbacks
- [ErrorBoundary](#errorboundary) - Error catching and recovery with auto-retry

### System & State Management
- [Theme System](#theme-system) - Light/dark mode management
- [useSettings Hook](#usesettings-hook) - Automatic settings persistence
- [Plugin Messaging System](#plugin-messaging-system) - UI ↔ Main thread communication

### Global Services
- [Toast Service](#toast) - Global toast notification system
- [MessageBox Service](#messagebox) - Global modal dialog system

### Utilities & Helpers
- [Async Utilities](#async-utilities) - Debouncing, throttling, and async operation helpers

---

## Button

**What it's for**: Creating clickable actions like "Save", "Cancel", "Delete", etc.

**When to use**: Any time you need users to trigger an action or submit a form.

### Import
```tsx
import { Button } from '@ui/components/base/Button';
```

### Basic Usage
The simplest button just needs text and a click handler:

```tsx
function MyComponent() {
  const handleSave = () => {
    console.log('Saving...');
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `children` | ReactNode | ✅ Yes | The text or content inside the button | `"Save"`, `<span>Delete</span>` |
| `onClick` | Function | ✅ Yes | What happens when clicked | `() => handleSave()` |
| `variant` | String | No | Button style: `'primary'` (default), `'secondary'`, `'danger'` | `"secondary"` |
| `disabled` | Boolean | No | Makes button unclickable and grayed out | `true`, `false` |
| `type` | String | No | HTML button type for forms | `"submit"`, `"button"` |

### Common Examples

```tsx
// Primary button (default - blue background)
<Button onClick={handleSave}>Save Project</Button>

// Secondary button (gray background, less prominent)
<Button onClick={handleCancel} variant="secondary">Cancel</Button>

// Danger button (red background for destructive actions)
<Button onClick={handleDelete} variant="danger">Delete All</Button>

// Disabled button (grayed out, won't respond to clicks)
<Button onClick={handleSubmit} disabled={!isFormValid}>
  {isFormValid ? 'Submit' : 'Please fill all fields'}
</Button>

// Form submit button
<Button onClick={handleSubmit} type="submit">Create Account</Button>
```

### Real-World Usage Pattern
```tsx
function SaveDialog({ onSave, onCancel, isSaving }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={onCancel} variant="secondary">
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
```

---

## Input

**What it's for**: Basic HTML input elements with consistent theming and styling.

**When to use**: For simple text inputs that don't need the enhanced features of Textbox.

### Import
```tsx
import { Input } from '@ui/components/base/Input';
```

### Basic Usage
```tsx
function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter text"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `value` | String | ✅ Yes | Current input value | `"Hello World"` |
| `onChange` | Function | ✅ Yes | Called when value changes | `(e) => setValue(e.target.value)` |
| `placeholder` | String | No | Placeholder text | `"Type here..."` |
| `disabled` | Boolean | No | Makes input uneditable | `true`, `false` |
| `type` | String | No | HTML input type | `"text"`, `"email"`, `"password"` |

### Common Examples

```tsx
// Basic text input
<Input
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Full name"
/>

// Email input
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="email@example.com"
/>

// Password input
<Input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Password"
/>

// Disabled input
<Input
  value="Read-only value"
  onChange={() => {}}
  disabled
/>
```

---

**What it's for**: Getting text input from users - names, descriptions, search terms, etc.

**When to use**: Any time you need users to type something.

### Import
```tsx
import { Textbox } from '@ui/components/base/Textbox';
```

### Basic Usage
```tsx
function MyComponent() {
  const [name, setName] = useState('');

  return (
    <Textbox
      value={name}
      onValueInput={setName}
      placeholder="Enter your name"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `value` | String | ✅ Yes | Current text in the input | `"John Doe"` |
| `onValueInput` | Function | ✅ Yes | Called when user types | `(newText) => setName(newText)` |
| `placeholder` | String | No | Gray hint text when empty | `"Type here..."` |
| `disabled` | Boolean | No | Makes input uneditable | `true`, `false` |
| `variant` | String | No | Style: `'border'` (default) or `'underline'` | `"underline"` |
| `icon` | ReactNode | No | Icon on the left side | `<SearchIcon />` |
| `suffix` | ReactNode | No | Icon or text on the right side | `<span>px</span>` |

### Common Examples

```tsx
// Basic text input
<Textbox
  value={username}
  onValueInput={setUsername}
  placeholder="Username"
/>

// Search box with underline style
<Textbox
  value={searchTerm}
  onValueInput={setSearchTerm}
  variant="underline"
  placeholder="Search layers..."
/>

// Number input with unit suffix
<Textbox
  value={width}
  onValueInput={setWidth}
  placeholder="100"
  suffix={<span style={{ color: '#666' }}>px</span>}
/>

// Disabled input (for display only)
<Textbox
  value="Read-only value"
  onValueInput={() => {}}
  disabled
/>
```

### Real-World Usage Pattern
```tsx
function UserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Textbox
        value={name}
        onValueInput={setName}
        placeholder="Full name"
        disabled={isSubmitting}
      />
      <Textbox
        value={email}
        onValueInput={setEmail}
        placeholder="email@example.com"
        disabled={isSubmitting}
      />
    </div>
  );
}
```

---

## Dropdown

**What it's for**: Letting users pick one option from a list (like a select menu).

**When to use**: When you have multiple options but want to save space, or when options are predefined.

### Import
```tsx
import { Dropdown } from '@ui/components/base/Dropdown';
```

### Basic Usage
```tsx
function MyComponent() {
  const [selectedType, setSelectedType] = useState('');

  const options = [
    { value: 'frame', text: 'Frame' },
    { value: 'group', text: 'Group' },
    { value: 'text', text: 'Text Layer' }
  ];

  return (
    <Dropdown
      options={options}
      value={selectedType}
      onValueChange={setSelectedType}
      placeholder="Choose a layer type"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `options` | Array | ✅ Yes | List of choices for the dropdown | `[{value: 'red', text: 'Red'}]` |
| `value` | String | ✅ Yes | Currently selected option's value | `"red"` |
| `onValueChange` | Function | ✅ Yes | Called when user selects an option | `(value) => setColor(value)` |
| `placeholder` | String | No | Text shown when nothing is selected | `"Select a color..."` |
| `disabled` | Boolean | No | Makes dropdown unclickable | `true`, `false` |

### Option Format
Each option in the `options` array should be an object with:
```tsx
{
  value: 'unique-id',        // The value you'll get in onValueChange
  text: 'Display Text',      // What the user sees
  disabled: false            // Optional: makes this option unselectable
}
```

### Common Examples

```tsx
// Color picker dropdown
const colorOptions = [
  { value: 'red', text: '🔴 Red' },
  { value: 'blue', text: '🔵 Blue' },
  { value: 'green', text: '🟢 Green' }
];

<Dropdown
  options={colorOptions}
  value={selectedColor}
  onValueChange={setSelectedColor}
  placeholder="Pick a color"
/>

// Font size selector
const sizeOptions = [
  { value: '12', text: '12px - Small' },
  { value: '16', text: '16px - Medium' },
  { value: '24', text: '24px - Large' },
  { value: '32', text: '32px - Extra Large' }
];

<Dropdown
  options={sizeOptions}
  value={fontSize}
  onValueChange={setFontSize}
  placeholder="Select font size"
/>

// With disabled option
const statusOptions = [
  { value: 'draft', text: 'Draft' },
  { value: 'review', text: 'In Review' },
  { value: 'published', text: 'Published', disabled: true }  // Can't select this
];
```

### Real-World Usage Pattern
```tsx
function LayerSettings() {
  const [layerType, setLayerType] = useState('');
  const [blendMode, setBlendMode] = useState('normal');

  const layerTypes = [
    { value: 'rectangle', text: 'Rectangle' },
    { value: 'ellipse', text: 'Ellipse' },
    { value: 'text', text: 'Text' },
    { value: 'image', text: 'Image' }
  ];

  const blendModes = [
    { value: 'normal', text: 'Normal' },
    { value: 'multiply', text: 'Multiply' },
    { value: 'screen', text: 'Screen' },
    { value: 'overlay', text: 'Overlay' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>Layer Type:</label>
        <Dropdown
          options={layerTypes}
          value={layerType}
          onValueChange={setLayerType}
          placeholder="Choose layer type"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>Blend Mode:</label>
        <Dropdown
          options={blendModes}
          value={blendMode}
          onValueChange={setBlendMode}
        />
      </div>
    </div>
  );
}
```

---

## Checkbox

**What it's for**: Letting users turn options on/off or agree to terms.

**When to use**: For yes/no choices, feature toggles, or multi-select scenarios.

### Import
```tsx
import { Checkbox } from '@ui/components/base/Checkbox';
```

### Basic Usage
```tsx
function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Checkbox
      checked={isEnabled}
      onChange={setIsEnabled}
      label="Enable notifications"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `checked` | Boolean | ✅ Yes | Whether the checkbox is ticked | `true`, `false` |
| `onChange` | Function | ✅ Yes | Called when user clicks the checkbox | `(isChecked) => setEnabled(isChecked)` |
| `label` | String | No | Text next to the checkbox | `"Remember me"` |
| `disabled` | Boolean | No | Makes checkbox unclickable | `true`, `false` |

### Common Examples

```tsx
// Basic checkbox with label
<Checkbox
  checked={rememberMe}
  onChange={setRememberMe}
  label="Remember me"
/>

// Checkbox without label (you provide your own text)
<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <Checkbox checked={agreed} onChange={setAgreed} />
  <span>I agree to the <a href="/terms">terms and conditions</a></span>
</div>

// Disabled checkbox
<Checkbox
  checked={true}
  onChange={() => {}}
  disabled
  label="This setting is locked"
/>

// Multiple checkboxes for features
function FeatureToggles() {
  const [features, setFeatures] = useState({
    darkMode: false,
    notifications: true,
    autoSave: false
  });

  const toggleFeature = (featureName) => {
    setFeatures(prev => ({
      ...prev,
      [featureName]: !prev[featureName]
    }));
  };

  return (
    <div>
      <h3>App Settings</h3>
      <Checkbox
        checked={features.darkMode}
        onChange={() => toggleFeature('darkMode')}
        label="Dark mode"
      />
      <Checkbox
        checked={features.notifications}
        onChange={() => toggleFeature('notifications')}
        label="Push notifications"
      />
      <Checkbox
        checked={features.autoSave}
        onChange={() => toggleFeature('autoSave')}
        label="Auto-save documents"
      />
    </div>
  );
}
```

### Real-World Usage Pattern
```tsx
function ExportSettings() {
  const [includeHidden, setIncludeHidden] = useState(false);
  const [compressImages, setCompressImages] = useState(true);
  const [exportMetadata, setExportMetadata] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h4>Export Options</h4>

      <Checkbox
        checked={includeHidden}
        onChange={setIncludeHidden}
        label="Include hidden layers"
      />

      <Checkbox
        checked={compressImages}
        onChange={setCompressImages}
        label="Compress images (recommended)"
      />

      <Checkbox
        checked={exportMetadata}
        onChange={setExportMetadata}
        label="Include layer metadata"
      />
    </div>
  );
}
```

---

## RadioButton

**What it's for**: Single choice selection from a group of mutually exclusive options.

**When to use**: When users need to select exactly one option from multiple choices.

### Import
```tsx
import { RadioButton } from '@ui/components/base/RadioButton';
```

### Basic Usage
```tsx
function MyComponent() {
  const [selectedSize, setSelectedSize] = useState('medium');

  const sizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  return (
    <RadioButton
      options={sizeOptions}
      value={selectedSize}
      onChange={setSelectedSize}
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `options` | Array | ✅ Yes | Array of option objects | `[{value: 'a', label: 'Option A'}]` |
| `value` | String | ✅ Yes | Currently selected value | `"medium"` |
| `onChange` | Function | ✅ Yes | Called when selection changes | `(value) => setSelected(value)` |
| `disabled` | Boolean | No | Disables all options | `true`, `false` |

### Option Format
Each option should be an object with:
```tsx
{
  value: 'unique-value',     // The value returned in onChange
  label: 'Display Text',     // What the user sees
  disabled: false            // Optional: disable this specific option
}
```

### Common Examples

```tsx
// Size selector
const sizes = [
  { value: 'xs', label: 'Extra Small' },
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra Large' }
];

<RadioButton
  options={sizes}
  value={selectedSize}
  onChange={setSelectedSize}
/>

// Priority selector with disabled option
const priorities = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'critical', label: 'Critical', disabled: true }
];

<RadioButton
  options={priorities}
  value={priority}
  onChange={setPriority}
/>
```

---

**What it's for**: Displaying contextual information, tips, warnings, or important messages with visual hierarchy.

**When to use**: For help text, status messages, alerts, documentation tips, or any informational content that needs to stand out.

### Import
```tsx
import { InfoBox } from '@ui/components/base/InfoBox';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <InfoBox title="Pro Tip" variant="tip">
      This is helpful information for your users to understand how to use this feature effectively.
    </InfoBox>
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `title` | String | ✅ Yes | The header text for the info box | `"Important Notice"` |
| `children` | ReactNode | ✅ Yes | The main content of the info box | `"Your message here"` |
| `variant` | String | No | Style variant: `'info'`, `'success'`, `'warning'`, `'error'`, `'accent'`, `'tip'` | `"warning"` |
| `backgroundColor` | String | No | Custom background color override | `"#f0f8ff"` |
| `borderColor` | String | No | Custom border color override | `"#ff6b6b"` |
| `titleColor` | String | No | Custom title text color override | `"#2c3e50"` |
| `contentColor` | String | No | Custom content text color override | `"#666"` |
| `className` | String | No | Additional CSS class name | `"my-custom-class"` |
| `style` | Object | No | Additional inline styles | `{{ marginTop: 16 }}` |

### Variants Explained

Each variant automatically applies appropriate colors:

- **`info`** (default): Blue theme for informational content
- **`success`**: Green theme for positive messages
- **`warning`**: Orange theme for warnings and cautions
- **`error`**: Red theme for errors and problems
- **`accent`**: Uses your theme's accent color
- **`tip`**: Uses your theme's accent color for helpful tips

### Common Examples

```tsx
// Basic info message
<InfoBox title="Getting Started" variant="info">
  Welcome to the plugin! Click the scan button to analyze your Figma selection.
</InfoBox>

// Success confirmation
<InfoBox title="Export Complete" variant="success">
  Your design has been successfully exported to the Downloads folder.
</InfoBox>

// Warning message
<InfoBox title="Performance Warning" variant="warning">
  Large selections may take longer to process. Consider breaking them into smaller chunks.
</InfoBox>

// Error message
<InfoBox title="Connection Failed" variant="error">
  Could not connect to the server. Please check your internet connection and try again.
</InfoBox>

// Helpful tip
<InfoBox title="Pro Tip" variant="tip">
  Use keyboard shortcuts Cmd+S to save your progress quickly!
</InfoBox>

// Custom styling
<InfoBox
  title="Custom Styled Message"
  variant="info"
  borderColor="#9b59b6"
  titleColor="#9b59b6"
>
  This InfoBox uses custom purple colors while maintaining the component structure.
</InfoBox>
```
---

## Alert

**What it's for**: Displaying important notifications, feedback messages, and status updates with clear visual hierarchy.

**When to use**: For user feedback, form validation, status updates, or any message that requires immediate user attention.

### Import
```tsx
import { Alert } from '@ui/components/base/Alert';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <Alert type="success">
      Your settings have been saved successfully!
    </Alert>
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `type` | String | ✅ Yes | Alert type: `'info'`, `'success'`, `'warning'`, `'error'` | `"success"` |
| `children` | ReactNode | ✅ Yes | The alert message content | `"Operation completed"` |
| `variant` | String | No | Style variant: `'solid'` (default) or `'subtle'` | `"subtle"` |

### Alert Types

- **`info`**: Blue theme for general information
- **`success`**: Green theme for successful operations
- **`warning`**: Orange theme for warnings and cautions
- **`error`**: Red theme for errors and failures

### Variants

- **`solid`** (default): Prominent styling with bold colors
- **`subtle`**: Muted styling with lighter colors

### Common Examples

```tsx
// Success message
<Alert type="success">
  Your design tokens have been exported successfully!
</Alert>

// Error message with subtle styling
<Alert type="error" variant="subtle">
  Failed to connect to the API. Please try again.
</Alert>

// Warning message
<Alert type="warning">
  Large files may take longer to process.
</Alert>

// Info message
<Alert type="info">
  Tip: Use Cmd+Z to undo your last action.
</Alert>
```

---

## ToggleSwitch

**What it's for**: Modern on/off switches for settings and preferences.

**When to use**: For boolean settings, feature toggles, or any binary choice that needs a modern interface.

### Import
```tsx
import { ToggleSwitch } from '@ui/components/base/ToggleSwitch';
```

### Basic Usage
```tsx
function MyComponent() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <ToggleSwitch
      checked={isEnabled}
      onChange={setIsEnabled}
      label="Enable notifications"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `checked` | Boolean | ✅ Yes | Whether the switch is on/off | `true`, `false` |
| `onChange` | Function | ✅ Yes | Called when switch is toggled | `(checked) => setEnabled(checked)` |
| `label` | String | No | Text label next to the switch | `"Dark mode"` |
| `disabled` | Boolean | No | Makes switch unclickable | `true`, `false` |

### Common Examples

```tsx
// Basic toggle switch
<ToggleSwitch
  checked={darkMode}
  onChange={setDarkMode}
  label="Dark mode"
/>

// Settings toggles
<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
  <ToggleSwitch
    checked={notifications}
    onChange={setNotifications}
    label="Push notifications"
  />
  <ToggleSwitch
    checked={autoSave}
    onChange={setAutoSave}
    label="Auto-save"
  />
  <ToggleSwitch
    checked={analytics}
    onChange={setAnalytics}
    label="Share analytics"
    disabled={!isPremium}
  />
</div>
```

---

## Toast

**What it's for**: Temporary notifications that appear and disappear automatically with smart stacking, consolidation, and queuing.

**When to use**: For confirmations, quick feedback, or non-critical messages that don't require user action.

### Import
```tsx
import { Toast } from '@ui/services/toast';
```

### Basic Usage
```tsx
function MyComponent() {
  const handleSave = () => {
    // Your save logic here
    Toast.success('Settings saved successfully!');
  };

  const handleError = () => {
    Toast.error('Something went wrong');
  };

  return (
    <div>
      <Button onClick={handleSave}>Save Settings</Button>
      <Button onClick={handleError}>Trigger Error</Button>
    </div>
  );
}
```

### Toast Types
Different types with automatic styling and durations:

```tsx
// Basic message types
Toast.info('Information message');          // Blue, 5s duration
Toast.success('Operation completed!');      // Green, 5s duration
Toast.warning('Please check your input');   // Orange, 5s duration
Toast.error('Something went wrong');        // Red, 10s duration

// Quick convenience methods
Toast.quickSuccess('Saved!');               // Green, 2s duration
Toast.persistentError('Critical error');    // Red, manual dismiss
Toast.single('Only this message');          // Dismisses all others
Toast.priority('Urgent message');           // High priority, bypasses queue
```

### Smart Features

#### Message Consolidation
Similar messages within 2 seconds are automatically consolidated:
```tsx
// These will be grouped into one toast with count badge
Toast.info('Processing file 1');
Toast.info('Processing file 2');
Toast.info('Processing file 3');
// Result: "Processing file #" with count badge "3"
```

#### Priority System
Higher priority messages can replace lower priority ones:
```tsx
Toast.info('Low priority message');
Toast.error('High priority error');  // Will replace info message if needed
```

#### Queuing System
Maximum 3 toasts visible at once, others queue automatically:
```tsx
// If 3 toasts already showing, this goes to queue
Toast.success('Will show when space available');
```

### Bulk Operations
Efficient handling of multiple messages:

```tsx
// Multiple messages with consolidation
Toast.bulk(['File 1 processed', 'File 2 processed'], 'success');

// Summary for multiple operations
Toast.summary(5, 'file processed');  // "5 file processeds completed"
Toast.summary(1, 'item deleted');    // "item deleted"
```

### Manual Control
Direct control over individual toasts:

```tsx
// Get toast ID for later control
const toastId = Toast.info('Processing...');

// Dismiss specific toast
Toast.dismiss(toastId);

// Dismiss all toasts and clear queue
Toast.dismissAll();

// Get current state (for debugging)
const state = Toast.getState();
console.log(state.toasts, state.queue);
```

### Advanced Options
Full control with showToast function:

```tsx
import { showToast } from '@ui/services/toast';

// Custom duration
showToast('Custom message', 'info', { duration: 8000 });

// Persistent until manually dismissed
showToast('Important notice', 'warning', { persist: true });

// Disable consolidation
showToast('Unique message', 'info', { consolidate: false });

// Custom priority (1=low, 2=medium, 3=high)
showToast('Custom priority', 'error', { priority: 2 });

// Single mode (dismisses others)
showToast('Only this shows', 'success', { allowMultiple: false });
```

### Configuration
Adjust global behavior:

```tsx
Toast.configure({
  maxVisible: 5,           // Show up to 5 toasts at once
  consolidationWindow: 3000, // Group similar messages within 3s
  defaultDuration: 6000    // Default 6s duration
});
```

### Setup
Add the toast container to your app root:
```tsx
import { GlobalToastContainer } from '@ui/components/base/Toast';

function App() {
  return (
    <div>
      {/* Your app content */}
      <GlobalToastContainer />
    </div>
  );
}
```

### Common Examples

```tsx
// Basic success/error handling
function SettingsForm() {
  const handleSave = async () => {
    try {
      await saveSettings();
      Toast.success('Settings saved successfully!');
    } catch (error) {
      Toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    Toast.info('Settings reset to defaults');
  };
}

// Bulk file processing with consolidation
function FileProcessor() {
  const processFiles = async (files) => {
    for (const file of files) {
      try {
        await processFile(file);
        Toast.success(`Processed ${file.name}`);  // Auto-consolidates
      } catch (error) {
        Toast.error(`Failed to process ${file.name}`);
      }
    }

    // Summary message
    Toast.summary(files.length, 'file processed');
  };
}

// Critical error that needs attention
function CriticalOperation() {
  const handleCritical = () => {
    Toast.persistentError('Connection lost. Please reconnect manually.');
  };
}

// Progress updates that don't overwhelm
function ProgressUpdates() {
  const updateProgress = (step) => {
    // Only show priority updates to avoid spam
    if (step % 10 === 0) {
      Toast.info(`Progress: ${step}/100 completed`);
    }
  };
}
```

### Features Summary
- **Smart Consolidation**: Similar messages group automatically with count badges
- **Priority Queue**: Important messages can bypass or replace lower priority ones
- **Automatic Timing**: Error messages stay longer (10s vs 5s)
- **Hover Pause**: Toasts pause auto-dismiss when hovered
- **Theme Integration**: Colors automatically adapt to light/dark themes
- **Accessibility**: Text colors automatically adjust for contrast
- **Queue Management**: Shows queue indicator and "Dismiss All" button when needed
- **Persistent Mode**: Critical messages stay until manually dismissed

---

## NotificationBanner

**What it's for**: Persistent banner notifications at the top of interfaces.

**When to use**: For important system messages, warnings, or persistent status updates.

### Import
```tsx
import { NotificationBanner } from '@ui/components/base/NotificationBanner';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <NotificationBanner type="info" onDismiss={() => setVisible(false)}>
      System maintenance scheduled for tonight at 2 AM.
    </NotificationBanner>
  );
}
```

---

## MessageBox

**What it's for**: Displaying modal dialogs with standardized button configurations following Windows MessageBox patterns.

**When to use**: For confirmations, alerts, questions, and user decisions that require modal interaction.

### Import
```tsx
import { showMessageBox, showConfirmBox, showYesNoBox, showYesNoCancelBox } from '@ui/services/messageBox';
```

### Button Configurations

#### OK Only - Simple Information
```tsx
async function showInfo() {
  await showMessageBox('Information', 'Operation completed successfully.');
  console.log('User acknowledged the message');
}
```

#### OK/Cancel - Confirmation Dialog
```tsx
async function confirmAction() {
  const confirmed = await showConfirmBox('Confirm', 'Do you want to proceed?');
  if (confirmed) {
    console.log('User confirmed');
  } else {
    console.log('User cancelled');
  }
}
```

#### Yes/No - Binary Choice
```tsx
async function askQuestion() {
  const result = await showYesNoBox('Question', 'Do you like this feature?');
  if (result) {
    console.log('User said Yes');
  } else {
    console.log('User said No');
  }
}
```

#### Yes/No/Cancel - Save Dialog
```tsx
async function savePrompt() {
  const result = await showYesNoCancelBox('Save Changes', 'Save before closing?');
  switch (result) {
    case 'yes':
      console.log('Save and close');
      break;
    case 'no':
      console.log('Close without saving');
      break;
    case 'cancel':
      console.log('Cancel close operation');
      break;
  }
}
```

### Close Button Behavior
- **OK Only**: Close button acts as OK
- **OK/Cancel**: Close button acts as Cancel
- **Yes/No**: Close button acts as No
- **Yes/No/Cancel**: Close button acts as Cancel

### Optional Callbacks
```tsx
await showConfirmBox('Delete File', 'Are you sure?', {
  onOk: () => console.log('Delete confirmed'),
  onCancel: () => console.log('Delete cancelled')
});
```

### Setup
Add the MessageBox component to your app root:
```tsx
import { MessageBox } from '@ui/components/base/MessageBox';

function App() {
  return (
    <div>
      {/* Your app content */}
      <MessageBox />
    </div>
  );
}
```

---

## Code

**What it's for**: Displaying code snippets with syntax highlighting and consistent styling.

**When to use**: For showing code examples, configuration snippets, or technical documentation.

### Import
```tsx
import { Code } from '@ui/components/base/Code';
```

### Basic Usage
```tsx
function MyComponent() {
  const codeExample = `function hello() {
  console.log('Hello, world!');
}`;

  return (
    <Code language="javascript">
      {codeExample}
    </Code>
  );
}
```

---

## Panel

**What it's for**: Container component with consistent padding, borders, and theming.

**When to use**: For grouping related content with visual boundaries.

### Import
```tsx
import { Panel } from '@ui/components/base/Panel';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <Panel title="Settings">
      <p>Panel content goes here.</p>
    </Panel>
  );
}
```

---

## ContextMenu

**What it's for**: Right-click menus and dropdown menus with smart positioning.

**When to use**: For context-sensitive actions, settings menus, or any dropdown that needs to position itself intelligently.

### Import
```tsx
import { ContextMenu } from '@ui/components/base/ContextMenu';
```

### Basic Usage
```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleRightClick = (e) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const menuItems = [
    {
      id: 'copy',
      content: <span>📋 Copy</span>,
      onClick: () => {
        console.log('Copy clicked');
        setIsOpen(false);
      }
    },
    {
      id: 'delete',
      content: <span style={{ color: 'red' }}>🗑️ Delete</span>,
      onClick: () => {
        console.log('Delete clicked');
        setIsOpen(false);
      }
    }
  ];

  return (
    <div onContextMenu={handleRightClick}>
      Right-click me!

      <ContextMenu
        isOpen={isOpen}
        position={position}
        items={menuItems}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
```

---

## SettingsDropdown

**What it's for**: A pre-built settings menu with theme and debug toggles, triggered by a cog icon.

**When to use**: For plugin settings, preferences, or configuration options.

### Import
```tsx
import { SettingsDropdown } from '@ui/components/base/SettingsDropdown';
```

### Basic Usage
```tsx
function MyComponent() {
  const [debugMode, setDebugMode] = useState(false);

  return (
    <SettingsDropdown
      debugMode={debugMode}
      onDebugToggle={setDebugMode}
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `debugMode` | Boolean | ✅ Yes | Current debug mode state | `true`, `false` |
| `onDebugToggle` | Function | ✅ Yes | Called when debug toggle is clicked | `(enabled) => setDebug(enabled)` |

---

## Modal

**What it's for**: Overlay dialogs that focus user attention on specific tasks or information.

**When to use**: For confirmations, forms, detailed views, or any content that needs to be displayed above the main interface.

### Import
```tsx
import { Modal } from '@ui/components/base/Modal';
```

### Basic Usage
```tsx
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
      >
        <p>Are you sure you want to delete this item?</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Button onClick={() => setIsOpen(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="danger">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
```

---

## ProgressModal

**What it's for**: Displaying progress indicators in a modal overlay format.

**When to use**: For long-running operations that need to show progress and prevent user interaction with the main interface.

### Import
```tsx
import { ProgressModal } from '@ui/components/base/ProgressModal';
```

### Basic Usage
```tsx
function MyComponent() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    setProgress(0);
    setIsProcessing(true);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsProcessing(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div>
      <Button onClick={handleProcess}>Start Process</Button>

      <ProgressModal
        isVisible={isProcessing}
        onClose={() => setIsProcessing(false)}
        progress={progress}
        title="Processing Files"
        description="Please wait while we process your files..."
        showCloseButton={false}
      />
    </div>
  );
}
```

### Props
- `isVisible`: `boolean` - Controls modal visibility
- `onClose`: `() => void` - Callback when modal should close
- `progress`: `number` - Progress value (0-100)
- `title`: `string` - Modal title (optional, defaults to "Processing")
- `description`: `string` - Description text (optional, defaults to "Please wait while we process your request")
- `showCloseButton`: `boolean` - Whether to show close button (optional, defaults to false, automatically shows when progress reaches 100%)

---

## DataTable

**What it's for**: Displaying tabular data with sorting, filtering, and theming support.

**When to use**: For displaying structured data like lists of layers, settings, or any data that benefits from a table format.

### Import
```tsx
import { DataTable } from '@ui/components/base/DataTable';
```

### Basic Usage
```tsx
function MyComponent() {
  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'type', title: 'Type', sortable: true },
    { key: 'visible', title: 'Visible', sortable: false }
  ];

  const data = [
    { id: 1, name: 'Button Component', type: 'Component', visible: true },
    { id: 2, name: 'Header Text', type: 'Text', visible: true },
    { id: 3, name: 'Background', type: 'Rectangle', visible: false }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => console.log('Selected:', row)}
    />
  );
}
```

---

## Accordion

**What it's for**: Organizing content into collapsible sections to save space and improve navigation.

**When to use**: For FAQ sections, settings groups, or any content that can be logically grouped and shown/hidden.

### Import
```tsx
import { Accordion } from '@ui/components/base/Accordion';
```

### Basic Usage
```tsx
function MyComponent() {
  const sections = [
    {
      title: 'Getting Started',
      content: 'Learn the basics of using this plugin...'
    },
    {
      title: 'Advanced Features',
      content: 'Explore more powerful capabilities...'
    },
    {
      title: 'Troubleshooting',
      content: 'Common issues and solutions...'
    }
  ];

  return (
    <Accordion
      sections={sections}
      allowMultiple={true}
      defaultExpanded={[0]}
    />
  );
}
```

---

## Tabs

**What it's for**: Organizing content into tabbed interfaces for easy navigation between related sections.

**When to use**: For settings panels, different views of the same data, or organizing related functionality.

### Import
```tsx
import { Tabs } from '@ui/components/base/Tabs';
```

### Basic Usage
```tsx
function MyComponent() {
  const [activeTab, setActiveTab] = useState('layers');

  const tabs = [
    { id: 'layers', label: 'Layers', content: <LayerPanel /> },
    { id: 'styles', label: 'Styles', content: <StylePanel /> },
    { id: 'assets', label: 'Assets', content: <AssetPanel /> }
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

---

## ProgressBar

**What it's for**: Showing progress of long-running operations like exports, imports, or processing.

**When to use**: For any operation that takes time and you want to provide visual feedback to users.

### Import
```tsx
import { ProgressBar } from '@ui/components/base/ProgressBar';
```

### Basic Usage
```tsx
function MyComponent() {
  const [progress, setProgress] = useState(0);

  const handleStart = () => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div>
      <ProgressBar
        value={progress}
        max={100}
        label={`Processing... ${progress}%`}
      />
      <Button onClick={handleStart}>Start Process</Button>
    </div>
  );
}
```

---

## ColorPicker

**What it's for**: Simple, themeable color selection using the native HTML color input.

**When to use**: For any color selection needs - theme colors, UI elements, styling options, or any feature that requires users to pick colors.

### Import
```tsx
import { ColorPicker } from '@ui/components/base/ColorPicker';
```

### Basic Usage
```tsx
function MyComponent() {
  const [selectedColor, setSelectedColor] = useState('#3772FF');

  return (
    <ColorPicker
      value={selectedColor}
      onChange={setSelectedColor}
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `value` | String | No | Current color value in hex format | `"#3772FF"`, `"#ff0000"` |
| `onChange` | Function | No | Called when color changes | `(color) => setColor(color)` |
| `disabled` | Boolean | No | Makes color picker uninteractive | `true`, `false` |
| `size` | String | No | Size variant: `'small'`, `'medium'` (default), `'large'` | `"large"` |

### Common Examples

```tsx
// Basic color picker
<ColorPicker
  value={primaryColor}
  onChange={setPrimaryColor}
/>

// Different sizes
<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
  <ColorPicker
    value={color1}
    onChange={setColor1}
    size="small"
  />
  <ColorPicker
    value={color2}
    onChange={setColor2}
    size="medium"
  />
  <ColorPicker
    value={color3}
    onChange={setColor3}
    size="large"
  />
</div>

// Disabled color picker
<ColorPicker
  value="#cccccc"
  onChange={() => {}}
  disabled
/>

// Color picker with label
<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
  <label style={{ fontSize: 12, fontWeight: 500 }}>
    Accent Color
  </label>
  <ColorPicker
    value={accentColor}
    onChange={setAccentColor}
  />
</div>
```

### Real-World Usage Pattern
```tsx
function ThemeEditor() {
  const [colors, setColors] = useState({
    primary: '#3772FF',
    secondary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  });

  const updateColor = (colorKey: string, newColor: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: newColor
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3>Theme Colors</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Primary Color</label>
          <ColorPicker
            value={colors.primary}
            onChange={(color) => updateColor('primary', color)}
          />
        </div>

        <div>
          <label>Secondary Color</label>
          <ColorPicker
            value={colors.secondary}
            onChange={(color) => updateColor('secondary', color)}
          />
        </div>

        <div>
          <label>Success Color</label>
          <ColorPicker
            value={colors.success}
            onChange={(color) => updateColor('success', color)}
            size="small"
          />
        </div>

        <div>
          <label>Warning Color</label>
          <ColorPicker
            value={colors.warning}
            onChange={(color) => updateColor('warning', color)}
            size="small"
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4>Preview</h4>
        <div style={{
          padding: 16,
          backgroundColor: colors.primary,
          color: 'white',
          borderRadius: 8
        }}>
          Primary color preview
        </div>
      </div>
    </div>
  );
}
```

### Features

- **Native HTML Color Input**: Uses the browser's built-in color picker for maximum compatibility
- **Theming Integration**: Automatically adapts border colors to match your theme
- **Size Variants**: Three size options (small: 32px, medium: 40px, large: 56px)
- **Focus States**: Interactive border color changes on focus/blur
- **Disabled State**: Proper disabled styling with reduced opacity
- **Accessibility**: Inherits all native HTML color input accessibility features

### Notes

- Returns hex color values in the format `#RRGGBB`
- Supports all standard hex color formats
- Default value is `#3772FF` (blue) if no value provided
- Browser support is excellent across all modern browsers
- No external dependencies - uses native HTML functionality

---

## DatePicker

**What it's for**: Selecting dates for scheduling, filtering, or any date-related input.

**When to use**: For date selection in forms, filters, or scheduling features.

### Import
```tsx
import { DatePicker } from '@ui/components/base/DatePicker';
```
```

### Basic Usage
```tsx
function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <DatePicker
      value={selectedDate}
      onChange={setSelectedDate}
      placeholder="Select a date"
      format="MM/dd/yyyy"
    />
  );
}
```

---

## TimePicker

**What it's for**: Selecting time values for scheduling or time-related inputs.

**When to use**: For time selection in forms, scheduling features, or time-based configurations.

### Import
```tsx
import { TimePicker } from '@ui/components/base/TimePicker';
```

### Basic Usage
```tsx
function MyComponent() {
  const [selectedTime, setSelectedTime] = useState('12:00');

  return (
    <TimePicker
      value={selectedTime}
      onChange={setSelectedTime}
      placeholder="Select time"
    />
  );
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `value` | String | ✅ Yes | Current time value | `"14:30"`, `"2:30 PM"` |
| `onChange` | Function | ✅ Yes | Called when time changes | `(time) => setTime(time)` |
| `placeholder` | String | No | Placeholder text | `"Select time"` |
| `disabled` | Boolean | No | Makes time picker uneditable | `true`, `false` |
| `format` | String | No | Time format: `'24h'` or `'12h'` | `"12h"` |

### Common Examples

```tsx
// 24-hour format
<TimePicker
  value={startTime}
  onChange={setStartTime}
  format="24h"
  placeholder="Start time"
/>

// 12-hour format with AM/PM
<TimePicker
  value={endTime}
  onChange={setEndTime}
  format="12h"
  placeholder="End time"
/>

// Disabled time picker
<TimePicker
  value="09:00"
  onChange={() => {}}
  disabled
/>
```

---

## Form

**What it's for**: Top-level form wrapper with title, description, and consistent spacing.

**When to use**: To wrap form content and provide structure.

### Import
```tsx
import { Form } from '@ui/components/base/FormLayout';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <Form title="Settings" onSubmit={handleSubmit}>
      {/* Form content */}
    </Form>
  );
}
```

---

## FormGroup

**What it's for**: Groups related form elements with optional title and consistent spacing.

**When to use**: To organize related form fields together.

### Import
```tsx
import { FormGroup } from '@ui/components/base/FormLayout';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <FormGroup title="User Details">
      {/* Form rows and fields */}
    </FormGroup>
  );
}
```

---

## FormRow

**What it's for**: Horizontal layout of form elements in columns with responsive wrapping.

**When to use**: To place form fields side by side.

### Import
```tsx
import { FormRow } from '@ui/components/base/FormLayout';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <FormRow columns={2}>
      <FormField label="First Name">
        <Input value={firstName} onChange={setFirstName} />
      </FormField>
      <FormField label="Last Name">
        <Input value={lastName} onChange={setLastName} />
      </FormField>
    </FormRow>
  );
}
```

---

## FormField

**What it's for**: Wraps individual form elements with label, help text, and error handling.

**When to use**: To add labels and styling to form inputs.

### Import
```tsx
import { FormField } from '@ui/components/base/FormLayout';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <FormField label="Email" required>
      <Input value={email} onChange={setEmail} />
    </FormField>
  );
}
```

---

## Spinner

**What it's for**: Indicating loading states for operations without specific progress information.

**When to use**: For loading states, API calls, or any time you need to show that something is happening.

### Import
```tsx
import { Spinner } from '@ui/components/base/Spinner';
```

### Basic Usage
```tsx
function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    setIsLoading(true);
    try {
      await someAsyncOperation();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleLoad} disabled={isLoading}>
        {isLoading ? <Spinner size="small" /> : 'Load Data'}
      </Button>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spinner size="large" />
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}
```

---

## useSettings Hook

**What it's for**: Automatic settings persistence with save/load functionality.

**When to use**: For any plugin that needs to remember user preferences between sessions.

### Import
```tsx
import { useSettings } from '@ui/hooks/useSettings';
```

### Basic Usage
```tsx
function MyComponent() {
  const { settings, updateSettings, isLoading } = useSettings();

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <ToggleSwitch
        checked={settings.debugMode}
        onChange={(checked) => updateSettings({ debugMode: checked })}
        label="Debug Mode"
      />

      <ToggleSwitch
        checked={settings.theme === 'dark'}
        onChange={(checked) => updateSettings({ theme: checked ? 'dark' : 'light' })}
        label="Dark Mode"
      />
    </div>
  );
}
```

### Settings Interface
```tsx
interface PluginSettings {
  theme: 'light' | 'dark';
  debugMode: boolean;
  userText: string;
  lastSaved: string;
}
```

### Hook Returns
```tsx
const {
  settings,           // Current settings object
  updateSettings,     // Function to update settings
  saveSettings,       // Manual save function
  loadSettings,       // Manual load function
  clearSettings,      // Clear all settings
  isLoading,          // Loading state
  isSaving,           // Saving state
  isPersistent        // Whether storage is persistent
} = useSettings();
```

---

## LazyLoader

**What it's for**: Dynamic component loading to reduce initial bundle size and improve performance.

**When to use**: For heavy components that aren't immediately visible, complex views, or components with large dependencies.

### Import
```tsx
import { LazyLoader } from '@ui/components/base/LazyLoader';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <LazyLoader
      loader={() => import('@ui/components/views/HeavyComponent')}
    >
      {(module) => <module.HeavyComponent data={someData} />}
    </LazyLoader>
  );
}
```

### How It Works
1. **Dynamic Import**: Uses ES6 dynamic imports to load components only when needed
2. **Loading State**: Shows spinner while component is loading
3. **Error Handling**: Displays error UI if component fails to load
4. **Caching**: Once loaded, component is cached for subsequent renders
5. **Cancellation**: Cancels loading if component unmounts

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `loader` | Function | ✅ Yes | Function that returns dynamic import promise | `() => import('./Component')` |
| `children` | Function | ✅ Yes | Render function that receives loaded module | `(module) => <module.Component />` |
| `fallback` | ReactNode | No | Custom loading UI (defaults to Spinner) | `<div>Loading...</div>` |
| `errorFallback` | Function | No | Custom error UI function | `(error) => <div>Failed: {error.message}</div>` |

### Common Examples

```tsx
// Basic lazy loading
<LazyLoader
  loader={() => import('@ui/components/views/DataView')}
>
  {(module) => <module.DataView />}
</LazyLoader>

// With props passed to lazy component
<LazyLoader
  loader={() => import('@ui/components/views/FormsView')}
>
  {(module) => <module.FormsView settings={settings} onSave={handleSave} />}
</LazyLoader>

// Custom loading indicator
<LazyLoader
  loader={() => import('@ui/components/complex/ChartComponent')}
  fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading chart...</div>}
>
  {(module) => <module.ChartComponent data={chartData} />}
</LazyLoader>

// Custom error handling
<LazyLoader
  loader={() => import('@ui/components/experimental/NewFeature')}
  errorFallback={(error) => (
    <div style={{ padding: 16, color: 'red' }}>
      <h4>Feature Unavailable</h4>
      <p>This feature couldn't be loaded: {error.message}</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )}
>
  {(module) => <module.NewFeature />}
</LazyLoader>
```

### Tab-Based Lazy Loading
Commonly used in tabbed interfaces to only load tab content when accessed:

```tsx
function TabbedInterface() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: <OverviewPanel />  // Always loaded
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: (
        <LazyLoader
          loader={() => import('@ui/components/analytics/AnalyticsPanel')}
        >
          {(module) => <module.AnalyticsPanel />}
        </LazyLoader>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      content: (
        <LazyLoader
          loader={() => import('@ui/components/settings/SettingsPanel')}
        >
          {(module) => <module.SettingsPanel />}
        </LazyLoader>
      )
    }
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={setActiveTab}
    />
  );
}
```

### Real-World Usage Pattern
```tsx
function PluginInterface() {
  return (
    <Tabs
      tabs={[
        {
          id: 'start',
          label: 'Start',
          content: <StartView />  // Immediately visible, not lazy
        },
        {
          id: 'forms',
          label: 'Forms',
          content: (
            <LazyLoader
              loader={() => import('@ui/components/views/FormsView')}
              fallback={<div style={{ textAlign: 'center', padding: 20 }}>Loading forms...</div>}
            >
              {(module) => <module.FormsView />}
            </LazyLoader>
          )
        },
        {
          id: 'data',
          label: 'Data',
          content: (
            <LazyLoader
              loader={() => import('@ui/components/views/DataView')}
            >
              {(module) => (
                <module.DataView
                  settings={settings}
                  onSettingsChange={updateSettings}
                  debugMode={debugMode}
                />
              )}
            </LazyLoader>
          )
        }
      ]}
      activeTab={activeTab}
      onChange={setActiveTab}
    />
  );
}
```

### Performance Benefits
- **Reduced Initial Bundle**: Heavy components don't increase initial load time
- **Faster Startup**: Plugin starts faster with smaller initial JavaScript bundle
- **Memory Efficiency**: Components only loaded when actually needed
- **Progressive Loading**: Users can interact with loaded parts while others load
- **Better UX**: Immediate response on first tab, smooth loading for others

### Component Requirements
For components to work with LazyLoader, they must be:

1. **Default or Named Exports**: Use consistent export patterns
```tsx
// ✅ Good: Named export
export function MyComponent() { ... }

// ✅ Good: Default export
export default function MyComponent() { ... }

// ✅ Good: Multiple exports
export function ComponentA() { ... }
export function ComponentB() { ... }
```

2. **Self-Contained**: No direct dependencies on parent component state
```tsx
// ✅ Good: Props-based dependencies
function LazyComponent({ data, onSave }) {
  return <div>{data.title}</div>;
}

// ❌ Bad: Direct parent state access
function LazyComponent() {
  const data = useContext(ParentContext);  // May not be available
  return <div>{data.title}</div>;
}
```

### Error Scenarios
LazyLoader handles these error cases:
- **Network failures**: When dynamic import fails due to connectivity
- **Missing files**: When bundled component files are not found
- **Component errors**: When the component itself throws during loading
- **Cancellation**: When component unmounts before loading completes

### Best Practices
- Use for components > 50KB or with heavy dependencies
- Provide meaningful loading states for better UX
- Test lazy loading in development and production builds
- Consider grouping related components in the same lazy module
- Use for routes or major view components, not small UI elements

---

## ErrorBoundary

**What it's for**: Catching JavaScript errors in child components with automatic recovery, retry mechanisms, and detailed error reporting.

**When to use**: Wrap components that might throw errors, around risky operations, or at application boundaries to prevent crashes.

### Import
```tsx
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Caught error:', error, errorInfo);
        showToast('An error occurred!', 'error');
      }}
    >
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

### Enhanced Features

#### Automatic Recovery
```tsx
<ErrorBoundary
  maxRetries={3}
  autoRecover={true}
  recoveryDelay={5000}
>
  <UnstableComponent />
</ErrorBoundary>
```

#### Custom Error UI
```tsx
<ErrorBoundary
  fallback={(error, errorInfo, retry) => (
    <div style={{ padding: 16, border: '1px solid red' }}>
      <h3>Custom Error Display</h3>
      <p>Error: {error.message}</p>
      <Button onClick={retry}>Try Again</Button>
      <Button onClick={() => window.location.reload()}>Reload Plugin</Button>
    </div>
  )}
>
  <MyRiskyComponent />
</ErrorBoundary>
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `children` | ReactNode | ✅ Yes | Components to wrap with error boundary | `<MyComponent />` |
| `fallback` | Function | No | Custom error UI function | `(error, errorInfo, retry) => <CustomErrorUI />` |
| `onError` | Function | No | Error handler callback | `(error, errorInfo) => logError(error)` |
| `maxRetries` | Number | No | Maximum retry attempts (default: 3) | `5` |
| `autoRecover` | Boolean | No | Enable automatic recovery (default: false) | `true` |
| `recoveryDelay` | Number | No | Auto-recovery delay in ms (default: 5000) | `3000` |

### Error State Management
- **Error Count Tracking**: Tracks consecutive errors to prevent infinite retry loops
- **Retry Limits**: Prevents endless retry attempts with configurable maximum
- **Recovery Delay**: Configurable delay before auto-recovery attempts
- **Reset Capability**: Full state reset to clear error history

### Error Information Display
The enhanced ErrorBoundary shows:
- **Error Count**: Number of consecutive errors
- **Error Details**: Expandable section with full error information
- **Component Stack**: Shows where in the component tree the error occurred
- **Stack Trace**: Full JavaScript stack trace for debugging
- **Retry Controls**: Manual retry and reset buttons

### Retry Mechanisms
```tsx
// Manual retry only
<ErrorBoundary maxRetries={3}>
  <Component />
</ErrorBoundary>

// Automatic recovery with delay
<ErrorBoundary
  maxRetries={3}
  autoRecover={true}
  recoveryDelay={3000}
>
  <Component />
</ErrorBoundary>

// Unlimited manual retries
<ErrorBoundary maxRetries={Infinity}>
  <Component />
</ErrorBoundary>
```

### Application-Level Protection
Wrap your entire app for comprehensive error handling:

```tsx
function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary
        maxRetries={3}
        autoRecover={true}
        onError={(error, errorInfo) => {
          console.error('🚨 App Level Error:', error, errorInfo);
          Toast.error('Application error occurred. Attempting recovery...');
        }}
      >
        <MainApplication />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
```

### Component-Level Protection
Wrap individual risky components:

```tsx
function DataProcessor() {
  return (
    <div>
      <h2>Data Processing</h2>

      <ErrorBoundary
        maxRetries={2}
        onError={(error) => {
          analytics.track('data_processing_error', { error: error.message });
        }}
      >
        <ComplexDataView />
      </ErrorBoundary>

      <ErrorBoundary
        maxRetries={1}
        fallback={(error, errorInfo, retry) => (
          <div>
            <p>Chart failed to load</p>
            <Button onClick={retry}>Retry Chart</Button>
          </div>
        )}
      >
        <ExpensiveChart />
      </ErrorBoundary>
    </div>
  );
}
```

### Development vs Production
```tsx
const isDevelopment = process.env.NODE_ENV === 'development';

<ErrorBoundary
  maxRetries={isDevelopment ? 1 : 3}
  autoRecover={!isDevelopment}
  onError={(error, errorInfo) => {
    if (isDevelopment) {
      console.error('Development Error:', error, errorInfo);
    } else {
      sendErrorToLoggingService(error, errorInfo);
    }
  }}
>
  <ProductionComponent />
</ErrorBoundary>
```

### Features Summary
- **Progressive Retry**: Retry attempts with limits to prevent infinite loops
- **Auto-Recovery**: Configurable automatic recovery with delays
- **Detailed Logging**: Enhanced error information with component stacks
- **User Feedback**: Warning indicators for repeated errors
- **Reset Capability**: Full state reset option
- **Theme Integration**: Error UI adapts to light/dark themes
- **Accessibility**: Proper focus management and screen reader support

---

## Theme System

**What it's for**: Consistent theming across all components with light/dark mode support.

**When to use**: All components automatically use the theme system. Use the theme context for custom styling.

### Import
```tsx
import { useTheme } from '@ui/contexts/ThemeContext';
```

### Basic Usage
```tsx
function MyComponent() {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.textColor,
      padding: 16,
      borderRadius: 8
    }}>
      <h3 style={{ color: colors.accent }}>Custom Themed Component</h3>
      <p style={{ color: colors.textSecondary }}>
        This component uses theme colors automatically.
      </p>
      <Button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </Button>
    </div>
  );
}
```

### Available Theme Colors
```tsx
const { colors } = useTheme();

// Text colors
colors.textColor      // Primary text
colors.textSecondary  // Secondary/muted text
colors.textInverse    // Inverse text (white on dark, black on light)

// Background colors
colors.background     // Main background
colors.backgroundHover // Hover states
colors.surface        // Card/panel backgrounds

// Interactive colors
colors.accent         // Brand/accent color
colors.accentHover    // Accent hover state
colors.border         // Border colors
colors.focus          // Focus ring colors

// Status colors
colors.success        // Success states
colors.error          // Error states
colors.warning        // Warning states
colors.info          // Info states
```

---

## Plugin Messaging System

The enhanced plugin messaging system enables optimized communication between the UI thread and the main Figma thread with object pooling, memory management, and improved error handling.

### Architecture

- **UI Thread**: Runs in an iframe with access to React/Preact and web APIs
- **Main Thread**: Runs in Figma's sandbox with access to the Figma API and document nodes
- **Communication**: Bidirectional message passing using `postMessage` API with object pooling
- **Memory Optimization**: Message object pooling to reduce garbage collection
- **Error Recovery**: Enhanced error handling with serialization safety

### Enhanced Messaging Features

#### Object Pooling
The messaging system now includes object pooling to reduce garbage collection during high-frequency messaging:

```tsx
import { messagePool } from '@shared/messagePool';

// Messages are automatically pooled and reused
function sendOptimizedMessage(type: string, data: any) {
  const message = messagePool.get(type);
  message.data = data;
  message.timestamp = Date.now();

  parent.postMessage({ pluginMessage: message }, '*');

  // Message is automatically returned to pool after sending
  messagePool.release(message);
}
```

#### Safe Serialization
Enhanced message sending with automatic serialization safety:

```tsx
import { sendToUI } from '@shared/messaging';

// Automatically handles serialization errors
sendToUI('COMPLEX_DATA', {
  nodes: processedNodes,
  metadata: extractedMetadata
});

// If serialization fails, automatically sends error message instead
```

### UI to Main Thread Communication

#### Enhanced Sending
```tsx
function sendToMain(type: string, data?: any) {
  parent.postMessage({
    pluginMessage: {
      type,
      data,
      timestamp: Date.now()
    }
  }, '*');
}

// Examples with different data types
sendToMain('SCAN_NODES');
sendToMain('EXPORT_SELECTION', {
  format: 'PNG',
  scale: 2,
  includeMetadata: true
});
sendToMain('BATCH_PROCESS', {
  items: selectedItems,
  options: processingOptions
});
```

### Main Thread to UI Communication

#### Enhanced Response Handling
```typescript
import { sendToUI, sendProgress, sendError, sendSuccess } from '@shared/messaging';

// Basic response with automatic safety checks
sendToUI('OPERATION_COMPLETE', {
  processedCount: 42,
  timestamp: Date.now()
});

// Progress updates with built-in formatting
sendProgress(65, 'Processing components', 13, 20, 'Button Component');

// Error handling with context
sendError(
  'Failed to process selection',
  'Node type not supported',
  'UNSUPPORTED_NODE_TYPE'
);

// Success responses with summary
sendSuccess('EXPORT_OPERATION', {
  files: exportedFiles,
  totalSize: '2.4MB'
}, 'Export completed successfully');
```

#### Batch Processing with Progress
```typescript
import { SafeBatchProcessor } from '@shared/messaging';

async function processManyNodes(nodes: SceneNode[]) {
  const processor = new SafeBatchProcessor(
    nodes,
    async (node, index) => {
      // Process individual node
      return await processNode(node);
    },
    {
      batchSize: 10,
      onProgress: (progress, current, total) => {
        sendProgress(progress, `Processing nodes`, current, total);
      },
      onBatchComplete: (results, batchIndex) => {
        console.log(`Batch ${batchIndex} completed`);
      }
    }
  );

  try {
    const results = await processor.process();
    sendSuccess('BATCH_PROCESS', { results });
  } catch (error) {
    sendError('Batch processing failed', error.message);
  }
}
```

### Receiving Messages in UI

#### Enhanced Message Handling
```tsx
import { extractMessageSafely } from '@shared/messaging';

// Automatic message extraction with safety checks
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const message = extractMessageSafely(event);
    if (!message) return;

    switch (message.type) {
      case 'PROCESS_COMPLETE':
        handleProcessComplete(message.data);
        break;
      case 'PROGRESS':
        updateProgress(message.data);
        break;
      case 'ERROR':
        handleError(message.data);
        break;
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

### Advanced Async Operations

#### Debounced Operations
```tsx
import { createDebouncer } from '@shared/asyncUtils';

// Debounce frequent operations to reduce message spam
const debouncedSave = createDebouncer(
  (data: any) => {
    sendToMain('SAVE_SETTINGS', data);
  },
  500,  // 500ms delay
  {
    leading: false,
    trailing: true,
    maxWait: 2000  // Maximum 2s wait
  }
);

// Usage in component
function SettingsPanel() {
  const handleChange = (newSettings: any) => {
    setLocalSettings(newSettings);
    debouncedSave(newSettings);  // Debounced save
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, []);
}
```

#### Cancelable Operations
```tsx
import { createCancelablePromise } from '@shared/asyncUtils';

function LongRunningOperation() {
  const [operation, setOperation] = useState(null);

  const startOperation = () => {
    const { promise, cancel, isCanceled } = createCancelablePromise(
      async (signal) => {
        // Send start message
        sendToMain('START_LONG_OPERATION', { signal });

        // Wait for completion
        return new Promise((resolve, reject) => {
          const handleMessage = (event) => {
            const message = extractMessageSafely(event);
            if (message?.type === 'LONG_OPERATION_COMPLETE') {
              resolve(message.data);
            } else if (message?.type === 'ERROR') {
              reject(new Error(message.data.error));
            }
          };

          window.addEventListener('message', handleMessage);
          signal.addEventListener('abort', () => {
            window.removeEventListener('message', handleMessage);
            reject(new Error('Operation was canceled'));
          });
        });
      }
    );

    setOperation({ promise, cancel, isCanceled });

    promise
      .then(result => {
        console.log('Operation completed:', result);
        setOperation(null);
      })
      .catch(error => {
        if (!isCanceled()) {
          console.error('Operation failed:', error);
        }
        setOperation(null);
      });
  };

  const cancelOperation = () => {
    if (operation) {
      operation.cancel();
      sendToMain('CANCEL_OPERATION');
    }
  };

  return (
    <div>
      <Button
        onClick={startOperation}
        disabled={operation !== null}
      >
        Start Operation
      </Button>
      {operation && (
        <Button onClick={cancelOperation} variant="secondary">
          Cancel
        </Button>
      )}
    </div>
  );
}
```

#### Retry with Exponential Backoff
```tsx
import { retryWithBackoff } from '@shared/asyncUtils';

async function reliableOperation() {
  try {
    const result = await retryWithBackoff(
      async () => {
        // Send request to main thread
        sendToMain('UNRELIABLE_OPERATION');

        // Wait for response
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Operation timeout'));
          }, 5000);

          const handleMessage = (event) => {
            const message = extractMessageSafely(event);
            if (message?.type === 'OPERATION_SUCCESS') {
              clearTimeout(timeout);
              resolve(message.data);
            } else if (message?.type === 'ERROR') {
              clearTimeout(timeout);
              reject(new Error(message.data.error));
            }
          };

          window.addEventListener('message', handleMessage, { once: true });
        });
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2
      }
    );

    console.log('Operation succeeded:', result);
    return result;
  } catch (error) {
    console.error('Operation failed after retries:', error);
    throw error;
  }
}
```

### Memory Management

#### Message Pool Configuration
```tsx
import { messagePool } from '@shared/messagePool';

// Check pool status
console.log('Pool size:', messagePool.getPoolSize());

// Clear pool if needed (useful for cleanup)
messagePool.clear();

// Pool automatically manages up to 50 messages by default
// Older messages are automatically garbage collected
```

#### Event Listener Cleanup
```tsx
import { useWindowResize } from '@ui/hooks/useWindowResize';

// Enhanced useWindowResize with proper cleanup
function MyComponent() {
  const containerRef = useWindowResize(
    400,  // minWidth
    300,  // minHeight
    1200, // maxWidth
    800,  // maxHeight
    48    // extraPadding
  );

  // ResizeObserver is automatically cleaned up on unmount
  // No memory leaks from event listeners

  return <div ref={containerRef}>Content</div>;
}
```

### Error Handling Patterns

#### Comprehensive Error Handling
```tsx
// Main thread error handling
try {
  const result = await complexOperation(data);
  sendSuccess('COMPLEX_OPERATION', result);
} catch (error) {
  sendError(
    'Complex operation failed',
    error.message,
    'COMPLEX_OP_ERROR'
  );
}

// UI thread error handling
usePluginMessages({
  ERROR: (data) => {
    console.error(`Error (${data.code}):`, data.error);
    if (data.details) {
      console.error('Details:', data.details);
    }

    Toast.error(`${data.error}${data.details ? ': ' + data.details : ''}`);
  },

  COMPLEX_OPERATION_COMPLETE: (data) => {
    if (data.success) {
      Toast.success(data.summary || 'Operation completed');
      setResults(data.data);
    }
  }
});
```

---

## DataGrid

**What it's for**: Enterprise-grade data table with comprehensive editing capabilities, virtual scrolling, column management, and 11 different form control types.

**When to use**: For displaying and editing structured data, spreadsheet-like interfaces, form-heavy data entry, or any scenario requiring inline editing with multiple control types.

### Import
```tsx
import { DataGrid, DataGridColumn } from '@ui/components/base/DataGrid';
```

### Basic Usage
```tsx
interface DataItem {
  id: number;
  name: string;
  type: string;
  enabled: boolean;
}

function MyComponent() {
  const [data, setData] = useState<DataItem[]>([
    { id: 1, name: 'Item 1', type: 'A', enabled: true },
    { id: 2, name: 'Item 2', type: 'B', enabled: false }
  ]);

  const columns: DataGridColumn<DataItem>[] = [
    {
      key: 'id',
      title: 'ID',
      width: 80,
      type: 'number',
      sortable: true
    },
    {
      key: 'name',
      title: 'Name',
      width: 200,
      type: 'text',
      editable: true
    },
    {
      key: 'type',
      title: 'Type',
      width: 120,
      type: 'select',
      editable: true,
      options: [
        { value: 'A', label: 'Type A' },
        { value: 'B', label: 'Type B' }
      ]
    },
    {
      key: 'enabled',
      title: 'Enabled',
      width: 100,
      type: 'boolean',
      editable: true
    }
  ];

  const handleDataChange = (delta) => {
    if (delta.updated) {
      setData(currentData =>
        currentData.map(row => {
          const updated = delta.updated?.find(u => u.id === row.id);
          return updated ? { ...row, ...updated } : row;
        })
      );
    }
  };

  return (
    <DataGrid
      data={data}
      columns={columns}
      rowKey="id"
      height={400}
      onDataChange={handleDataChange}
    />
  );
}
```

### Column Types

The DataGrid supports 11 different form control types:

#### 1. Text Input
```tsx
{
  key: 'description',
  title: 'Description',
  type: 'text',
  editable: true,
  width: 200
}
```

#### 2. Number Input
```tsx
{
  key: 'quantity',
  title: 'Quantity',
  type: 'number',
  editable: true,
  width: 100
}
```

#### 3. Select Dropdown
```tsx
{
  key: 'category',
  title: 'Category',
  type: 'select',
  editable: true,
  width: 150,
  options: [
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' }
  ]
}
```

#### 4. Boolean Checkbox
```tsx
{
  key: 'active',
  title: 'Active',
  type: 'boolean',
  editable: true,
  width: 80
}
```

#### 5. Toggle Switch
```tsx
{
  key: 'featured',
  title: 'Featured',
  type: 'toggle',
  editable: true,
  width: 100
}
```

#### 6. Date Picker
```tsx
{
  key: 'createdDate',
  title: 'Created',
  type: 'date',
  editable: true,
  width: 140,
  formatter: (value) => new Date(value).toLocaleDateString()
}
```

#### 7. Time Picker
```tsx
{
  key: 'scheduledTime',
  title: 'Time',
  type: 'time',
  editable: true,
  width: 100
}
```

#### 8. Color Picker
```tsx
{
  key: 'themeColor',
  title: 'Color',
  type: 'color',
  editable: true,
  width: 120
}
```

#### 9. Textarea
```tsx
{
  key: 'notes',
  title: 'Notes',
  type: 'textarea',
  editable: true,
  width: 250
}
```

#### 10. URL Input
```tsx
{
  key: 'website',
  title: 'Website',
  type: 'url',
  editable: true,
  width: 200
}
```

#### 11. Email Input
```tsx
{
  key: 'contactEmail',
  title: 'Email',
  type: 'email',
  editable: true,
  width: 200
}
```

### All Props Explained

| Prop | Type | Required | Description | Example |
|------|------|----------|-------------|---------|
| `data` | Array | ✅ Yes | Array of data objects | `[{id: 1, name: 'Item'}]` |
| `columns` | Array | ✅ Yes | Column definitions | `[{key: 'name', title: 'Name'}]` |
| `rowKey` | String | ✅ Yes | Unique key property for rows | `"id"` |
| `height` | Number | No | Fixed grid height in pixels | `400` |
| `editTrigger` | String | No | Edit trigger: `'single'`, `'double'`, `'manual'` | `"single"` |
| `selectionMode` | String | No | Selection mode: `'none'`, `'single'`, `'multi'` | `"multi"` |
| `virtualizeRows` | Boolean | No | Enable row virtualization for large datasets | `true` |
| `stickyFirstColumn` | Boolean | No | Keep first column visible when scrolling | `true` |
| `aggregatable` | Boolean | No | Enable column aggregation features | `true` |
| `onDataChange` | Function | No | Called when data is modified | `(delta) => handleChange(delta)` |
| `onSelectionChange` | Function | No | Called when selection changes | `(selection) => setSelected(selection)` |

### Column Configuration

Each column object supports these properties:

| Property | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `key` | String | ✅ Yes | Data property key | `"name"` |
| `title` | String | ✅ Yes | Column header text | `"Product Name"` |
| `type` | String | No | Data/editor type | `"text"`, `"number"`, `"select"` |
| `width` | Number | No | Column width in pixels | `200` |
| `minWidth` | Number | No | Minimum width when resizing | `100` |
| `maxWidth` | Number | No | Maximum width when resizing | `300` |
| `resizable` | Boolean | No | Allow column resizing | `true` |
| `sortable` | Boolean | No | Allow column sorting | `true` |
| `editable` | Boolean | No | Allow inline editing | `true` |
| `options` | Array | No | Options for select type | `[{value: 'a', label: 'Option A'}]` |
| `formatter` | Function | No | Custom value formatter | `(value) => formatValue(value)` |

### Advanced Features

#### Virtual Scrolling
For large datasets (1000+ rows):
```tsx
<DataGrid
  data={largeDataset}
  columns={columns}
  rowKey="id"
  height={400}
  virtualizeRows={true}
/>
```

#### Column Resizing
```tsx
const columns = [
  {
    key: 'name',
    title: 'Name',
    width: 200,
    minWidth: 150,
    maxWidth: 300,
    resizable: true
  }
];
```

#### Selection Handling
```tsx
const [selectedItems, setSelectedItems] = useState([]);

<DataGrid
  data={data}
  columns={columns}
  rowKey="id"
  selectionMode="multi"
  onSelectionChange={(selection) => {
    setSelectedItems(selection);
    console.log('Selected:', selection);
  }}
/>
```

#### Data Change Handling
```tsx
const handleDataChange = (delta) => {
  console.log('Data changes:', delta);

  // Handle updates
  if (delta.updated) {
    setData(currentData =>
      currentData.map(row => {
        const updated = delta.updated?.find(u => u.id === row.id);
        return updated ? { ...row, ...updated } : row;
      })
    );
  }

  // Handle additions
  if (delta.added) {
    setData(currentData => [...currentData, ...delta.added]);
  }

  // Handle deletions
  if (delta.deleted) {
    const deletedIds = delta.deleted.map(d => d.id);
    setData(currentData =>
      currentData.filter(row => !deletedIds.includes(row.id))
    );
  }
};
```

### Real-World Example

```tsx
interface ProductData {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  featured: boolean;
  launchDate: string;
  availableTime: string;
  brandColor: string;
  website: string;
  contactEmail: string;
}

function ProductManager() {
  const [products, setProducts] = useState<ProductData[]>([]);

  const columns: DataGridColumn<ProductData>[] = [
    {
      key: 'id',
      title: 'ID',
      width: 60,
      type: 'number',
      sortable: true
    },
    {
      key: 'name',
      title: 'Product Name',
      width: 200,
      minWidth: 150,
      maxWidth: 300,
      type: 'text',
      editable: true,
      resizable: true,
      sortable: true
    },
    {
      key: 'description',
      title: 'Description',
      width: 250,
      type: 'textarea',
      editable: true,
      resizable: true
    },
    {
      key: 'price',
      title: 'Price',
      width: 100,
      type: 'number',
      editable: true,
      sortable: true,
      formatter: (value) => `$${value.toFixed(2)}`
    },
    {
      key: 'category',
      title: 'Category',
      width: 120,
      type: 'select',
      editable: true,
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'books', label: 'Books' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'home', label: 'Home & Garden' }
      ]
    },
    {
      key: 'inStock',
      title: 'In Stock',
      width: 80,
      type: 'boolean',
      editable: true
    },
    {
      key: 'featured',
      title: 'Featured',
      width: 90,
      type: 'toggle',
      editable: true
    },
    {
      key: 'launchDate',
      title: 'Launch Date',
      width: 120,
      type: 'date',
      editable: true,
      formatter: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'availableTime',
      title: 'Available',
      width: 100,
      type: 'time',
      editable: true
    },
    {
      key: 'brandColor',
      title: 'Brand Color',
      width: 110,
      type: 'color',
      editable: true
    },
    {
      key: 'website',
      title: 'Website',
      width: 200,
      type: 'url',
      editable: true
    },
    {
      key: 'contactEmail',
      title: 'Contact',
      width: 200,
      type: 'email',
      editable: true
    }
  ];

  const handleDataChange = (delta) => {
    if (delta.updated) {
      setProducts(currentProducts =>
        currentProducts.map(product => {
          const updated = delta.updated?.find(u => u.id === product.id);
          return updated ? { ...product, ...updated } : product;
        })
      );

      // Save to backend
      delta.updated.forEach(async (updatedProduct) => {
        try {
          await saveProduct(updatedProduct);
          Toast.success(`Updated ${updatedProduct.name}`);
        } catch (error) {
          Toast.error(`Failed to save ${updatedProduct.name}`);
        }
      });
    }
  };

  const handleSelectionChange = (selection) => {
    console.log(`Selected ${selection.length} products:`, selection);
  };

  return (
    <Panel title="Product Management">
      <DataGrid
        data={products}
        columns={columns}
        rowKey="id"
        height={600}
        editTrigger="single"
        selectionMode="multi"
        virtualizeRows={true}
        stickyFirstColumn={true}
        aggregatable={false}
        onDataChange={handleDataChange}
        onSelectionChange={handleSelectionChange}
      />
    </Panel>
  );
}
```

### Performance Features

- **Virtual Scrolling**: Handles thousands of rows efficiently
- **Theme Integration**: All colors adapt to light/dark themes automatically
- **Column Resizing**: Smooth resizing with min/max constraints
- **Sticky Columns**: Keep important columns visible during horizontal scrolling
- **Optimized Rendering**: Only renders visible cells for better performance
- **Memory Efficient**: Minimal re-renders during editing

### Editing Modes

- **Single Click**: Edit on single click (default)
- **Double Click**: Edit on double click for accidental edit prevention
- **Manual**: Programmatic editing control

### Accessibility

- **Keyboard Navigation**: Full keyboard support for navigation and editing
- **Screen Reader**: Proper ARIA labels and roles
- **Focus Management**: Logical tab order and focus indicators
- **Theme Contrast**: Automatic text color adjustment for proper contrast

---

## Async Utilities

**What it's for**: Advanced async operation management including debouncing, throttling, cancelable promises, retry logic, and batch processing.
    }
  }
});
```

### Performance Optimization

#### High-Frequency Message Handling
```tsx
import { createThrottler } from '@shared/asyncUtils';

// Throttle high-frequency updates
const throttledProgressUpdate = createThrottler(
  (progress: number) => {
    setProgress(progress);
    updateProgressBar(progress);
  },
  100  // Max once per 100ms
);

usePluginMessages({
  PROGRESS: (data) => {
    throttledProgressUpdate(data.progress);
  }
});
```

#### Bulk Message Processing
```tsx
import { ComputationTasks } from '@shared/workerUtils';

// Process large datasets efficiently
async function processLargeDataset(items: any[]) {
  const results = await ComputationTasks.processArray(
    items,
    async (item, index) => {
      // Process individual item
      return await processItem(item);
    },
    {
      chunkSize: 50,  // Process 50 items at a time
      onProgress: (progress) => {
        setProcessingProgress(progress);
      }
    }
  );

  return results;
}
```

### Best Practices

#### Memory-Safe Data Extraction
```typescript
// ✅ Good: Extract primitives with type safety
function extractNodeData(node: SceneNode): any {
  return {
    id: String(node.id),
    name: String(node.name),
    type: String(node.type),
    x: Number(node.x) || 0,
    y: Number(node.y) || 0,
    width: Number(node.width) || 0,
    height: Number(node.height) || 0,
    visible: Boolean(node.visible),
    locked: Boolean(node.locked),
    // Only include serializable properties
    fills: 'fills' in node ? node.fills?.map(fill => ({
      type: fill.type,
      color: fill.type === 'SOLID' ? fill.color : null
    })) : null
  };
}

// ❌ Bad: Direct node references
function badExtractNodeData(node: SceneNode): any {
  return {
    node: node,  // Contains non-serializable references
    parent: node.parent,  // Can cause circular references
    children: 'children' in node ? node.children : null  // Deep object graphs
  };
}
```

#### Efficient Message Patterns
```typescript
// ✅ Good: Batch similar operations
const batchedUpdates = [];
items.forEach(item => {
  batchedUpdates.push(processItem(item));
});

sendToUI('BATCH_UPDATE', {
  updates: batchedUpdates,
  timestamp: Date.now()
});

// ❌ Bad: Individual messages for each item
items.forEach(item => {
  sendToUI('ITEM_UPDATE', { item });  // Creates message spam
});
```

#### Resource Cleanup
```tsx
// ✅ Good: Proper cleanup patterns
useEffect(() => {
  const debouncedSave = createDebouncer(saveData, 500);
  const cancelableOperation = createCancelablePromise(longOperation);

  return () => {
    // Clean up all resources
    debouncedSave.cancel();
    cancelableOperation.cancel();
    messagePool.clear();
  };
}, []);
```

### Common Message Types

#### Standard Messages
- `PING` / `PONG` - Connectivity testing
- `GET_SELECTION` / `SELECTION_RESULT` - Selection analysis
- `SCAN_NODES` / `SCAN_COMPLETE` - Document scanning
- `EXPORT_*` / `EXPORT_COMPLETE` - Export operations
- `PROGRESS` - Progress updates with consolidation
- `ERROR` - Error notifications with context
- `SUCCESS` - Success confirmations with summaries

#### Enhanced Messages
- `BATCH_PROCESS` / `BATCH_COMPLETE` - Bulk operations
- `CANCEL_OPERATION` - Operation cancellation
- `MEMORY_CLEANUP` - Memory management
- `VALIDATION_ERROR` - Data validation failures
- `RETRY_OPERATION` - Retry requests with backoff

---

## Async Utilities

**What it's for**: Advanced async operation helpers including debouncing, throttling, cancellation, and retry mechanisms with proper cleanup.

**When to use**: For optimizing performance, preventing race conditions, managing frequent function calls, and handling long-running operations.

### Import
```tsx
import {
  createDebouncer,
  createThrottler,
  createCancelablePromise,
  retryWithBackoff
} from '@shared/asyncUtils';
```

### createDebouncer

**What it's for**: Delays function execution until after a specified delay, preventing excessive calls from frequent events.

**When to use**: For search inputs, save operations, resize handlers, API calls triggered by user input, or any operation that shouldn't execute on every change.

#### Basic Usage
```tsx
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => createDebouncer(async (term: string) => {
      if (!term.trim()) return;
      const searchResults = await searchAPI(term);
      setResults(searchResults);
    }, 300),
    []
  );

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);  // Only calls API after 300ms of no typing
  };

  return (
    <div>
      <Input
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search..."
      />
      {/* Results display */}
    </div>
  );
}
```

#### Advanced Options
```tsx
// Leading edge: Execute immediately, then wait
const leadingDebouncer = createDebouncer(
  () => console.log('Immediate execution'),
  1000,
  { leading: true, trailing: false }
);

// Trailing edge: Wait, then execute (default)
const trailingDebouncer = createDebouncer(
  () => console.log('Delayed execution'),
  1000,
  { leading: false, trailing: true }
);

// Both edges: Execute immediately AND after delay
const bothEdgesDebouncer = createDebouncer(
  () => console.log('Both immediate and delayed'),
  1000,
  { leading: true, trailing: true }
);

// Maximum wait: Ensures execution even with continuous calls
const maxWaitDebouncer = createDebouncer(
  () => console.log('Guaranteed execution'),
  500,
  { maxWait: 2000 }  // Will execute at least every 2 seconds
);
```

#### Manual Control
```tsx
function AutoSaveComponent() {
  const [data, setData] = useState('');

  const debouncedSave = useMemo(
    () => createDebouncer(async (content: string) => {
      await saveToAPI(content);
      console.log('Auto-saved!');
    }, 1000),
    []
  );

  const handleChange = (newData: string) => {
    setData(newData);
    debouncedSave(newData);
  };

  const handleManualSave = () => {
    // Cancel pending auto-save and save immediately
    debouncedSave.cancel();
    saveToAPI(data);
  };

  const handleForceFlush = () => {
    // Execute any pending debounced call immediately
    debouncedSave.flush();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => debouncedSave.cancel();
  }, [debouncedSave]);

  return (
    <div>
      <Textbox value={data} onValueInput={handleChange} />
      <Button onClick={handleManualSave}>Save Now</Button>
      <Button onClick={handleForceFlush}>Flush Pending</Button>
    </div>
  );
}
```

### createThrottler

**What it's for**: Limits function execution to at most once per specified interval, useful for rate limiting.

**When to use**: For scroll handlers, mouse move events, resize handlers, or any high-frequency event where you need regular but limited execution.

#### Basic Usage
```tsx
function ScrollTracker() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const throttledScroll = useMemo(
    () => createThrottler((event: Event) => {
      const position = window.scrollY;
      setScrollPosition(position);
      console.log('Scroll position:', position);
    }, 100),  // Maximum once every 100ms
    []
  );

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      throttledScroll.cancel();
    };
  }, [throttledScroll]);

  return <div>Scroll position: {scrollPosition}</div>;
}
```

#### Throttle Options
```tsx
// Leading edge only: Execute immediately, then wait
const leadingThrottler = createThrottler(
  handleResize,
  250,
  { leading: true, trailing: false }
);

// Trailing edge only: Wait, then execute at end of interval
const trailingThrottler = createThrottler(
  handleResize,
  250,
  { leading: false, trailing: true }
);

// Both edges: Execute immediately AND at end (default)
const bothEdgesThrottler = createThrottler(
  handleResize,
  250,
  { leading: true, trailing: true }
);
```

### createCancelablePromise

**What it's for**: Wraps promises with cancellation capability to prevent race conditions and memory leaks.

**When to use**: For API calls, file operations, or any async operation that might become irrelevant before completion.

#### Basic Usage
```tsx
function DataLoader() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelableRef = useRef(null);

  const loadData = async (id: string) => {
    // Cancel previous request if still pending
    if (cancelableRef.current) {
      cancelableRef.current.cancel();
    }

    setLoading(true);

    // Create cancelable API call
    const cancelable = createCancelablePromise(async (signal) => {
      const response = await fetch(`/api/data/${id}`, { signal });
      return response.json();
    });

    cancelableRef.current = cancelable;

    try {
      const result = await cancelable.promise;
      setData(result);
    } catch (error) {
      if (!cancelable.isCanceled()) {
        console.error('Failed to load data:', error);
      }
    } finally {
      setLoading(false);
      cancelableRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelableRef.current) {
        cancelableRef.current.cancel();
      }
    };
  }, []);

  return (
    <div>
      <Button onClick={() => loadData('123')}>Load Data</Button>
      {loading && <Spinner />}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

### retryWithBackoff

**What it's for**: Automatically retries failed operations with increasing delays between attempts.

**When to use**: For network requests, API calls, or any operation that might fail temporarily but could succeed with retry.

#### Basic Usage
```tsx
function RobustApiCall() {
  const [status, setStatus] = useState('idle');

  const makeRobustCall = async () => {
    setStatus('loading');

    try {
      const result = await retryWithBackoff(
        async () => {
          const response = await fetch('/api/unstable-endpoint');
          if (!response.ok) throw new Error('API request failed');
          return response.json();
        },
        {
          maxRetries: 3,
          initialDelay: 1000,      // Start with 1 second
          maxDelay: 10000,         // Never wait more than 10 seconds
          backoffFactor: 2,        // Double delay each time (1s, 2s, 4s)
        }
      );

      setStatus('success');
      console.log('API call succeeded:', result);
    } catch (error) {
      setStatus('error');
      console.error('API call failed after all retries:', error);
    }
  };

  return (
    <div>
      <Button onClick={makeRobustCall} disabled={status === 'loading'}>
        Make Robust API Call
      </Button>
      <div>Status: {status}</div>
    </div>
  );
}
```

#### With Cancellation
```tsx
function CancelableRetry() {
  const cancelableRef = useRef(null);

  const startRetryOperation = async () => {
    const controller = new AbortController();
    cancelableRef.current = { cancel: () => controller.abort() };

    try {
      await retryWithBackoff(
        async () => {
          const response = await fetch('/api/data', {
            signal: controller.signal
          });
          return response.json();
        },
        {
          maxRetries: 5,
          initialDelay: 500,
          signal: controller.signal  // Pass signal for cancellation
        }
      );
    } catch (error) {
      if (controller.signal.aborted) {
        console.log('Operation was cancelled');
      } else {
        console.error('Operation failed:', error);
      }
    }
  };

  const cancelOperation = () => {
    if (cancelableRef.current) {
      cancelableRef.current.cancel();
    }
  };

  return (
    <div>
      <Button onClick={startRetryOperation}>Start Operation</Button>
      <Button onClick={cancelOperation}>Cancel</Button>
    </div>
  );
}
```

### Real-World Usage Patterns

#### Settings Auto-Save with Debouncing
```tsx
// From useSettings hook
const debouncedSave = useMemo(
  () => createDebouncer(async (settingsToSave: PluginSettings) => {
    setIsSaving(true);
    await SettingsStorage.save(settingsToSave);
    setIsSaving(false);
  }, 500),
  []
);

// Auto-save when settings change
useEffect(() => {
  if (isLoading) return;
  debouncedSave(settings);
}, [settings, isLoading, debouncedSave]);
```

#### Search with Debouncing and Cancellation
```tsx
function SmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const searchRef = useRef(null);

  const debouncedSearch = useMemo(
    () => createDebouncer(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      // Cancel previous search
      if (searchRef.current) {
        searchRef.current.cancel();
      }

      // Create new cancelable search
      const cancelable = createCancelablePromise(async (signal) => {
        // Retry the search with backoff in case of network issues
        return retryWithBackoff(
          async () => {
            const response = await fetch(`/search?q=${searchTerm}`, { signal });
            return response.json();
          },
          { maxRetries: 2, signal }
        );
      });

      searchRef.current = cancelable;

      try {
        const searchResults = await cancelable.promise;
        setResults(searchResults);
      } catch (error) {
        if (!cancelable.isCanceled()) {
          console.error('Search failed:', error);
        }
      }
    }, 300),
    []
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      if (searchRef.current) {
        searchRef.current.cancel();
      }
    };
  }, [debouncedSearch]);
}
```

### Best Practices

#### ✅ Good Patterns
```tsx
// Always clean up in useEffect
useEffect(() => {
  const debounced = createDebouncer(expensiveOperation, 300);
  return () => debounced.cancel();
}, []);

// Use useMemo to prevent recreating debouncers
const debouncedHandler = useMemo(
  () => createDebouncer(handleChange, 500),
  [dependency]
);

// Combine with cancellation for robust async operations
const robustAsyncOperation = async () => {
  const cancelable = createCancelablePromise(async (signal) => {
    return retryWithBackoff(
      () => apiCall(signal),
      { maxRetries: 3, signal }
    );
  });

  return cancelable.promise;
};
```

#### ❌ Bad Patterns
```tsx
// Don't create new debouncers on every render
function BadComponent() {
  const handleChange = (value) => {
    // Creates new debouncer every time!
    const debounced = createDebouncer(save, 500);
    debounced(value);
  };
}

// Don't forget cleanup
function LeakyComponent() {
  const debounced = createDebouncer(expensiveOp, 1000);
  // Missing cleanup - will continue executing after unmount!
}

// Don't ignore cancellation
function RaceConditionComponent() {
  const loadData = async () => {
    // No cancellation - old requests can overwrite new ones
    const data = await fetch('/api/data');
    setData(data);
  };
}
```

### Performance Impact

- **Debouncing**: Reduces API calls by ~80-95% for typical user input
- **Throttling**: Limits event handler execution to manageable rates
- **Cancellation**: Prevents memory leaks and race conditions
- **Retry**: Improves reliability without blocking UI
- **Memory**: Minimal overhead with proper cleanup

---
