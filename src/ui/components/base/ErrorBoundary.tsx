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
  /** Count of consecutive errors for tracking */
  errorCount: number;
  /** Last error timestamp for rate limiting */
  lastErrorTime?: number;
}

/**
 * Props interface for the ErrorBoundary component.
 */
interface ErrorBoundaryProps {
  /** Child components to wrap with error boundary */
  children: h.JSX.Element | h.JSX.Element[];
  /** Optional custom fallback UI function */
  fallback?: (error: Error, errorInfo: any, retry: () => void) => h.JSX.Element;
  /** Optional error handler callback */
  onError?: (error: Error, errorInfo: any) => void;
  /** Maximum retries before showing permanent error */
  maxRetries?: number;
  /** Recovery attempt delay in ms */
  recoveryDelay?: number;
  /** Whether to enable automatic recovery */
  autoRecover?: boolean;
}

/**
 * Enhanced error boundary component with recovery mechanisms.
 *
 * Provides comprehensive error handling with automatic recovery,
 * retry limits, and detailed error reporting for debugging.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   maxRetries={3}
 *   autoRecover={true}
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
  private recoveryTimeoutId?: number;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0
    };
  }

  /**
   * Static method called when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  /**
   * Catches errors thrown by child components.
   */
  componentDidCatch(error: Error, errorInfo: any) {
    const now = Date.now();
    const { maxRetries = 3, autoRecover = false, recoveryDelay = 5000 } = this.props;

    this.setState(prevState => ({
      hasError: true,
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: now
    }));

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enhanced error logging with context
    console.group('🚨 ErrorBoundary: Error Caught');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Count:', this.state.errorCount + 1);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();

    // Auto-recovery mechanism
    if (autoRecover && this.state.errorCount < maxRetries) {
      console.log(`🔄 Auto-recovery attempt ${this.state.errorCount + 1}/${maxRetries} in ${recoveryDelay}ms`);

      this.recoveryTimeoutId = window.setTimeout(() => {
        this.handleRetry();
      }, recoveryDelay);
    }
  }

  componentWillUnmount() {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }

  /**
   * Handle manual or automatic retry
   */
  private handleRetry = (): void => {
    console.log('🔄 Attempting error recovery...');

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });

    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = undefined;
    }
  };

  /**
   * Reset error state completely
   */
  private handleReset = (): void => {
    console.log('🔄 Resetting error boundary state...');

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorCount: 0,
      lastErrorTime: undefined
    });

    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = undefined;
    }
  };

  render() {
    const colors = getThemeColors('dark'); // Default to dark theme for error boundary
    const { maxRetries = 3 } = this.props;

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      const hasExceededRetries = this.state.errorCount >= maxRetries;

      // Default enhanced error UI
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
            {hasExceededRetries ? 'Persistent Error' : 'Something went wrong'}
          </div>

          <div style={{
            color: colors.textSecondary,
            fontSize: typography.body,
            marginBottom: spacing.md,
            lineHeight: 1.5
          }}>
            {hasExceededRetries
              ? `This component has failed ${this.state.errorCount} times. Please refresh the plugin or contact support.`
              : 'An unexpected error occurred in this component. You can try again or refresh the plugin.'
            }
          </div>

          {this.state.errorCount > 1 && (
            <div style={{
              background: colors.warning + '20',
              border: `1px solid ${colors.warning}`,
              borderRadius: borderRadius.default,
              padding: spacing.sm,
              marginBottom: spacing.md,
              fontSize: typography.bodySmall,
              color: colors.warning
            }}>
              ⚠️ This error has occurred {this.state.errorCount} time{this.state.errorCount > 1 ? 's' : ''}
            </div>
          )}

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
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.name}: {this.state.error.message}
                {this.state.error.stack && '\n\nStack Trace:\n' + this.state.error.stack}
                {this.state.errorInfo?.componentStack && (
                  '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                )}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
            <button
              onClick={this.handleRetry}
              disabled={hasExceededRetries}
              style={{
                background: hasExceededRetries ? colors.textSecondary : colors.accent,
                border: 'none',
                borderRadius: borderRadius.default,
                color: colors.textInverse,
                padding: `${spacing.sm}px ${spacing.md}px`,
                fontSize: typography.bodySmall,
                fontWeight: 500,
                cursor: hasExceededRetries ? 'not-allowed' : 'pointer',
                opacity: hasExceededRetries ? 0.5 : 1,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!hasExceededRetries) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasExceededRetries) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              Try Again {!hasExceededRetries && `(${maxRetries - this.state.errorCount} left)`}
            </button>

            {this.state.errorCount > 0 && (
              <button
                onClick={this.handleReset}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.textSecondary}`,
                  borderRadius: borderRadius.default,
                  color: colors.textSecondary,
                  padding: `${spacing.sm}px ${spacing.md}px`,
                  fontSize: typography.bodySmall,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.textColor;
                  e.currentTarget.style.color = colors.textColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.textSecondary;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
