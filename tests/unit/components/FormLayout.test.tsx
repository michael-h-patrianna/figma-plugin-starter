import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { Form, FormField, FormGroup, FormRow, FormSection } from '../../../src/ui/components/base/FormLayout';
import { ThemeProvider } from '../../../src/ui/contexts/ThemeContext';

const renderWithTheme = (component: any) => {
  return render(
    h(ThemeProvider, { children: component })
  );
};

describe('FormLayout Components', () => {
  describe('Form', () => {
    it('renders basic form without title or description', () => {
      const onSubmit = jest.fn();
      renderWithTheme(
        h(Form, { onSubmit, children: h('div', {}, 'Form content') })
      );

      const form = screen.getByText('Form content').closest('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        margin: '0'
      });
    });

    it('renders form with title and description', () => {
      renderWithTheme(
        h(Form, {
          title: 'Test Form',
          description: 'This is a test form description',
          children: h('div', {}, 'Form content')
        })
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Form');
      expect(screen.getByText('This is a test form description')).toBeInTheDocument();
    });

    it('applies title styling correctly', () => {
      renderWithTheme(
        h(Form, {
          title: 'Test Form',
          children: h('div', {}, 'Content')
        })
      );

      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveStyle({
        margin: '0',
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '1.3'
      });
    });

    it('applies description styling correctly', () => {
      renderWithTheme(
        h(Form, {
          title: 'Test Form',
          description: 'Test description',
          children: h('div', {}, 'Content')
        })
      );

      const description = screen.getByText('Test description');
      expect(description).toHaveStyle({
        fontSize: '14px',
        lineHeight: '1.5'
      });
    });

    it('calls onSubmit when form is submitted', () => {
      const onSubmit = jest.fn();
      renderWithTheme(
        h(Form, {
          onSubmit,
          children: h('button', { type: 'submit' }, 'Submit')
        })
      );

      const form = screen.getByText('Submit').closest('form');
      fireEvent.submit(form!);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('passes isLast prop to last child', () => {
      // Create a test component that receives isLast prop
      const TestChild = ({ isLast }: { isLast?: boolean }) =>
        h('div', { 'data-testid': 'test-child', 'data-is-last': isLast }, 'Child');

      renderWithTheme(
        h(Form, {
          children: [
            h(TestChild, { key: 1 }),
            h(TestChild, { key: 2 })
          ]
        })
      );

      const children = screen.getAllByTestId('test-child');
      expect(children).toHaveLength(2);
      expect(children[1]).toHaveAttribute('data-is-last', 'true');
    }); it('handles different spacing values', () => {
      renderWithTheme(
        h(Form, {
          title: 'Test Form',
          spacing: 'xs',
          children: h('div', {}, 'Content')
        })
      );

      const form = screen.getByText('Content').closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('FormGroup', () => {
    it('renders basic form group without title', () => {
      renderWithTheme(
        h(FormGroup, { children: h('div', {}, 'Group content') })
      );

      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('renders form group with title and description', () => {
      renderWithTheme(
        h(FormGroup, {
          title: 'Group Title',
          description: 'Group description',
          children: h('div', {}, 'Content')
        })
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Group Title');
      expect(screen.getByText('Group description')).toBeInTheDocument();
    });

    it('applies title styling correctly', () => {
      renderWithTheme(
        h(FormGroup, {
          title: 'Test Group',
          children: h('div', {}, 'Content')
        })
      );

      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveStyle({
        margin: '0',
        fontSize: '14px',
        fontWeight: '600',
        lineHeight: '1.4'
      });
    });

    it('applies description styling correctly', () => {
      renderWithTheme(
        h(FormGroup, {
          title: 'Test Group',
          description: 'Test description',
          children: h('div', {}, 'Content')
        })
      );

      const description = screen.getByText('Test description');
      expect(description).toHaveStyle({
        fontSize: '12px',
        lineHeight: '1.5'
      });
    });

    it('removes bottom margin when isLast is true', () => {
      renderWithTheme(
        h(FormGroup, {
          isLast: true,
          children: h('div', {}, 'Content')
        })
      );

      const group = screen.getByText('Content').parentElement?.parentElement;
      expect(group).toHaveStyle({ marginBottom: '0px' });
    });

    it('applies custom spacing', () => {
      renderWithTheme(
        h(FormGroup, {
          spacing: 'lg',
          children: h('div', {}, 'Content')
        })
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('passes isLast prop to last child when group is last', () => {
      const TestChild = ({ isLast }: { isLast?: boolean }) =>
        h('div', { 'data-testid': 'test-child', 'data-is-last': isLast }, 'Child');

      renderWithTheme(
        h(FormGroup, {
          isLast: true,
          children: [
            h(TestChild, { key: 1 }),
            h(TestChild, { key: 2 })
          ]
        })
      );

      const children = screen.getAllByTestId('test-child');
      expect(children).toHaveLength(2);
      expect(children[1]).toHaveAttribute('data-is-last', 'true');
    });
  });

  describe('FormRow', () => {
    it('renders basic form row with default 2 columns', () => {
      renderWithTheme(
        h(FormRow, {
          children: [
            h('div', { key: 1 }, 'Item 1'),
            h('div', { key: 2 }, 'Item 2')
          ]
        })
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('applies correct flex layout styling', () => {
      renderWithTheme(
        h(FormRow, {
          children: h('div', {}, 'Content')
        })
      );

      const row = screen.getByText('Content').parentElement?.parentElement;
      expect(row).toHaveStyle({
        display: 'flex',
        alignItems: 'end',
        flexWrap: 'wrap'
      });
    });

    it('applies different column counts correctly', () => {
      renderWithTheme(
        h(FormRow, {
          columns: 3,
          children: [
            h('div', { key: 1 }, 'Item 1'),
            h('div', { key: 2 }, 'Item 2'),
            h('div', { key: 3 }, 'Item 3')
          ]
        })
      );

      const items = screen.getAllByText(/Item \d/);
      expect(items).toHaveLength(3);

      // Each item should have appropriate flex-basis for 3 columns
      items.forEach(item => {
        const wrapper = item.parentElement;
        expect(wrapper).toHaveStyle({
          flex: '1 1 200px',
          minWidth: '200px',
          maxWidth: '100%'
        });
      });
    });

    it('applies different alignment options', () => {
      renderWithTheme(
        h(FormRow, {
          align: 'center',
          children: h('div', {}, 'Content')
        })
      );

      const row = screen.getByText('Content').parentElement?.parentElement;
      expect(row).toHaveStyle({ alignItems: 'center' });
    });

    it('applies custom gap spacing', () => {
      renderWithTheme(
        h(FormRow, {
          gap: 'lg',
          children: h('div', {}, 'Content')
        })
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('removes bottom margin when isLast is true', () => {
      renderWithTheme(
        h(FormRow, {
          isLast: true,
          children: h('div', {}, 'Content')
        })
      );

      const row = screen.getByText('Content').parentElement?.parentElement;
      expect(row).toHaveStyle({ marginBottom: '0px' });
    });

    it('calculates correct flex-basis for different column counts', () => {
      const testCases = [
        { columns: 1, expectedBasis: '100%' },
        { columns: 2, expectedBasis: '300px' },
        { columns: 3, expectedBasis: '200px' },
        { columns: 4, expectedBasis: '150px' }
      ];

      testCases.forEach(({ columns, expectedBasis }) => {
        const { unmount } = renderWithTheme(
          h(FormRow, {
            columns: columns as 1 | 2 | 3 | 4,
            children: h('div', { 'data-testid': `item-${columns}` }, `Item ${columns}`)
          })
        );

        const item = screen.getByTestId(`item-${columns}`);
        const wrapper = item.parentElement;
        expect(wrapper).toHaveStyle({
          flex: `1 1 ${expectedBasis}`,
          minWidth: expectedBasis
        });

        unmount();
      });
    });
  });

  describe('FormField', () => {
    it('renders basic form field without label', () => {
      renderWithTheme(
        h(FormField, { children: h('input', { 'data-testid': 'test-input' }) })
      );

      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    it('renders form field with label', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Test Label',
          children: h('input', {})
        })
      );

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Test Label').tagName).toBe('LABEL');
    });

    it('applies label styling correctly', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Test Label',
          children: h('input', {})
        })
      );

      const label = screen.getByText('Test Label');
      expect(label).toHaveStyle({
        display: 'block',
        fontSize: '12px',
        fontWeight: '500',
        lineHeight: '1.4'
      });
    });

    it('shows required asterisk when required is true', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Required Field',
          required: true,
          children: h('input', {})
        })
      );

      const label = screen.getByText('Required Field');
      expect(label.textContent).toContain('*');
    });

    it('displays error message', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Test Field',
          error: 'This field is required',
          children: h('input', {})
        })
      );

      const error = screen.getByText('This field is required');
      expect(error).toBeInTheDocument();
      expect(error).toHaveStyle({
        fontSize: '11px',
        lineHeight: '1.4'
      });
    });

    it('displays help text when no error', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Test Field',
          helpText: 'This is helpful information',
          children: h('input', {})
        })
      );

      const helpText = screen.getByText('This is helpful information');
      expect(helpText).toBeInTheDocument();
      expect(helpText).toHaveStyle({
        fontSize: '11px',
        lineHeight: '1.4'
      });
    });

    it('prioritizes error message over help text', () => {
      renderWithTheme(
        h(FormField, {
          label: 'Test Field',
          error: 'Error message',
          helpText: 'Help text',
          children: h('input', {})
        })
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Help text')).not.toBeInTheDocument();
    });

    it('applies full width when fullWidth is true', () => {
      renderWithTheme(
        h(FormField, {
          fullWidth: true,
          children: h('input', { 'data-testid': 'input' })
        })
      );

      const field = screen.getByTestId('input').parentElement?.parentElement;
      expect(field).toHaveStyle({ width: '100%' });
    });

    it('applies auto width by default', () => {
      renderWithTheme(
        h(FormField, {
          children: h('input', { 'data-testid': 'input' })
        })
      );

      const field = screen.getByTestId('input').parentElement?.parentElement;
      expect(field).toHaveStyle({ width: 'auto' });
    });
  });

  describe('FormSection', () => {
    it('renders basic form section without title', () => {
      renderWithTheme(
        h(FormSection, { children: h('div', {}, 'Section content') })
      );

      expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    it('renders form section with title and description', () => {
      renderWithTheme(
        h(FormSection, {
          title: 'Section Title',
          description: 'Section description',
          children: h('div', {}, 'Content')
        })
      );

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section Title');
      expect(screen.getByText('Section description')).toBeInTheDocument();
    });

    it('applies title styling correctly', () => {
      renderWithTheme(
        h(FormSection, {
          title: 'Test Section',
          children: h('div', {}, 'Content')
        })
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveStyle({
        margin: '0',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '1.3'
      });
    });

    it('applies description styling correctly', () => {
      renderWithTheme(
        h(FormSection, {
          title: 'Test Section',
          description: 'Test description',
          children: h('div', {}, 'Content')
        })
      );

      const description = screen.getByText('Test description');
      expect(description).toHaveStyle({
        fontSize: '13px',
        lineHeight: '1.5'
      });
    });

    it('adds separator border when separator is true', () => {
      renderWithTheme(
        h(FormSection, {
          separator: true,
          children: h('div', {}, 'Content')
        })
      );

      const section = screen.getByText('Content').closest('div');
      expect(section).toHaveStyle({ borderBottom: expect.stringContaining('1px solid') });
    });

    it('removes bottom margin when isLast is true', () => {
      renderWithTheme(
        h(FormSection, {
          isLast: true,
          children: h('div', {}, 'Content')
        })
      );

      const section = screen.getByText('Content').parentElement;
      expect(section).toHaveStyle({ marginBottom: '0px' });
    });

    it('passes isLast prop to last child when section is last', () => {
      const TestChild = ({ isLast }: { isLast?: boolean }) =>
        h('div', { 'data-testid': 'test-child', 'data-is-last': isLast }, 'Child');

      renderWithTheme(
        h(FormSection, {
          isLast: true,
          children: [
            h(TestChild, { key: 1 }),
            h(TestChild, { key: 2 })
          ]
        })
      );

      const children = screen.getAllByTestId('test-child');
      expect(children).toHaveLength(2);
      expect(children[1]).toHaveAttribute('data-is-last', 'true');
    });
  });

  describe('Integration Tests', () => {
    it('renders complete form structure correctly', () => {
      renderWithTheme(
        h(Form, {
          title: 'Registration Form',
          description: 'Please fill out all required fields',
          children: [
            h(FormSection, {
              key: 1,
              title: 'Personal Information',
              separator: true,
              children: [
                h(FormGroup, {
                  key: 1,
                  title: 'Basic Details',
                  children: [
                    h(FormRow, {
                      key: 1,
                      children: [
                        h(FormField, {
                          key: 1,
                          label: 'First Name',
                          required: true,
                          children: h('input', { 'data-testid': 'firstName' })
                        }),
                        h(FormField, {
                          key: 2,
                          label: 'Last Name',
                          required: true,
                          children: h('input', { 'data-testid': 'lastName' })
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            h(FormSection, {
              key: 2,
              title: 'Contact Information',
              children: [
                h(FormGroup, {
                  key: 1,
                  children: [
                    h(FormRow, {
                      key: 1,
                      columns: 1,
                      children: [
                        h(FormField, {
                          key: 1,
                          label: 'Email',
                          helpText: 'We will never share your email',
                          children: h('input', { 'data-testid': 'email', type: 'email' })
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      );

      // Verify all components are rendered
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Registration Form');
      expect(screen.getByText('Please fill out all required fields')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Personal Information' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Contact Information' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Basic Details');
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('We will never share your email')).toBeInTheDocument();
      expect(screen.getByTestId('firstName')).toBeInTheDocument();
      expect(screen.getByTestId('lastName')).toBeInTheDocument();
      expect(screen.getByTestId('email')).toBeInTheDocument();
    });

    it('handles empty children arrays gracefully', () => {
      renderWithTheme(
        h(Form, { children: [] })
      );

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('handles single child without array wrapping', () => {
      renderWithTheme(
        h(FormRow, { children: h('div', {}, 'Single child') })
      );

      expect(screen.getByText('Single child')).toBeInTheDocument();
    });
  });
});
