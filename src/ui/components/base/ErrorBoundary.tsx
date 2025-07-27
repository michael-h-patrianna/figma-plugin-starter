import { getThemeColors } from '@ui/contexts/ThemeContext';
import { Component, h } from 'preact';

// Get spacing values from theme - fallback to manual spacing for error boundary
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

// Border radius values from theme - fallback for error boundary
const borderRadius = {
  default: 6,
  small: 3,
  medium: 4,
  round: '50%'
};

// Typography values from theme - fallback for error boundary
const typography = {
  heading: 18,
  subheading: 16,
  body: 14,
  bodySmall: 13,
  caption: 12,
  tiny: 11
};

/**
 * State interface for the ErrorBoundary component.
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error object */
  error?: Error;
  /** Additional error information including component stack */
  errorInfo?: any;
}

/**
 * Props interface for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to wrap with error boundary */
  children: h.JSX.Element | h.JSX.Element[];
  /** Optional custom fallback UI function */
  fallback?: (error: Error, errorInfo: any) => h.JSX.Element;
  /** Optional error handler callback */
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Error boundary component that catches JavaScript errors in child components.
 *
 * Provides a fallback UI when errors occur and prevents the entire plugin
 * from crashing. Includes error details for debugging and a retry mechanism.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     console.error('App Error:', error, errorInfo);
 *     showToast('An unexpected error occurred', 'error');
 *   }}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Catches errors thrown by child components.
   *
   * Called when an error is thrown during rendering, in lifecycle methods,
   * or in constructors of the whole tree below this component.
   *
   * @param error - The error that was thrown
   * @param errorInfo - Additional error information including component stack
   */
  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const colors = getThemeColors('dark'); // Default to dark theme for error boundary

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      return (
        <div style={{
          background: colors.darkPanel,
          border: `1px solid ${colors.error}`,
          borderRadius: borderRadius.default,
          padding: spacing.lg,
          margin: spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            color: colors.error,
            fontSize: typography.heading,
            fontWeight: 600,
            marginBottom: spacing.md
          }}>
            Something went wrong
          </div>

          <div style={{
            color: colors.textSecondary,
            fontSize: typography.body,
            marginBottom: spacing.md,
            lineHeight: 1.5
          }}>
            An unexpected error occurred in this component. Please try refreshing the plugin.
          </div>

          {this.state.error && (
            <details style={{
              background: colors.darkBg,
              borderRadius: borderRadius.default,
              padding: spacing.md,
              marginBottom: spacing.md,
              textAlign: 'left'
            }}>
              <summary style={{
                color: colors.textColor,
                cursor: 'pointer',
                fontSize: typography.bodySmall,
                fontWeight: 500,
                marginBottom: spacing.sm
              }}>
                Error details
              </summary>
              <pre style={{
                color: colors.error,
                fontSize: typography.tiny,
                fontFamily: 'Monaco, monospace',
                overflow: 'auto',
                margin: 0,
                lineHeight: 1.4
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                )}
              </pre>
            </details>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{
              background: colors.accent,
              border: 'none',
              borderRadius: borderRadius.default,
              color: colors.textInverse,
              padding: `${spacing.sm}px ${spacing.md}px`,
              fontSize: typography.bodySmall,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
