import { Button } from '@ui/components/base/Button';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Input } from '@ui/components/base/Input';
import { Modal } from '@ui/components/base/Modal';
import { Panel } from '@ui/components/base/Panel';
import { useTheme } from '@ui/contexts/ThemeContext';
import { showConfirmBox, showMessageBox, showYesNoBox, showYesNoCancelBox } from '@ui/services/messageBox';
import { Toast as ToastService } from '@ui/services/toast';
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
  const [showModal, setShowModal] = useState(false);
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
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>MessageBox Types</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Windows-style MessageBox with different button configurations.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                onClick={async () => {
                  await showMessageBox('Information', 'This is a simple message box with only an OK button.');
                  ToastService.info('Message box closed!');
                }}
                variant="secondary"
                size="small"
              >
                OK
              </Button>
              <Button
                onClick={async () => {
                  const confirmed = await showConfirmBox('Confirm Action', 'Do you want to proceed with this action?');
                  if (confirmed) {
                    ToastService.success('User clicked OK!');
                  } else {
                    ToastService.warning('User clicked Cancel!');
                  }
                }}
                variant="secondary"
                size="small"
              >
                OK/Cancel
              </Button>
              <Button
                onClick={async () => {
                  const result = await showYesNoBox('Question', 'Do you like this feature?');
                  if (result) {
                    ToastService.success('User clicked Yes!');
                  } else {
                    ToastService.info('User clicked No!');
                  }
                }}
                variant="secondary"
                size="small"
              >
                Yes/No
              </Button>
              <Button
                onClick={async () => {
                  const result = await showYesNoCancelBox('Save Changes', 'Do you want to save your changes before closing?');
                  switch (result) {
                    case 'yes':
                      ToastService.success('User clicked Yes - saving!');
                      break;
                    case 'no':
                      ToastService.warning('User clicked No - discarding changes!');
                      break;
                    case 'cancel':
                      ToastService.info('User clicked Cancel - staying in document!');
                      break;
                  }
                }}
                variant="secondary"
                size="small"
              >
                Yes/No/Cancel
              </Button>
            </div>
          </div>

          <InfoBox title="Windows MessageBox API Style" variant="plain">
            • <strong>OK Only:</strong> Simple information messages<br />
            • <strong>OK/Cancel:</strong> Confirmation dialogs<br />
            • <strong>Yes/No:</strong> Binary choice questions<br />
            • <strong>Yes/No/Cancel:</strong> Save/Discard/Cancel scenarios<br />
            • <strong>Close Behavior:</strong> X button follows Windows conventions<br />
            • <strong>Callbacks:</strong> Optional handlers for each button
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
              ToastService.success('Custom modal action completed!');
              setShowModal(false);
            }}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
