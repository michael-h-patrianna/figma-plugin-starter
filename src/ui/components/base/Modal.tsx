import { useTheme } from '@ui/contexts/ThemeContext';
import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** Whether the modal is visible */
  isVisible: boolean;
  /** Function to call when modal should be closed */
  onClose: () => void;
  /** Title text to display in the modal header */
  title: string;
  /** Content to display in the modal body */
  children: h.JSX.Element | h.JSX.Element[];
  /** Size of the modal - affects width and max height */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the close button in the header */
  showCloseButton?: boolean;
  /** Accessible label for screen readers (defaults to title) */
  'aria-label'?: string;
  /** Description for screen readers */
  'aria-describedby'?: string;
  /** Unique ID for the modal */
  id?: string;
}

/**
 * A modal dialog component with backdrop, keyboard navigation, and customizable sizing.
 *
 * Provides a centered overlay modal with backdrop blur, escape key handling,
 * and click-outside-to-close functionality. Includes a header with title and
 * optional close button.
 *
 * @param props - The modal props
 * @returns A modal dialog overlay or null if not visible
 *
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 *
 * <Modal
 *   isVisible={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Settings"
 *   size="medium"
 * >
 *   <p>Modal content goes here</p>
 *   <Button onClick={() => setShowModal(false)}>Close</Button>
 * </Modal>
 * ```
 */
export function Modal({
  isVisible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  id
}: ModalProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  // Simple state management - ensure animation on mount
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);

  // Handle visibility changes with proper animation timing
  useEffect(() => {
    if (isVisible) {
      // Mount the component first
      setShouldRender(true);
      // Then trigger animation in next frame
      const animationFrame = requestAnimationFrame(() => {
        setIsAnimatedIn(true);
      });
      return () => cancelAnimationFrame(animationFrame);
    } else if (shouldRender) {
      // Start exit animation immediately
      setIsAnimatedIn(false);
      // Unmount after animation completes
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  // Generate unique IDs for accessibility
  const modalId = id || `modal-${Math.random().toString(36).substr(2, 9)}`;
  const titleId = `${modalId}-title`;
  const bodyId = `${modalId}-body`;

  // Handle escape key and focus management
  useEffect(() => {
    if (!isVisible) return;

    // Store previous focused element for restoration
    const previouslyFocused = document.activeElement as HTMLElement;

    /**
     * Handles keyboard events for modal navigation.
     * Closes modal when Escape key is pressed and manages focus trapping.
     */
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    /**
     * Handles focus trapping within modal.
     * Ensures focus stays within modal when tabbing.
     */
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const modal = document.getElementById(modalId);
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      handleEscape(e);
      handleTabKey(e);
    };

    document.addEventListener('keydown', handleKeyDown);

    // Focus management: focus first focusable element when modal opens
    const focusFirstElement = () => {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      // First try to focus content area elements (exclude close button)
      const contentArea = modal.querySelector('[id$="-body"]');
      if (contentArea) {
        const contentFocusableElements = contentArea.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (contentFocusableElements.length > 0) {
          (contentFocusableElements[0] as HTMLElement).focus();
          return;
        }
      }

      // Fallback to any focusable element in the modal
      const allFocusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = allFocusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    };

    // Focus first element after a brief delay to ensure DOM is ready
    const timeoutId = setTimeout(focusFirstElement, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);

      // Restore focus to previously focused element
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isVisible, onClose, modalId]);

  // Don't render modal until animation system says we should
  if (!shouldRender) return null;

  /**
   * Gets the size-specific styles for the modal.
   *
   * @returns Style object with width and max height for the selected size
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { width: '320px', maxHeight: '400px' };
      case 'large': return { width: '600px', maxHeight: '700px' };
      default: return { width: '480px', maxHeight: '500px' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)', // Safari support
        opacity: isAnimatedIn ? 1 : 0,
        transition: 'opacity 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={ariaDescribedBy || bodyId}
        aria-label={ariaLabel}
        style={{
          background: colors.darkPanel,
          borderRadius: borderRadius.default,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          transform: isAnimatedIn ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)',
          opacity: isAnimatedIn ? 1 : 0,
          transition: 'transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          ...getSizeStyles()
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: `${spacing.lg - 4}px ${spacing.lg}px`,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3
            id={titleId}
            style={{
              margin: 0,
              color: colors.textColor,
              fontSize: typography.subheading,
              fontWeight: 600
            }}
          >
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textSecondary,
                fontSize: typography.heading,
                cursor: 'pointer',
                padding: spacing.xs,
                borderRadius: borderRadius.medium,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.textColor}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        <div
          id={bodyId}
          style={{
            padding: spacing.lg,
            flex: 1,
            overflow: 'auto'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
