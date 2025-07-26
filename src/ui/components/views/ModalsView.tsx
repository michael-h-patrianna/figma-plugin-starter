import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../base/Button';
import { Panel } from '../base/Panel';

interface ModalsViewProps {
  onShowModal: () => void;
  onShowMessageBox: () => void;
  onShowConfirmBox: () => void;
}

export function ModalsView({
  onShowModal,
  onShowMessageBox,
  onShowConfirmBox
}: ModalsViewProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Panel title="Modal Dialogs">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Custom Modal</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Full-featured modal with custom content, actions, and size variants.
            </p>
            <Button onClick={onShowModal}>Show Custom Modal</Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Message Box</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Simple message dialog with OK button. Perfect for alerts and notifications.
            </p>
            <Button onClick={onShowMessageBox} variant="secondary">Show Message Box</Button>
          </div>

          <div>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Confirm Box</h4>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 12, lineHeight: 1.4 }}>
              Confirmation dialog with OK/Cancel buttons. Ideal for destructive actions.
            </p>
            <Button onClick={onShowConfirmBox} variant="secondary">Show Confirmation</Button>
          </div>

          <div style={{
            color: colors.textSecondary,
            fontSize: 12,
            lineHeight: 1.5,
            padding: 12,
            background: colors.darkBg,
            borderRadius: 6,
            border: `1px solid ${colors.border}`
          }}>
            <strong>Easy Message Boxes:</strong><br />
            • MessageBox - Simple OK dialog<br />
            • ConfirmBox - OK/Cancel dialog<br />
            • Modal - Custom content with full control
          </div>
        </div>
      </Panel>
    </div>
  );
}
