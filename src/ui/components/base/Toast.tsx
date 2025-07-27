import { useTheme } from '@ui/contexts/ThemeContext';
import { Toast as ToastType } from '@ui/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const { colors } = useTheme();

  const getToastColor = (type: string) => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      default: return colors.darkPanel;
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
