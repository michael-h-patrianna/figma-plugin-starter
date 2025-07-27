/**
 * Node Scanner - WASM-Safe Node Analysis Tools
 *
 * Provides safe node scanning and analysis using proven patterns:
 * - Immediate primitive extraction
 * - No external object references held
 * - Safe traversal methods
 * - Batch processing capabilities
 */

import { UIHelpers } from './ui-helpers';

export interface NodeData {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  rotation?: number;
  opacity?: number;
  locked?: boolean;
  parent?: string;
  fills?: any[];
  strokes?: any[];
}

export interface ScanResult {
  summary: {
    totalNodes: number;
    selectedNodes: number;
    nodesByType: Record<string, number>;
    processingTime: number;
  };
  nodes: NodeData[];
  errors: string[];
}

export class NodeScanner {
  private uiHelpers = new UIHelpers();

  /**
   * Get current selection with safe data extraction
   */
  async getSelection(): Promise<void> {
    try {
      const startTime = Date.now();
      const selection = figma.currentPage.selection;

      const nodes: NodeData[] = [];
      const errors: string[] = [];

      for (const node of selection) {
        try {
          const nodeData = this.extractNodeData(node);
          nodes.push(nodeData);
        } catch (error) {
          errors.push(`Failed to extract data from node ${node.id}: ${error}`);
        }
      }

      const result: ScanResult = {
        summary: {
          totalNodes: nodes.length,
          selectedNodes: selection.length,
          nodesByType: this.groupNodesByType(nodes),
          processingTime: Date.now() - startTime
        },
        nodes,
        errors
      };

      this.uiHelpers.sendToUI('SELECTION_RESULT', result);

    } catch (error) {
      console.error('❌ Get selection failed:', error);
      this.uiHelpers.sendError('Selection failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Scan nodes based on criteria
   */
  async scanNodes(options: {
    types?: string[];
    namePattern?: string;
    includeHidden?: boolean;
    maxDepth?: number;
    startFrom?: 'selection' | 'page' | 'document';
  } = {}): Promise<void> {
    try {
      const startTime = Date.now();
      const {
        types = [],
        namePattern,
        includeHidden = false,
        maxDepth = 10,
        startFrom = 'page'
      } = options;

      // Get starting nodes
      const startNodes = this.getStartingNodes(startFrom);

      const allNodes: NodeData[] = [];
      const errors: string[] = [];

      // Traverse and collect nodes
      for (const startNode of startNodes) {
        this.traverseNode(startNode, allNodes, errors, {
          types,
          namePattern,
          includeHidden,
          maxDepth,
          currentDepth: 0
        });
      }

      const result: ScanResult = {
        summary: {
          totalNodes: allNodes.length,
          selectedNodes: figma.currentPage.selection.length,
          nodesByType: this.groupNodesByType(allNodes),
          processingTime: Date.now() - startTime
        },
        nodes: allNodes,
        errors
      };

      this.uiHelpers.sendToUI('SCAN_RESULT', result);

    } catch (error) {
      console.error('❌ Node scan failed:', error);
      this.uiHelpers.sendError('Node scan failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Analyze frames specifically
   */
  async analyzeFrames(options: {
    includeComponentSets?: boolean;
    extractImages?: boolean;
    analyzeChildren?: boolean;
  } = {}): Promise<void> {
    try {
      const startTime = Date.now();
      const { includeComponentSets = true, extractImages = false, analyzeChildren = true } = options;

      const frameTypes = ['FRAME'];
      if (includeComponentSets) {
        frameTypes.push('COMPONENT_SET', 'COMPONENT', 'INSTANCE');
      }

      await this.scanNodes({
        types: frameTypes,
        startFrom: 'page',
        maxDepth: analyzeChildren ? 10 : 1
      });

    } catch (error) {
      console.error('❌ Frame analysis failed:', error);
      this.uiHelpers.sendError('Frame analysis failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * WASM-safe node data extraction - immediately extract primitives
   */
  private extractNodeData(node: SceneNode): NodeData {
    // Extract all data as primitives immediately
    const data: NodeData = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      visible: node.visible
    };

    // Optional properties
    if ('rotation' in node) data.rotation = node.rotation;
    if ('opacity' in node) data.opacity = node.opacity;
    if ('locked' in node) data.locked = node.locked;
    if (node.parent) data.parent = node.parent.id;

    // Extract fills safely
    if ('fills' in node && Array.isArray(node.fills)) {
      data.fills = node.fills.map(fill => this.extractFillData(fill));
    }

    // Extract strokes safely
    if ('strokes' in node && Array.isArray(node.strokes)) {
      data.strokes = node.strokes.map(stroke => this.extractFillData(stroke));
    }

    return data;
  }

  /**
   * Extract fill data safely
   */
  private extractFillData(fill: Paint): any {
    const fillData: any = {
      type: fill.type,
      visible: fill.visible !== false
    };

    if (fill.type === 'SOLID') {
      const solidFill = fill as SolidPaint;
      fillData.color = { ...solidFill.color };
      if (solidFill.opacity !== undefined) fillData.opacity = solidFill.opacity;
    }

    if (fill.type === 'IMAGE') {
      const imageFill = fill as ImagePaint;
      fillData.imageHash = imageFill.imageHash;
      fillData.scaleMode = imageFill.scaleMode;
    }

    return fillData;
  }

  /**
   * Get starting nodes based on option
   */
  private getStartingNodes(startFrom: string): readonly SceneNode[] {
    switch (startFrom) {
      case 'selection':
        return figma.currentPage.selection;
      case 'page':
        return figma.currentPage.children;
      case 'document':
        // Flatten all page children
        const allNodes: SceneNode[] = [];
        for (const page of figma.root.children) {
          allNodes.push(...page.children);
        }
        return allNodes;
      default:
        return figma.currentPage.children;
    }
  }

  /**
   * Safe node traversal with filters
   */
  private traverseNode(
    node: SceneNode,
    results: NodeData[],
    errors: string[],
    options: {
      types: string[];
      namePattern?: string;
      includeHidden: boolean;
      maxDepth: number;
      currentDepth: number;
    }
  ): void {
    try {
      // Check depth limit
      if (options.currentDepth > options.maxDepth) return;

      // Check visibility
      if (!options.includeHidden && !node.visible) return;

      // Check type filter
      if (options.types.length > 0 && !options.types.includes(node.type)) {
        // Still traverse children even if parent doesn't match
        this.traverseChildren(node, results, errors, options);
        return;
      }

      // Check name pattern
      if (options.namePattern && !new RegExp(options.namePattern, 'i').test(node.name)) {
        // Still traverse children even if parent doesn't match
        this.traverseChildren(node, results, errors, options);
        return;
      }

      // Extract node data
      const nodeData = this.extractNodeData(node);
      results.push(nodeData);

      // Traverse children
      this.traverseChildren(node, results, errors, options);

    } catch (error) {
      errors.push(`Failed to process node ${node.id}: ${error}`);
    }
  }

  /**
   * Traverse child nodes
   */
  private traverseChildren(
    node: SceneNode,
    results: NodeData[],
    errors: string[],
    options: {
      types: string[];
      namePattern?: string;
      includeHidden: boolean;
      maxDepth: number;
      currentDepth: number;
    }
  ): void {
    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.traverseNode(child, results, errors, {
          ...options,
          currentDepth: options.currentDepth + 1
        });
      }
    }
  }

  /**
   * Group nodes by type for summary
   */
  private groupNodesByType(nodes: NodeData[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const node of nodes) {
      groups[node.type] = (groups[node.type] || 0) + 1;
    }
    return groups;
  }
}
