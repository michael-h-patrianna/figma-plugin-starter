import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/preact';
import { DataTable } from '@ui/components/base/DataTable';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

// Test wrapper with theme
const renderDataTable = (props: any) => {
  return render(
    <ThemeProvider>
      <DataTable {...props} />
    </ThemeProvider>
  );
};

describe('DataTable', () => {
  // Sample test data
  const sampleData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' }
  ];

  const basicColumns = [
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'age', label: 'Age', width: '80px' },
    { key: 'email', label: 'Email', width: '250px' }
  ];

  describe('Basic Rendering', () => {
    it('renders with data and columns', () => {
      renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      // Check column headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();

      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('renders proper table structure', () => {
      renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      // Check for semantic table elements
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Age' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
    });

    it('shows empty state when no data provided', () => {
      renderDataTable({
        data: [],
        columns: basicColumns
      });

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows empty state when data is null', () => {
      renderDataTable({
        data: null,
        columns: basicColumns
      });

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('shows empty state when data is undefined', () => {
      renderDataTable({
        data: undefined,
        columns: basicColumns
      });

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Column Configuration', () => {
    it('applies column widths correctly', () => {
      const columnsWithWidths = [
        { key: 'name', label: 'Name', width: '300px' },
        { key: 'age', label: 'Age', width: '100px' }
      ];

      const { container } = renderDataTable({
        data: sampleData,
        columns: columnsWithWidths
      });

      const nameHeader = screen.getByText('Name').closest('th');
      const ageHeader = screen.getByText('Age').closest('th');

      expect(nameHeader).toHaveStyle('width: 300px');
      expect(ageHeader).toHaveStyle('width: 100px');
    });

    it('renders columns without specified widths', () => {
      const columnsWithoutWidths = [
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' }
      ];

      renderDataTable({
        data: sampleData,
        columns: columnsWithoutWidths
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('applies custom render functions', () => {
      const columnsWithRender = [
        {
          key: 'name',
          label: 'Name',
          render: (value: string) => `Mr. ${value}`
        },
        {
          key: 'age',
          label: 'Age',
          render: (value: number) => `${value} years old`
        }
      ];

      renderDataTable({
        data: sampleData,
        columns: columnsWithRender
      });

      expect(screen.getByText('Mr. John Doe')).toBeInTheDocument();
      expect(screen.getByText('Mr. Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('30 years old')).toBeInTheDocument();
      expect(screen.getByText('25 years old')).toBeInTheDocument();
    });

    it('renders JSX elements from render functions', () => {
      const columnsWithJSX = [
        {
          key: 'name',
          label: 'Name',
          render: (value: string) => h('strong', {}, value)
        }
      ];

      renderDataTable({
        data: [{ name: 'Test User' }],
        columns: columnsWithJSX
      });

      const strongElement = screen.getByText('Test User');
      expect(strongElement.tagName).toBe('STRONG');
    });

    it('passes both value and row to render function', () => {
      const renderSpy = jest.fn((value, row) => `${value} (ID: ${row.id})`);
      const columnsWithSpy = [
        {
          key: 'name',
          label: 'Name',
          render: renderSpy
        }
      ];

      renderDataTable({
        data: [{ id: 1, name: 'Test User' }],
        columns: columnsWithSpy
      });

      expect(renderSpy).toHaveBeenCalledWith('Test User', { id: 1, name: 'Test User' });
      expect(screen.getByText('Test User (ID: 1)')).toBeInTheDocument();
    });
  });

  describe('Data Handling', () => {
    it('handles missing data values gracefully', () => {
      const dataWithMissing = [
        { id: 1, name: 'John Doe' }, // missing age and email
        { id: 2, age: 25, email: 'jane@example.com' }, // missing name
        { id: 3, name: 'Bob Johnson', age: null, email: '' } // null and empty values
      ];

      renderDataTable({
        data: dataWithMissing,
        columns: basicColumns
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('converts non-string values to strings', () => {
      const dataWithDifferentTypes = [
        { number: 42, boolean: true, object: { test: 'value' } }
      ];

      const mixedColumns = [
        { key: 'number', label: 'Number' },
        { key: 'boolean', label: 'Boolean' },
        { key: 'object', label: 'Object' }
      ];

      renderDataTable({
        data: dataWithDifferentTypes,
        columns: mixedColumns
      });

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getByText('[object Object]')).toBeInTheDocument();
    });
  });

  describe('Scrolling Behavior', () => {
    it('applies max height when data exceeds 8 rows', () => {
      // Create data with more than 8 rows
      const largeData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + i
      }));

      const { container } = renderDataTable({
        data: largeData,
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'age', label: 'Age' }
        ]
      });

      const tableContainer = container.querySelector('.data-table-container');
      expect(tableContainer).toHaveStyle('overflow: auto');
      // Max height should be header (32px) + 8 rows (28px each) + 2px borders = 258px
      expect(tableContainer).toHaveStyle('max-height: 258px');
    });

    it('does not apply scrolling for 8 or fewer rows', () => {
      const { container } = renderDataTable({
        data: sampleData, // Only 3 rows
        columns: basicColumns
      });

      const tableContainer = container.querySelector('.data-table-container');
      expect(tableContainer).toHaveStyle('overflow: visible');
      expect(tableContainer).toHaveStyle('max-height: auto');
    });

    it('respects custom maxHeight prop', () => {
      // Create data with fewer than 8 rows to test custom maxHeight
      const { container } = renderDataTable({
        data: sampleData,
        columns: basicColumns,
        maxHeight: '400px'
      });

      const tableContainer = container.querySelector('.data-table-container');
      // Custom maxHeight should only apply when scrolling is enabled (> 8 rows)
      // With only 3 rows, it should be auto
      expect(tableContainer).toHaveStyle('max-height: auto');
    });
  });

  describe('Styling and Theme Integration', () => {
    it('applies theme colors to table elements', () => {
      const { container } = renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      // Check for themed container
      const tableContainer = container.querySelector('.data-table-container');
      expect(tableContainer).toHaveStyle('border-radius: 6px');

      // Check for proper table styling
      const table = screen.getByRole('table');
      expect(table).toHaveStyle('border-collapse: collapse');
      expect(table).toHaveStyle('font-size: 12px');
      expect(table).toHaveStyle('table-layout: fixed');
    });

    it('applies alternating row backgrounds', () => {
      const { container } = renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveStyle('background: transparent');
      expect(rows[1]).toHaveStyle('background: rgba(255, 255, 255, 0.02)');
      expect(rows[2]).toHaveStyle('background: transparent');
    });

    it('applies consistent row heights', () => {
      const { container } = renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      const headerCells = container.querySelectorAll('thead th');
      const dataCells = container.querySelectorAll('tbody td');

      // Check that header cells have correct height
      headerCells.forEach(cell => {
        expect(cell).toHaveStyle('height: 32px');
      });

      // Check that data cells have correct height
      dataCells.forEach(cell => {
        expect(cell).toHaveStyle('height: 28px');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty columns array', () => {
      const { container } = renderDataTable({
        data: sampleData,
        columns: []
      });

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Should have no columns
      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(0);
    });

    it('handles data with keys not in columns', () => {
      const dataWithExtraKeys = [
        { id: 1, name: 'John', extraField: 'ignored', anotherField: 'also ignored' }
      ];

      renderDataTable({
        data: dataWithExtraKeys,
        columns: [{ key: 'name', label: 'Name' }]
      });

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.queryByText('ignored')).not.toBeInTheDocument();
    });

    it('handles columns with keys not in data', () => {
      renderDataTable({
        data: [{ name: 'John' }],
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'nonexistent', label: 'Missing' }
        ]
      });

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Missing')).toBeInTheDocument(); // Header should show
    });
  });

  describe('Accessibility', () => {
    it('has proper table semantics', () => {
      renderDataTable({
        data: sampleData,
        columns: basicColumns
      });

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('applies text overflow handling for long content', () => {
      const dataWithLongText = [{
        name: 'This is a very long name that should be truncated with ellipsis'
      }];

      const { container } = renderDataTable({
        data: dataWithLongText,
        columns: [{ key: 'name', label: 'Name', width: '100px' }]
      });

      const cell = container.querySelector('td');
      expect(cell).toHaveStyle('overflow: hidden');
      expect(cell).toHaveStyle('text-overflow: ellipsis');
      expect(cell).toHaveStyle('white-space: nowrap');
    });
  });
});
