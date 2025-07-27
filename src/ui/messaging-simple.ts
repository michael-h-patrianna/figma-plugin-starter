import { useEffect } from 'preact/hooks';

export function usePluginMessages(handlers: { [key: string]: (data: any) => void }) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, ...data } = event.data.pluginMessage || event.data || {};
      if (type && handlers[type]) {
        handlers[type](data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handlers]);
}

export function sendToMain(type: string, data: any = {}) {
  parent.postMessage({ pluginMessage: { type, ...data } }, '*');
}
