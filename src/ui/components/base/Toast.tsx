import { getBestTextColor } from '@shared/utils';
import { useTheme } from '@ui/contexts/ThemeContext';
import { dismissAllToasts, dismissToast, Toast as ServiceToast, toastState } from '@ui/services/toast';
import { useEffect, useMemo, useState } from 'preact/hooks';

/**
 * Props for the SingleToast component.
 */
interface SingleToastProps {
  /** The toast data object containing message, type, and timing information */
  toast: ServiceToast;
  /** Function to call when the toast should be dismissed */
  onDismiss: (id: string) => void;
  /** Index of the toast in the toast stack for spacing calculations */
  index: number;
  /** Custom aria-label for the toast */
  'aria-label'?: string;
  /** ID of element that labels the toast */
  'aria-labelledby'?: string;
  /** ID of element that describes the toast */
  'aria-describedby'?: string;
}

/**
 * Individual toast component used by the global toast container.
 *
 * Renders a single toast notification with type-based styling, hover effects,
 * auto-dismiss functionality, and support for consolidated message counting.
 * Includes pause-on-hover behavior for better user experience.
 *
 * @param props - The toast props including the toast data and dismiss callback
 * @returns A styled toast notification element
 *
 * @example
 * ```tsx
 * // This component is typically used internally by GlobalToastContainer
 * <SingleToast
 *   toast={{
 *     id: '1',
 *     message: 'Settings saved successfully',
 *     type: 'success',
 *     persist: false
 *   }}
 *   onDismiss={handleDismiss}
 *   index={0}
 * />
 * ```
 */
function SingleToast({
  toast,
  onDismiss,
  index,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy
}: SingleToastProps) {
  const { colors, spacing, shadows, animations } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);

  // Handle animation timing on mount
  useEffect(() => {
    // Trigger animation in next frame after mount
    const animationFrame = requestAnimationFrame(() => {
      setIsAnimatedIn(true);
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Handle exit animation when dismissed
  useEffect(() => {
    if (!isVisible) {
      setIsAnimatedIn(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.darkPanel;
    }
  };

  // Memoize text color calculations to avoid recalculating on every render
  const textColors = useMemo(() => {
    const types = ['success', 'error', 'warning', 'info', 'default'] as const;
    return types.reduce((acc, type) => {
      const backgroundColor = getToastColor(type);
      acc[type] = getBestTextColor(backgroundColor, colors.textColor, colors.textInverse);
      return acc;
    }, {} as Record<string, string>);
  }, [colors.success, colors.error, colors.warning, colors.info, colors.darkPanel, colors.textColor, colors.textInverse]);

  const getToastTextColor = (type: string) => {
    return textColors[type] || textColors.default;
  };

  // Handle dismiss with animation
  const handleDismiss = () => {
    // Call onDismiss immediately for immediate action (like tests)
    onDismiss(toast.id);
    // Then trigger exit animation
    setIsVisible(false);
  };

  // Pause auto-dismiss timer on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (toast.timerId) {
      clearTimeout(toast.timerId);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Restart timer if toast is not persistent
    if (!toast.persist && toast.timerId !== undefined) {
      const remainingTime = toast.type === 'error' ? 8000 : 4000; // Shorter remaining time
      toast.timerId = setTimeout(() => {
        handleDismiss();
      }, remainingTime);
    }
  };

  // Auto-dismiss effect
  useEffect(() => {
    if (!toast.persist && !isHovered && isVisible) {
      const timeout = toast.type === 'error' ? 10000 : 5000;
      const timerId = setTimeout(() => {
        handleDismiss();
      }, timeout);

      toast.timerId = timerId;

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [toast.persist, toast.type, isHovered, isVisible]);

  const displayMessage = toast.message;

  if (!shouldRender) return null;

  // Determine ARIA attributes
  const toastRole = toast.type === 'error' ? 'alert' : 'status';
  const ariaLive = toast.type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={toastRole}
      aria-live={ariaLive}
      aria-atomic="true"
      aria-label={ariaLabel || `${toast.type} notification: ${displayMessage}`}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      style={{
        background: getToastColor(toast.type),
        color: getToastTextColor(toast.type),
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: spacing.sm,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: isHovered ? shadows.toastHover : shadows.toast,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        maxWidth: '400px',
        wordWrap: 'break-word',
        marginBottom: index > 0 ? spacing.sm : 0,
        position: 'relative',
        // CSS animations
        opacity: isAnimatedIn ? 1 : 0,
        transform: `translateX(${isAnimatedIn ? '0' : '100%'}) translateY(${isHovered ? '-2px' : '0'})`,
        transition: 'opacity 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      onClick={handleDismiss}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span>{displayMessage}</span>

      {/* Count badge for consolidated messages */}
      {toast.count && toast.count > 1 && (
        <div
          style={{
            background: colors.toastCountBadge,
            borderRadius: '50%',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            marginLeft: 'auto'
          }}
        >
          {toast.count}
        </div>
      )}

      {/* Persistent indicator */}
      {toast.persist && (
        <div
          style={{
            width: '6px',
            height: '6px',
            background: colors.toastPersistIndicator,
            borderRadius: '50%',
            opacity: 0.7,
            marginLeft: toast.count && toast.count > 1 ? spacing.xs : 'auto'
          }}
        />
      )}
    </div>
  );
}

/**
 * Singleton toast container component that uses the global toast service.
 *
 * This component should be included once in your app root to enable global toasts.
 * It automatically renders all active toasts from the global state, manages
 * toast queuing, and provides a "dismiss all" action when multiple toasts are present.
 *
 * Features include:
 * - Automatic toast positioning and stacking
 * - Queue management for multiple simultaneous toasts
 * - Dismiss all functionality
 * - Responsive positioning and animations
 *
 * @returns A toast container with active toasts or null if no toasts are present
 *
 * @example
 * ```tsx
 * // Include once in your app root
 * function App() {
 *   return (
 *     <div>
 *       <GlobalToastContainer />
 *     </div>
 *   );
 * }
 *
 * // Use the toast service anywhere
 * import { showToast } from '@ui/services/toast';
 * showToast('Operation completed!', 'success');
 * ```
 */
export function GlobalToastContainer() {
  const { colors, spacing, shadows, animations } = useTheme();
  const state = toastState.value;
  const totalCount = state.toasts.length + state.queue.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 32,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse', // Newest toasts appear at bottom
        alignItems: 'center',
        gap: spacing.xs
      }}
    >
      {/* Queue indicator and dismiss all button */}
      {(state.queue.length > 0 || state.toasts.length > 2) && (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Dismiss all ${state.toasts.length} notifications${state.queue.length > 0 ? ` and ${state.queue.length} queued` : ''}`}
          style={{
            background: colors.toastQueueBackground,
            color: colors.toastQueueText,
            padding: `${spacing.sm}px ${spacing.md}px`,
            borderRadius: spacing.xs,
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            boxShadow: shadows.queue,
            cursor: 'pointer',
            transition: animations.hover
          }}
          onClick={() => dismissAllToasts()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              dismissAllToasts();
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.toastQueueBackgroundHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.toastQueueBackground;
          }}
        >
          {state.queue.length > 0 && (
            <span style={{ opacity: 0.7 }}>
              +{state.queue.length} queued
            </span>
          )}
          <span
            style={{
              fontWeight: 600,
              color: colors.info
            }}
            onClick={(e) => {
              e.stopPropagation();
              dismissAllToasts();
            }}
          >
            Dismiss All
          </span>
        </div>
      )}

      {/* Active toasts */}
      {state.toasts.map((toast, index) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          index={index}
        />
      ))}
    </div>
  );
}
