import { h } from 'preact';
import { useTheme } from '../../contexts/ThemeContext';

interface Tab {
  id: string;
  label: string;
  content: h.JSX.Element;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  const { colors } = useTheme();

  return (
    <div style={{ width: '100%' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `2px solid ${colors.border}`,
        marginBottom: 16,
        position: 'relative'
      }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              disabled={tab.disabled}
              style={{
                background: 'transparent',
                border: 'none',
                color: tab.disabled
                  ? colors.textSecondary
                  : isActive
                    ? colors.accent
                    : colors.textColor,
                padding: '12px 20px 10px 20px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s ease',
                position: 'relative',
                outline: 'none',
                borderBottom: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                marginBottom: '-2px' // Overlap the parent border
              }}
              onMouseEnter={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = colors.accent;
                  e.currentTarget.style.borderBottomColor = `${colors.accent}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = colors.textColor;
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
