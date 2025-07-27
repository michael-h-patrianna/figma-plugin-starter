import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the HelpPopup component.
 */
interface HelpPopupProps {
  /** Whether the help popup is visible */
  isVisible: boolean;
  /** Function to call when popup should be closed */
  onClose: () => void;
}

/**
 * A help popup component that displays plugin usage instructions and keyboard shortcuts.
 *
 * Provides a modal overlay with comprehensive help information including
 * component usage, keyboard shortcuts, and common troubleshooting tips.
 *
 * @param props - The help popup props
 * @returns A modal help overlay or null if not visible
 *
 * @example
 * ```tsx
 * const [showHelp, setShowHelp] = useState(false);
 *
 * <HelpPopup
 *   isVisible={showHelp}
 *   onClose={() => setShowHelp(false)}
 * />
 * ```
 */
export function HelpPopup({ isVisible, onClose }: HelpPopupProps) {
  const { colors } = useTheme();

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: colors.darkPanel,
        borderRadius: 12,
        padding: 32,
        border: `1px solid ${colors.border}`,
        maxWidth: 500,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h2 style={{
            color: colors.textColor,
            margin: 0,
            fontWeight: 700,
            fontSize: 20
          }}>
            Help & Documentation
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          color: colors.textColor,
          lineHeight: 1.6
        }}>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: colors.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Demo Mode
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Toggle Demo Mode to explore all components and features. Try loading demo data, testing notifications, and simulating progress indicators. This mode showcases the starter's capabilities without requiring actual Figma selections.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: colors.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Component Library
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Includes Panel, DataTable, NotificationBanner, Toast, DebugPanel, and more. Each component is designed to be reusable and follows consistent styling patterns with the dark theme.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: colors.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Custom Hooks
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Features useToast for notifications, usePluginMessages for Figma communication, and useWindowResize for automatic plugin resizing. These hooks handle common plugin patterns.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: colors.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Error Handling
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Built-in error helpers create consistent messages across your plugin. The NotificationBanner displays errors, warnings, and info messages with proper styling and icons.
            </p>
          </section>

          <section>
            <h3 style={{
              color: colors.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Development
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: colors.textSecondary
            }}>
              Use Debug Mode to add development utilities. The starter includes TypeScript, ESLint, Prettier, and hot reloading. Copy this template and customize for your specific plugin needs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
