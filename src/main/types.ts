import { EventHandler } from '@create-figma-plugin/utilities';

// Generic types for Figma plugin starter

export type IssueLevel = 'error' | 'warning' | 'info';

export interface Issue {
  code: string;
  message: string;
  nodeId?: string;
  level: IssueLevel;
}

export interface PluginData {
  // Generic data structure for plugin operations
  [key: string]: any;
}

export interface OperationResult {
  success: boolean;
  data?: PluginData;
  issues?: Issue[];
  message?: string;
}

// Plugin message types
export interface ScanMessage extends EventHandler {
  name: 'SCAN';
  handler: () => void;
}

export interface ProcessMessage extends EventHandler {
  name: 'PROCESS';
  handler: (data: PluginData) => void;
}

export interface ResizeMessage extends EventHandler {
  name: 'RESIZE';
  handler: (width: number, height: number) => void;
}
