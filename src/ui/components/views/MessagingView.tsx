import { Button } from '@ui/components/base/Button';
import { Panel } from '@ui/components/base/Panel';
import { Code } from '@ui/components/base/Code';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
import { Toast } from '@ui/components/base/Toast';
import { usePluginMessages, sendToMain } from '@ui/messaging-simple';
import { useState } from 'preact/hooks';

export function MessagingView() {
  const { colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
  const [lastMessage, setLastMessage] = useState<any>(null);

  usePluginMessages({
    PONG: (data) => {
      setLastMessage(data);
      showToast('Received PONG!', 'success');
    },
    SELECTION_RESULT: (data) => {
      setLastMessage(data);
      showToast(`Selection: ${data.count} items`, 'success');
    },
  });

  const handlePing = () => {
    sendToMain('PING', { message: 'Hello from UI!' });
    showToast('Sent PING', 'info');
  };

  const handleGetSelection = () => {
    sendToMain('GET_SELECTION');
    showToast('Requested selection', 'info');
  };

  const handleResize = () => {
    sendToMain('RESIZE', { width: 600, height: 400 });
    showToast('Resizing window', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="🔄 Messaging Tests">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button onClick={handlePing} size="small">
              Send Ping
            </Button>
            <Button onClick={handleGetSelection} size="small">
              Get Selection
            </Button>
            <Button onClick={handleResize} size="small">
              Resize Window
            </Button>
          </div>
        </div>
      </Panel>

      {lastMessage && (
        <Panel title="📨 Last Message">
          <Code language="json">
            {JSON.stringify(lastMessage, null, 2)}
          </Code>
        </Panel>
      )}

      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
