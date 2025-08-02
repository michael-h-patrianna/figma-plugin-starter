import { getBestTextColor } from '@shared/utils';
import { useTheme } from '@ui/contexts/ThemeContext';
import { dismissAllToasts, dismissToast, Toast as ServiceToast, toastState } from '@ui/services/toast';
import { useMemo, useState } from 'preact/hooks';

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
function SingleToast({ toast, onDismiss, index }: SingleToastProps) {
  const { colors, spacing, shadows, animations } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

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
        onDismiss(toast.id);
      }, remainingTime);
    }
  };

  const displayMessage = toast.message;

  return (
    <div
      style={{
        background: getToastColor(toast.type),
        color: getToastTextColor(toast.type),
        padding: `${spacing.md}px ${spacing.lg}px`,
        borderRadius: spacing.sm,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: isHovered ? shadows.toastHover : shadows.toast,
        opacity: 1,
        transition: animations.transition,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        maxWidth: '400px',
        wordWrap: 'break-word',
        marginBottom: index > 0 ? spacing.sm : 0,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative'
      }}
      onClick={() => onDismiss(toast.id)}
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
