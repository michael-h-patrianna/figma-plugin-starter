/**
 * MessageBox Singleton Service
 *
 * Provides a global, easy-to-use MessageBox system using Preact signals.
 * Can be called from anywhere in the application without prop drilling.
 */

import { signal } from '@preact/signals';
import { generateId } from '@shared/utils';

/**
 * MessageBox types for different button configurations (Windows MessageBox style)
 */
export type MessageBoxType = 'ok' | 'okcancel' | 'yesno' | 'yesnocancel';

/**
 * State interface for the MessageBox singleton
 */
export interface MessageBoxState {
  /** Whether the message box is currently open */
  open: boolean;
  /** Unique ID for the current message box */
  id?: string;
  /** Type of message box defining button configuration */
  type?: MessageBoxType;
  /** Title of the message box */
  title?: string;
  /** Main text content */
  text?: string;
  /** Callback when OK is clicked */
  onOk?: () => void;
  /** Callback when Cancel is clicked */
  onCancel?: () => void;
  /** Callback when Yes is clicked */
  onYes?: () => void;
  /** Callback when No is clicked */
  onNo?: () => void;
  /** Callback when the message box is closed (fired after button callbacks) */
  onClose?: () => void;
}

/**
 * Global signal for MessageBox state
 */
export const messageBoxState = signal<MessageBoxState>({ open: false });

/**
 * Shows a simple message box with an OK button.
 *
 * @param title - Title of the message box
 * @param text - Main text content
 * @param onOk - Optional callback when OK is clicked
 * @returns Promise that resolves when the message box is closed
 *
 * @example
 * ```typescript
 * await showMessageBox('Success', 'Your file has been saved successfully!');
 * ```
 */
export function showMessageBox(
  title: string,
  text: string,
  onOk?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    messageBoxState.value = {
      open: true,
      id: generateId(),
      type: 'ok',
      title,
      text,
      onOk: () => {
        if (onOk) onOk();
        hideMessageBox();
        resolve();
      }
    };
  });
}

/**
 * Shows a confirmation box with OK and Cancel buttons.
 *
 * @param title - Title of the message box
 * @param text - Main text content
 * @param onOk - Optional callback when OK is clicked
 * @param onCancel - Optional callback when Cancel is clicked
 * @returns Promise that resolves to true if OK was clicked, false if Cancel
 *
 * @example
 * ```typescript
 * const confirmed = await showConfirmBox('Delete File', 'Are you sure you want to delete this file?');
 * if (confirmed) {
 *   // User clicked OK
 * }
 * ```
 */
export function showConfirmBox(
  title: string,
  text: string,
  options: { onOk?: () => void; onCancel?: () => void } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const { onOk, onCancel } = options;

    messageBoxState.value = {
      open: true,
      id: generateId(),
      type: 'okcancel',
      title,
      text,
      onOk: () => {
        if (onOk) onOk();
        hideMessageBox();
        resolve(true);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        hideMessageBox();
        resolve(false);
      }
    };
  });
}

/**
 * Shows a Yes/No message box.
 *
 * @param title - Title of the message box
 * @param text - Main text content
 * @param onYes - Optional callback when Yes is clicked
 * @param onNo - Optional callback when No is clicked
 * @returns Promise that resolves to true if Yes was clicked, false if No
 */
export function showYesNoBox(
  title: string,
  text: string,
  options: { onYes?: () => void; onNo?: () => void } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    const { onYes, onNo } = options;

    messageBoxState.value = {
      open: true,
      id: generateId(),
      type: 'yesno',
      title,
      text,
      onYes: () => {
        if (onYes) onYes();
        hideMessageBox();
        resolve(true);
      },
      onNo: () => {
        if (onNo) onNo();
        hideMessageBox();
        resolve(false);
      }
    };
  });
}

/**
 * Shows a Yes/No/Cancel message box.
 *
 * @param title - Title of the message box
 * @param text - Main text content
 * @param onYes - Optional callback when Yes is clicked
 * @param onNo - Optional callback when No is clicked
 * @param onCancel - Optional callback when Cancel is clicked
 * @returns Promise that resolves to 'yes', 'no', or 'cancel'
 */
export function showYesNoCancelBox(
  title: string,
  text: string,
  options: { onYes?: () => void; onNo?: () => void; onCancel?: () => void } = {}
): Promise<'yes' | 'no' | 'cancel'> {
  return new Promise((resolve) => {
    const { onYes, onNo, onCancel } = options;

    messageBoxState.value = {
      open: true,
      id: generateId(),
      type: 'yesnocancel',
      title,
      text,
      onYes: () => {
        if (onYes) onYes();
        hideMessageBox();
        resolve('yes');
      },
      onNo: () => {
        if (onNo) onNo();
        hideMessageBox();
        resolve('no');
      },
      onCancel: () => {
        if (onCancel) onCancel();
        hideMessageBox();
        resolve('cancel');
      }
    };
  });
}

/**
 * Hides the currently displayed message box.
 * This is typically called internally by the MessageBox component.
 */
export function hideMessageBox(): void {
  const currentState = messageBoxState.value;
  const onClose = currentState.onClose;

  messageBoxState.value = { open: false };

  // Fire the onClose callback after closing
  if (onClose) {
    // Use setTimeout to ensure the callback runs after the state update
    setTimeout(onClose, 0);
  }
}
