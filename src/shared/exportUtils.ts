// Export/Import utilities for plugin data
import { copyToClipboard } from './utils';


/**
 * Structure for exported plugin data (JSON or CSV).
 *
 * @property version - Version of the export format.
 * @property timestamp - Export timestamp (ms since epoch).
 * @property pluginName - Name of the plugin.
 * @property data - The exported data payload.
 * @property metadata - (Optional) Additional metadata about the export.
 */
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

/**
 * Exports data as a downloadable JSON file.
 *
 * @param data - The data to export.
 * @param filename - (Optional) Filename for the exported file.
 */
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

/**
 * Prompts the user to import data from a JSON file.
 *
 * @returns {Promise<ExportData>} Promise resolving to the imported data.
 * @throws Error if the file is invalid or cannot be read.
 */
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

/**
 * Exports tabular data as a downloadable CSV file.
 *
 * @param data - Array of objects to export as CSV.
 * @param filename - (Optional) Filename for the exported file.
 * @throws Error if data is not a non-empty array.
 */
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

/**
 * Copies data to the clipboard as a formatted JSON string.
 *
 * @param data - The data to copy.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export async function copyToClipboardAsJSON(data: any): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    return await copyToClipboard(jsonString);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}


/**
 * Schema for validating imported data.
 *
 * @property required - List of required property names.
 * @property properties - Map of property names to type and requirement info.
 */
export interface ValidationSchema {
  required?: string[];
  properties?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      required?: boolean;
    };
  };
}

/**
 * Validates imported data against a schema.
 *
 * @param data - The data to validate.
 * @param schema - The validation schema.
 * @returns Object with isValid boolean and list of error messages.
 */
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
