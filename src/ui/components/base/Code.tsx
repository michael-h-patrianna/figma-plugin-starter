import { useTheme } from '@ui/contexts/ThemeContext';

/**
 * Props for the Code component.
 */
interface CodeProps {
  children: string;
  language?: string;
  title?: string;
}

/**
 * Themed code block component with syntax highlighting styling.
 *
 * Displays code with proper theming, typography, and spacing consistent
 * with the design system. Uses monospace font and theme-appropriate
 * background and text colors.
 *
 * @param props - {@link CodeProps} for configuring the code block
 * @returns The rendered code block React element
 */
export function Code({ children, language = 'typescript', title }: CodeProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      background: colors.backgroundSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 16
    }}>
      {title && (
        <div style={{
          background: colors.darkPanel,
          color: colors.textSecondary,
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 600,
          borderBottom: `1px solid ${colors.border}`
        }}>
          {title}
        </div>
      )}
      <pre style={{
        margin: 0,
        padding: 16,
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: 'SF Mono, Monaco, Consolas, monospace',
        color: colors.textColor,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {children}
      </pre>
    </div>
  );
}
