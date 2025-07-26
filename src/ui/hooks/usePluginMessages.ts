import { OperationResult } from '@main/types';
import { useCallback, useEffect } from 'react';

export function usePluginMessages(
  onScanResult: (result: OperationResult) => void,
  onProcessResult: (result: OperationResult) => void,
  onScanProgress?: (progress: number) => void
) {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data.pluginMessage) {
        const { type, data, progress } = event.data.pluginMessage;
        if (type === 'SCAN_RESULT') onScanResult(data);
        if (type === 'PROCESS_RESULT') onProcessResult(data);
        if (type === 'SCAN_PROGRESS' && onScanProgress) onScanProgress(progress);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onScanResult, onProcessResult, onScanProgress]);

  const sendScan = useCallback(() => {
    parent.postMessage({ pluginMessage: { type: 'SCAN' } }, '*');
  }, []);

  const sendProcess = useCallback((data?: any) => {
    parent.postMessage({ pluginMessage: { type: 'PROCESS', data } }, '*');
  }, []);

  return { sendScan, sendProcess };
}
