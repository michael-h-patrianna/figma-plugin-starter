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
export interface DataGridColumn<T = any> {
  key: keyof T;
  title: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  hidden?: boolean;
  type?: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'color' | 'select' | 'toggle';
  options?: Array<{ value: any; label: string }>;
  formatter?: (value: any) => string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  min?: number;
  max?: number;
  editor?: (props: EditorProps) => JSX.Element;
}

export interface EditorProps {
  value: any;
  onChange: (value: any) => void;
  onCancel: () => void;
  onCommit: () => void;
  column: DataGridColumn;
  row: any;
}

export interface DataGridState {
  sortBy?: { key: string; direction: 'asc' | 'desc' }[];
  filters?: Record<string, any>;
  groupBy?: string[];
  selection?: any[];
  expandedGroups?: string[];
  scrollPosition?: { top: number; left: number };
}

export interface DataGridProps<T = any> {
  data: T[];
  columns: DataGridColumn<T>[];
  rowKey: string | ((row: T) => string);
  state?: DataGridState;
  defaultState?: DataGridState;
  height?: number | string;
  rowHeight?: number | ((row: T) => number);
  editTrigger?: 'single' | 'double';
  selectionMode?: 'single' | 'multi' | 'checkbox';
  virtualizeRows?: boolean;
  virtualizeColumns?: boolean;
  groupable?: boolean;
  aggregatable?: boolean;
  exportable?: boolean;
  stickyFirstColumn?: boolean;
  onDataChange?: (delta: { added?: T[]; updated?: T[]; deleted?: T[] }) => void;
  onStateChange?: (state: DataGridState) => void;
  onSelectionChange?: (selection: T[]) => void;
  onRowClick?: (row: T, event: Event) => void;
  locale?: string;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

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

    return (
      <div
        key={column.key}
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
      >
        {renderCell(row, column, rowIndex)}
      </div>
    );
  };

  return (
    <div
      ref={gridRef}
      className={className}
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
        {visibleColumns.map((column, index) => renderHeaderCell(column, index))}
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
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
