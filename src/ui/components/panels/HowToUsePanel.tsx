import { Panel } from '@ui/components/base/Panel';
import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * A panel component that displays usage instructions for the Figma plugin.
 *
 * @returns A panel with plugin usage instructions
 *
 * @example
 * ```tsx
 * // Display usage instructions in a tab or modal
 * <HowToUsePanel />
 * ```
 */
export function HowToUsePanel() {
  const { colors } = useTheme();

  return (
    <Panel title="How to use this plugin" variant="blue">
      <div
        style={{
          color: colors.textColor,
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        1. <strong>Select objects</strong> in your Figma canvas<br />
        2. <strong>Click "Load Demo Data"</strong> to see the components in action<br />
        3. <strong>Try the form inputs</strong> and interactive elements<br />
        4. <strong>Open modals, test notifications</strong> and explore features<br />
        5. <strong>Use this as a starting point</strong> for your own plugin
      </div>
    </Panel>
  );
}
