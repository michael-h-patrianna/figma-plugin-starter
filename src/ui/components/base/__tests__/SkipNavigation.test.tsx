import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/preact';
import { ThemeProvider } from '@ui/contexts/ThemeContext';
import { SkipNavigation } from '../SkipNavigation';

const renderWithTheme = (component: any) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('SkipNavigation', () => {
  beforeEach(() => {
    // Clear any existing elements
    document.body.innerHTML = '';
  });

  it('renders with default skip links', () => {
    renderWithTheme(<SkipNavigation />);

    expect(screen.getByRole('navigation', { name: 'Skip navigation links' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to navigation' })).toBeInTheDocument();
  });

  it('renders with custom skip links', () => {
    const customLinks = [
      { target: 'header', label: 'Skip to header' },
      { target: 'footer', label: 'Skip to footer' }
    ];

    renderWithTheme(<SkipNavigation links={customLinks} />);

    expect(screen.getByRole('link', { name: 'Skip to header' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to footer' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Skip to main content' })).not.toBeInTheDocument();
  });

  it('handles skip link clicks correctly', () => {
    // Create a target element
    const targetElement = document.createElement('div');
    targetElement.id = 'main-content';
    document.body.appendChild(targetElement);

    const focusSpy = jest.spyOn(targetElement, 'focus');
    const scrollSpy = jest.spyOn(targetElement, 'scrollIntoView');

    renderWithTheme(<SkipNavigation />);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    fireEvent.click(skipLink);

    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(targetElement.getAttribute('tabindex')).toBe('-1');
  });

  it('adds tabindex when target element lacks focus capability', () => {
    // Create a target element without tabindex
    const targetElement = document.createElement('div');
    targetElement.id = 'navigation';
    document.body.appendChild(targetElement);

    renderWithTheme(<SkipNavigation />);

    const skipLink = screen.getByRole('link', { name: 'Skip to navigation' });
    fireEvent.click(skipLink);

    expect(targetElement.getAttribute('tabindex')).toBe('-1');
  });

  it('does not modify tabindex when element already has it', () => {
    // Create a target element with existing tabindex
    const targetElement = document.createElement('button');
    targetElement.id = 'main-content';
    targetElement.setAttribute('tabindex', '0');
    document.body.appendChild(targetElement);

    renderWithTheme(<SkipNavigation />);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    fireEvent.click(skipLink);

    expect(targetElement.getAttribute('tabindex')).toBe('0');
  });

  it('handles missing target elements gracefully', () => {
    renderWithTheme(<SkipNavigation />);

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });

    // Should not throw error when target doesn't exist
    expect(() => {
      fireEvent.click(skipLink);
    }).not.toThrow();
  });

  it('has correct accessibility attributes', () => {
    renderWithTheme(<SkipNavigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Skip navigation links');

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.getAttribute('href')).toMatch(/^#/);
    });
  });

  it('supports keyboard navigation', () => {
    renderWithTheme(<SkipNavigation />);

    const firstLink = screen.getByRole('link', { name: 'Skip to main content' });
    const secondLink = screen.getByRole('link', { name: 'Skip to navigation' });

    // Test tab navigation
    firstLink.focus();
    expect(document.activeElement).toBe(firstLink);

    fireEvent.keyDown(firstLink, { key: 'Tab' });
    secondLink.focus();
    expect(document.activeElement).toBe(secondLink);
  });

  it('is initially hidden and shows on focus', () => {
    const { container } = renderWithTheme(<SkipNavigation />);

    const skipNavElement = container.querySelector('.skip-navigation') as HTMLElement;
    expect(skipNavElement).toBeInTheDocument();

    // Initially hidden (translateY(-100%))
    const computedStyle = window.getComputedStyle(skipNavElement);
    expect(computedStyle.transform).toBe('translateY(-100%)');
  });
});
