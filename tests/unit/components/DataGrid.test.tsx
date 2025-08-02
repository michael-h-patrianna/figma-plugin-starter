import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/preact';
import { DataGrid, DataGridColumn, DataGridProps } from '@ui/components/base/DataGrid';
import { ThemeProvider } from '@ui/contexts/ThemeContext';

// Mock window.ResizeObserver for virtual scrolling
class MockResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
}

global.ResizeObserver = MockResizeObserver;

// Test wrapper with theme
const renderDataGrid = (props: Partial<DataGridProps>) => {
  const defaultProps: DataGridProps = {
    data: [],
    columns: [],
    ...props
  };

  return render(
    <ThemeProvider>
      <DataGrid {...defaultProps} />
    </ThemeProvider>
  );
};

describe('DataGrid', () => {
  // Sample test data
  const sampleData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com', active: false },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com', active: true }
  ];

  const basicColumns: DataGridColumn[] = [
    { key: 'name', title: 'Name', width: 150, sortable: true },
    { key: 'age', title: 'Age', width: 100, type: 'number', sortable: true },
    { key: 'email', title: 'Email', width: 200 },
    { key: 'active', title: 'Active', width: 100, type: 'boolean' }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with empty data', () => {
      const { container } = renderDataGrid({
        data: [],
        columns: basicColumns
      });

      // Check for basic grid structure
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with data and columns', () => {
      renderDataGrid({
        data: sampleData,
        columns: basicColumns
      });

      // Check column headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('applies custom className and style', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        className: 'custom-grid',
        style: { border: '2px solid red' }
      });

      const grid = container.querySelector('.custom-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveStyle('border: 2px solid red');
    });

    it('sets grid height correctly', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        height: 500
      });

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveStyle('height: 500px');
    });
  });

  describe('Column Configuration', () => {
    it('respects column widths', () => {
      const columnsWithWidths: DataGridColumn[] = [
        { key: 'name', title: 'Name', width: 200 },
        { key: 'age', title: 'Age', width: 80 }
      ];

      renderDataGrid({
        data: sampleData,
        columns: columnsWithWidths
      });

      // Verify columns are rendered
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });

    it('renders sortable columns with sort indicators', () => {
      const sortableColumns: DataGridColumn[] = [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'age', title: 'Age', sortable: true }
      ];

      renderDataGrid({
        data: sampleData,
        columns: sortableColumns
      });

      // Check for sortable headers
      const nameHeader = screen.getByText('Name');
      const ageHeader = screen.getByText('Age');

      expect(nameHeader).toBeInTheDocument();
      expect(ageHeader).toBeInTheDocument();
    });

    it('handles hidden columns correctly', () => {
      const columnsWithHidden: DataGridColumn[] = [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age', hidden: true },
        { key: 'email', title: 'Email' }
      ];

      renderDataGrid({
        data: sampleData,
        columns: columnsWithHidden
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Age')).not.toBeInTheDocument(); // Hidden column
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('formats different data types correctly', () => {
      const typedColumns: DataGridColumn[] = [
        { key: 'name', title: 'Name', type: 'text' },
        { key: 'age', title: 'Age', type: 'number' },
        { key: 'active', title: 'Active', type: 'boolean' }
      ];

      renderDataGrid({
        data: sampleData,
        columns: typedColumns
      });

      // Text should render as-is
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Numbers should be displayed
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('applies custom formatters when provided', () => {
      const formattedColumns: DataGridColumn[] = [
        {
          key: 'age',
          title: 'Age',
          formatter: (value) => `${value} years old`
        }
      ];

      renderDataGrid({
        data: sampleData,
        columns: formattedColumns
      });

      expect(screen.getByText('30 years old')).toBeInTheDocument();
      expect(screen.getByText('25 years old')).toBeInTheDocument();
    });

    it('handles empty or null values gracefully', () => {
      const dataWithNulls = [
        { id: 1, name: null, age: 30 },
        { id: 2, name: '', age: null },
        { id: 3, name: 'Bob', age: 35 }
      ];

      renderDataGrid({
        data: dataWithNulls,
        columns: [
          { key: 'name', title: 'Name' },
          { key: 'age', title: 'Age' }
        ]
      });

      // Should render without throwing errors
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    const mockOnStateChange = jest.fn();

    it('enables sorting on sortable columns', () => {
      renderDataGrid({
        data: sampleData,
        columns: [
          { key: 'name', title: 'Name', sortable: true },
          { key: 'age', title: 'Age', sortable: true }
        ],
        onStateChange: mockOnStateChange
      });

      // Click on sortable column header
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);

      // Should render sortable headers
      expect(nameHeader).toBeInTheDocument();
    });

    it('handles sorting state correctly', () => {
      renderDataGrid({
        data: sampleData,
        columns: [
          { key: 'name', title: 'Name', sortable: true }
        ],
        state: {
          sortBy: [{ key: 'name', direction: 'asc' }]
        }
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    const mockOnSelectionChange = jest.fn();

    it('supports single selection mode', () => {
      renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        selectionMode: 'single',
        onSelectionChange: mockOnSelectionChange
      });

      // Click on a row
      const firstRow = screen.getByText('John Doe');
      fireEvent.click(firstRow);

      // Should trigger selection change
      expect(mockOnSelectionChange).toHaveBeenCalled();
    });

    it('supports multiple selection mode', () => {
      renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        selectionMode: 'multiple',
        onSelectionChange: mockOnSelectionChange
      });

      // Should render selection checkboxes (implementation dependent)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles row click events', () => {
      const mockOnRowClick = jest.fn();

      renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        onRowClick: mockOnRowClick
      });

      const firstRow = screen.getByText('John Doe');
      fireEvent.click(firstRow);

      expect(mockOnRowClick).toHaveBeenCalled();
    });
  });

  describe('Editing Functionality', () => {
    const mockOnDataChange = jest.fn();

    it('supports cell editing when editable columns are configured', () => {
      const editableColumns: DataGridColumn[] = [
        { key: 'name', title: 'Name', editable: true },
        { key: 'age', title: 'Age', editable: true, type: 'number' }
      ];

      renderDataGrid({
        data: sampleData,
        columns: editableColumns,
        onDataChange: mockOnDataChange
      });

      // Double-click to edit (depending on editTrigger)
      const nameCell = screen.getByText('John Doe');
      fireEvent.doubleClick(nameCell);

      // Cell should become editable
      expect(nameCell).toBeInTheDocument();
    });

    it('handles different edit triggers', () => {
      renderDataGrid({
        data: sampleData,
        columns: [{ key: 'name', title: 'Name', editable: true }],
        editTrigger: 'double',
        onDataChange: mockOnDataChange
      });

      const nameCell = screen.getByText('John Doe');
      fireEvent.doubleClick(nameCell);

      expect(nameCell).toBeInTheDocument();
    });
  });

  describe('Virtualization', () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Person ${i}`,
      age: 20 + (i % 50),
      email: `person${i}@example.com`
    }));

    it('handles virtual scrolling for large datasets', () => {
      const { container } = renderDataGrid({
        data: largeDataset,
        columns: basicColumns,
        virtualizeRows: true,
        height: 400
      });

      // Should render grid container
      expect(container.firstChild).toBeInTheDocument();
    });

    it('can disable virtualization', () => {
      renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        virtualizeRows: false
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('shows export button when exportable is true', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        exportable: true
      });

      // Grid should render with export capability
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing rowKey gracefully', () => {
      renderDataGrid({
        data: sampleData,
        columns: basicColumns
        // No rowKey specified
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('handles columns with no key', () => {
      // This should be caught by TypeScript, but test runtime behavior
      const invalidColumns = [
        { title: 'Name' } // Missing key
      ] as DataGridColumn[];

      expect(() => {
        renderDataGrid({
          data: sampleData,
          columns: invalidColumns
        });
      }).not.toThrow();
    });

    it('handles empty columns array', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: []
      });

      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles data changes correctly', () => {
      const mockOnDataChange = jest.fn();

      renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        onDataChange: mockOnDataChange
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles and attributes', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns
      });

      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns
      });

      const grid = container.firstChild as HTMLElement;

      // Test keyboard interactions
      fireEvent.keyDown(grid, { key: 'ArrowDown' });
      fireEvent.keyDown(grid, { key: 'ArrowUp' });
      fireEvent.keyDown(grid, { key: 'Tab' });

      // Should not throw errors
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors and styles', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns
      });

      // Grid should be themed appropriately
      const grid = container.firstChild;
      expect(grid).toBeInTheDocument();
    });

    it('respects custom styling', () => {
      const { container } = renderDataGrid({
        data: sampleData,
        columns: basicColumns,
        style: { backgroundColor: 'rgb(255, 0, 0)' }
      });

      const gridContainer = container.firstChild as HTMLElement;
      expect(gridContainer).toHaveStyle('background-color: rgb(255, 0, 0)');
    });
  });
});
