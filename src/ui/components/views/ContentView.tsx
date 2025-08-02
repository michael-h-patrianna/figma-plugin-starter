import { Accordion } from '@ui/components/base/Accordion';
import { Alert } from '@ui/components/base/Alert';
import { InfoBox } from '@ui/components/base/InfoBox';
import { Panel } from '@ui/components/base/Panel';
import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * ContentView component demonstrating content display components like InfoBox and Accordion.
 *
 * This view showcases components used for organizing and presenting information,
 * including contextual info boxes with different variants and collapsible accordion sections.
 *
 * @returns The rendered ContentView React element
 */
export function ContentView() {
  const { colors } = useTheme();

  // Local accordion items for demo
  const accordionItems = [
    {
      id: 'overview',
      title: 'Plugin Overview',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          This starter includes comprehensive UI components, hooks, and utilities for building professional Figma plugins.
        </div>
      )
    },
    {
      id: 'components',
      title: 'Available Components',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          Panels, Modals, Inputs, Dropdowns, Tabs, Accordions, Native Loading, Tables, Notifications, and more.
        </div>
      )
    },
    {
      id: 'features',
      title: 'Advanced Features',
      content: (
        <div style={{ color: colors.textSecondary, lineHeight: 1.5 }}>
          Theme system, plugin storage, error boundaries, export utilities, and selection helpers.
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Alert Components Panel */}
      <Panel title="Alert Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              Alert components for displaying important messages with different severity levels and styling variants.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ color: colors.textColor, margin: '0 0 8px 0', fontSize: 14 }}>Solid Variants (Default)</h4>

            <Alert type="info">
              <strong>Information:</strong> This is an informational alert with solid background styling.
            </Alert>

            <Alert type="success">
              <strong>Success:</strong> Your action was completed successfully! All data has been saved.
            </Alert>

            <Alert type="warning">
              <strong>Warning:</strong> Please review this important information before proceeding.
            </Alert>

            <Alert type="error">
              <strong>Error:</strong> Something went wrong. Please check your input and try again.
            </Alert>

            <h4 style={{ color: colors.textColor, margin: '16px 0 8px 0', fontSize: 14 }}>Subtle Variants</h4>

            <Alert type="info" variant="subtle">
              <strong>Info:</strong> This is a subtle informational alert with light background.
            </Alert>

            <Alert type="success" variant="subtle">
              <strong>Success:</strong> Operation completed with subtle styling for less visual impact.
            </Alert>

            <Alert type="warning" variant="subtle">
              <strong>Warning:</strong> Subtle warning for less critical notifications.
            </Alert>

            <Alert type="error" variant="subtle">
              <strong>Error:</strong> Subtle error styling for form validation or minor issues.
            </Alert>

          </div>
        </div>
      </Panel>

      {/* InfoBox Demonstrations Panel */}
      <Panel title="InfoBox Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              InfoBox components for displaying contextual information with different variants and styling options.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoBox title="Lorem Ipsum Info" variant="info">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </InfoBox>

            <InfoBox title="Dolor Sit Amet" variant="success">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.
            </InfoBox>

            <InfoBox title="Consectetur Adipiscing" variant="warning">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.
            </InfoBox>

            <InfoBox
              title="Custom Styled Lorem"
              variant="tip"
              borderColor="#9b59b6"
              titleColor="#9b59b6"
            >
              Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime.
            </InfoBox>

            <InfoBox title="Plain Variant" variant="plain">
              This is a plain InfoBox variant with minimal styling - perfect for simple informational content without visual emphasis.
            </InfoBox>
          </div>
        </div>
      </Panel>

      {/* Accordion Panel */}
      <Panel title="Accordion Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              Accordion components for organizing content into collapsible sections. Great for FAQs, settings, or any grouped information.
            </p>
          </div>

          <Accordion items={accordionItems} defaultOpen={['overview']} />
        </div>
      </Panel>


    </div>
  );
}
