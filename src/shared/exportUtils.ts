// Export/Import utilities for plugin data

export interface ExportData {
  version: string;
  timestamp: number;
  pluginName: string;
  data: any;
  metadata?: {
    selectionCount?: number;
    pageInfo?: {
      name: string;
      nodeCount: number;
    };
  };
}

// Export data to JSON
export function exportToJSON(data: any, filename?: string): void {
  const exportData: ExportData = {
    version: '1.0.0',
    timestamp: Date.now(),
    pluginName: 'Figma Plugin Starter',
    data,
    metadata: {
      selectionCount: Array.isArray(data) ? data.length : undefined
    }
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `plugin-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import data from JSON file
export function importFromJSON(): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const data = JSON.parse(result) as ExportData;

          // Validate the imported data structure
          if (!data.version || !data.data) {
            throw new Error('Invalid file format');
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Failed to parse JSON file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    };

    input.click();
  });
}

// Export data as CSV (for tabular data)
export function exportToCSV(data: any[], filename?: string): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Data must be a non-empty array');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape values containing commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `plugin-export-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copy data to clipboard as JSON
export async function copyToClipboardAsJSON(data: any): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Validate imported data against a schema
export interface ValidationSchema {
  required?: string[];
  properties?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required?: boolean;
    };
  };
}

export function validateImportedData(data: any, schema: ValidationSchema): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  // Check property types
  if (schema.properties) {
    for (const [key, spec] of Object.entries(schema.properties)) {
      if (key in data) {
        const value = data[key];
        const expectedType = spec.type;

        let actualType: string;
        if (Array.isArray(value)) {
          actualType = 'array';
        } else if (value === null) {
          actualType = 'null';
        } else {
          actualType = typeof value;
        }

        if (actualType !== expectedType) {
          errors.push(`Field "${key}" should be ${expectedType}, got ${actualType}`);
        }
      } else if (spec.required) {
        errors.push(`Missing required field: ${key}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
