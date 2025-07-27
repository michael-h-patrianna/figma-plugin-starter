import { BORDER_RADIUS } from '@shared/constants';
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
  const { colors } = useTheme();

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'rgba(255, 193, 7, 0.1)',
      border: '1px solid rgba(255, 193, 7, 0.3)',
      borderRadius: BORDER_RADIUS,
      padding: 16,
      marginBottom: 0
    }}>
      <div style={{
        color: '#ffc107',
        fontWeight: 600,
        marginBottom: 12,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        Debug
      </div>
      <div style={{
        color: colors.textColor,
        fontSize: 13,
        lineHeight: 1.5
      }}>
        Add your debug functions here
      </div>
    </div>
  );
}
