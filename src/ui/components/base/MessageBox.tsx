import { Button } from '@ui/components/base/Button';
import { Modal } from '@ui/components/base/Modal';
import { useTheme } from '@ui/contexts/ThemeContext';
import { hideMessageBox, messageBoxState } from '@ui/services/messageBox';

/**
 * Singleton MessageBox component that uses the global message box service.
 *
 * This should be included once in your app root to enable global message boxes.
 * Use the functions from @ui/services/messageBox to show message boxes from anywhere.
 *
 * @example
 * ```tsx
 * // In your app root
 * function App() {
 *   return (
 *     <div>
 *       {/* Your app content *\/}
 *       <MessageBox />
 *     </div>
 *   );
 * }
 *
 * // Anywhere in your app
 * import { showMessageBox, showConfirmBox } from '@ui/services/messageBox';
 *
 * await showMessageBox('Success', 'Operation completed successfully!');
 * await showConfirmBox('Confirm', 'Are you sure?');
 * ```
 */
export function MessageBox() {
  const { colors } = useTheme();
  const state = messageBoxState.value;

  if (!state.open) {
    return null;
  }

  const { type, title, text, onOk, onCancel, onYes, onNo } = state;

  // Handle close button (X) and escape key based on button type
  const handleClose = () => {
    switch (type) {
      case 'ok':
        // Only OK button: counts as OK
        if (onOk) onOk();
        break;
      case 'okcancel':
        // OK and Cancel: counts as Cancel
        if (onCancel) onCancel();
        break;
      case 'yesno':
        // Yes and No: counts as No
        if (onNo) onNo();
        break;
      case 'yesnocancel':
        // Yes, No and Cancel: counts as Cancel
        if (onCancel) onCancel();
        break;
      default:
        hideMessageBox();
    }
  };

  const handleOk = () => {
    if (onOk) onOk();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const handleYes = () => {
    if (onYes) onYes();
  };

  const handleNo = () => {
    if (onNo) onNo();
  };

  // Determine which buttons to show based on type
  const renderButtons = () => {
    switch (type) {
      case 'ok':
        return (
          <Button onClick={handleOk}>OK</Button>
        );

      case 'okcancel':
        return (
          <>
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleOk}>
              OK
            </Button>
          </>
        );

      case 'yesno':
        return (
          <>
            <Button onClick={handleNo} variant="secondary">
              No
            </Button>
            <Button onClick={handleYes}>
              Yes
            </Button>
          </>
        );

      case 'yesnocancel':
        return (
          <>
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleNo} variant="secondary">
              No
            </Button>
            <Button onClick={handleYes}>
              Yes
            </Button>
          </>
        );

      default:
        return <Button onClick={() => hideMessageBox()}>OK</Button>;
    }
  };

  return (
    <Modal
      isVisible={true}
      onClose={handleClose}
      title={title || 'Message'}
      size="small"
      showCloseButton={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{
          color: colors.textColor,
          margin: 0,
          lineHeight: 1.5,
          fontSize: 14
        }}>
          {text}
        </p>

        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end'
        }}>
          {renderButtons()}
        </div>
      </div>
    </Modal>
  );
}
