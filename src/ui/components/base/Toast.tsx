import { COLORS } from '@shared/constants';
import { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const getToastColor = (type: string) => {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.warning;
      case 'info': return COLORS.info;
      default: return COLORS.darkPanel;
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 32,
        transform: 'translateX(-50%)',
        background: getToastColor(toast.type),
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        opacity: 1,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: '400px',
        wordWrap: 'break-word'
      }}
      onClick={onDismiss}
    >
      <span style={{ fontSize: 16 }}>{getToastIcon(toast.type)}</span>
      <span>{toast.message}</span>
    </div>
  );
}
