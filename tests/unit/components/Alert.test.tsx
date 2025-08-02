import { render } from '@testing-library/preact';
import { h } from 'preact';
import { Alert, AlertType } from '../../../src/ui/components/base/Alert';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: any) => {
  return render(h(ThemeProvider, { defaultTheme: 'light', children: component }));
};

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('renders alert with text content', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', children: 'This is an alert message' })
      );
      expect(container.querySelector('.alert')).toBeInTheDocument();
      expect(container.textContent).toContain('This is an alert message');
    });

    it('renders alert with JSX content', () => {
      const { container } = renderWithTheme(
        h(Alert, {
          type: 'warning',
          children: h('div', null,
            h('strong', null, 'Warning: '),
            'This is important'
          )
        })
      );
      expect(container.querySelector('strong')).toBeInTheDocument();
      expect(container.textContent).toContain('Warning: This is important');
    });

    it('applies correct CSS classes', () => {
      const { container } = renderWithTheme(
        h(Alert, {
          type: 'error',
          variant: 'subtle',
          className: 'custom-class',
          children: 'Test content'
        })
      );
      const alert = container.querySelector('.alert');
      expect(alert).toHaveClass('alert');
      expect(alert).toHaveClass('alert--error');
      expect(alert).toHaveClass('alert--subtle');
      expect(alert).toHaveClass('custom-class');
    });
  });

  describe('Alert Types', () => {
    const types: AlertType[] = ['info', 'warning', 'error', 'success'];

    test.each(types)('renders %s alert with correct styling', (type) => {
      const { container } = renderWithTheme(
        h(Alert, { type, children: `This is a ${type} alert` })
      );
      const alert = container.querySelector('.alert');
      expect(alert).toHaveClass(`alert--${type}`);
      expect(alert).toBeInTheDocument();
    });

    it('applies different colors for different types', () => {
      const types = ['info', 'warning', 'error', 'success'] as AlertType[];
      const colors: string[] = [];

      types.forEach(type => {
        const { container } = renderWithTheme(
          h(Alert, { type, children: 'Test message' })
        );
        const alert = container.querySelector('.alert') as HTMLElement;
        if (alert) {
          colors.push(getComputedStyle(alert).backgroundColor);
        }
      });

      // Each type should have a different background color
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(types.length);
    });
  });

  describe('Variants', () => {
    it('renders solid variant by default', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', children: 'Test message' })
      );
      const alert = container.querySelector('.alert');
      expect(alert).toHaveClass('alert--solid');
    });

    it('renders subtle variant when specified', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', variant: 'subtle', children: 'Test message' })
      );
      const alert = container.querySelector('.alert');
      expect(alert).toHaveClass('alert--subtle');
    });

    it('applies different styles for solid vs subtle variants', () => {
      const { container: solidContainer } = renderWithTheme(
        h(Alert, { type: 'info', variant: 'solid', children: 'Solid' })
      );
      const { container: subtleContainer } = renderWithTheme(
        h(Alert, { type: 'info', variant: 'subtle', children: 'Subtle' })
      );

      const solidAlert = solidContainer.querySelector('.alert') as HTMLElement;
      const subtleAlert = subtleContainer.querySelector('.alert') as HTMLElement;

      if (solidAlert && subtleAlert) {
        const solidBg = getComputedStyle(solidAlert).backgroundColor;
        const subtleBg = getComputedStyle(subtleAlert).backgroundColor;
        expect(solidBg).not.toBe(subtleBg);
      }
    });
  });

  describe('Visibility', () => {
    it('renders when visible is true', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', visible: true, children: 'Visible alert' })
      );
      expect(container.querySelector('.alert')).toBeInTheDocument();
    });

    it('renders when visible is not specified (defaults to true)', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', children: 'Default visible alert' })
      );
      expect(container.querySelector('.alert')).toBeInTheDocument();
    });

    it('does not render when visible is false', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', visible: false, children: 'Hidden alert' })
      );
      expect(container.querySelector('.alert')).not.toBeInTheDocument();
      expect(container.textContent).not.toContain('Hidden alert');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom styles', () => {
      const customStyle = {
        fontSize: '16px',
        padding: '20px',
        border: '2px solid red'
      };

      const { container } = renderWithTheme(
        h(Alert, { type: 'info', style: customStyle, children: 'Styled alert' })
      );

      const alert = container.querySelector('.alert') as HTMLElement;
      if (alert) {
        expect(alert.style.fontSize).toBe('16px');
        expect(alert.style.padding).toBe('20px');
        expect(alert.style.border).toBe('2px solid red');
      }
    });

    it('merges custom styles with default styles', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', style: { fontSize: '20px' }, children: 'Test' })
      );

      const alert = container.querySelector('.alert') as HTMLElement;
      if (alert) {
        expect(alert.style.fontSize).toBe('20px');
        // Default styles should still be applied
        expect(alert.style.display).toBe('flex');
        expect(alert.style.borderRadius).toBe('6px');
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'error', children: 'Error message' })
      );
      const alert = container.querySelector('.alert');
      expect(alert).toBeInTheDocument();
      expect(alert?.tagName).toBe('DIV');
    });

    it('maintains content structure for screen readers', () => {
      const { container } = renderWithTheme(
        h(Alert, {
          type: 'warning',
          children: h('div', null,
            h('strong', null, 'Warning: '),
            'Please check your input'
          )
        })
      );

      const strong = container.querySelector('strong');
      expect(strong).toBeInTheDocument();
      expect(strong?.textContent).toBe('Warning: ');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors and spacing', () => {
      const { container } = renderWithTheme(
        h(Alert, { type: 'info', children: 'Themed alert' })
      );

      const alert = container.querySelector('.alert') as HTMLElement;

      if (alert) {
        // Should have theme-based styling
        expect(alert.style.fontFamily).toContain('Inter');
        expect(alert.style.lineHeight).toBe('1.4');
        expect(alert.style.borderRadius).toBe('6px');
      }
    });

    it('renders all alert types without errors', () => {
      const types: AlertType[] = ['info', 'warning', 'error', 'success'];

      types.forEach(type => {
        expect(() => {
          renderWithTheme(
            h(Alert, { type, children: `${type} alert` })
          );
        }).not.toThrow();
      });
    });
  });
});
