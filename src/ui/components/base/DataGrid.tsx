import { useTheme } from '@ui/contexts/ThemeContext';
import { JSX } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Checkbox } from './Checkbox';
import { ColorPicker } from './ColorPicker';
import './DataGrid.css';
import { DatePicker } from './DatePicker';
import { Dropdown } from './Dropdown';
import { Input } from './Input';
import { TimePicker } from './TimePicker';
import { ToggleSwitch } from './ToggleSwitch';

// Types and Interfaces

/**
 * Configuration for a DataGrid column.
 * @template T - The type of data objects in the grid
 */
export interface DataGridColumn<T = any> {
  /** Unique key identifying the data property */
  key: keyof T;
  /** Display title for the column header */
  title: string;
  /** Fixed width in pixels */
  width?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Whether the column can be resized by dragging */
  resizable?: boolean;
  /** Whether the column supports sorting */
  sortable?: boolean;
  /** Whether the column supports filtering */
  filterable?: boolean;
  /** Whether cells in this column can be edited */
  editable?: boolean;
  /** Whether the column is hidden from view */
  hidden?: boolean;
  /** Data type for specialized rendering and editing */
  type?: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'color' | 'select' | 'toggle';
  /** Options for select-type columns */
  options?: Array<{ value: any; label: string }>;
  /** Custom formatter function for cell display */
  formatter?: (value: any) => string;
  /** Aggregation function to apply to column data */
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Custom editor component for cell editing */
  editor?: (props: EditorProps) => JSX.Element;
}

/**
 * Props passed to custom cell editor components.
 */
export interface EditorProps {
  /** Current value of the cell being edited */
  value: any;
  /** Function to call when value changes */
  onChange: (value: any) => void;
  /** Function to call to cancel editing */
  onCancel: () => void;
  /** Function to call to commit changes */
  onCommit: () => void;
  /** Column configuration object */
  column: DataGridColumn;
  /** The complete row data object */
  row: any;
}

/**
 * State object for DataGrid component.
 */
export interface DataGridState {
  /** Current sorting configuration */
  sortBy?: { key: string; direction: 'asc' | 'desc' }[];
  /** Current filter values by column key */
  filters?: Record<string, any>;
  /** Column keys to group data by */
  groupBy?: string[];
  /** Array of selected row identifiers */
  selection?: any[];
  /** Array of expanded group identifiers */
  expandedGroups?: string[];
  /** Current scroll position */
  scrollPosition?: { top: number; left: number };
}

/**
 * Props for the DataGrid component.
 * @template T - The type of data objects in the grid
 */
export interface DataGridProps<T = any> {
  /** Array of data objects to display */
  data: T[];
  /** Column configuration array */
  columns: DataGridColumn<T>[];
  /** Property name or function to generate unique row keys */
  rowKey: string | ((row: T) => string);
  /** External state object (for controlled mode) */
  state?: DataGridState;
  /** Default state for uncontrolled mode */
  defaultState?: DataGridState;
  /** Height of the grid container */
  height?: number | string;
  /** Height of individual rows */
  rowHeight?: number | ((row: T) => number);
  /** Trigger type for cell editing */
  editTrigger?: 'single' | 'double';
  /** Row selection behavior */
  selectionMode?: 'single' | 'multi' | 'checkbox';
  /** Whether to use virtual scrolling for rows */
  virtualizeRows?: boolean;
  /** Whether to use virtual scrolling for columns */
  virtualizeColumns?: boolean;
  /** Whether rows can be grouped */
  groupable?: boolean;
  /** Whether to show aggregation footer */
  aggregatable?: boolean;
  /** Whether to show export functionality */
  exportable?: boolean;
  /** Whether the first column should stick during horizontal scroll */
  stickyFirstColumn?: boolean;
  /** Callback when data changes (for editing) */
  onDataChange?: (delta: { added?: T[]; updated?: T[]; deleted?: T[] }) => void;
  /** Callback when grid state changes */
  onStateChange?: (state: DataGridState) => void;
  /** Callback when row selection changes */
  onSelectionChange?: (selection: T[]) => void;
  /** Callback when a row is clicked */
  onRowClick?: (row: T, event: Event) => void;
  /** Locale for formatting */
  locale?: string;
  /** Theme override */
  theme?: 'light' | 'dark';
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Accessible label for the data grid */
  'aria-label'?: string;
  /** ID of element that labels the data grid */
  'aria-labelledby'?: string;
  /** ID of element that describes the data grid */
  'aria-describedby'?: string;
  /** Unique ID for the data grid */
  id?: string;
}

/**
 * A comprehensive data grid component with virtual scrolling, editing, sorting, and filtering.
 *
 * Features include:
 * - Virtual scrolling for performance with large datasets
 * - In-line cell editing with various input types
 * - Multi-column sorting and filtering
 * - Row selection (single/multi)
 * - Column resizing and reordering
 * - Aggregation footer
 * - Sticky first column option
 * - Responsive design with theme integration
 *
 * @param props - The DataGrid props
 * @returns A feature-rich data grid component
 *
 * @example
 * ```tsx
 * // Basic data grid
 * <DataGrid
 *   data={users}
 *   columns={[
 *     { key: 'name', title: 'Name', sortable: true, editable: true },
 *     { key: 'email', title: 'Email', type: 'email' },
 *     { key: 'active', title: 'Active', type: 'boolean' }
 *   ]}
 *   rowKey="id"
 *   height={400}
 * />
 *
 * // Advanced grid with editing and aggregation
 * <DataGrid
 *   data={salesData}
 *   columns={[
 *     { key: 'product', title: 'Product', editable: true },
 *     { key: 'amount', title: 'Amount', type: 'number', aggregation: 'sum' },
 *     { key: 'date', title: 'Date', type: 'date' }
 *   ]}
 *   rowKey="id"
 *   aggregatable
 *   onDataChange={handleDataChange}
 * />
 * ```
 */

// Default cell editors
const TextEditor = ({ value, onChange, onCommit, onCancel }: EditorProps) => {
  const [localValue, setLocalValue] = useState(value);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(localValue);
      onCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onChange(localValue);
    onCommit();
  };

  return (
    <div onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <Input
        value={localValue}
        onChange={setLocalValue}
        placeholder=""
      />
    </div>
  );
}; const NumberEditor = ({ value, onChange, onCommit, onCancel, column }: EditorProps) => {
  const [localValue, setLocalValue] = useState(String(value || ''));

  const validateAndClamp = (val: number) => {
    let clampedValue = val;
    if (column.min !== undefined && clampedValue < column.min) {
      clampedValue = column.min;
    }
    if (column.max !== undefined && clampedValue > column.max) {
      clampedValue = column.max;
    }
    return clampedValue;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const numValue = Number(localValue);
      const clampedValue = validateAndClamp(numValue);
      onChange(clampedValue);
      onCommit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    const numValue = Number(localValue);
    const clampedValue = validateAndClamp(numValue);
    onChange(clampedValue);
    onCommit();
  };

  return (
    <div onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <Input
        value={localValue}
        onChange={setLocalValue}
        type="number"
        min={column.min}
        max={column.max}
        placeholder=""
      />
    </div>
  );
};

const BooleanEditor = ({ value, onChange, onCommit }: EditorProps) => {
  useEffect(() => {
    onChange(!value);
    onCommit();
  }, []);

  return null;
};

const SelectEditor = ({ value, onChange, onCommit, onCancel, column }: EditorProps) => {
  const handleChange = (newValue: string) => {
    // Convert to number if all options are numeric
    const numericValue = Number(newValue);
    const finalValue = !isNaN(numericValue) && column.options?.every(opt => typeof opt.value === 'number')
      ? numericValue
      : newValue;
    onChange(finalValue);
    onCommit();
  };

  // Convert DataGrid column options to Dropdown options
  const dropdownOptions = column.options?.map(option => ({
    value: String(option.value),
    text: option.label,
    disabled: false
  })) || [];

  return (
    <Dropdown
      options={dropdownOptions}
      value={String(value)}
      onValueChange={handleChange}
      placeholder="Select..."
    />
  );
};

const DateEditor = ({ value, onChange, onCommit, onCancel }: EditorProps) => {
  const [localValue, setLocalValue] = useState(value || '');

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    onCommit();
  };

  return (
    <DatePicker
      value={localValue}
      onChange={handleChange}
    />
  );
};

const TimeEditor = ({ value, onChange, onCommit, onCancel }: EditorProps) => {
  const [localValue, setLocalValue] = useState(value || '09:00');

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    onCommit();
  };

  return (
    <TimePicker
      value={localValue}
      onChange={handleChange}
    />
  );
};

const ColorEditor = ({ value, onChange, onCommit, onCancel }: EditorProps) => {
  const [localValue, setLocalValue] = useState(value || '#3772FF');

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    onCommit();
  };

  return (
    <ColorPicker
      value={localValue}
      onChange={handleChange}
      size="small"
    />
  );
};

const ToggleEditor = ({ value, onChange, onCommit }: EditorProps) => {
  useEffect(() => {
    onChange(!value);
    onCommit();
  }, []);

  return null;
};

// Main DataGrid component
export function DataGrid<T = any>({
  data,
  columns: initialColumns,
  rowKey,
  state,
  defaultState,
  height = 400,
  rowHeight = 32,
  editTrigger = 'single',
  selectionMode = 'single',
  virtualizeRows = true,
  virtualizeColumns = false,
  groupable = false,
  aggregatable = false,
  exportable = false,
  stickyFirstColumn = false,
  onDataChange,
  onStateChange,
  onSelectionChange,
  onRowClick,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  id,
  ...props
}: DataGridProps<T>) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Column resizing state
  const [columns, setColumns] = useState(initialColumns);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const [internalState, setInternalState] = useState<DataGridState>(defaultState || {});
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Use external state if provided, otherwise use internal state
  const currentState = state || internalState;
  const setState = useCallback((newState: DataGridState) => {
    if (state) {
      onStateChange?.(newState);
    } else {
      setInternalState(newState);
    }
  }, [state, onStateChange]);

  // Get row key function
  const getRowKey = useCallback((row: T, index: number) => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return (row as any)[rowKey] || index.toString();
  }, [rowKey]);

  // Column resizing handlers
  const handleResizeStart = useCallback((e: MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    setResizeStartX(e.clientX);
    const column = columns.find(col => col.key === columnKey);
    setResizeStartWidth(column?.width || 150);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [columns]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;

    const deltaX = e.clientX - resizeStartX;
    const newWidth = Math.max(50, resizeStartWidth + deltaX); // Min width of 50px

    setColumns(prev => prev.map(col =>
      col.key === resizingColumn
        ? { ...col, width: Math.min(newWidth, col.maxWidth || 500) }
        : col
    ));
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);

  // Cleanup resize listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!currentState.sortBy?.length) return data;

    return [...data].sort((a, b) => {
      for (const sort of currentState.sortBy!) {
        const aValue = (a as any)[sort.key];
        const bValue = (b as any)[sort.key];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return sort.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }, [data, currentState.sortBy]);

  // Filtering logic
  const filteredData = useMemo(() => {
    if (!currentState.filters) return sortedData;

    return sortedData.filter(row => {
      return Object.entries(currentState.filters!).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const value = (row as any)[key];
        if (typeof filterValue === 'string') {
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        }
        return value === filterValue;
      });
    });
  }, [sortedData, currentState.filters]);

  // Virtual scrolling calculations
  const itemHeight = typeof rowHeight === 'number' ? rowHeight : 32;
  const containerHeight = typeof height === 'number' ? height : 400;
  const visibleRowCount = Math.ceil(containerHeight / itemHeight) + 5; // Buffer rows
  const startIndex = virtualizeRows ? Math.floor(scrollTop / itemHeight) : 0;
  const endIndex = virtualizeRows ? Math.min(startIndex + visibleRowCount, filteredData.length) : filteredData.length;
  const visibleData = filteredData.slice(startIndex, endIndex);

  // Column handling
  const visibleColumns = columns.filter(col => !col.hidden);

  // Sorting handler
  const handleSort = useCallback((columnKey: string, event: MouseEvent) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const currentSort = currentState.sortBy?.find(s => s.key === columnKey);
    let newSortBy = [...(currentState.sortBy || [])];

    if (event.shiftKey) {
      // Multi-sort
      if (currentSort) {
        if (currentSort.direction === 'asc') {
          currentSort.direction = 'desc';
        } else {
          newSortBy = newSortBy.filter(s => s.key !== columnKey);
        }
      } else {
        newSortBy.push({ key: columnKey, direction: 'asc' });
      }
    } else {
      // Single sort
      if (currentSort?.direction === 'asc') {
        newSortBy = [{ key: columnKey, direction: 'desc' }];
      } else if (currentSort?.direction === 'desc') {
        newSortBy = [];
      } else {
        newSortBy = [{ key: columnKey, direction: 'asc' }];
      }
    }

    setState({ ...currentState, sortBy: newSortBy });
  }, [columns, currentState, setState]);

  // Filter handler
  const handleFilter = useCallback((columnKey: string, filterValue: any) => {
    const newFilters = { ...currentState.filters };
    if (filterValue) {
      newFilters[columnKey] = filterValue;
    } else {
      delete newFilters[columnKey];
    }
    setState({ ...currentState, filters: newFilters });
  }, [currentState, setState]);

  // Cell editing handlers
  const handleCellClick = useCallback((rowIndex: number, columnKey: string, event: MouseEvent) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.editable) return;

    if (editTrigger === 'single' || (editTrigger === 'double' && event.detail === 2)) {
      setEditingCell({ rowIndex: startIndex + rowIndex, columnKey });
    }
  }, [columns, editTrigger, startIndex]);

  const handleCellCommit = useCallback((rowIndex: number, columnKey: string, newValue: any) => {
    const actualRowIndex = startIndex + rowIndex;
    const row = filteredData[actualRowIndex];
    const updatedRow = { ...row, [columnKey]: newValue };

    // Fire data change event
    onDataChange?.({ updated: [updatedRow] });

    setEditingCell(null);
  }, [startIndex, filteredData, onDataChange]);

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  // Scroll handler
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  // Selection handlers
  const handleRowSelection = useCallback((row: T, event: MouseEvent) => {
    if (selectionMode === 'single') {
      setState({ ...currentState, selection: [getRowKey(row, 0)] });
      onSelectionChange?.([row]);
    } else if (selectionMode === 'multi') {
      const currentSelection = currentState.selection || [];
      const rowId = getRowKey(row, 0);

      let newSelection: string[];
      if (event.ctrlKey || event.metaKey) {
        // Toggle selection
        if (currentSelection.includes(rowId)) {
          newSelection = currentSelection.filter(id => id !== rowId);
        } else {
          newSelection = [...currentSelection, rowId];
        }
      } else {
        newSelection = [rowId];
      }

      setState({ ...currentState, selection: newSelection });
      const selectedRows = filteredData.filter(r => newSelection.includes(getRowKey(r, 0)));
      onSelectionChange?.(selectedRows);
    }
  }, [selectionMode, currentState, setState, getRowKey, filteredData, onSelectionChange]);

  // Default cell editors
  const getDefaultEditor = (column: DataGridColumn) => {
    switch (column.type) {
      case 'number': return NumberEditor;
      case 'boolean': return BooleanEditor;
      case 'select': return SelectEditor;
      case 'date': return DateEditor;
      case 'time': return TimeEditor;
      case 'color': return ColorEditor;
      case 'toggle': return ToggleEditor;
      default: return TextEditor;
    }
  };

  // Render cell content
  const renderCell = (row: T, column: DataGridColumn, rowIndex: number) => {
    const value = (row as any)[column.key];
    const isEditing = editingCell?.rowIndex === (startIndex + rowIndex) && editingCell?.columnKey === column.key;

    if (isEditing && column.editable) {
      const Editor = column.editor || getDefaultEditor(column);
      return (
        <Editor
          value={value}
          onChange={(newValue) => {
            // Update the data immediately when value changes
            handleCellCommit(rowIndex, String(column.key), newValue);
          }}
          onCommit={() => {
            // Just exit editing mode since value is already committed
            setEditingCell(null);
          }}
          onCancel={handleCellCancel}
          column={column}
          row={row}
        />
      );
    }

    if (column.type === 'boolean') {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={Boolean(value)}
            onChange={(newValue) => {
              if (column.editable) {
                handleCellCommit(rowIndex, String(column.key), newValue);
              }
            }}
            disabled={!column.editable}
          />
        </div>
      );
    }

    if (column.type === 'toggle') {
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <ToggleSwitch
            checked={Boolean(value)}
            onChange={(newValue) => {
              if (column.editable) {
                handleCellCommit(rowIndex, String(column.key), newValue);
              }
            }}
            disabled={!column.editable}
            label=""
          />
        </div>
      );
    }

    if (column.type === 'color') {
      return (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: `${borderRadius.small}px`,
              backgroundColor: value || '#000000',
              border: `1px solid ${colors.border}`,
              cursor: column.editable ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (column.editable) {
                setEditingCell({ rowIndex: startIndex + rowIndex, columnKey: String(column.key) });
              }
            }}
          />
          <span style={{ fontSize: `${typography.caption}px`, color: colors.textSecondary }}>
            {value || '#000000'}
          </span>
        </div>
      );
    }

    if (column.formatter) {
      return column.formatter(value);
    }

    return String(value || '');
  };

  // Render sort indicator
  const renderSortIndicator = (columnKey: string) => {
    const sort = currentState.sortBy?.find(s => s.key === columnKey);
    if (!sort) return null;

    return (
      <span style={{ marginLeft: spacing.xs, fontSize: typography.caption }}>
        {sort.direction === 'asc' ? '↑' : '↓'}
        {currentState.sortBy!.length > 1 && (
          <span style={{ fontSize: typography.tiny }}>
            {currentState.sortBy!.findIndex(s => s.key === columnKey) + 1}
          </span>
        )}
      </span>
    );
  };

  // Render header cell
  const renderHeaderCell = (column: DataGridColumn, columnIndex: number) => {
    const isFirstColumn = columnIndex === 0;
    const isSticky = stickyFirstColumn && isFirstColumn;

    const sortColumn = currentState.sortBy?.find(sort => sort.key === String(column.key));

    return (
      <div
        key={column.key}
        role="columnheader"
        aria-sort={
          sortColumn
            ? sortColumn.direction === 'asc'
              ? 'ascending'
              : 'descending'
            : column.sortable
              ? 'none'
              : undefined
        }
        aria-label={`${column.title} column`}
        tabIndex={column.sortable ? 0 : -1}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.sm}px ${spacing.sm + spacing.xs}px`,
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.backgroundSecondary,
          fontWeight: 600,
          fontSize: typography.body,
          minWidth: column.minWidth || 100,
          width: column.width || 150,
          cursor: column.sortable ? 'pointer' : 'default',
          userSelect: 'none',
          position: isSticky ? 'sticky' : 'relative',
          left: isSticky ? 0 : 'auto',
          zIndex: isSticky ? 11 : 1
        }}
        onClick={(e) => column.sortable && handleSort(String(column.key), e)}
        onKeyDown={(e) => {
          if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleSort(String(column.key), e as any);
          }
        }}
      >
        <span>{column.title}</span>
        {renderSortIndicator(String(column.key))}
        {(column.resizable !== false) && (
          <div
            className={`data-grid-resizer ${resizingColumn === String(column.key) ? 'resizing' : ''}`}
            onMouseDown={(e) => handleResizeStart(e, String(column.key))}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    );
  };

  // Render data cell
  const renderDataCell = (row: T, column: DataGridColumn, rowIndex: number, columnIndex: number, rowBackgroundColor: string) => {
    const isFirstColumn = columnIndex === 0;
    const isSticky = stickyFirstColumn && isFirstColumn;
    const isEditing = editingCell?.rowIndex === (startIndex + rowIndex) && editingCell?.columnKey === column.key;

    return (
      <div
        key={column.key}
        role="gridcell"
        aria-colindex={columnIndex + 1}
        aria-label={`${column.title}: ${String((row as any)[column.key] || '')}`}
        tabIndex={column.editable ? 0 : -1}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${spacing.sm}px ${spacing.sm + spacing.xs}px`,
          borderRight: `1px solid ${colors.border}`,
          minWidth: column.minWidth || 100,
          width: column.width || 150,
          cursor: column.editable ? 'pointer' : 'default',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          position: isSticky ? 'sticky' : 'relative',
          left: isSticky ? 0 : 'auto',
          zIndex: isSticky ? 1 : 0,
          backgroundColor: rowBackgroundColor
        }}
        onClick={(e) => handleCellClick(rowIndex, String(column.key), e)}
        onKeyDown={(e) => {
          if (column.editable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleCellClick(rowIndex, String(column.key), e as any);
          }
        }}
      >
        {renderCell(row, column, rowIndex)}
      </div>
    );
  };

  return (
    <div
      ref={gridRef}
      className={className}
      role="grid"
      aria-label={ariaLabel || `Data grid with ${data.length} rows and ${visibleColumns.length} columns`}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-rowcount={data.length + 1} // +1 for header row
      aria-colcount={visibleColumns.length}
      id={id}
      tabIndex={0}
      style={{
        height,
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.medium,
        overflow: 'hidden',
        backgroundColor: colors.darkBg,
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      {...props}
    >
      {/* Header */}
      <div
        ref={headerRef}
        role="rowgroup"
        aria-label="Column headers"
        style={{
          display: 'flex',
          borderBottom: `2px solid ${colors.border}`,
          backgroundColor: colors.backgroundSecondary,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          overflow: 'hidden',
          minWidth: 'fit-content'
        }}
      >
        <div role="row" style={{ display: 'flex', width: '100%' }}>
          {visibleColumns.map((column, index) => renderHeaderCell(column, index))}
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        role="rowgroup"
        aria-label="Data rows"
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          setScrollLeft(target.scrollLeft);
          setScrollTop(target.scrollTop);

          // Sync header scroll by transforming only non-sticky columns
          if (headerRef.current) {
            const headerChildren = headerRef.current.children;
            for (let i = 0; i < headerChildren.length; i++) {
              const headerCell = headerChildren[i] as HTMLElement;
              const isFirstColumn = i === 0;
              const isSticky = stickyFirstColumn && isFirstColumn;

              if (isSticky) {
                // First column should not transform with scroll when sticky
                headerCell.style.transform = '';
              } else {
                // Non-sticky columns should transform with scroll
                headerCell.style.transform = `translateX(-${target.scrollLeft}px)`;
              }
            }
          }
        }}
      >
        {/* Virtual scroll spacer */}
        {virtualizeRows && (
          <div style={{ height: startIndex * itemHeight }} />
        )}

        {/* Visible rows */}
        {visibleData.map((row, rowIndex) => {
          const actualRowIndex = startIndex + rowIndex;
          const rowId = getRowKey(row, actualRowIndex);
          const isSelected = currentState.selection?.includes(rowId);
          const rowBackgroundColor = isSelected ? colors.buttonSecondaryHover :
            actualRowIndex % 2 === 0 ? colors.darkBg : colors.backgroundSecondary;

          // Check if any cell in this row is being edited with a dropdown
          const hasEditingDropdown = editingCell?.rowIndex === actualRowIndex &&
            visibleColumns.find(col => col.key === editingCell.columnKey)?.type === 'select';

          return (
            <div
              key={rowId}
              role="row"
              aria-rowindex={actualRowIndex + 2} // +2 because index starts at 1 and includes header
              aria-selected={isSelected ? "true" : "false"}
              style={{
                display: 'flex',
                height: typeof rowHeight === 'function' ? rowHeight(row) : itemHeight,
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: 'transparent', // Remove row background - let cells handle it
                cursor: selectionMode !== 'single' ? 'pointer' : 'default',
                minWidth: 'fit-content',
                overflow: stickyFirstColumn ? 'visible' : 'hidden'
              }}
              onClick={(e) => {
                handleRowSelection(row, e);
                onRowClick?.(row, e);
              }}
            >
              {visibleColumns.map((column, columnIndex) => renderDataCell(row, column, rowIndex, columnIndex, rowBackgroundColor))}
            </div>
          );
        })}

        {/* Virtual scroll spacer */}
        {virtualizeRows && (
          <div style={{ height: (filteredData.length - endIndex) * itemHeight }} />
        )}
      </div>

      {/* Footer with aggregations */}
      {aggregatable && (
        <div
          style={{
            display: 'flex',
            borderTop: `2px solid ${colors.border}`,
            backgroundColor: colors.backgroundSecondary,
            fontWeight: 600
          }}
        >
          {visibleColumns.map(column => {
            if (!column.aggregation) {
              return (
                <div
                  key={column.key}
                  style={{
                    padding: `${spacing.sm}px ${spacing.sm + spacing.xs}px`,
                    borderRight: `1px solid ${colors.border}`,
                    minWidth: column.minWidth || 100,
                    width: column.width || 150
                  }}
                />
              );
            }

            const values = filteredData.map(row => (row as any)[column.key]).filter(v => v != null);
            let aggregateValue = '';

            switch (column.aggregation) {
              case 'sum':
                aggregateValue = values.reduce((sum, val) => sum + Number(val), 0).toString();
                break;
              case 'avg':
                aggregateValue = values.length ? (values.reduce((sum, val) => sum + Number(val), 0) / values.length).toFixed(2) : '0';
                break;
              case 'min':
                aggregateValue = Math.min(...values.map(Number)).toString();
                break;
              case 'max':
                aggregateValue = Math.max(...values.map(Number)).toString();
                break;
              case 'count':
                aggregateValue = values.length.toString();
                break;
            }

            return (
              <div
                key={column.key}
                style={{
                  padding: `${spacing.sm}px ${spacing.sm + spacing.xs}px`,
                  borderRight: `1px solid ${colors.border}`,
                  minWidth: column.minWidth || 100,
                  width: column.width || 150
                }}
              >
                {aggregateValue}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DataGrid;
