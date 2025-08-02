/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { MainThreadProgressDemo } from '../../../src/ui/components/views/MainThreadProgressDemo';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';
import { ProgressManagerService } from '../../../src/ui/services/progressManager';

// Mock the dependencies
jest.mock('@ui/messaging', () => ({
  usePluginMessages: jest.fn(),
  sendToMain: jest.fn()
}));

jest.mock('@ui/services/progressManager', () => ({
  ProgressManagerService: {
    start: jest.fn()
  }
}));

jest.mock('@ui/hooks/useProgressManager', () => ({
  useProgressManager: jest.fn()
}));

jest.mock('@ui/services/toast', () => ({
  Toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('MainThreadProgressDemo', () => {
  const mockProgressManagerService = ProgressManagerService as jest.Mocked<typeof ProgressManagerService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockProgressManagerService.start.mockReturnValue({ operationId: 'test-op-123' });
  });

  const renderDemo = () => {
    return render(
      h(ThemeProvider, {
        defaultTheme: 'light',
        children: h(MainThreadProgressDemo, {})
      })
    );
  };

  it('should render the demo with unified progress description', () => {
    renderDemo();

    expect(screen.getByText(/unified Progress Manager system/)).toBeInTheDocument();
    expect(screen.getByText(/SINGLE modal/)).toBeInTheDocument();
    expect(screen.getByText(/Click multiple buttons to see concurrent operations!/)).toBeInTheDocument();
  });

  it('should render three operation buttons', () => {
    renderDemo();

    expect(screen.getByText(/Start Node Scan \(adds to unified progress\)/)).toBeInTheDocument();
    expect(screen.getByText(/Start Component Export \(adds to unified progress\)/)).toBeInTheDocument();
    expect(screen.getByText(/Start Long Operation \(adds to unified progress\)/)).toBeInTheDocument();
  });

  it('should start scan operation when scan button is clicked', () => {
    renderDemo();

    const scanButton = screen.getByText(/Start Node Scan/);
    fireEvent.click(scanButton);

    expect(mockProgressManagerService.start).toHaveBeenCalledWith(
      {
        title: 'Scanning Nodes',
        description: 'Starting scan operation...',
        cancellable: true,
        total: 100
      },
      'SCAN_NODES',
      {
        includeHidden: true,
        nodeTypes: ['FRAME', 'TEXT', 'RECTANGLE']
      }
    );
  });

  it('should start export operation when export button is clicked', () => {
    renderDemo();

    const exportButton = screen.getByText(/Start Component Export/);
    fireEvent.click(exportButton);

    expect(mockProgressManagerService.start).toHaveBeenCalledWith(
      {
        title: 'Exporting Components',
        description: 'Preparing export...',
        cancellable: true,
        total: 50
      },
      'EXPORT_COMPONENTS',
      {
        format: 'PNG',
        scale: 2,
        includeBackground: true
      }
    );
  });

  it('should start long operation when long operation button is clicked', () => {
    renderDemo();

    const longOpButton = screen.getByText(/Start Long Operation/);
    fireEvent.click(longOpButton);

    expect(mockProgressManagerService.start).toHaveBeenCalledWith(
      {
        title: 'Processing Data',
        description: 'This will take a while...',
        cancellable: true,
        total: 50
      },
      'LONG_OPERATION',
      {
        duration: 10000,
        steps: 50
      }
    );
  });

  it('should explain the new unified progress manager', () => {
    renderDemo();

    expect(screen.getByText(/New Unified Progress Manager:/)).toBeInTheDocument();
    expect(screen.getByText(/Single modal shows ALL operations/)).toBeInTheDocument();
    expect(screen.getByText(/Much better UX than multiple separate modal popups/)).toBeInTheDocument();
  });
});
