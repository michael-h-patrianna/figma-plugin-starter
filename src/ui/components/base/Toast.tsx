import { useTheme } from '@ui/contexts/ThemeContext';
import { dismissToast, Toast as ServiceToast, toastState } from '@ui/services/toast';

interface SingleToastProps {
  toast: ServiceToast;
  onDismiss: (id: string) => void;
  index: number;
}

/**
 * Individual toast component used by the global toast container.
 *
 * @param props - The toast props including the toast data and dismiss callback
 */
function SingleToast({ toast, onDismiss, index }: SingleToastProps) {
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


  return (
    <div
      style={{
        background: getToastColor(toast.type),
        color: '#fff',
        padding: '12px 24px',
        borderRadius: 8,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        opacity: 1,
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        maxWidth: '400px',
        wordWrap: 'break-word',
        marginBottom: index > 0 ? 8 : 0
      }}
      onClick={() => onDismiss(toast.id)}
    >

      <span>{toast.message}</span>
    </div>
  );
}

/**
 * Singleton toast container component that uses the global toast service.
 *
 * This should be included once in your app root to enable global toasts.
 * It automatically renders all active toasts from the global state.
 */
export function GlobalToastContainer() {
  const state = toastState.value;

  if (state.toasts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 32,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse', // Newest toasts appear at bottom
        alignItems: 'center'
      }}
    >
      {state.toasts.map((toast, index) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          index={index}
        />
      ))}
    </div>
  );
}
