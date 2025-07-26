import { BORDER_RADIUS, COLORS } from '@shared/constants';

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
  color = COLORS.accent
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
          fontSize: 13,
          color: COLORS.textColor
        }}>
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
        </div>
      )}

      <div style={{
        width: '100%',
        height,
        background: COLORS.darkBg,
        borderRadius: BORDER_RADIUS,
        overflow: 'hidden',
        border: `1px solid ${COLORS.border}`
      }}>
        <div style={{
          width: `${clampedProgress}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: BORDER_RADIUS
        }} />
      </div>
    </div>
  );
}
