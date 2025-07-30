import { useTheme } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

interface DataTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    render?: (value: any, row: Record<string, any>) => string | h.JSX.Element;
  }>;
  maxHeight?: string;
}

export function DataTable({ data, columns, maxHeight }: DataTableProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div style={{
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        padding: 20
      }}>
        No data available
      </div>
    );
  }

  // Calculate height for 8 rows: header (32px) + 8 rows (28px each) + borders
  const maxRowsVisible = 8;
  const headerHeight = 32;
  const rowHeight = 28;
  const calculatedMaxHeight = maxHeight || `${headerHeight + (maxRowsVisible * rowHeight) + 2}px`; // +2 for borders
  const shouldScroll = data.length > maxRowsVisible;

  return (
    <div
      className="data-table-container"
      style={{
        overflow: shouldScroll ? 'auto' : 'visible',
        maxHeight: shouldScroll ? calculatedMaxHeight : 'auto',
        border: `1px solid ${colors.border}`,
        borderRadius: 6
      }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12,
        tableLayout: 'fixed'
      }}>
        <thead>
          <tr style={{ background: colors.darkPanel }}>
            {columns.map(column => (
              <th key={column.key} style={{
                padding: '8px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: colors.textSecondary,
                borderBottom: `1px solid ${colors.border}`,
                width: column.width,
                height: `${headerHeight}px`,
                boxSizing: 'border-box',
                minHeight: `${headerHeight}px`,
                maxHeight: `${headerHeight}px`
              }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              borderBottom: `1px solid ${colors.border}`,
              background: rowIndex % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
              height: `${rowHeight}px`,
              minHeight: `${rowHeight}px`,
              maxHeight: `${rowHeight}px`
            }}>
              {columns.map(column => {
                const value = row[column.key];
                const displayValue = column.render ? column.render(value, row) : String(value || '');

                return (
                  <td key={column.key} style={{
                    padding: '6px 12px',
                    color: colors.textColor,
                    verticalAlign: 'middle',
                    height: `${rowHeight}px`,
                    boxSizing: 'border-box',
                    minHeight: `${rowHeight}px`,
                    maxHeight: `${rowHeight}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
