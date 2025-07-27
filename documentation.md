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
- [Textbox](#textbox) - Enhanced text input fields with icons and validation
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
- [MessageBox](#messagebox) - Message display component
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

### System & State Management
- [ErrorBoundary](#errorboundary) - Error catching and fallback UI
- [Theme System](#theme-system) - Light/dark mode management
- [useSettings Hook](#usesettings-hook) - Automatic settings persistence
- [Plugin Messaging System](#plugin-messaging-system) - UI ↔ Main thread communication

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

**What it's for**: Displaying messages with consistent styling and theming.

**When to use**: For status messages, confirmations, or informational content.

### Import
```tsx
import { MessageBox } from '@ui/components/base/MessageBox';
```

### Basic Usage
```tsx
function MyComponent() {
  return (
    <MessageBox title="Success" type="success">
      Your changes have been saved successfully.
    </MessageBox>
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

## ErrorBoundary

**What it's for**: Catching JavaScript errors in child components and providing a fallback UI to prevent the entire plugin from crashing.

**When to use**: Wrap components that might throw errors, especially during development or around risky operations.

### Import
```tsx
import { ErrorBoundary } from '@ui/components/base/ErrorBoundary';
```

### Basic Usage
```tsx
function MyComponent() {
  const [hasError, setHasError] = useState(false);

  // Component that might throw an error
  const RiskyComponent = () => {
    if (hasError) {
      throw new Error('Something went wrong!');
    }
    return <div>Everything is working fine!</div>;
  };

  return (
    <div>
      <Button onClick={() => setHasError(true)}>
        Trigger Error
      </Button>
      <Button onClick={() => setHasError(false)}>
        Reset
      </Button>

      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Caught error:', error, errorInfo);
          showToast('An error occurred!', 'error');
        }}
      >
        <RiskyComponent />
      </ErrorBoundary>
    </div>
  );
}
```

### Advanced Usage with Custom Fallback
```tsx
<ErrorBoundary
  fallback={(error, errorInfo) => (
    <div style={{ padding: 16, border: '1px solid red' }}>
      <h3>Custom Error Display</h3>
      <p>Error: {error.message}</p>
      <Button onClick={() => window.location.reload()}>
        Reload Plugin
      </Button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Send error to logging service
    analytics.track('plugin_error', { error: error.message });
  }}
>
  <MyRiskyComponent />
</ErrorBoundary>
```

### Props
- `children`: React elements to wrap with error boundary
- `fallback`: `(error: Error, errorInfo: any) => JSX.Element` - Optional custom fallback UI function
- `onError`: `(error: Error, errorInfo: any) => void` - Optional error handler callback

### Features
- **Default Fallback UI**: Provides a styled error display with details and retry button
- **Error Details**: Shows error message and component stack trace in expandable section
- **Retry Mechanism**: "Try Again" button to reset the error state
- **Error Logging**: Automatically logs errors to console and calls optional error handler
- **Theming**: Uses theme colors for consistent styling

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

The plugin messaging system enables communication between the UI thread and the main Figma thread. This allows you to trigger operations on Figma nodes, request data analysis, and receive results back in the UI.

### Architecture

- **UI Thread**: Runs in an iframe with access to React/Preact and web APIs
- **Main Thread**: Runs in Figma's sandbox with access to the Figma API and document nodes
- **Communication**: Bidirectional message passing using `postMessage` API

### UI to Main Thread Communication

#### Import
```tsx
import { sendToMain } from '@ui/messaging-simple';
```

#### Sending Messages
```tsx
// Simple message with no data
sendToMain('SCAN_NODES');

// Message with data payload
sendToMain('EXPORT_SELECTION', {
  format: 'PNG',
  scale: 2,
  includeMetadata: true
});

// Complex data structures
sendToMain('BATCH_RENAME', {
  pattern: 'Layer_{index}',
  startIndex: 1,
  nodes: ['node-id-1', 'node-id-2']
});
```

### Main Thread to UI Communication

#### Receiving Messages in Main Thread
```typescript
// src/main/index.ts
figma.ui.onmessage = (msg) => {
  const { type, ...data } = msg.pluginMessage || msg;

  switch (type) {
    case 'SCAN_NODES':
      handleNodeScan(data);
      break;

    case 'EXPORT_SELECTION':
      handleExportSelection(data);
      break;

    case 'BATCH_RENAME':
      handleBatchRename(data);
      break;

    default:
      console.log('Unknown message type:', type);
  }
};
```

#### Sending Results Back to UI
```typescript
// Send simple response
figma.ui.postMessage({
  type: 'SCAN_COMPLETE',
  nodeCount: 42
});

// Send detailed analysis results
figma.ui.postMessage({
  type: 'ANALYSIS_RESULT',
  summary: {
    totalNodes: 156,
    componentCount: 23,
    textNodes: 67
  },
  nodes: extractedNodeData,
  timestamp: Date.now()
});

// Send progress updates
figma.ui.postMessage({
  type: 'PROGRESS',
  percentage: 65,
  currentTask: 'Processing components'
});
```

### Receiving Messages in UI

#### Import
```tsx
import { usePluginMessages } from '@ui/messaging-simple';
```

#### Basic Usage
```tsx
function MyComponent() {
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  usePluginMessages({
    SCAN_COMPLETE: (data) => {
      console.log('Scan finished:', data.nodeCount);
      setResults(data);
    },

    ANALYSIS_RESULT: (data) => {
      console.log('Analysis complete:', data.summary);
      setResults(data);
    },

    PROGRESS: (data) => {
      setProgress(data.percentage);
    },

    ERROR: (data) => {
      console.error('Plugin error:', data.message);
    }
  });

  return (
    <div>
      {progress > 0 && <ProgressBar value={progress} />}
      {results && <DisplayResults data={results} />}
    </div>
  );
}
```

### Complete Example: Node Analysis

#### UI Component
```tsx
function NodeAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  usePluginMessages({
    ANALYSIS_COMPLETE: (data) => {
      setResults(data);
      setIsAnalyzing(false);
      setProgress(0);
    },

    ANALYSIS_PROGRESS: (data) => {
      setProgress(data.percentage);
    },

    ERROR: (data) => {
      console.error('Analysis failed:', data.message);
      setIsAnalyzing(false);
      setProgress(0);
    }
  });

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setResults(null);
    setProgress(0);

    sendToMain('ANALYZE_SELECTION', {
      includeHidden: false,
      analyzeText: true,
      analyzeComponents: true
    });
  };

  return (
    <div>
      <Button
        onClick={startAnalysis}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Selection'}
      </Button>

      {isAnalyzing && (
        <ProgressBar
          value={progress}
          label={`Processing... ${progress}%`}
        />
      )}

      {results && (
        <Panel title="Analysis Results">
          <div>
            <p>Total Nodes: {results.summary.totalNodes}</p>
            <p>Components: {results.summary.componentCount}</p>
            <p>Text Layers: {results.summary.textNodes}</p>
          </div>

          <Code language="json">
            {JSON.stringify(results.nodes, null, 2)}
          </Code>
        </Panel>
      )}
    </div>
  );
}
```

#### Main Thread Handler
```typescript
// src/main/index.ts
async function handleAnalyzeSelection(data: any) {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 0) {
      figma.ui.postMessage({
        type: 'ERROR',
        message: 'No nodes selected'
      });
      return;
    }

    // Send initial progress
    figma.ui.postMessage({
      type: 'ANALYSIS_PROGRESS',
      percentage: 0
    });

    const results = {
      summary: {
        totalNodes: 0,
        componentCount: 0,
        textNodes: 0
      },
      nodes: []
    };

    // Process each selected node
    for (let i = 0; i < selection.length; i++) {
      const node = selection[i];

      // Analyze node
      const nodeData = analyzeNode(node, data);
      results.nodes.push(nodeData);

      // Update counters
      results.summary.totalNodes++;
      if (node.type === 'COMPONENT') results.summary.componentCount++;
      if (node.type === 'TEXT') results.summary.textNodes++;

      // Send progress update
      const percentage = Math.round(((i + 1) / selection.length) * 100);
      figma.ui.postMessage({
        type: 'ANALYSIS_PROGRESS',
        percentage: percentage
      });
    }

    // Send final results
    figma.ui.postMessage({
      type: 'ANALYSIS_COMPLETE',
      summary: results.summary,
      nodes: results.nodes,
      timestamp: Date.now()
    });

  } catch (error) {
    figma.ui.postMessage({
      type: 'ERROR',
      message: error.message
    });
  }
}

function analyzeNode(node: SceneNode, options: any) {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    visible: node.visible,
    // Add more analysis based on options
    textContent: options.analyzeText && node.type === 'TEXT' ? node.characters : null,
    componentInfo: options.analyzeComponents && node.type === 'COMPONENT' ? {
      mainComponent: node.mainComponent?.name,
      variantProperties: node.variantProperties
    } : null
  };
}
```

### Message Patterns

#### Request-Response Pattern
```tsx
// UI: Send request
sendToMain('GET_LAYER_STYLES', { nodeId: 'selected' });

// Main: Process and respond
figma.ui.postMessage({
  type: 'LAYER_STYLES_RESULT',
  nodeId: data.nodeId,
  styles: extractedStyles
});

// UI: Handle response
usePluginMessages({
  LAYER_STYLES_RESULT: (data) => {
    setLayerStyles(data.styles);
  }
});
```

#### Progress Updates Pattern
```tsx
// Main: Send periodic progress
for (let i = 0; i < items.length; i++) {
  processItem(items[i]);

  figma.ui.postMessage({
    type: 'PROCESS_PROGRESS',
    current: i + 1,
    total: items.length,
    percentage: Math.round(((i + 1) / items.length) * 100)
  });
}
```

#### Error Handling Pattern
```tsx
// Main: Consistent error reporting
try {
  const result = await dangerousOperation();
  figma.ui.postMessage({
    type: 'OPERATION_SUCCESS',
    result: result
  });
} catch (error) {
  figma.ui.postMessage({
    type: 'ERROR',
    operation: 'dangerousOperation',
    message: error.message,
    timestamp: Date.now()
  });
}

// UI: Handle all errors consistently
usePluginMessages({
  ERROR: (data) => {
    console.error(`Error in ${data.operation}:`, data.message);
    showToast(`Error: ${data.message}`, 'error');
  }
});
```

### Best Practices

#### Data Safety
- Extract only primitive values from Figma nodes to avoid memory leaks
- Use `String()`, `Number()`, and `Boolean()` to ensure primitive types
- Avoid passing complex Figma objects directly to UI

```typescript
// ✅ Good: Extract primitives
const nodeData = {
  id: String(node.id),
  name: String(node.name),
  width: Number(node.width),
  visible: Boolean(node.visible)
};

// ❌ Bad: Passing complex objects
const nodeData = node; // May cause memory issues
```

#### Message Structure
- Use consistent message types with clear, descriptive names
- Include metadata like timestamps and operation IDs for debugging
- Structure data consistently across different message types

```typescript
// ✅ Good: Structured message
figma.ui.postMessage({
  type: 'EXPORT_COMPLETE',
  operationId: 'export-001',
  timestamp: Date.now(),
  result: {
    format: 'PNG',
    fileCount: 5,
    totalSize: '2.4MB'
  }
});
```

#### Error Handling
- Always wrap main thread operations in try-catch blocks
- Provide meaningful error messages with context
- Include operation identifiers for debugging

```typescript
// ✅ Good: Comprehensive error handling
try {
  const result = await complexOperation(data);
  figma.ui.postMessage({
    type: 'OPERATION_SUCCESS',
    operationId: data.operationId,
    result: result
  });
} catch (error) {
  figma.ui.postMessage({
    type: 'ERROR',
    operationId: data.operationId,
    operation: 'complexOperation',
    message: error.message,
    stack: error.stack
  });
}
```

### Common Message Types

Here are standard message types used throughout the plugin:

#### UI to Main
- `PING` - Test connectivity
- `GET_SELECTION` - Request current selection info
- `SCAN_NODES` - Analyze nodes in document
- `EXPORT_SELECTION` - Export selected nodes
- `RESIZE` - Resize plugin window

#### Main to UI
- `PONG` - Response to ping
- `SELECTION_RESULT` - Selection analysis results
- `SCAN_COMPLETE` - Node scan results
- `EXPORT_COMPLETE` - Export operation results
- `PROGRESS` - Operation progress updates
- `ERROR` - Error notifications

---
