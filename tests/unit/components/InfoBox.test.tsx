import { render, screen } from '@testing-library/preact';
import { InfoBox } from '@ui/components/base/InfoBox';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { h } from 'preact';

const renderInfoBox = (props = {}) => {
  return render(
    h(ThemeProvider, { children: h(InfoBox, { title: 'Test Title', children: 'Test content', ...props }) })
  );
};

describe('InfoBox Component', () => {
  describe('Rendering', () => {
    test('renders with title and content', () => {
      renderInfoBox();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    test('renders with custom title', () => {
      renderInfoBox({ title: 'Custom Title' });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    test('renders with complex content', () => {
      const complexContent = h('div', {}, [
        h('strong', { key: 'label' }, 'Note: '),
        'This is complex content with ',
        h('em', { key: 'emphasis' }, 'emphasis')
      ]);
      renderInfoBox({ children: complexContent });

      expect(screen.getByText('Note:')).toBeInTheDocument();
      expect(screen.getByText('This is complex content with')).toBeInTheDocument();
      expect(screen.getByText('emphasis')).toBeInTheDocument();
    });

    test('renders with empty content', () => {
      renderInfoBox({ children: '' });
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    test('renders info variant by default', () => {
      const { container } = renderInfoBox();
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(79, 148, 255)');
    });

    test('renders success variant', () => {
      const { container } = renderInfoBox({ variant: 'success' });
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(20, 174, 92)');
    });

    test('renders warning variant', () => {
      const { container } = renderInfoBox({ variant: 'warning' });
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(243, 156, 18)');
    });

    test('renders error variant', () => {
      const { container } = renderInfoBox({ variant: 'error' });
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(242, 72, 34)');
    });

    test('renders accent variant', () => {
      const { container } = renderInfoBox({ variant: 'accent' });
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(79, 148, 255)');
    });

    test('renders tip variant', () => {
      const { container } = renderInfoBox({ variant: 'tip' });
      const infoBox = container.firstChild as HTMLElement;

      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(79, 148, 255)');
    });

    test('renders plain variant with different border style', () => {
      const { container } = renderInfoBox({ variant: 'plain' });
      const infoBox = container.firstChild as HTMLElement;

      // Plain variant should have regular border instead of thick left border
      expect(infoBox).toHaveStyle('border-left: 1px solid rgb(44, 48, 57)');
    });
  });

  describe('Title Styling', () => {
    test('applies correct title color for info variant', () => {
      renderInfoBox({ variant: 'info' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(79, 148, 255)');
    });

    test('applies correct title color for success variant', () => {
      renderInfoBox({ variant: 'success' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(20, 174, 92)');
    });

    test('applies correct title color for warning variant', () => {
      renderInfoBox({ variant: 'warning' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(243, 156, 18)');
    });

    test('applies correct title color for error variant', () => {
      renderInfoBox({ variant: 'error' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(242, 72, 34)');
    });

    test('applies correct title color for plain variant', () => {
      renderInfoBox({ variant: 'plain' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(255, 255, 255)');
    });

    test('applies correct title font weight and size', () => {
      renderInfoBox();
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;
      expect(titleContainer).toHaveStyle('font-weight: 600');
      expect(titleContainer).toHaveStyle('font-size: 14px');
    });
  });

  describe('Content Styling', () => {
    test('applies correct content color', () => {
      renderInfoBox();
      const contentElement = screen.getByText('Test content');
      expect(contentElement).toHaveStyle('color: rgb(160, 163, 168)');
    });

    test('applies correct content font size and line height', () => {
      renderInfoBox();
      const contentElement = screen.getByText('Test content');
      expect(contentElement).toHaveStyle('font-size: 14px');
      expect(contentElement).toHaveStyle('line-height: 1.4');
    });
  });

  describe('Custom Colors', () => {
    test('uses custom background color when provided', () => {
      const { container } = renderInfoBox({ backgroundColor: '#ff0000' });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('background: rgb(255, 0, 0)');
    });

    test('uses custom border color when provided', () => {
      const { container } = renderInfoBox({ borderColor: '#00ff00' });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(0, 255, 0)');
    });

    test('uses custom title color when provided', () => {
      renderInfoBox({ titleColor: '#ff00ff' });
      const titleElement = screen.getByText('Test Title');
      expect(titleElement).toHaveStyle('color: rgb(255, 0, 255)');
    });

    test('uses custom content color when provided', () => {
      renderInfoBox({ contentColor: '#ffff00' });
      const contentElement = screen.getByText('Test content');
      expect(contentElement).toHaveStyle('color: rgb(255, 255, 0)');
    });

    test('combines custom colors with variant', () => {
      const { container } = renderInfoBox({
        variant: 'error',
        backgroundColor: '#000000',
        titleColor: '#ffffff'
      });

      const infoBox = container.firstChild as HTMLElement;
      const titleElement = screen.getByText('Test Title');

      expect(infoBox).toHaveStyle('background: rgb(0, 0, 0)');
      expect(titleElement).toHaveStyle('color: rgb(255, 255, 255)');
      // Border should still use error variant border
      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(242, 72, 34)');
    });
  });

  describe('Layout and Spacing', () => {
    test('applies correct padding', () => {
      const { container } = renderInfoBox();
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('padding: 16px');
    });

    test('applies correct border radius', () => {
      const { container } = renderInfoBox();
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('border-radius: 6px');
    });

    test('applies correct margin between title and content', () => {
      renderInfoBox();
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;
      expect(titleContainer).toHaveStyle('margin-bottom: 8px');
    });

    test('title has correct flex layout', () => {
      renderInfoBox();
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;
      expect(titleContainer).toHaveStyle('display: flex');
      expect(titleContainer).toHaveStyle('align-items: center');
      expect(titleContainer).toHaveStyle('gap: 6px');
    });
  });

  describe('Custom Props', () => {
    test('applies custom className', () => {
      const { container } = renderInfoBox({ className: 'custom-info-box' });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveClass('custom-info-box');
    });

    test('applies custom inline styles', () => {
      const customStyle = { marginTop: '20px', opacity: '0.8' };
      const { container } = renderInfoBox({ style: customStyle });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('margin-top: 20px');
      expect(infoBox).toHaveStyle('opacity: 0.8');
    });

    test('custom styles override default styles', () => {
      const customStyle = { padding: '30px', borderRadius: '10px' };
      const { container } = renderInfoBox({ style: customStyle });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('padding: 30px');
      expect(infoBox).toHaveStyle('border-radius: 10px');
    });
  });

  describe('Border Styles', () => {
    test('applies semi-transparent border for colored variants', () => {
      const { container } = renderInfoBox({ variant: 'info' });
      const infoBox = container.firstChild as HTMLElement;
      // Should have a semi-transparent border (the component adds 20 as hex alpha)
      expect(infoBox).toHaveStyle('border: 1px solid #4f94ff20');
    });

    test('applies regular border for plain variant', () => {
      const { container } = renderInfoBox({ variant: 'plain' });
      const infoBox = container.firstChild as HTMLElement;
      // Plain variant should have regular border color
      expect(infoBox).toHaveStyle('border: 1px solid rgb(44, 48, 57)');
    });

    test('custom border color affects both border and left border', () => {
      const { container } = renderInfoBox({ borderColor: '#123456' });
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(18, 52, 86)');
      expect(infoBox).toHaveStyle('border: 1px solid #12345620');
    });
  });

  describe('Theme Integration', () => {
    test('uses theme spacing values', () => {
      const { container } = renderInfoBox();
      const infoBox = container.firstChild as HTMLElement;
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;

      expect(infoBox).toHaveStyle('padding: 16px'); // md spacing
      expect(titleContainer).toHaveStyle('margin-bottom: 8px'); // sm spacing
    });

    test('uses theme typography values', () => {
      renderInfoBox();
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;
      const contentElement = screen.getByText('Test content');

      expect(titleContainer).toHaveStyle('font-size: 14px'); // body typography
      expect(contentElement).toHaveStyle('font-size: 14px'); // body typography
    });

    test('uses theme border radius', () => {
      const { container } = renderInfoBox();
      const infoBox = container.firstChild as HTMLElement;
      expect(infoBox).toHaveStyle('border-radius: 6px'); // default border radius
    });

    test('uses theme color system', () => {
      renderInfoBox({ variant: 'info' });
      const titleElement = screen.getByText('Test Title');
      const contentElement = screen.getByText('Test content');

      expect(titleElement).toHaveStyle('color: rgb(79, 148, 255)'); // theme info color
      expect(contentElement).toHaveStyle('color: rgb(160, 163, 168)'); // theme textSecondary color
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined variant gracefully', () => {
      const { container } = renderInfoBox({ variant: undefined });
      const infoBox = container.firstChild as HTMLElement;
      // Should default to info variant
      expect(infoBox).toHaveStyle('border-left: 4px solid rgb(79, 148, 255)');
    });

    test('handles empty title', () => {
      renderInfoBox({ title: '' });
      // Should still render the title container, just empty
      expect(document.querySelector('[style*="font-weight: 600"]')).toBeInTheDocument();
    });

    test('handles long titles without breaking layout', () => {
      const longTitle = 'This is a very long title that should wrap properly without breaking the layout of the info box component';
      renderInfoBox({ title: longTitle });
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    test('handles long content without breaking layout', () => {
      const longContent = 'This is very long content that should wrap properly and maintain good readability within the info box component without causing any layout issues or overflow problems.';
      renderInfoBox({ children: longContent });
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test('handles nested React elements in content', () => {
      const nestedContent = h('div', {}, [
        h('p', { key: 'p1' }, 'First paragraph'),
        h('ul', { key: 'list' }, [
          h('li', { key: 'li1' }, 'List item 1'),
          h('li', { key: 'li2' }, 'List item 2')
        ])
      ]);
      renderInfoBox({ children: nestedContent });

      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('maintains proper text contrast', () => {
      renderInfoBox({ variant: 'info' });
      const titleElement = screen.getByText('Test Title');
      const contentElement = screen.getByText('Test content');

      // Title uses accent color for visibility
      expect(titleElement).toHaveStyle('color: rgb(79, 148, 255)');
      // Content uses secondary text color for readability
      expect(contentElement).toHaveStyle('color: rgb(160, 163, 168)');
    });

    test('provides clear visual hierarchy', () => {
      renderInfoBox();
      const titleElement = screen.getByText('Test Title');
      const titleContainer = titleElement.parentElement;
      const contentElement = screen.getByText('Test content');

      // Title should be bolder than content
      expect(titleContainer).toHaveStyle('font-weight: 600');
      // Content should have good line height for readability
      expect(contentElement).toHaveStyle('line-height: 1.4');
    });

    test('uses semantic structure', () => {
      renderInfoBox();
      // The component should create a clear structure with title and content sections
      const titleElement = screen.getByText('Test Title');
      const contentElement = screen.getByText('Test content');

      expect(titleElement.parentElement).toBeTruthy();
      expect(contentElement.parentElement).toBeTruthy();
    });
  });
});
