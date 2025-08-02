import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the SkipNavigation component
 */
export interface SkipNavigationProps {
  /** Array of skip links with targets and labels */
  links?: Array<{
    /** ID of the target element to skip to */
    target: string;
    /** Label text for the skip link */
    label: string;
  }>;
}

/**
 * Accessibility skip navigation component
 *
 * Provides keyboard users with skip links to jump to main content areas,
 * improving navigation efficiency and accessibility compliance.
 *
 * @example
 * ```tsx
 * <SkipNavigation
 *   links={[
 *     { target: 'main-content', label: 'Skip to main content' },
 *     { target: 'navigation', label: 'Skip to navigation' }
 *   ]}
 * />
 * ```
 */
export function SkipNavigation({
  links = [
    { target: 'main-content', label: 'Skip to main content' },
    { target: 'navigation', label: 'Skip to navigation' }
  ]
}: SkipNavigationProps) {
  const { colors, spacing } = useTheme();

  const handleSkipClick = (e: Event, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Make target focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus();
      // Scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const skipNavStyles = `
    .skip-navigation {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 9999;
      background: ${colors.darkBg};
      padding: ${spacing.sm}px;
      transform: translateY(-100%);
      transition: transform 0.2s ease;
    }

    .skip-navigation:focus-within {
      transform: translateY(0);
    }

    .skip-navigation ul {
      display: flex;
      gap: ${spacing.md}px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .skip-navigation a {
      display: inline-block;
      padding: ${spacing.sm}px ${spacing.md}px;
      background: ${colors.textColor};
      color: ${colors.darkBg};
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      border: 2px solid ${colors.textColor};
      transition: all 0.2s ease;
    }

    .skip-navigation a:focus {
      background: ${colors.darkBg};
      color: ${colors.textColor};
      box-shadow: 0 0 0 2px ${colors.textColor};
    }
  `;

  return (
    <>
      <style>{skipNavStyles}</style>
      <div className="skip-navigation">
        <nav aria-label="Skip navigation links">
          <ul>
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={`#${link.target}`}
                  onClick={(e) => handleSkipClick(e, link.target)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
