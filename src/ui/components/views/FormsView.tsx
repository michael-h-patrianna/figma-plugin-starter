import { useMemo } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';
import { Accordion } from '../base/Accordion';
import { DataTable } from '../base/DataTable';
import { DatePicker } from '../base/DatePicker';
import { Dropdown } from '../base/Dropdown';
import { Input, Textarea } from '../base/Input';
import { Panel } from '../base/Panel';
import { RadioButton } from '../base/RadioButton';
import { TimePicker } from '../base/TimePicker';
import { ToggleSwitch } from '../base/ToggleSwitch';

interface FormsViewProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  textareaValue: string;
  onTextareaChange: (value: string) => void;
  selectedDropdown: string;
  onDropdownChange: (value: string) => void;
  selectedRadio: string;
  onRadioChange: (value: string) => void;
  toggleState: boolean;
  onToggleChange: (value: boolean) => void;
  isLoading: boolean;
  onDemoLoading: () => void;
  onShowToast: () => void;
  accordionItems: Array<{
    id: string;
    title: string;
    content: any;
  }>;
  selectedDate: string;
  onDateChange: (value: string) => void;
  selectedTime: string;
  onTimeChange: (value: string) => void;
}

export function FormsView({
  inputValue,
  onInputChange,
  textareaValue,
  onTextareaChange,
  selectedDropdown,
  onDropdownChange,
  selectedRadio,
  onRadioChange,
  toggleState,
  onToggleChange,
  isLoading,
  onDemoLoading,
  onShowToast,
  accordionItems,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange
}: FormsViewProps) {
  const { colors } = useTheme();

  const dropdownOptions = [
    { value: 'option1', label: 'First Option' },
    { value: 'option2', label: 'Second Option' },
    { value: 'option3', label: 'Third Option' },
    { value: 'disabled', label: 'Disabled Option', disabled: true }
  ];

  const radioOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'disabled', label: 'Extra Large (Disabled)', disabled: true }
  ];

  // Generate demo table data - 20 rows with the last one having status
  // Use useMemo to prevent regeneration on every render
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
  }, []); // Empty dependency array means this only runs once

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Standard Form Elements Panel */}
      <Panel title="Standard Form Elements">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Input
              value={inputValue}
              onChange={onInputChange}
              placeholder="Enter text..."
              label="Text Input"
              width="180px"
            />
            <Input
              value={inputValue}
              onChange={onInputChange}
              type="number"
              placeholder="0"
              label="Number Input"
              width="100px"
              min={0}
              max={100}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
            <Dropdown
              options={dropdownOptions}
              value={selectedDropdown}
              onChange={onDropdownChange}
              placeholder="Select option"
              width="160px"
            />
            <ToggleSwitch
              checked={toggleState}
              onChange={onToggleChange}
              label="Enable Feature"
            />
          </div>

          <RadioButton
            options={radioOptions}
            value={selectedRadio}
            onChange={onRadioChange}
            name="size"
            label="Size Options"
            direction="horizontal"
          />

          <Textarea
            value={textareaValue}
            onChange={onTextareaChange}
            placeholder="Enter longer text..."
            label="Textarea (Scrollable)"
            maxLength={500}
            rows={4}
          />
        </div>
      </Panel>

      {/* Date and Time Panel */}
      <Panel title="Date & Time Inputs">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              Native HTML5 date and time pickers with proper styling for the dark theme.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
            <DatePicker
              value={selectedDate}
              onChange={onDateChange}
              label="Start Date"
              min="2024-01-01"
              max="2025-12-31"
            />

            <TimePicker
              value={selectedTime}
              onChange={onTimeChange}
              label="Start Time"
              step={300} // 5-minute intervals
            />

            <DatePicker
              value={selectedDate}
              onChange={onDateChange}
              label="End Date (Disabled)"
              disabled={true}
            />
          </div>

          <div style={{
            background: colors.darkBg,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            padding: 12,
            fontSize: 12
          }}>
            <div style={{ color: colors.textSecondary, marginBottom: 8 }}>Selected values:</div>
            <div style={{ color: colors.textColor, fontFamily: 'monospace' }}>
              Date: {selectedDate || 'Not selected'}<br />
              Time: {selectedTime || 'Not selected'}
              {selectedDate && selectedTime && (
                <>
                  <br />
                  Combined: {new Date(`${selectedDate}T${selectedTime}`).toLocaleString()}
                </>
              )}
            </div>
          </div>
        </div>
      </Panel>

      {/* Data Table Panel */}
      <Panel title="Data Table">
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: colors.textSecondary, margin: 0, fontSize: 13, lineHeight: 1.5 }}>
            Interactive data table with sorting, filtering, and selection capabilities. ({tableData.length} rows - scrollable after row 8)
          </p>
        </div>
        <DataTable
          data={tableData}
          columns={tableColumns}
        />
      </Panel>

      {/* Interactive Elements Panel */}
      <Panel title="Interactive Elements">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Accordion items={accordionItems} defaultOpen={['overview']} />
        </div>
      </Panel>
    </div>
  );
}
