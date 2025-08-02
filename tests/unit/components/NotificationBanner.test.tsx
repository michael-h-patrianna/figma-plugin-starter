import { Issue } from '@main/types';
import { render, screen } from '@testing-library/preact';
import { NotificationBanner } from '@ui/components/base/NotificationBanner';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

const renderNotificationBanner = (props: { issues?: Issue[] } = {}) => {
  return render(
    h(ThemeProvider, { children: h(NotificationBanner, { issues: [], ...props }) })
  );
};

describe('NotificationBanner Component', () => {
  describe('Visibility', () => {
    test('renders nothing when no issues provided', () => {
      const { container } = renderNotificationBanner({ issues: [] });
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when issues is undefined', () => {
      const { container } = renderNotificationBanner({ issues: undefined });
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when issues is null', () => {
      const { container } = render(
        h(ThemeProvider, { children: h(NotificationBanner, { issues: null as any }) })
      );
      expect(container.firstChild).toBeNull();
    });

    test('renders banner when issues are provided', () => {
      const issues: Issue[] = [
        { code: 'TEST_ERROR', message: 'Test error', level: 'error' }
      ];
      renderNotificationBanner({ issues });
      expect(screen.getByText('Issues Found (1)')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    test('displays errors with correct styling', () => {
      const issues: Issue[] = [
        { code: 'ERROR_1', message: 'First error', level: 'error' },
        { code: 'ERROR_2', message: 'Second error', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('Issues Found (2)')).toBeInTheDocument();
      expect(screen.getByText('❌ 2 Errors:')).toBeInTheDocument();
      expect(screen.getByText('1. First error')).toBeInTheDocument();
      expect(screen.getByText('2. Second error')).toBeInTheDocument();
    });

    test('displays single error with singular label', () => {
      const issues: Issue[] = [
        { code: 'ERROR_1', message: 'Single error', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('❌ 1 Error:')).toBeInTheDocument();
      expect(screen.getByText('1. Single error')).toBeInTheDocument();
    });

    test('applies error styling to container', () => {
      const issues: Issue[] = [
        { code: 'ERROR_1', message: 'Test error', level: 'error' }
      ];
      const { container } = renderNotificationBanner({ issues });

      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('background: rgba(231, 76, 60, 0.1)');
      expect(banner).toHaveStyle('border: 1px solid rgba(231, 76, 60, 0.3)');
    });
  });

  describe('Warning Display', () => {
    test('displays warnings with correct styling', () => {
      const issues: Issue[] = [
        { code: 'WARN_1', message: 'First warning', level: 'warning' },
        { code: 'WARN_2', message: 'Second warning', level: 'warning' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('Warnings (2)')).toBeInTheDocument();
      expect(screen.getByText('⚠️ 2 Warnings:')).toBeInTheDocument();
      expect(screen.getByText('1. First warning')).toBeInTheDocument();
      expect(screen.getByText('2. Second warning')).toBeInTheDocument();
    });

    test('displays single warning with singular label', () => {
      const issues: Issue[] = [
        { code: 'WARN_1', message: 'Single warning', level: 'warning' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('⚠️ 1 Warning:')).toBeInTheDocument();
      expect(screen.getByText('1. Single warning')).toBeInTheDocument();
    });

    test('applies warning styling to container', () => {
      const issues: Issue[] = [
        { code: 'WARN_1', message: 'Test warning', level: 'warning' }
      ];
      const { container } = renderNotificationBanner({ issues });

      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('background: rgba(243, 156, 18, 0.1)');
      expect(banner).toHaveStyle('border: 1px solid rgba(243, 156, 18, 0.3)');
    });
  });

  describe('Info Display', () => {
    test('displays info messages with correct styling', () => {
      const issues: Issue[] = [
        { code: 'INFO_1', message: 'First info', level: 'info' },
        { code: 'INFO_2', message: 'Second info', level: 'info' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('Information (2)')).toBeInTheDocument();
      expect(screen.getByText('ℹ️ 2 Infos:')).toBeInTheDocument();
      expect(screen.getByText('1. First info')).toBeInTheDocument();
      expect(screen.getByText('2. Second info')).toBeInTheDocument();
    });

    test('displays single info with singular label', () => {
      const issues: Issue[] = [
        { code: 'INFO_1', message: 'Single info', level: 'info' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('ℹ️ 1 Info:')).toBeInTheDocument();
      expect(screen.getByText('1. Single info')).toBeInTheDocument();
    });

    test('applies info styling to container', () => {
      const issues: Issue[] = [
        { code: 'INFO_1', message: 'Test info', level: 'info' }
      ];
      const { container } = renderNotificationBanner({ issues });

      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('background: rgba(52, 152, 219, 0.1)');
      expect(banner).toHaveStyle('border: 1px solid rgba(52, 152, 219, 0.3)');
    });
  });

  describe('Mixed Issue Types', () => {
    test('displays mixed issues with errors taking precedence', () => {
      const issues: Issue[] = [
        { code: 'ERROR_1', message: 'Test error', level: 'error' },
        { code: 'WARN_1', message: 'Test warning', level: 'warning' },
        { code: 'INFO_1', message: 'Test info', level: 'info' }
      ];
      renderNotificationBanner({ issues });

      // Should show "Issues Found" and use error styling
      expect(screen.getByText('Issues Found (3)')).toBeInTheDocument();
      expect(screen.getByText('❌ 1 Error:')).toBeInTheDocument();
      expect(screen.getByText('⚠️ 1 Warning:')).toBeInTheDocument();
      expect(screen.getByText('ℹ️ 1 Info:')).toBeInTheDocument();

      const { container } = renderNotificationBanner({ issues });
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('background: rgba(231, 76, 60, 0.1)');
    });

    test('displays warnings and info with warning styling when no errors', () => {
      const issues: Issue[] = [
        { code: 'WARN_1', message: 'Test warning', level: 'warning' },
        { code: 'INFO_1', message: 'Test info', level: 'info' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('Warnings (2)')).toBeInTheDocument();
      expect(screen.getByText('⚠️ 1 Warning:')).toBeInTheDocument();
      expect(screen.getByText('ℹ️ 1 Info:')).toBeInTheDocument();

      const { container } = renderNotificationBanner({ issues });
      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('background: rgba(243, 156, 18, 0.1)');
    });

    test('displays sections in correct order: errors, warnings, infos', () => {
      const issues: Issue[] = [
        { code: 'INFO_1', message: 'Test info', level: 'info' },
        { code: 'ERROR_1', message: 'Test error', level: 'error' },
        { code: 'WARN_1', message: 'Test warning', level: 'warning' }
      ];
      renderNotificationBanner({ issues });

      const text = screen.getByText('Issues Found (3)').parentElement?.textContent;
      const errorIndex = text?.indexOf('❌ 1 Error:') || -1;
      const warningIndex = text?.indexOf('⚠️ 1 Warning:') || -1;
      const infoIndex = text?.indexOf('ℹ️ 1 Info:') || -1;

      expect(errorIndex).toBeLessThan(warningIndex);
      expect(warningIndex).toBeLessThan(infoIndex);
    });
  });

  describe('Issue with Node IDs', () => {
    test('handles issues with node IDs correctly', () => {
      const issues: Issue[] = [
        { code: 'ERROR_1', message: 'Node error', level: 'error', nodeId: 'node-123' },
        { code: 'ERROR_1', message: 'Another node error', level: 'error', nodeId: 'node-456' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('1. Node error')).toBeInTheDocument();
      expect(screen.getByText('2. Another node error')).toBeInTheDocument();
    });

    test('handles duplicate codes with different node IDs', () => {
      const issues: Issue[] = [
        { code: 'DUPLICATE', message: 'First occurrence', level: 'warning', nodeId: 'node-1' },
        { code: 'DUPLICATE', message: 'Second occurrence', level: 'warning', nodeId: 'node-2' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('1. First occurrence')).toBeInTheDocument();
      expect(screen.getByText('2. Second occurrence')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    test('applies proper spacing and layout styles', () => {
      const issues: Issue[] = [
        { code: 'TEST', message: 'Test message', level: 'info' }
      ];
      const { container } = renderNotificationBanner({ issues });

      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('border-radius: 6px');
      expect(banner).toHaveStyle('padding: 16px');
      expect(banner).toHaveStyle('margin-bottom: 16px');
    });

    test('applies proper indentation to issue messages', () => {
      const issues: Issue[] = [
        { code: 'TEST', message: 'Test message', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      const messageElement = screen.getByText('1. Test message');
      expect(messageElement).toHaveStyle('padding-left: 16px');
      expect(messageElement).toHaveStyle('font-size: 12px');
      expect(messageElement).toHaveStyle('margin-bottom: 4px');
    });

    test('applies correct font weights and sizes', () => {
      const issues: Issue[] = [
        { code: 'TEST', message: 'Test message', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      const titleElement = screen.getByText('Issues Found (1)');
      expect(titleElement).toHaveStyle('font-weight: 600');
      expect(titleElement).toHaveStyle('font-size: 14px');

      const sectionElement = screen.getByText('❌ 1 Error:');
      expect(sectionElement).toHaveStyle('font-weight: 600');
      expect(sectionElement).toHaveStyle('font-size: 13px');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string messages', () => {
      const issues: Issue[] = [
        { code: 'EMPTY', message: '', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText('1.')).toBeInTheDocument();
    });

    test('handles long messages without breaking layout', () => {
      const longMessage = 'This is a very long error message that should wrap properly without breaking the layout or causing any display issues in the notification banner component.';
      const issues: Issue[] = [
        { code: 'LONG', message: longMessage, level: 'error' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText(`1. ${longMessage}`)).toBeInTheDocument();
    });

    test('handles special characters in messages', () => {
      const specialMessage = 'Error with special chars: <>&"\'';
      const issues: Issue[] = [
        { code: 'SPECIAL', message: specialMessage, level: 'error' }
      ];
      renderNotificationBanner({ issues });

      expect(screen.getByText(`1. ${specialMessage}`)).toBeInTheDocument();
    });

    test('handles large number of issues', () => {
      const issues: Issue[] = Array.from({ length: 100 }, (_, i) => ({
        code: `ERROR_${i}`,
        message: `Error message ${i + 1}`,
        level: 'error' as const
      }));
      renderNotificationBanner({ issues });

      expect(screen.getByText('Issues Found (100)')).toBeInTheDocument();
      expect(screen.getByText('❌ 100 Errors:')).toBeInTheDocument();
      expect(screen.getByText('1. Error message 1')).toBeInTheDocument();
      expect(screen.getByText('100. Error message 100')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    test('uses theme colors correctly', () => {
      const issues: Issue[] = [
        { code: 'ERROR', message: 'Error', level: 'error' },
        { code: 'WARN', message: 'Warning', level: 'warning' },
        { code: 'INFO', message: 'Info', level: 'info' }
      ];
      renderNotificationBanner({ issues });

      // The specific colors will be provided by the theme context
      // We can verify the elements exist and have color styling
      const titleElement = screen.getByText('Issues Found (3)');
      expect(titleElement).toHaveStyle('color: rgb(242, 72, 34)'); // error color

      const errorSection = screen.getByText('❌ 1 Error:');
      expect(errorSection).toHaveStyle('color: rgb(242, 72, 34)');

      const warningSection = screen.getByText('⚠️ 1 Warning:');
      expect(warningSection).toHaveStyle('color: rgb(243, 156, 18)');

      const infoSection = screen.getByText('ℹ️ 1 Info:');
      expect(infoSection).toHaveStyle('color: rgb(79, 148, 255)');
    });

    test('uses theme spacing values', () => {
      const issues: Issue[] = [
        { code: 'TEST', message: 'Test', level: 'info' }
      ];
      const { container } = renderNotificationBanner({ issues });

      const banner = container.firstChild as HTMLElement;
      expect(banner).toHaveStyle('padding: 16px'); // md spacing
      expect(banner).toHaveStyle('margin-bottom: 16px'); // md spacing
    });
  });

  describe('Accessibility', () => {
    test('provides semantic structure for screen readers', () => {
      const issues: Issue[] = [
        { code: 'ERROR', message: 'Test error', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      // The component uses semantic text content that screen readers can understand
      expect(screen.getByText('Issues Found (1)')).toBeInTheDocument();
      expect(screen.getByText('❌ 1 Error:')).toBeInTheDocument();
      expect(screen.getByText('1. Test error')).toBeInTheDocument();
    });

    test('uses appropriate contrast colors', () => {
      const issues: Issue[] = [
        { code: 'ERROR', message: 'Test error', level: 'error' }
      ];
      renderNotificationBanner({ issues });

      const messageElement = screen.getByText('1. Test error');
      // Message text uses theme textColor for good contrast (white text on dark theme by default)
      expect(messageElement).toHaveStyle('color: rgb(255, 255, 255)');
    });
  });
});
