import { BORDER_RADIUS } from '@shared/constants';
import { useTheme } from '../../contexts/ThemeContext';

interface DebugPanelProps {
  isVisible: boolean;
}

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
