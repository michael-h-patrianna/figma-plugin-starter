import { BORDER_RADIUS } from '@shared/constants';
import { Component, h } from 'preact';
import { getThemeColors } from '../../contexts/ThemeContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: h.JSX.Element | h.JSX.Element[];
  fallback?: (error: Error, errorInfo: any) => h.JSX.Element;
  onError?: (error: Error, errorInfo: any) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

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
          borderRadius: BORDER_RADIUS,
          padding: 24,
          margin: 16,
          textAlign: 'center'
        }}>
          <div style={{
            color: colors.error,
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12
          }}>
            Something went wrong
          </div>

          <div style={{
            color: colors.textSecondary,
            fontSize: 14,
            marginBottom: 16,
            lineHeight: 1.5
          }}>
            An unexpected error occurred in this component. Please try refreshing the plugin.
          </div>

          {this.state.error && (
            <details style={{
              background: colors.darkBg,
              borderRadius: BORDER_RADIUS,
              padding: 12,
              marginBottom: 16,
              textAlign: 'left'
            }}>
              <summary style={{
                color: colors.textColor,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 8
              }}>
                Error details
              </summary>
              <pre style={{
                color: colors.error,
                fontSize: 11,
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
              borderRadius: BORDER_RADIUS,
              color: '#fff',
              padding: '8px 16px',
              fontSize: 13,
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
