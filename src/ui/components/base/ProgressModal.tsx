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
  description,
  showCloseButton = false
}: ProgressModalProps) {
  const { colors, spacing } = useTheme();

  const handleClose = () => {
    if (showCloseButton || progress >= 100) {
      onClose();
    }
  };

  const displayDescription = description === null ? null : (description === '' ? null : (description || 'Please wait while we process your request'));

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
        {displayDescription && (
          <div style={{
            marginTop: spacing.md,
            color: colors.textSecondary,
            fontSize: 12,
            textAlign: 'center'
          }}>
            {displayDescription}
          </div>
        )}
      </div>
    </Modal>
  );
}
