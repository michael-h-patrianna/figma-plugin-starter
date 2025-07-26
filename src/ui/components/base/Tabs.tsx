import { COLORS } from '@shared/constants';
import { h } from 'preact';

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
  return (
    <div style={{ width: '100%' }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `2px solid ${COLORS.border}`,
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
                  ? COLORS.textSecondary
                  : isActive
                    ? COLORS.accent
                    : COLORS.textColor,
                padding: '12px 20px 10px 20px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s ease',
                position: 'relative',
                outline: 'none',
                borderBottom: isActive ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                marginBottom: '-2px' // Overlap the parent border
              }}
              onMouseEnter={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = COLORS.accent;
                  e.currentTarget.style.borderBottomColor = `${COLORS.accent}40`;
                }
              }}
              onMouseLeave={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = COLORS.textColor;
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
