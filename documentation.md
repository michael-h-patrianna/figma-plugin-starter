# Figma Plugin Starter - Feature Guide

This documentation covers all the custom components, hooks, and features in this plugin template.

---

## TL&DR

1. **Import Components** using the @ui alias:
   ```tsx
   import { Button } from '@ui/components/base/Button';
   ```

2. **Use it in your JSX** with the required props:
   ```tsx
   <Button onClick={() => alert('Hello!')}>Click Me</Button>
   ```

### Import Paths

The project uses TypeScript path aliases for clean, consistent imports:
```tsx
import { Button } from '@ui/components/base/Button';
import { Textbox } from '@ui/components/base/Textbox';
import { CustomDropdown } from '@ui/components/base/CustomDropdown';
```

### Available Aliases
- `@ui/*` → `src/ui/*` (UI components, contexts, hooks)
- `@main/*` → `src/main/*` (Main thread code, types)
- `@shared/*` → `src/shared/*` (Shared utilities)

---

## Table of Contents

### Components
- [Button](#button) - Clickable actions with primary/secondary/danger variants
- [Textbox](#textbox) - Text input fields with icons and validation
- [CustomDropdown](#customdropdown) - Select menus and option pickers
- [Checkbox](#checkbox) - Toggle options and boolean settings
- [ToggleSwitch](#toggleswitch) - Modern on/off switches
- [RadioButton](#radiobutton) - Single choice from multiple options
- [Alert](#alert) - Notification banners with info/success/warning/error types
- [InfoBox](#infobox) - Contextual information boxes with theming
- [Panel](#panel) - Container components with consistent styling
- [Modal](#modal) - Overlay dialogs and popups
- [Toast](#toast) - Temporary notifications and feedback
- [ContextMenu](#contextmenu) - Right-click menus and dropdowns
- [DataTable](#datatable) - Sortable tables with theming
- [Accordion](#accordion) - Expandable content sections
- [Tabs](#tabs) - Tabbed interfaces
- [ProgressBar](#progressbar) - Loading and progress indicators
- [DatePicker](#datepicker) - Date selection components
- [Spinner](#spinner) - Loading indicators

### Settings & Configuration
- [SettingsDropdown](#settingsdropdown) - Settings menu with cog icon
- [useSettings Hook](#usesettings-hook) - Automatic settings persistence
- [Theme System](#theme-system) - Light/dark mode management

### Communication & State
- [usePluginMessages Hook](#usepluginmessages-hook) - UI ↔ Main thread communication
- [useToast Hook](#usetoast-hook) - Toast notification management
- [Plugin Storage](#plugin-storage) - Persistent data storage

### Patterns & Examples
- [Common Patterns](#common-patterns) - Real-world usage examples
- [Error Handling](#error-handling) - Error boundaries and user feedback
- [Troubleshooting](#troubleshooting) - Solutions to common issues

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

## Textbox

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

## CustomDropdown

**What it's for**: Letting users pick one option from a list (like a select menu).

**When to use**: When you have multiple options but want to save space, or when options are predefined.

### Import
```tsx
import { CustomDropdown } from '@ui/components/base/CustomDropdown';
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
    <CustomDropdown
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

<CustomDropdown
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

<CustomDropdown
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
        <CustomDropdown
          options={layerTypes}
          value={layerType}
          onValueChange={setLayerType}
          placeholder="Choose layer type"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 4 }}>Blend Mode:</label>
        <CustomDropdown
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

## InfoBox

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
| `icon` | String | No | Custom icon or emoji to display | `"🔥"`, `"⚠️"` |
| `backgroundColor` | String | No | Custom background color override | `"#f0f8ff"` |
| `borderColor` | String | No | Custom border color override | `"#ff6b6b"` |
| `titleColor` | String | No | Custom title text color override | `"#2c3e50"` |
| `contentColor` | String | No | Custom content text color override | `"#666"` |
| `className` | String | No | Additional CSS class name | `"my-custom-class"` |
| `style` | Object | No | Additional inline styles | `{{ marginTop: 16 }}` |

### Variants Explained

Each variant automatically applies appropriate colors and default icons:

- **`info`** (default): Blue theme, information icon ℹ️
- **`success`**: Green theme, checkmark icon ✅
- **`warning`**: Orange theme, warning icon ⚠️
- **`error`**: Red theme, error icon ❌
- **`accent`**: Uses your theme's accent color, target icon 🎯
- **`tip`**: Uses your theme's accent color, lightbulb icon 💡

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

// Tip with custom icon
<InfoBox title="Pro Tip" variant="tip" icon="🚀">
  Use keyboard shortcuts Cmd+S to save your progress quickly!
</InfoBox>

// Custom styling
<InfoBox
  title="Custom Styled Message"
  variant="info"
  icon="🎨"
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
| `icon` | String | No | Custom icon override | `"🎉"` |

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
  ✅ Your design tokens have been exported successfully!
</Alert>

// Error message with subtle styling
<Alert type="error" variant="subtle">
  ❌ Failed to connect to the API. Please try again.
</Alert>

// Warning with custom icon
<Alert type="warning" icon="⚠️">
  Large files may take longer to process.
</Alert>

// Info message
<Alert type="info">
  💡 Tip: Use Cmd+Z to undo your last action.
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

**What it's for**: Temporary notifications that appear and disappear automatically.

**When to use**: For confirmations, quick feedback, or non-critical messages that don't require user action.

### Import
```tsx
import { Toast } from '@ui/components/base/Toast';
import { useToast } from '@ui/hooks/useToast';
```

### Basic Usage with useToast Hook
```tsx
function MyComponent() {
  const { showToast } = useToast();

  const handleSave = () => {
    // Your save logic here
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <Button onClick={handleSave}>Save Settings</Button>
  );
}
```

### useToast Hook

The `useToast` hook provides an easy way to show toast notifications:

```tsx
const { toast, showToast, dismissToast } = useToast();

// Show different types of toasts
showToast('Info message', 'info');
showToast('Success!', 'success');
showToast('Warning!', 'warning');
showToast('Error occurred', 'error');

// Dismiss current toast
dismissToast();
```

### Common Examples

```tsx
function SettingsForm() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({});

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast('Settings reset to defaults', 'info');
  };

  return (
    <div>
      {/* Your form here */}
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleReset} variant="secondary">Reset</Button>
    </div>
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

## usePluginMessages Hook

**What it's for**: Communication between the UI and main thread with flexible message handling.

**When to use**: For any plugin that needs to communicate between the UI and Figma's main thread.

### Import
```tsx
import { usePluginMessages } from '@ui/hooks/usePluginMessages';
```

### Basic Usage
```tsx
function MyComponent() {
  const { sendMessage } = usePluginMessages({
    onScanComplete: (data) => {
      console.log('Scan completed:', data);
      showToast('Scan completed successfully!', 'success');
    },
    onError: (error) => {
      console.error('Plugin error:', error);
      showToast(`Error: ${error.message}`, 'error');
    }
  });

  const handleScan = () => {
    sendMessage('scan', { includeHidden: true });
  };

  return (
    <Button onClick={handleScan}>Start Scan</Button>
  );
}
```

### Message Handler Pattern
```tsx
const { sendMessage } = usePluginMessages({
  onScanComplete: (data) => {
    // Handle scan completion
    setResults(data.results);
    setProgress(100);
  },

  onProgress: (data) => {
    // Handle progress updates
    setProgress(data.percentage);
  },

  onError: (error) => {
    // Handle errors
    setError(error.message);
  }
});

// Send messages to main thread
sendMessage('scan', { options: { deep: true } });
sendMessage('export', { format: 'svg' });
```

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

## Plugin Communication Hook

### usePluginMessages

The `usePluginMessages` hook is for handling communication between your plugin UI and the main Figma thread.

#### Import
```tsx
import { usePluginMessages } from '@ui/hooks/usePluginMessages';
```

####  Usage
```tsx
function MyPluginComponent() {
  const [scanProgress, setScanProgress] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const { sendMessage } = usePluginMessages({
    onMessage: (type, data) => {
      switch (type) {
        case 'SCAN_RESULT':
          console.log('Scan completed:', data);
          setLastResult(data);
          break;

        case 'PROCESS_RESULT':
          console.log('Process completed:', data);
          setLastResult(data);
          break;

        case 'SCAN_PROGRESS':
          setScanProgress(data); // data is the progress value
          break;

        case 'ERROR':
          console.error('Plugin error:', data);
          break;

        case 'CUSTOM_ACTION':
          console.log('Custom action result:', data);
          break;

        default:
          console.log('Unknown message type:', type, data);
      }
    }
  });

  // Send messages to the main thread
  const handleScan = () => {
    sendMessage('SCAN');
  };

  const handleProcess = () => {
    sendMessage('PROCESS', {
      action: 'export',
      format: 'json',
      includeMetadata: true
    });
  };

  const handleCustomAction = () => {
    sendMessage('CUSTOM_ACTION', {
      actionType: 'batch_rename',
      pattern: 'Layer_{index}',
      startIndex: 1
    });
  };

  return (
    <div>
      <Button onClick={handleScan}>Start Scan</Button>
      <Button onClick={handleProcess}>Process Data</Button>
      <Button onClick={handleCustomAction}>Custom Action</Button>

      {scanProgress > 0 && (
        <div>Progress: {scanProgress}%</div>
      )}
    </div>
  );
}
```
---
