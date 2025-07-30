import { Checkbox } from '@ui/components/base/Checkbox';
import { ColorPicker } from '@ui/components/base/ColorPicker';
import { DataGrid, DataGridColumn } from '@ui/components/base/DataGrid';
import { DataTable } from '@ui/components/base/DataTable';
import { DatePicker } from '@ui/components/base/DatePicker';
import { Dropdown } from '@ui/components/base/Dropdown';
import { Form, FormField, FormGroup, FormRow, FormSection } from '@ui/components/base/FormLayout';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Input, Textarea } from '@ui/components/base/Input';
import { Panel } from '@ui/components/base/Panel';
import { RadioButton } from '@ui/components/base/RadioButton';
import { TimePicker } from '@ui/components/base/TimePicker';
import { ToggleSwitch } from '@ui/components/base/ToggleSwitch';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useMemo, useState } from 'preact/hooks';

/**
 * Props for the FormsView component.
 */
interface FormsViewProps {
  // No external dependencies - fully self-contained
}

/**
 * FormsView component that demonstrates various form input components.
 *
 * This view showcases different types of form inputs including text inputs, dropdowns,
 * radio buttons, toggles, date/time pickers, and data tables. All form state and
 * interactions are self-contained within this view.
 *
 * @param props - {@link FormsViewProps} for configuring the view
 * @returns The rendered FormsView React element
 */
export function FormsView({ }: FormsViewProps) {
  const { colors, spacing } = useTheme();

  // Form state
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('medium');
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [selectedTime, setSelectedTime] = useState('09:00');

  // Color picker state
  const [selectedColor, setSelectedColor] = useState('#3772FF');

  // DataGrid demo data and state
  interface DemoItem {
    id: number;
    description: string;
    textValue: string;
    numberValue: number;
    selectValue: string;
    rating: number;
    checkboxValue: boolean;
    toggleValue: boolean;
    dateValue: string;
    timeValue: string;
    colorValue: string;
  }

  const [gridData, setGridData] = useState<DemoItem[]>(() => {
    const selectOptions = ['Option A', 'Option B', 'Option C', 'Option D'];
    const descriptions = [
      'Sample item 1', 'Demo record 2', 'Test data 3', 'Example 4', 'Sample 5',
      'Demo 6', 'Test 7', 'Example 8', 'Sample 9', 'Demo 10'
    ];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      description: descriptions[i] || `Item ${i + 1}`,
      textValue: `Text ${i + 1}`,
      numberValue: (i + 1) * 10,
      selectValue: selectOptions[i % selectOptions.length],
      rating: Math.floor(Math.random() * 5) + 1,
      checkboxValue: i % 2 === 0,
      toggleValue: i % 3 === 0,
      dateValue: new Date(2024, i % 12, (i % 28) + 1).toISOString().split('T')[0],
      timeValue: `${9 + (i % 8)}:${(i * 15) % 60 < 10 ? '0' : ''}${(i * 15) % 60}`,
      colorValue: colors[i % colors.length]
    }));
  });

  const gridColumns: DataGridColumn<DemoItem>[] = [
    {
      key: 'id',
      title: 'ID',
      width: 60,
      minWidth: 50,
      maxWidth: 80,
      resizable: true,
      sortable: true,
      type: 'number'
    },
    {
      key: 'description',
      title: 'Description',
      width: 150,
      minWidth: 120,
      maxWidth: 250,
      resizable: true,
      sortable: true,
      type: 'text'
    },
    {
      key: 'textValue',
      title: 'Text Input',
      width: 120,
      minWidth: 100,
      maxWidth: 180,
      resizable: true,
      editable: true,
      type: 'text'
    },
    {
      key: 'numberValue',
      title: 'Number Input',
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      resizable: true,
      editable: true,
      type: 'number'
    },
    {
      key: 'selectValue',
      title: 'Select',
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      resizable: true,
      editable: true,
      type: 'select',
      options: [
        { value: 'Option A', label: 'Option A' },
        { value: 'Option B', label: 'Option B' },
        { value: 'Option C', label: 'Option C' },
        { value: 'Option D', label: 'Option D' }
      ]
    },
    {
      key: 'rating',
      title: 'Rating',
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      resizable: true,
      editable: true,
      type: 'select',
      options: [
        { value: 1, label: '1 Star' },
        { value: 2, label: '2 Stars' },
        { value: 3, label: '3 Stars' },
        { value: 4, label: '4 Stars' },
        { value: 5, label: '5 Stars' }
      ],
      formatter: (value: number) => '★'.repeat(value) + '☆'.repeat(5 - value)
    },
    {
      key: 'checkboxValue',
      title: 'Checkbox',
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      resizable: true,
      editable: true,
      type: 'boolean'
    },
    {
      key: 'toggleValue',
      title: 'Toggle',
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      resizable: true,
      editable: true,
      type: 'toggle'
    },
    {
      key: 'dateValue',
      title: 'Date',
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      resizable: true,
      editable: true,
      type: 'date',
      formatter: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'timeValue',
      title: 'Time',
      width: 100,
      minWidth: 80,
      maxWidth: 120,
      resizable: true,
      editable: true,
      type: 'time'
    },
    {
      key: 'colorValue',
      title: 'Color',
      width: 120,
      minWidth: 100,
      maxWidth: 150,
      resizable: true,
      editable: true,
      type: 'color'
    }
  ];

  const handleGridDataChange = (delta: { added?: DemoItem[]; updated?: DemoItem[]; deleted?: DemoItem[] }) => {
    if (delta.updated) {
      setGridData(currentData =>
        currentData.map(row => {
          const updated = delta.updated?.find(u => u.id === row.id);
          return updated ? { ...row, ...updated } : row;
        })
      );
    }
    if (delta.added) {
      setGridData(currentData => [...currentData, ...delta.added!]);
    }
    if (delta.deleted) {
      const deletedIds = delta.deleted.map(d => d.id);
      setGridData(currentData => currentData.filter(row => !deletedIds.includes(row.id)));
    }
  };

  const dropdownOptions = [
    { value: 'option1', text: 'First Option' },
    { value: 'option2', text: 'Second Option' },
    { value: 'option3', text: 'Third Option' },
    { value: 'disabled', text: 'Disabled Option', disabled: true }
  ];

  const radioOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'disabled', label: 'Extra Large (Disabled)', disabled: true }
  ];

  // Generate demo table data
  const tableData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= 20; i++) {
      const isLastRow = i === 20;
      data.push({
        id: i,
        name: `Item ${i}`,
        type: ['Rectangle', 'Text', 'Ellipse', 'Group'][i % 4],
        status: isLastRow ? (i % 2 === 0 ? 'ok' : 'error') : 'normal',
        value: Math.floor(Math.random() * 100)
      });
    }
    return data;
  }, []);

  const tableColumns = [
    { key: 'name', label: 'Name', width: '30%' },
    { key: 'type', label: 'Type', width: '25%' },
    {
      key: 'status',
      label: 'Status',
      width: '25%',
      render: (value: string) => {
        if (value === 'ok') {
          return <span style={{ color: colors.success }}>✓ OK</span>;
        } else if (value === 'error') {
          return <span style={{ color: colors.error }}>✗ Error</span>;
        }
        return <span style={{ color: colors.textSecondary }}>-</span>;
      }
    },
    { key: 'value', label: 'Value', width: '20%' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      {/* Comprehensive Form Layout Demo */}
      <Panel title="Form Layout">
        <Form

        >
          <FormSection title="Input Fields & Controls">
            <FormGroup>
              <FormRow columns={3}>
                <FormField label="Text Input" required>
                  <Input
                    value={inputValue}
                    onChange={setInputValue}
                    placeholder="Enter text..."
                  />
                </FormField>
                <FormField label="Number Input">
                  <Input
                    value=""
                    onChange={() => { }}
                    type="number"
                    placeholder="0"
                    min={0}
                    max={100}
                  />
                </FormField>
                <FormField label="Disabled Input">
                  <Input
                    value="Disabled"
                    onChange={() => { }}
                    placeholder="Disabled"
                    disabled={true}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={4}>
                <FormField label="Dropdown">
                  <Dropdown
                    options={dropdownOptions}
                    value={selectedDropdown}
                    onValueChange={setSelectedDropdown}
                    placeholder="Select option"
                  />
                </FormField>
                <FormField label="Date">
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </FormField>
                <FormField label="Time">
                  <TimePicker
                    value={selectedTime}
                    onChange={setSelectedTime}
                    step={300}
                  />
                </FormField>
                <FormField label="Toggle">
                  <ToggleSwitch
                    checked={toggleState}
                    onChange={setToggleState}
                    label="Enable"
                  />
                </FormField>
              </FormRow>

              <FormRow columns={2}>
                <FormField label="Radio Options">
                  <RadioButton
                    options={radioOptions}
                    value={selectedRadio}
                    onChange={setSelectedRadio}
                    name="size"
                    direction="horizontal"
                  />
                </FormField>
                <FormField label="Disabled Toggle">
                  <ToggleSwitch
                    checked={false}
                    onChange={() => { }}
                    label="Disabled"
                    disabled={true}
                  />
                </FormField>
              </FormRow>

              <FormRow columns={3}>
                <FormField label="Checkbox">
                  <Checkbox
                    checked={checkboxState}
                    onChange={setCheckboxState}
                    label="Enable feature"
                  />
                </FormField>
                <FormField label="Disabled Checkbox">
                  <Checkbox
                    checked={false}
                    onChange={() => { }}
                    label="Disabled option"
                    disabled={true}
                  />
                </FormField>
                <FormField label="Checked Disabled">
                  <Checkbox
                    checked={true}
                    onChange={() => { }}
                    label="Always on"
                    disabled={true}
                  />
                </FormField>
              </FormRow>

              <FormField label="Description" helpText="Maximum 500 characters">
                <Textarea
                  value={textareaValue}
                  onChange={setTextareaValue}
                  placeholder="Enter description..."
                  maxLength={500}
                  rows={3}
                />
              </FormField>
            </FormGroup>
          </FormSection>

          <FormSection title="Data Table">
            <FormGroup>
              <DataTable
                data={tableData}
                columns={tableColumns}
              />
            </FormGroup>
          </FormSection>
        </Form>

        <InfoBox title="Layout Notice" variant="plain">
          The Form component automatically removes bottom margins from the last elements for consistent spacing.
        </InfoBox>
      </Panel>

      {/* Color Picker */}
      <Panel title="Color Picker">
        <Form

        >
          <FormSection title="Color Picker">
            <FormGroup>
              <FormRow columns={3}>
                <FormField label="Small Color Picker">
                  <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                    size="small"
                  />
                </FormField>
                <FormField label="Medium Color Picker">
                  <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                    size="medium"
                  />
                </FormField>
                <FormField label="Large Color Picker">
                  <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                    size="large"
                  />
                </FormField>
              </FormRow>
            </FormGroup>
          </FormSection>
        </Form>
      </Panel>

      {/* DataGrid Demo */}
      <Panel title="DataGrid - Control Types Demo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InfoBox title="DataGrid Control Types" variant="info">
            This demo showcases all supported input control types in the DataGrid:<br />
            • <strong>Sticky Column:</strong> ID column stays fixed while scrolling horizontally<br />
            • <strong>Text Input:</strong> Editable text field<br />
            • <strong>Number Input:</strong> Numeric input with validation<br />
            • <strong>Select Dropdown:</strong> Dropdown with predefined options<br />
            • <strong>Rating Select:</strong> Star rating display with dropdown selection<br />
            • <strong>Checkbox:</strong> Boolean toggle with checkbox UI<br />
            • <strong>Toggle Switch:</strong> Boolean toggle with switch UI<br />
            • <strong>Date Picker:</strong> Date selection with calendar popup<br />
            • <strong>Time Picker:</strong> Time selection with time input<br />
            • <strong>Color Picker:</strong> Color selection with color preview and picker
          </InfoBox>

          <DataGrid
            data={gridData}
            columns={gridColumns}
            rowKey="id"
            height={400}
            editTrigger="single"
            selectionMode="multi"
            virtualizeRows={false}
            aggregatable={false}
            stickyFirstColumn={true}
            onDataChange={handleGridDataChange}
            onSelectionChange={(selection) => {
              console.log('Selected items:', selection);
            }}
          />

          <InfoBox title="Interactive Controls" variant="plain">
            <strong>Try the Controls:</strong> Click on any editable cell to test the different input types.<br />
            <strong>Column Resizing:</strong> Drag column borders to resize columns<br />
            <strong>Row Selection:</strong> Click rows to select them (multi-select supported)<br />
            <strong>Horizontal Scrolling:</strong> ID column stays sticky while other columns scroll
          </InfoBox>
        </div>
      </Panel>
    </div>
  );
}
