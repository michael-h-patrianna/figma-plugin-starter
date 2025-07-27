import { Button } from '@ui/components/base/Button';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Input } from '@ui/components/base/Input';
import { ConfirmBox, MessageBox } from '@ui/components/base/MessageBox';
import { Modal } from '@ui/components/base/Modal';
import { Panel } from '@ui/components/base/Panel';
import { Toast } from '@ui/components/base/Toast';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
import { useState } from 'preact/hooks';
/**
 * Props for the ModalsView component.
 */
interface ModalsViewProps {
  // No external dependencies - fully self-contained
}

/**
 * Renders a demonstration view for modal dialogs, message boxes, and confirmation dialogs.
 *
 * This view provides interactive examples of different modal types including custom modals,
 * message boxes, and confirmation dialogs. All modal instances and toast notifications
 * are self-contained within this view for demonstration purposes.
 *
 * @param props - {@link ModalsViewProps} for configuring the view
 * @returns The rendered modals view React element
 */
export function ModalsView({ }: ModalsViewProps) {
  const { colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [showConfirmBox, setShowConfirmBox] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Modal Dialogs">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Custom Modal</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Full-featured modal with custom content, actions, and size variants.
            </p>
            <Button onClick={() => setShowModal(true)}>Show Custom Modal</Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Message Box</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Simple message dialog with OK button. Perfect for alerts and notifications.
            </p>
            <Button onClick={() => setShowMessageBox(true)} variant="secondary">Show Message Box</Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Confirm Box</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Confirmation dialog with OK/Cancel buttons. Ideal for destructive actions.
            </p>
            <Button onClick={() => setShowConfirmBox(true)} variant="secondary">Show Confirmation</Button>
          </div>

          <InfoBox title="Easy Message Boxes" variant="plain">
            • MessageBox - Simple OK dialog<br />
            • ConfirmBox - OK/Cancel dialog<br />
            • Modal - Custom content with full control
          </InfoBox>
        </div>
      </Panel>
      {/* Modal Demo */}
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title="Custom Modal Demo"
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: colors.textColor, margin: 0, lineHeight: 1.5 }}>
            This is a custom modal with full control over content and behavior. You can add any
            components, forms, or content here.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              value={inputValue}
              onChange={setInputValue}
              placeholder="Type something..."
              label="Modal Input"
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button onClick={() => setShowModal(false)} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => {
              showToast('Custom modal action completed!', 'success');
              setShowModal(false);
            }}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Box Demo */}
      <MessageBox
        isVisible={showMessageBox}
        title="Information"
        message="This is a simple message box. Perfect for showing information, alerts, or confirmations with just an OK button."
        onOk={() => {
          setShowMessageBox(false);
          showToast('Message box closed!', 'info');
        }}
      />

      {/* Confirm Box Demo */}
      <ConfirmBox
        isVisible={showConfirmBox}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This is a confirm dialog with OK and Cancel buttons."
        onOk={() => {
          setShowConfirmBox(false);
          showToast('Action confirmed!', 'success');
        }}
        onCancel={() => {
          setShowConfirmBox(false);
          showToast('Action cancelled!', 'warning');
        }}
        okText="Yes, do it"
        cancelText="No, cancel"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );


}
