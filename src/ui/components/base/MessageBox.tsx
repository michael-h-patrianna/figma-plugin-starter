import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import { Modal } from './Modal';

interface MessageBoxProps {
  isVisible: boolean;
  title: string;
  message: string;
  onOk: () => void;
}

interface ConfirmBoxProps {
  isVisible: boolean;
  title: string;
  message: string;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

export function MessageBox({ isVisible, title, message, onOk }: MessageBoxProps) {
  const { colors } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onOk}
      title={title}
      size="small"
      showCloseButton={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{
          color: colors.textColor,
          margin: 0,
          lineHeight: 1.5,
          fontSize: 14
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onOk}>OK</Button>
        </div>
      </div>
    </Modal>
  );
}

export function ConfirmBox({
  isVisible,
  title,
  message,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel'
}: ConfirmBoxProps) {
  const { colors } = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onCancel}
      title={title}
      size="small"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{
          color: colors.textColor,
          margin: 0,
          lineHeight: 1.5,
          fontSize: 14
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} variant="secondary">
            {cancelText}
          </Button>
          <Button onClick={onOk}>
            {okText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
