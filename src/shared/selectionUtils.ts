// Selection utility functions for common Figma operations


/**
 * Information about the current Figma selection.
 *
 * @property count - Number of selected nodes.
 * @property types - Array of node types in the selection.
 * @property hasText - Whether selection contains text nodes.
 * @property hasFrames - Whether selection contains frame nodes.
 * @property hasComponents - Whether selection contains components or instances.
 * @property hasImages - Whether selection contains image fills.
 */
export interface SelectionInfo {
  count: number;
  types: string[];
  hasText: boolean;
  hasFrames: boolean;
  hasComponents: boolean;
  hasImages: boolean;
}

/**
 * Analyzes the current Figma selection and returns detailed info.
 *
 * @param selection - Array of selected SceneNodes.
 * @returns {SelectionInfo} Information about the selection.
 */
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

/**
 * Filters the selection by node type.
 *
 * @param selection - Array of selected SceneNodes.
 * @param type - The node type to filter by.
 * @returns {T[]} Array of nodes of the specified type.
 */
export function filterSelectionByType<T extends SceneNode>(
  selection: readonly SceneNode[],
  type: T['type']
): T[] {
  return selection.filter(node => node.type === type) as T[];
}

/**
 * Recursively gets all text nodes from the selection (including nested).
 *
 * @param nodes - Array of SceneNodes to search.
 * @returns {TextNode[]} Array of all text nodes found.
 */
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

/**
 * Recursively gets all frame nodes from the selection (including nested).
 *
 * @param nodes - Array of SceneNodes to search.
 * @returns {FrameNode[]} Array of all frame nodes found.
 */
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


/**
 * Validation rule for checking Figma selection.
 *
 * @property name - Name of the rule.
 * @property validator - Function to validate the selection.
 * @property message - Error message if validation fails.
 */
export interface ValidationRule {
  name: string;
  validator: (selection: readonly SceneNode[]) => boolean;
  message: string;
}

/**
 * Validates the selection against a set of rules.
 *
 * @param selection - Array of selected SceneNodes.
 * @param rules - Array of validation rules to apply.
 * @returns Object with isValid boolean and list of error messages.
 */
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

/**
 * Common validation rules for Figma selection.
 */
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

/**
 * Extracts common properties from the first node in the selection.
 *
 * @param selection - Array of selected SceneNodes.
 * @returns Object with common properties, or null if selection is empty.
 */
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
