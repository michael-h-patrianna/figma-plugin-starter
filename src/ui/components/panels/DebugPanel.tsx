import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the DebugPanel component.
 */
interface DebugPanelProps {
  /** Whether the debug panel should be visible */
  isVisible: boolean;
}

/**
 * A debug panel component for displaying development and debugging information.
 * Only renders when the isVisible prop is true (usually set via Debug toggleswitch in the main view), making it easy to toggle on/off.
 *
 * @param props - The debug panel props
 * @returns A styled debug panel or null if not visible
 *
 * @example
 * ```tsx
 * const [debugMode, setDebugMode] = useState(false);
 *
 * <DebugPanel isVisible={debugMode} />
 * ```
 */
export function DebugPanel({ isVisible = false }: DebugPanelProps) {
  const { colors, spacing, typography, borderRadius } = useTheme();

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: borderRadius.default,
      padding: spacing.md,
      marginBottom: 0
    }}>
      <div style={{
        color: '#ffc107',
        fontWeight: 600,
        marginBottom: spacing.sm,
        fontSize: typography.body,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm
      }}>
        Debug
      </div>
      <div style={{
        color: colors.textColor,
        fontSize: typography.bodySmall,
        lineHeight: 1.5
      }}>
        Add your debug functions here
      </div>
    </div>
  );
}
