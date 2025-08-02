# Component Usage Examples

This document provides comprehensive usage examples for all components in the Figma Plugin Starter.

## Form Components

### Button
```tsx
import { Button } from '@ui/components/base';

// Primary action button
<Button onClick={handleSave}>
  Save Changes
</Button>

// Secondary button
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Danger button for destructive actions
<Button variant="danger" onClick={handleDelete}>
  Delete Item
</Button>

// Disabled state
<Button disabled onClick={handleSubmit}>
  Submit
</Button>

// Different sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// Full width button
<Button fullWidth>
  Full Width Button
</Button>
```

### Input
```tsx
import { Input } from '@ui/components/base';

// Basic text input
<Input
  value={name}
  onChange={setName}
  placeholder="Enter your name"
/>

// Input with label and validation
<Input
  value={email}
  onChange={setEmail}
  type="email"
  label="Email Address"
  required
  error={emailError}
/>

// Number input with constraints
<Input
  value={count}
  onChange={setCount}
  type="number"
  min={0}
  max={100}
  step={1}
  label="Count"
/>

// Password input
<Input
  value={password}
  onChange={setPassword}
  type="password"
  label="Password"
  required
/>
```

### Textarea
```tsx
import { Textarea } from '@ui/components/base';

// Basic textarea
<Textarea
  value={description}
  onChange={setDescription}
  placeholder="Enter description"
  rows={4}
/>

// Textarea with character limit
<Textarea
  value={comment}
  onChange={setComment}
  label="Comments"
  maxLength={500}
  required
/>
```

### Dropdown
```tsx
import { Dropdown } from '@ui/components/base';

const options = [
  { value: 'option1', text: 'Option 1', disabled: false },
  { value: 'option2', text: 'Option 2', disabled: false },
  { value: 'option3', text: 'Option 3', disabled: true }
];

<Dropdown
  options={options}
  value={selectedValue}
  onValueChange={setSelectedValue}
  placeholder="Choose an option"
/>
```

### Checkbox
```tsx
import { Checkbox } from '@ui/components/base';

<Checkbox
  checked={isChecked}
  onChange={setIsChecked}
  label="Enable notifications"
/>

// Disabled state
<Checkbox
  checked={false}
  onChange={() => {}}
  label="Disabled option"
  disabled
/>
```

### RadioButton
```tsx
import { RadioButton } from '@ui/components/base';

<div>
  <RadioButton
    name="theme"
    value="light"
    checked={theme === 'light'}
    onChange={() => setTheme('light')}
    label="Light Theme"
  />
  <RadioButton
    name="theme"
    value="dark"
    checked={theme === 'dark'}
    onChange={() => setTheme('dark')}
    label="Dark Theme"
  />
</div>
```

### ToggleSwitch
```tsx
import { ToggleSwitch } from '@ui/components/base';

<ToggleSwitch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable feature"
/>

// Disabled state
<ToggleSwitch
  checked={false}
  onChange={() => {}}
  label="Disabled toggle"
  disabled
/>
```

### ColorPicker
```tsx
import { ColorPicker } from '@ui/components/base';

// Basic color picker
<ColorPicker
  value={color}
  onChange={setColor}
/>

// Different sizes
<ColorPicker value={color} onChange={setColor} size="small" />
<ColorPicker value={color} onChange={setColor} size="medium" />
<ColorPicker value={color} onChange={setColor} size="large" />
```

### DatePicker
```tsx
import { DatePicker } from '@ui/components/base';

<DatePicker
  value={date}
  onChange={setDate}
/>
```

### TimePicker
```tsx
import { TimePicker } from '@ui/components/base';

<TimePicker
  value={time}
  onChange={setTime}
/>
```

## Data Display Components

### DataGrid
```tsx
import { DataGrid } from '@ui/components/base';

const columns = [
  { key: 'name', title: 'Name', sortable: true, editable: true },
  { key: 'email', title: 'Email', type: 'email' },
  { key: 'active', title: 'Active', type: 'boolean' },
  { key: 'score', title: 'Score', type: 'number', aggregation: 'avg' }
];

// Basic data grid
<DataGrid
  data={users}
  columns={columns}
  rowKey="id"
  height={400}
/>

// Advanced grid with editing and aggregation
<DataGrid
  data={salesData}
  columns={columns}
  rowKey="id"
  aggregatable
  virtualizeRows
  selectionMode="multi"
  onDataChange={handleDataChange}
  onSelectionChange={handleSelectionChange}
/>
```

### DataTable
```tsx
import { DataTable } from '@ui/components/base';

<DataTable
  data={items}
  columns={[
    { key: 'name', title: 'Name' },
    { key: 'value', title: 'Value' }
  ]}
  rowKey="id"
/>
```

### Accordion
```tsx
import { Accordion } from '@ui/components/base';

<Accordion title="Advanced Settings">
  <p>Content that can be collapsed</p>
  <Button>Action Button</Button>
</Accordion>
```

### Code
```tsx
import { Code } from '@ui/components/base';

// Inline code
<Code>const example = 'inline code';</Code>

// Code block
<Code block>
{`function example() {
  return 'code block';
}`}
</Code>
```

## Feedback Components

### Modal
```tsx
import { Modal } from '@ui/components/base';

const [showModal, setShowModal] = useState(false);

<Modal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  title="Settings"
  size="medium"
>
  <p>Modal content goes here</p>
  <Button onClick={() => setShowModal(false)}>Close</Button>
</Modal>
```

### Toast Notifications
```tsx
import { showToast } from '@ui/services/toast';
import { GlobalToastContainer } from '@ui/components/base';

// Include once in your app root
<GlobalToastContainer />

// Use anywhere in your app
showToast('Success message', 'success');
showToast('Error message', 'error');
showToast('Warning message', 'warning');
showToast('Info message', 'info');

// Persistent toast
showToast('Important message', 'info', { persist: true });
```

### Alert
```tsx
import { Alert } from '@ui/components/base';

<Alert type="success">
  Operation completed successfully!
</Alert>

<Alert type="error">
  An error occurred while processing.
</Alert>

<Alert type="warning">
  This action cannot be undone.
</Alert>

<Alert type="info">
  New features are available.
</Alert>
```

### NotificationBanner
```tsx
import { NotificationBanner } from '@ui/components/base';

<NotificationBanner
  type="info"
  message="System maintenance scheduled for tonight"
  onDismiss={() => setBannerVisible(false)}
/>
```

### ProgressBar
```tsx
import { ProgressBar } from '@ui/components/base';

// Basic progress bar
<ProgressBar value={75} />

// With label
<ProgressBar
  value={progress}
  label={`${progress}% complete`}
/>

// Indeterminate progress
<ProgressBar indeterminate />
```

### Spinner
```tsx
import { Spinner } from '@ui/components/base';

// Basic spinner
<Spinner />

// With message
<Spinner message="Loading..." />

// Different sizes
<Spinner size="small" />
<Spinner size="large" />
```

### ProgressModal
```tsx
import { ProgressModal } from '@ui/components/base';

<ProgressModal
  isVisible={isProcessing}
  title="Processing Data"
  progress={processingProgress}
  message="Please wait while we process your data..."
  onCancel={handleCancel}
/>
```

### MessageBox
```tsx
import { MessageBox } from '@ui/components/base';

<MessageBox
  type="info"
  title="Information"
  message="This is an informational message"
  onClose={() => setMessageVisible(false)}
/>
```

### InfoBox
```tsx
import { InfoBox } from '@ui/components/base';

<InfoBox
  title="Tip"
  message="You can use keyboard shortcuts to work faster"
  type="tip"
/>
```

## Navigation Components

### Tabs
```tsx
import { Tabs } from '@ui/components/base';

const tabs = [
  { id: 'tab1', label: 'General', content: <GeneralSettings /> },
  { id: 'tab2', label: 'Advanced', content: <AdvancedSettings /> },
  { id: 'tab3', label: 'About', content: <AboutPanel /> }
];

<Tabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Panel
```tsx
import { Panel } from '@ui/components/base';

<Panel title="Settings Panel">
  <p>Panel content goes here</p>
</Panel>
```

### ContextMenu
```tsx
import { ContextMenu } from '@ui/components/base';

const menuItems = [
  { label: 'Copy', onClick: handleCopy },
  { label: 'Paste', onClick: handlePaste },
  { label: 'Delete', onClick: handleDelete, danger: true }
];

<ContextMenu
  items={menuItems}
  visible={menuVisible}
  position={{ x: mouseX, y: mouseY }}
  onClose={() => setMenuVisible(false)}
/>
```

### SettingsDropdown
```tsx
import { SettingsDropdown } from '@ui/components/base';

const settingsItems = [
  { label: 'Preferences', onClick: openPreferences },
  { label: 'Export Data', onClick: exportData },
  { label: 'Reset Settings', onClick: resetSettings }
];

<SettingsDropdown items={settingsItems} />
```

## Form Layout Components

### Form Layout
```tsx
import { Form, FormField, FormRow, FormSection, FormGroup } from '@ui/components/base';

<Form>
  <FormSection title="Personal Information">
    <FormRow>
      <FormField label="First Name">
        <Input value={firstName} onChange={setFirstName} />
      </FormField>
      <FormField label="Last Name">
        <Input value={lastName} onChange={setLastName} />
      </FormField>
    </FormRow>

    <FormField label="Email Address">
      <Input
        type="email"
        value={email}
        onChange={setEmail}
        error={emailError}
      />
    </FormField>
  </FormSection>

  <FormSection title="Preferences">
    <FormGroup>
      <Checkbox
        checked={notifications}
        onChange={setNotifications}
        label="Enable notifications"
      />
      <Checkbox
        checked={darkMode}
        onChange={setDarkMode}
        label="Use dark mode"
      />
    </FormGroup>
  </FormSection>
</Form>
```

## Utility Components

### ErrorBoundary
```tsx
import { ErrorBoundary } from '@ui/components/base';

<ErrorBoundary
  maxRetries={3}
  autoRecover={true}
  onError={(error, errorInfo) => {
    console.error('App Error:', error, errorInfo);
    showToast('An unexpected error occurred', 'error');
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### LazyLoader
```tsx
import { LazyLoader } from '@ui/components/base';

<LazyLoader>
  <ExpensiveComponent />
</LazyLoader>
```

## Complete Form Example

```tsx
import {
  Form,
  FormSection,
  FormField,
  FormRow,
  FormGroup,
  Input,
  Textarea,
  Dropdown,
  Checkbox,
  RadioButton,
  Button,
  ErrorBoundary
} from '@ui/components/base';

function UserForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    bio: '',
    notifications: false,
    theme: 'light'
  });

  const roleOptions = [
    { value: 'admin', text: 'Administrator', disabled: false },
    { value: 'user', text: 'User', disabled: false },
    { value: 'viewer', text: 'Viewer', disabled: false }
  ];

  return (
    <ErrorBoundary>
      <Form>
        <FormSection title="Basic Information">
          <FormRow>
            <FormField label="First Name">
              <Input
                value={formData.firstName}
                onChange={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                required
              />
            </FormField>
            <FormField label="Last Name">
              <Input
                value={formData.lastName}
                onChange={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                required
              />
            </FormField>
          </FormRow>

          <FormField label="Email">
            <Input
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              required
            />
          </FormField>

          <FormField label="Role">
            <Dropdown
              options={roleOptions}
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              placeholder="Select a role"
            />
          </FormField>

          <FormField label="Bio">
            <Textarea
              value={formData.bio}
              onChange={(value) => setFormData(prev => ({ ...prev, bio: value }))}
              placeholder="Tell us about yourself"
              maxLength={500}
            />
          </FormField>
        </FormSection>

        <FormSection title="Preferences">
          <FormGroup>
            <Checkbox
              checked={formData.notifications}
              onChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
              label="Enable email notifications"
            />
          </FormGroup>

          <FormGroup>
            <RadioButton
              name="theme"
              value="light"
              checked={formData.theme === 'light'}
              onChange={() => setFormData(prev => ({ ...prev, theme: 'light' }))}
              label="Light Theme"
            />
            <RadioButton
              name="theme"
              value="dark"
              checked={formData.theme === 'dark'}
              onChange={() => setFormData(prev => ({ ...prev, theme: 'dark' }))}
              label="Dark Theme"
            />
          </FormGroup>
        </FormSection>

        <FormRow>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save User
          </Button>
        </FormRow>
      </Form>
    </ErrorBoundary>
  );
}
```

## Advanced DataGrid Example

```tsx
import { DataGrid } from '@ui/components/base';
import { useState } from 'preact/hooks';

function UserDataGrid() {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true, score: 85 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false, score: 92 },
    // ... more data
  ]);

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      editable: true,
      width: 150
    },
    {
      key: 'email',
      title: 'Email',
      type: 'email',
      sortable: true,
      width: 200
    },
    {
      key: 'active',
      title: 'Active',
      type: 'boolean',
      editable: true,
      width: 100
    },
    {
      key: 'score',
      title: 'Score',
      type: 'number',
      sortable: true,
      editable: true,
      aggregation: 'avg',
      min: 0,
      max: 100,
      width: 100
    },
    {
      key: 'role',
      title: 'Role',
      type: 'select',
      editable: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'user', label: 'User' },
        { value: 'viewer', label: 'Viewer' }
      ],
      width: 120
    }
  ];

  const handleDataChange = (delta) => {
    if (delta.updated) {
      setUsers(prev => prev.map(user => {
        const updated = delta.updated.find(u => u.id === user.id);
        return updated || user;
      }));
    }
  };

  return (
    <DataGrid
      data={users}
      columns={columns}
      rowKey="id"
      height={500}
      virtualizeRows
      aggregatable
      selectionMode="multi"
      stickyFirstColumn
      onDataChange={handleDataChange}
      onSelectionChange={(selection) => console.log('Selected:', selection)}
    />
  );
}
```
