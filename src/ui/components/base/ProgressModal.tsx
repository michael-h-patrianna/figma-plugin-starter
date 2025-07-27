import { useTheme } from '@ui/contexts/ThemeContext';
import { Modal } from './Modal';
import { ProgressBar } from './ProgressBar';

interface ProgressModalProps {
  isVisible: boolean;
  onClose: () => void;
  progress: number; // 0-100
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}

export function ProgressModal({
  isVisible,
  onClose,
  progress,
  title = 'Processing',
  description = 'Please wait while we process your request',
  showCloseButton = false
}: ProgressModalProps) {
  const { colors, spacing } = useTheme();

  const handleClose = () => {
    if (showCloseButton || progress >= 100) {
      onClose();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={handleClose}
      title={title}
      showCloseButton={showCloseButton || progress >= 100}
    >
      <div style={{ padding: `${spacing.md}px 0` }}>
        <ProgressBar
          progress={progress}
          label={`Processing... ${Math.round(progress)}%`}
        />
        {description && (
          <div style={{
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 12,
            textAlign: 'center'
          }}>
            {description}
          </div>
        )}
      </div>
    </Modal>
  );
}
