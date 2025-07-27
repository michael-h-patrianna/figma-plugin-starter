import { BORDER_RADIUS } from '@shared/constants';
import { clamp } from '@shared/utils';
import { useTheme } from '@ui/contexts/ThemeContext';
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  height = 8,
  color
}: ProgressBarProps) {
  const { colors } = useTheme();
  const progressColor = color || colors.accent;
  const clampedProgress = clamp(progress, 0, 100);

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          fontSize: 13,
          color: colors.textColor
        }}>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}

      <div style={{
        width: '100%',
        height,
        background: colors.darkBg,
        borderRadius: BORDER_RADIUS,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{
          width: `${clampedProgress}%`,
          height: '100%',
          background: progressColor,
          transition: 'width 0.3s ease',
          borderRadius: BORDER_RADIUS
        }} />
      </div>
    </div>
  );
}
