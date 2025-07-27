import { ColorPicker } from '@ui/components/base/ColorPicker';
import { DataTable } from '@ui/components/base/DataTable';
import { DatePicker } from '@ui/components/base/DatePicker';
import { Dropdown } from '@ui/components/base/Dropdown';
import { Form, FormField, FormGroup, FormRow, FormSection } from '@ui/components/base/FormLayout';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Input, Textarea } from '@ui/components/base/Input';
import { Panel } from '@ui/components/base/Panel';
import { RadioButton } from '@ui/components/base/RadioButton';
import { TimePicker } from '@ui/components/base/TimePicker';
import { Toast } from '@ui/components/base/Toast';
import { ToggleSwitch } from '@ui/components/base/ToggleSwitch';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
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
  const { toast, showToast, dismissToast } = useToast();

  // Form state
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectedDropdown, setSelectedDropdown] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('medium');
  const [toggleState, setToggleState] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  });
  const [selectedTime, setSelectedTime] = useState('09:00');

  // Color picker state
  const [selectedColor, setSelectedColor] = useState('#3772FF');

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

      {/* Toast Notification */}
      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
