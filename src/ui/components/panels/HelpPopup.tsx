import { COLORS } from '@shared/constants';
import { h } from 'preact';

interface HelpPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

export function HelpPopup({ isVisible, onClose }: HelpPopupProps) {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(24, 26, 32, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: COLORS.darkPanel,
        borderRadius: 12,
        padding: 32,
        border: `1px solid ${COLORS.border}`,
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
            color: COLORS.textColor,
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
              color: COLORS.textSecondary,
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
          color: COLORS.textColor,
          lineHeight: 1.6
        }}>
          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: COLORS.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Demo Mode
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: COLORS.textSecondary
            }}>
              Toggle Demo Mode to explore all components and features. Try loading demo data, testing notifications, and simulating progress indicators. This mode showcases the starter's capabilities without requiring actual Figma selections.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: COLORS.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Component Library
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: COLORS.textSecondary
            }}>
              Includes Panel, DataTable, NotificationBanner, Toast, DebugPanel, and more. Each component is designed to be reusable and follows consistent styling patterns with the dark theme.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: COLORS.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Custom Hooks
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: COLORS.textSecondary
            }}>
              Features useToast for notifications, usePluginMessages for Figma communication, and useWindowResize for automatic plugin resizing. These hooks handle common plugin patterns.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{
              color: COLORS.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Error Handling
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: COLORS.textSecondary
            }}>
              Built-in error helpers create consistent messages across your plugin. The NotificationBanner displays errors, warnings, and info messages with proper styling and icons.
            </p>
          </section>

          <section>
            <h3 style={{
              color: COLORS.accent,
              marginBottom: 12,
              fontSize: 16,
              fontWeight: 600
            }}>
              Development
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: COLORS.textSecondary
            }}>
              Use Debug Mode to add development utilities. The starter includes TypeScript, ESLint, Prettier, and hot reloading. Copy this template and customize for your specific plugin needs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
