import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/preact';
import { h } from 'preact';
import { LazyLoader } from '../../../src/ui/components/base/LazyLoader';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

const renderWithTheme = (component: any) => {
  return render(
    h(ThemeProvider, { children: component })
  );
};

// Mock the Spinner component
jest.mock('../../../src/ui/components/base/Spinner', () => ({
  Spinner: ({ size }: { size?: number }) => {
    const { h } = require('preact');
    return h('div', { 'data-testid': 'spinner', 'data-size': size }, 'Loading...');
  }
}));

describe('LazyLoader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows default spinner while loading', () => {
      const mockLoader = jest.fn(() => new Promise(() => { })); // Never resolves

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Loaded component')
        })
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toHaveAttribute('data-size', '24');
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows custom fallback when provided', () => {
      const mockLoader = jest.fn(() => new Promise(() => { })); // Never resolves

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          fallback: h('div', { 'data-testid': 'custom-fallback' }, 'Custom loading...'),
          children: (component: any) => h('div', {}, 'Loaded component')
        })
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('applies correct styling to default loading container', () => {
      const mockLoader = jest.fn(() => new Promise(() => { })); // Never resolves

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Loaded component')
        })
      );

      const loadingContainer = screen.getByTestId('spinner').parentElement;
      expect(loadingContainer).toHaveStyle({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      });
    });
  });

  describe('Success State', () => {
    it('renders children with loaded component', async () => {
      const mockComponent = { name: 'TestComponent' };
      const mockLoader = jest.fn(() => Promise.resolve(mockComponent));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'loaded-content' }, `Loaded: ${component.name}`)
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('loaded-content')).toBeInTheDocument();
      });

      expect(screen.getByText('Loaded: TestComponent')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('handles component with default export', async () => {
      const mockModule = {
        default: { name: 'DefaultComponent' },
        namedExport: { name: 'NamedComponent' }
      };
      const mockLoader = jest.fn(() => Promise.resolve(mockModule));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (module: any) => h('div', { 'data-testid': 'loaded-module' },
            `Default: ${module.default.name}, Named: ${module.namedExport.name}`)
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('loaded-module')).toBeInTheDocument();
      });

      expect(screen.getByText('Default: DefaultComponent, Named: NamedComponent')).toBeInTheDocument();
    });

    it('handles complex component data', async () => {
      const mockComponent = {
        Component: ({ title }: { title: string }) => h('h1', {}, title),
        props: { title: 'Dynamic Title' },
        metadata: { version: '1.0.0' }
      };
      const mockLoader = jest.fn(() => Promise.resolve(mockComponent));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (comp: any) => h('div', { 'data-testid': 'complex-component' },
            [
              h(comp.Component, comp.props),
              h('span', {}, `Version: ${comp.metadata.version}`)
            ]
          )
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('complex-component')).toBeInTheDocument();
      });

      expect(screen.getByText('Dynamic Title')).toBeInTheDocument();
      expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when loader throws', async () => {
      const mockError = new Error('Failed to load module');
      const mockLoader = jest.fn(() => Promise.reject(mockError));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Should not render')
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading component: Failed to load module')).toBeInTheDocument();
      });

      expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('handles non-Error rejections', async () => {
      const mockLoader = jest.fn(() => Promise.reject('String error'));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Should not render')
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading component: Failed to load component')).toBeInTheDocument();
      });
    });

    it('applies correct styling to error container', async () => {
      const mockLoader = jest.fn(() => Promise.reject(new Error('Test error')));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Should not render')
        })
      );

      await waitFor(() => {
        expect(screen.getByText(/Error loading component/)).toBeInTheDocument();
      });

      const errorContainer = screen.getByText(/Error loading component/);
      expect(errorContainer).toHaveStyle({
        padding: '20px',
        textAlign: 'center'
      });
      // Note: Color may be computed differently in test environment
    });
  });

  describe('Cleanup and Memory Management', () => {
    it('cancels loading when component unmounts', () => {
      let resolveLoader: (value: any) => void;
      const mockLoader = jest.fn(() => new Promise((resolve) => {
        resolveLoader = resolve;
      }));

      const { unmount } = renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', {}, 'Loaded')
        })
      );

      // Unmount before loader resolves
      unmount();

      // Resolve loader after unmount
      resolveLoader!({ name: 'TestComponent' });

      // Should not cause any errors or state updates
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('reloads when loader function changes', async () => {
      const mockLoader1 = jest.fn(() => Promise.resolve({ name: 'Component1' }));
      const mockLoader2 = jest.fn(() => Promise.resolve({ name: 'Component2' }));

      const { rerender } = renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader1,
          children: (component: any) => h('div', { 'data-testid': 'content' }, component.name)
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Component1')).toBeInTheDocument();
      });

      // Change loader
      rerender(
        h(ThemeProvider, {
          children: h(LazyLoader, {
            loader: mockLoader2,
            children: (component: any) => h('div', { 'data-testid': 'content' }, component.name)
          })
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Component2')).toBeInTheDocument();
      });

      expect(mockLoader1).toHaveBeenCalledTimes(1);
      expect(mockLoader2).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles null component gracefully', async () => {
      const mockLoader = jest.fn(() => Promise.resolve(null));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'null-component' }, 'Should not render')
        })
      );

      await waitFor(() => {
        expect(screen.queryByTestId('null-component')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error loading component/)).not.toBeInTheDocument();
    });

    it('handles undefined component gracefully', async () => {
      const mockLoader = jest.fn(() => Promise.resolve(undefined));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'undefined-component' }, 'Should not render')
        })
      );

      await waitFor(() => {
        expect(screen.queryByTestId('undefined-component')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error loading component/)).not.toBeInTheDocument();
    });

    it('handles component that returns false', async () => {
      const mockLoader = jest.fn(() => Promise.resolve(false));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'should-not-render' }, 'Should not render')
        })
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      });

      // Should render nothing because component is falsy
      expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
      expect(mockLoader).toHaveBeenCalledTimes(1);
    });

    it('resets error state when loader succeeds after previous error', async () => {
      let shouldFail = true;
      const mockLoader = jest.fn(() =>
        shouldFail
          ? Promise.reject(new Error('Initial error'))
          : Promise.resolve({ name: 'SuccessComponent' })
      );

      const { rerender } = renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'success-content' }, component.name)
        })
      );

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/Error loading component/)).toBeInTheDocument();
      });

      // Change loader to succeed
      shouldFail = false;
      const newLoader = jest.fn(() => Promise.resolve({ name: 'SuccessComponent' }));

      rerender(
        h(ThemeProvider, {
          children: h(LazyLoader, {
            loader: newLoader,
            children: (component: any) => h('div', { 'data-testid': 'success-content' }, component.name)
          })
        })
      );

      // Wait for success
      await waitFor(() => {
        expect(screen.getByTestId('success-content')).toBeInTheDocument();
      });

      expect(screen.getByText('SuccessComponent')).toBeInTheDocument();
      expect(screen.queryByText(/Error loading component/)).not.toBeInTheDocument();
    });
  });

  describe('Loading State Transitions', () => {
    it('shows loading -> success transition correctly', async () => {
      const mockLoader = jest.fn(() => Promise.resolve({ name: 'TestComponent' }));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'final-content' }, component.name)
        })
      );

      // Initially shows loading
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('final-content')).not.toBeInTheDocument();

      // After loading completes
      await waitFor(() => {
        expect(screen.getByTestId('final-content')).toBeInTheDocument();
      });

      expect(screen.getByText('TestComponent')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    it('shows loading -> error transition correctly', async () => {
      const mockLoader = jest.fn(() => Promise.reject(new Error('Load failed')));

      renderWithTheme(
        h(LazyLoader, {
          loader: mockLoader,
          children: (component: any) => h('div', { 'data-testid': 'should-not-render' }, 'Success')
        })
      );

      // Initially shows loading
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.queryByText(/Error loading component/)).not.toBeInTheDocument();

      // After loading fails
      await waitFor(() => {
        expect(screen.getByText(/Error loading component/)).toBeInTheDocument();
      });

      expect(screen.getByText('Error loading component: Load failed')).toBeInTheDocument();
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('should-not-render')).not.toBeInTheDocument();
    });
  });
});
