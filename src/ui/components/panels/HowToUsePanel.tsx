import { Panel } from '../base/Panel';

export function HowToUsePanel() {
  return (
    <Panel title="How to use this plugin" variant="blue">
      <div
        style={{
          color: '#fff',
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
