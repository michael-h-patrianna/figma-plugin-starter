import { render } from '@testing-library/preact';
import { h } from 'preact';
import { Code } from '../../../src/ui/components/base/Code';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: any) => {
  return render(h(ThemeProvider, { defaultTheme: 'light', children: component }));
};

describe('Code Component', () => {
  const sampleCode = `function hello() {
  return "Hello, World!";
}`;

  describe('Rendering', () => {
    it('renders code content', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      expect(container.textContent).toContain('function hello()');
      expect(container.textContent).toContain('return "Hello, World!"');
    });

    it('renders code in a pre element', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      expect(pre?.textContent).toBe(sampleCode);
    });

    it('applies monospace font family', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const pre = container.querySelector('pre') as HTMLElement;
      expect(pre.style.fontFamily).toContain('monospace');
    });

    it('preserves whitespace and formatting', () => {
      const codeWithSpaces = `  indented line
    more indented
normal line`;

      const { container } = renderWithTheme(
        h(Code, { children: codeWithSpaces })
      );

      const pre = container.querySelector('pre') as HTMLElement;
      expect(pre.style.whiteSpace).toBe('pre-wrap');
      expect(pre.textContent).toBe(codeWithSpaces);
    });
  });

  describe('Title Functionality', () => {
    it('renders without title by default', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      // Check if title element exists by checking structure
      const divs = container.querySelectorAll('div');
      // Should only have the main wrapper div, not a title div
      expect(divs.length).toBe(1);
    });

    it('renders title when provided', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, title: 'example.ts' })
      );

      expect(container.textContent).toContain('example.ts');
    });

    it('applies correct styling to title', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, title: 'example.ts' })
      );

      // Find the title div - should be the first child div inside the main container
      const mainDiv = container.querySelector('div');
      const titleDiv = mainDiv?.querySelector('div') as HTMLElement;

      expect(titleDiv).toBeTruthy();
      expect(titleDiv.textContent).toBe('example.ts');
      expect(titleDiv.style.fontWeight).toBe('600');
      expect(titleDiv.style.fontSize).toBe('11px');
    });

    it('separates title from code with border', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, title: 'example.ts' })
      );

      const titleDiv = container.querySelector('div > div') as HTMLElement;
      expect(titleDiv.style.borderBottom).toContain('1px solid');
    });
  });

  describe('Language Support', () => {
    it('uses typescript as default language', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      // Component renders regardless of language (no visual difference in basic implementation)
      expect(container.querySelector('pre')).toBeInTheDocument();
    });

    it('accepts custom language', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, language: 'javascript' })
      );

      // Component renders regardless of language
      expect(container.querySelector('pre')).toBeInTheDocument();
    });

    it('handles various language types', () => {
      const languages = ['javascript', 'python', 'css', 'html', 'json'];

      languages.forEach(language => {
        const { container } = renderWithTheme(
          h(Code, { children: sampleCode, language })
        );

        expect(container.querySelector('pre')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Theme Integration', () => {
    it('applies theme-based colors', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const wrapper = container.querySelector('div') as HTMLElement;
      const pre = container.querySelector('pre') as HTMLElement;

      // Should have background and border styles
      expect(wrapper.style.borderRadius).toBe('6px');
      expect(wrapper.style.border).toContain('1px solid');
      expect(pre.style.margin).toBe('0px');
      expect(pre.style.padding).toBe('16px');
    });

    it('applies consistent typography', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const pre = container.querySelector('pre') as HTMLElement;

      expect(pre.style.fontSize).toBe('12px');
      expect(pre.style.lineHeight).toBe('1.5');
      expect(pre.style.fontFamily).toContain('SF Mono');
    });

    it('handles overflow properly', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const wrapper = container.querySelector('div') as HTMLElement;
      const pre = container.querySelector('pre') as HTMLElement;

      expect(wrapper.style.overflow).toBe('hidden');
      expect(pre.style.overflow).toBe('auto');
    });

    it('applies word breaking for long lines', () => {
      const longCode = 'this.is.a.very.long.line.of.code.that.should.break.properly.when.it.exceeds.the.container.width';

      const { container } = renderWithTheme(
        h(Code, { children: longCode })
      );

      const pre = container.querySelector('pre') as HTMLElement;
      expect(pre.style.wordBreak).toBe('break-word');
    });
  });

  describe('Content Types', () => {
    it('handles single line code', () => {
      const singleLine = 'const x = 42;';

      const { container } = renderWithTheme(
        h(Code, { children: singleLine })
      );

      expect(container.textContent).toContain(singleLine);
    });

    it('handles multi-line code', () => {
      const multiLine = `function test() {
  if (true) {
    return 'success';
  }
  return 'failure';
}`;

      const { container } = renderWithTheme(
        h(Code, { children: multiLine })
      );

      expect(container.textContent).toContain('function test()');
      expect(container.textContent).toContain('return \'success\'');
    });

    it('handles empty code', () => {
      const { container } = renderWithTheme(
        h(Code, { children: '' })
      );

      const pre = container.querySelector('pre');
      expect(pre).toBeInTheDocument();
      expect(pre?.textContent).toBe('');
    });

    it('handles code with special characters', () => {
      const specialCode = 'const regex = /[a-z]+$/gi;\nconst symbols = "!@#$%^&*()";';

      const { container } = renderWithTheme(
        h(Code, { children: specialCode })
      );

      expect(container.textContent).toContain('regex = /[a-z]+$/gi');
      expect(container.textContent).toContain('!@#$%^&*()');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic pre element', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const pre = container.querySelector('pre');
      expect(pre?.tagName).toBe('PRE');
    });

    it('maintains code structure for screen readers', () => {
      const structuredCode = `class Example {
  constructor() {
    this.value = 42;
  }
}`;

      const { container } = renderWithTheme(
        h(Code, { children: structuredCode })
      );

      const pre = container.querySelector('pre');
      expect(pre?.textContent).toEqual(structuredCode);
    });

    it('provides clear visual hierarchy with title', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, title: 'Main Component' })
      );

      const mainDiv = container.querySelector('div');
      const title = mainDiv?.querySelector('div');
      const code = container.querySelector('pre');

      expect(title).toBeInTheDocument();
      expect(code).toBeInTheDocument();
      expect(title?.textContent).toBe('Main Component');

      // Title should come before code in DOM order
      const children = Array.from(mainDiv?.children || []);
      const titleIndex = children.indexOf(title as Element);
      const codeIndex = children.indexOf(code as Element);
      expect(titleIndex).toBeLessThan(codeIndex);
    });
  });

  describe('Layout and Spacing', () => {
    it('applies consistent margin bottom', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const wrapper = container.querySelector('div') as HTMLElement;
      expect(wrapper.style.marginBottom).toBe('16px');
    });

    it('applies appropriate padding to code content', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode })
      );

      const pre = container.querySelector('pre') as HTMLElement;
      expect(pre.style.padding).toBe('16px');
    });

    it('applies different padding to title', () => {
      const { container } = renderWithTheme(
        h(Code, { children: sampleCode, title: 'example.ts' })
      );

      const mainDiv = container.querySelector('div');
      const titleDiv = mainDiv?.querySelector('div') as HTMLElement;

      expect(titleDiv.style.padding).toBe('8px 12px');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long single line', () => {
      const longLine = 'a'.repeat(1000);

      const { container } = renderWithTheme(
        h(Code, { children: longLine })
      );

      const pre = container.querySelector('pre');
      expect(pre?.textContent).toBe(longLine);
    });

    it('handles code with only whitespace', () => {
      const whitespaceCode = '   \n  \t  \n   ';

      const { container } = renderWithTheme(
        h(Code, { children: whitespaceCode })
      );

      const pre = container.querySelector('pre');
      expect(pre?.textContent).toBe(whitespaceCode);
    });

    it('handles Unicode characters', () => {
      const unicodeCode = 'const emoji = "🚀"; // Unicode test\nconst chinese = "你好";';

      const { container } = renderWithTheme(
        h(Code, { children: unicodeCode })
      );

      expect(container.textContent).toContain('🚀');
      expect(container.textContent).toContain('你好');
    });
  });
});
