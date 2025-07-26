import { BORDER_RADIUS } from '@shared/constants';
import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useTheme } from '../../contexts/ThemeContext';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: h.JSX.Element | h.JSX.Element[];
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
}

export function Modal({
  isVisible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true
}: ModalProps) {
  const { colors } = useTheme();

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { width: '320px', maxHeight: '400px' };
      case 'large': return { width: '600px', maxHeight: '700px' };
      default: return { width: '480px', maxHeight: '500px' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: colors.darkPanel,
          borderRadius: BORDER_RADIUS,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          ...getSizeStyles()
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3
            style={{
              margin: 0,
              color: colors.textColor,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textSecondary,
                fontSize: 18,
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.textColor}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              ×
            </button>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            padding: 24,
            flex: 1,
            overflow: 'auto'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
