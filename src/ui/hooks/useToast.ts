import { useCallback, useState } from 'preact/hooks';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: string;
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { message, type, id };

    setToast(newToast);

    // Auto-dismiss after duration
    const timeout = setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, duration);

    // Store timeout for manual dismissal
    (window as any).__toastTimeout = timeout;

    return id;
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    if ((window as any).__toastTimeout) {
      clearTimeout((window as any).__toastTimeout);
      delete (window as any).__toastTimeout;
    }
  }, []);

  return {
    toast,
    showToast,
    dismissToast
  };
}
