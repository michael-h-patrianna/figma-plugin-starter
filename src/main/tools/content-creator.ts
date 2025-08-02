/**
 * Content Creator - Safe Content Creation Tools
 *
 * Provides tools for creating Figma content:
 * - Frame creation
 * - Shape creation
 * - Sample content generation
 * - Component instantiation
 */

import { UIHelpers } from './ui-helpers';

export interface FrameOptions {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fillColor?: { r: number; g: number; b: number };
  backgroundColor?: string;
}

export interface CreationResult {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ContentCreator {
  private uiHelpers = new UIHelpers();

  /**
   * Create a frame with specified options
   */
  async createFrame(options: FrameOptions = {}): Promise<void> {
    try {
      const {
        name = 'New Frame',
        x = 0,
        y = 0,
        width = 200,
        height = 200,
        fillColor,
        backgroundColor
      } = options;

      // Create frame
      const frame = figma.createFrame();
      frame.name = name;
      frame.x = x;
      frame.y = y;
      frame.resize(width, height);

      // Set fill if provided
      if (fillColor) {
        frame.fills = [{ type: 'SOLID', color: fillColor }];
      } else if (backgroundColor) {
        const color = this.hexToRgb(backgroundColor);
        if (color) {
          frame.fills = [{ type: 'SOLID', color }];
        }
      }

      // Select the created frame
      this.uiHelpers.setSelection([frame]);
      figma.viewport.scrollAndZoomIntoView([frame]);

      const result: CreationResult = {
        id: frame.id,
        name: frame.name,
        type: frame.type,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height
      };

      this.uiHelpers.sendToUI('FRAME_CREATED', result);
      this.uiHelpers.showNotification(`Created frame: ${name}`);

    } catch (error) {
      console.error('❌ Frame creation failed:', error);
      this.uiHelpers.sendError('Frame creation failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create sample content for testing
   */
  async createSamples(options: {
    count?: number;
    type?: 'frames' | 'shapes' | 'mixed';
    spacing?: number;
  } = {}): Promise<void> {
    try {
      const { count = 3, type = 'mixed', spacing = 250 } = options;

      const samples: CreationResult[] = [];
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

      for (let i = 0; i < count; i++) {
        let element: SceneNode;
        const x = i * spacing;
        const y = 0;
        const color = this.hexToRgb(colors[i % colors.length]);

        switch (type) {
          case 'frames':
            element = this.createSampleFrame(i, x, y, color);
            break;
          case 'shapes':
            element = this.createSampleShape(i, x, y, color);
            break;
          case 'mixed':
            element = i % 2 === 0
              ? this.createSampleFrame(i, x, y, color)
              : this.createSampleShape(i, x, y, color);
            break;
          default:
            element = this.createSampleFrame(i, x, y, color);
        }

        samples.push({
          id: element.id,
          name: element.name,
          type: element.type,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        });
      }

      // Select and focus created elements
      const createdElements = samples.map(s => figma.getNodeById(s.id)).filter(Boolean) as SceneNode[];
      this.uiHelpers.setSelection(createdElements);
      figma.viewport.scrollAndZoomIntoView(createdElements);

      this.uiHelpers.sendToUI('SAMPLES_CREATED', {
        samples,
        summary: `Created ${samples.length} sample ${type}`
      });

      this.uiHelpers.showNotification(`Created ${samples.length} sample ${type}`);

    } catch (error) {
      console.error('❌ Sample creation failed:', error);
      this.uiHelpers.sendError('Sample creation failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create a rectangle shape
   */
  async createRectangle(options: {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fillColor?: string;
    cornerRadius?: number;
  } = {}): Promise<void> {
    try {
      const {
        name = 'Rectangle',
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        fillColor = '#000000',
        cornerRadius = 0
      } = options;

      const rect = figma.createRectangle();
      rect.name = name;
      rect.x = x;
      rect.y = y;
      rect.resize(width, height);
      rect.cornerRadius = cornerRadius;

      const color = this.hexToRgb(fillColor);
      if (color) {
        rect.fills = [{ type: 'SOLID', color }];
      }

      this.uiHelpers.setSelection([rect]);

      const result: CreationResult = {
        id: rect.id,
        name: rect.name,
        type: rect.type,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };

      this.uiHelpers.sendToUI('RECTANGLE_CREATED', result);

    } catch (error) {
      console.error('❌ Rectangle creation failed:', error);
      this.uiHelpers.sendError('Rectangle creation failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create an ellipse shape
   */
  async createEllipse(options: {
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fillColor?: string;
  } = {}): Promise<void> {
    try {
      const {
        name = 'Ellipse',
        x = 0,
        y = 0,
        width = 100,
        height = 100,
        fillColor = '#000000'
      } = options;

      const ellipse = figma.createEllipse();
      ellipse.name = name;
      ellipse.x = x;
      ellipse.y = y;
      ellipse.resize(width, height);

      const color = this.hexToRgb(fillColor);
      if (color) {
        ellipse.fills = [{ type: 'SOLID', color }];
      }

      this.uiHelpers.setSelection([ellipse]);

      const result: CreationResult = {
        id: ellipse.id,
        name: ellipse.name,
        type: ellipse.type,
        x: ellipse.x,
        y: ellipse.y,
        width: ellipse.width,
        height: ellipse.height
      };

      this.uiHelpers.sendToUI('ELLIPSE_CREATED', result);

    } catch (error) {
      console.error('❌ Ellipse creation failed:', error);
      this.uiHelpers.sendError('Ellipse creation failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Create a text node
   */
  async createText(options: {
    content?: string;
    name?: string;
    x?: number;
    y?: number;
    fontSize?: number;
    fillColor?: string;
  } = {}): Promise<void> {
    try {
      const {
        content = 'Hello World',
        name = 'Text',
        x = 0,
        y = 0,
        fontSize = 16,
        fillColor = '#000000'
      } = options;

      const text = figma.createText();

      // Load font first
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

      text.name = name;
      text.x = x;
      text.y = y;
      text.characters = content;
      text.fontSize = fontSize;

      const color = this.hexToRgb(fillColor);
      if (color) {
        text.fills = [{ type: 'SOLID', color }];
      }

      this.uiHelpers.setSelection([text]);

      const result: CreationResult = {
        id: text.id,
        name: text.name,
        type: text.type,
        x: text.x,
        y: text.y,
        width: text.width,
        height: text.height
      };

      this.uiHelpers.sendToUI('TEXT_CREATED', result);

    } catch (error) {
      console.error('❌ Text creation failed:', error);
      this.uiHelpers.sendError('Text creation failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Helper: Create sample frame
   */
  private createSampleFrame(index: number, x: number, y: number, color: { r: number; g: number; b: number } | null): FrameNode {
    const frame = figma.createFrame();
    frame.name = `Sample Frame ${index + 1}`;
    frame.x = x;
    frame.y = y;
    frame.resize(200, 150);

    if (color) {
      frame.fills = [{ type: 'SOLID', color }];
    }

    return frame;
  }

  /**
   * Helper: Create sample shape
   */
  private createSampleShape(index: number, x: number, y: number, color: { r: number; g: number; b: number } | null): SceneNode {
    const shape = index % 2 === 0 ? figma.createRectangle() : figma.createEllipse();
    shape.name = `Sample ${shape.type} ${index + 1}`;
    shape.x = x;
    shape.y = y;
    shape.resize(150, 150);

    if (color) {
      shape.fills = [{ type: 'SOLID', color }];
    }

    return shape;
  }

  /**
   * Helper: Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  }
}
