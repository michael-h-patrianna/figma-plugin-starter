// Selection utility functions for common Figma operations

export interface SelectionInfo {
  count: number;
  types: string[];
  hasText: boolean;
  hasFrames: boolean;
  hasComponents: boolean;
  hasImages: boolean;
}

// Get detailed information about current selection
export function analyzeSelection(selection: readonly SceneNode[]): SelectionInfo {
  const typeSet = new Set(selection.map(node => node.type));
  const types = Array.from(typeSet);

  return {
    count: selection.length,
    types,
    hasText: types.includes('TEXT'),
    hasFrames: types.includes('FRAME'),
    hasComponents: types.includes('COMPONENT') || types.includes('INSTANCE'),
    hasImages: selection.some(node =>
      'fills' in node &&
      Array.isArray(node.fills) &&
      node.fills.some(fill => fill.type === 'IMAGE')
    )
  };
}

// Filter selection by type
export function filterSelectionByType<T extends SceneNode>(
  selection: readonly SceneNode[],
  type: T['type']
): T[] {
  return selection.filter(node => node.type === type) as T[];
}

// Get all text nodes from selection (including nested)
export function getAllTextNodes(nodes: readonly SceneNode[]): TextNode[] {
  const textNodes: TextNode[] = [];

  function traverse(node: SceneNode) {
    if (node.type === 'TEXT') {
      textNodes.push(node);
    }

    if ('children' in node) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return textNodes;
}

// Get all frames from selection (including nested)
export function getAllFrames(nodes: readonly SceneNode[]): FrameNode[] {
  const frames: FrameNode[] = [];

  function traverse(node: SceneNode) {
    if (node.type === 'FRAME') {
      frames.push(node);
    }

    if ('children' in node) {
      node.children.forEach(traverse);
    }
  }

  nodes.forEach(traverse);
  return frames;
}

// Validate selection for specific operations
export interface ValidationRule {
  name: string;
  validator: (selection: readonly SceneNode[]) => boolean;
  message: string;
}

export function validateSelection(
  selection: readonly SceneNode[],
  rules: ValidationRule[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validator(selection)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Common validation rules
export const commonValidationRules = {
  notEmpty: {
    name: 'notEmpty',
    validator: (selection: readonly SceneNode[]) => selection.length > 0,
    message: 'Please select at least one object'
  },

  hasText: {
    name: 'hasText',
    validator: (selection: readonly SceneNode[]) =>
      selection.some(node => node.type === 'TEXT'),
    message: 'Selection must include at least one text node'
  },

  onlyFrames: {
    name: 'onlyFrames',
    validator: (selection: readonly SceneNode[]) =>
      selection.every(node => node.type === 'FRAME'),
    message: 'Selection must contain only frames'
  },

  maxItems: (max: number) => ({
    name: 'maxItems',
    validator: (selection: readonly SceneNode[]) => selection.length <= max,
    message: `Please select no more than ${max} items`
  }),

  minItems: (min: number) => ({
    name: 'minItems',
    validator: (selection: readonly SceneNode[]) => selection.length >= min,
    message: `Please select at least ${min} items`
  })
};

// Extract common properties from selection
export function getSelectionProperties(selection: readonly SceneNode[]) {
  if (selection.length === 0) return null;

  const firstNode = selection[0];
  const properties: any = {
    name: firstNode.name,
    type: firstNode.type,
    visible: firstNode.visible,
    locked: firstNode.locked
  };

  // Add position info if available
  if ('x' in firstNode && 'y' in firstNode) {
    properties.x = firstNode.x;
    properties.y = firstNode.y;
  }

  // Add size info if available
  if ('width' in firstNode && 'height' in firstNode) {
    properties.width = firstNode.width;
    properties.height = firstNode.height;
  }

  return properties;
}
