import {
  MiddleAlign,
  VerticalSpace
} from '@create-figma-plugin/ui';
import { Button } from '@ui/components/base/Button';
import { CustomDropdown } from '@ui/components/base/CustomDropdown';
import { Panel } from '@ui/components/base/Panel';
import { Textbox } from '@ui/components/base/Textbox';
import { Toast } from '@ui/components/base/Toast';
import { useTheme } from '@ui/contexts/ThemeContext';
import { useToast } from '@ui/hooks/useToast';
import { useState } from 'preact/hooks';

/**
 * Props for the FigmaView component.
 */
interface FigmaViewProps {
  // No external dependencies - fully self-contained
}

/**
 * FigmaView component that demonstrates Figma-native components, color management, and layout tools.
 *
 * This view showcases Figma's native UI components and provides examples of color utilities,
 * file operations, and design token management. All interactions and notifications are
 * self-contained within this view.
 *
 * @param props - {@link FigmaViewProps} for configuring the view
 * @returns The rendered FigmaView React element
 */
export function FigmaView({ }: FigmaViewProps) {
  const { colors } = useTheme();
  const { toast, showToast, dismissToast } = useToast();

  // Figma native component states
  const [searchValue, setSearchValue] = useState('');
  const [textboxValue, setTextboxValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('frame');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [segmentedValue, setSegmentedValue] = useState('layers');
  const [isLoading, setIsLoading] = useState(false);

  // Color-related states
  const [selectedColor, setSelectedColor] = useState('#3772FF');
  const [hexColor, setHexColor] = useState('#FF5733');
  const [rgbaColor, setRgbaColor] = useState({ r: 55, g: 114, b: 255, a: 1 });
  const [selectedToken, setSelectedToken] = useState('primary');

  // Color tokens for demo
  const colorTokens = [
    { value: 'primary', text: 'Primary Blue', color: '#3772FF' },
    { value: 'success', text: 'Success Green', color: '#1ecb7a' },
    { value: 'error', text: 'Error Red', color: '#e74c3c' },
    { value: 'warning', text: 'Warning Orange', color: '#f39c12' },
    { value: 'info', text: 'Info Blue', color: '#3498db' }
  ];

  const dropdownOptions = [
    { value: 'frame', text: 'Frame' },
    { value: 'group', text: 'Group' },
    { value: 'component', text: 'Component' },
    { value: 'instance', text: 'Instance' }
  ];

  const segmentedOptions = [
    { value: 'layers', children: 'Layers' },
    { value: 'assets', children: 'Assets' },
    { value: 'styles', children: 'Styles' }
  ];

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      showToast(`Uploaded: ${files[0].name}`, 'success');
    }
  };

  // Color helper functions
  const hexToRgba = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : { r: 0, g: 0, b: 0, a: 1 };
  };

  const rgbaToHex = (rgba: { r: number; g: number; b: number; a: number }) => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  };

  const applyColorToken = (tokenValue: string) => {
    const token = colorTokens.find(t => t.value === tokenValue);
    if (token) {
      setSelectedColor(token.color);
      setHexColor(token.color);
      setRgbaColor(hexToRgba(token.color));
      showToast(`Applied ${token.text} token`, 'success');
    }
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('Process completed!', 'success');
    }, 2000);
  };

  const handleIconAction = (action: string) => {
    showToast(`${action} clicked!`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Color Components */}
      <Panel title="Color Components & Tokens">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              Color pickers, tokens, and color management tools commonly used in design systems.
            </p>
          </div>

          {/* Color Token Selector */}
          <div>
            <div style={{ color: colors.textColor, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Color Tokens
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <CustomDropdown
                options={colorTokens.map(token => ({ value: token.value, text: token.text }))}
                value={selectedToken}
                onValueChange={(value: string) => {
                  setSelectedToken(value);
                  applyColorToken(value);
                }}
                placeholder="Select a color token..."
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {colorTokens.map(token => (
                  <button
                    key={token.value}
                    onClick={() => {
                      setSelectedToken(token.value);
                      applyColorToken(token.value);
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: token.color,
                      border: selectedToken === token.value ? `2px solid ${colors.textColor}` : `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      padding: 0,
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    title={token.text}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Custom Color Picker */}
          <div>
            <div style={{ color: colors.textColor, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Custom Color Picker
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Hex Color Input */}
              <div>
                <div style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>HEX Color</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={hexColor}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const newColor = target.value;
                      setHexColor(newColor);
                      setSelectedColor(newColor);
                      setRgbaColor(hexToRgba(newColor));
                    }}
                    style={{
                      width: 40,
                      height: 32,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: 'none'
                    }}
                  />
                  <Textbox
                    value={hexColor}
                    onValueInput={(value) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                        setHexColor(value);
                        setSelectedColor(value);
                        setRgbaColor(hexToRgba(value));
                      }
                    }}
                    placeholder="#FF5733"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* RGBA Inputs */}
              <div>
                <div style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>RGBA Values</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                  {(['r', 'g', 'b', 'a'] as const).map(channel => (
                    <div key={channel}>
                      <div style={{ color: colors.textSecondary, fontSize: 10, marginBottom: 2, textTransform: 'uppercase' }}>
                        {channel}
                      </div>
                      <Textbox
                        value={String(rgbaColor[channel])}
                        onValueInput={(value) => {
                          const numValue = channel === 'a' ? parseFloat(value) : parseInt(value);
                          if (!isNaN(numValue)) {
                            const newRgba = { ...rgbaColor, [channel]: numValue };
                            setRgbaColor(newRgba);
                            const newHex = rgbaToHex(newRgba);
                            setHexColor(newHex);
                            setSelectedColor(newHex);
                          }
                        }}
                        placeholder={channel === 'a' ? '1.0' : '255'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Preview */}
              <div>
                <div style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 4 }}>Color Preview</div>
                <div style={{
                  width: '100%',
                  height: 60,
                  borderRadius: 6,
                  background: selectedColor,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {selectedColor}
                </div>
              </div>

              {/* Color Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedColor);
                    showToast(`Copied ${selectedColor} to clipboard`, 'success');
                  }}
                >
                  Copy Hex
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const rgbaString = `rgba(${rgbaColor.r}, ${rgbaColor.g}, ${rgbaColor.b}, ${rgbaColor.a})`;
                    navigator.clipboard?.writeText(rgbaString);
                    showToast(`Copied RGBA to clipboard`, 'success');
                  }}
                >
                  Copy RGBA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Figma Layout Components */}
      <Panel title="Figma Layout Components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ color: colors.textSecondary, margin: '0 0 12px 0', fontSize: 13, lineHeight: 1.5 }}>
              Layout components for organizing content in a Figma-native way.
            </p>
          </div>

          {/* Middle Align Demo */}
          <div>
            <div style={{ color: colors.textColor, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Middle Align Layout
            </div>
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              height: 80,
              background: colors.darkBg
            }}>
              <MiddleAlign>
                <div style={{
                  color: colors.textColor,
                  fontSize: 14,
                  textAlign: 'center'
                }}>
                  Centered content using MiddleAlign
                </div>
              </MiddleAlign>
            </div>
          </div>

          {/* Vertical Space Demo */}
          <div>
            <div style={{ color: colors.textColor, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Vertical Spacing
            </div>
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: 12,
              background: colors.darkBg
            }}>
              <div style={{ color: colors.textColor, fontSize: 13 }}>First section</div>
              <VerticalSpace space="small" />
              <div style={{ color: colors.textColor, fontSize: 13 }}>Small space (8px)</div>
              <VerticalSpace space="medium" />
              <div style={{ color: colors.textColor, fontSize: 13 }}>Medium space (16px)</div>
              <VerticalSpace space="large" />
              <div style={{ color: colors.textColor, fontSize: 13 }}>Large space (24px)</div>
            </div>
          </div>

          {/* Custom Preview */}
          <div>
            <div style={{ color: colors.textColor, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Custom Preview
            </div>
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              padding: 16,
              background: colors.darkPanel
            }}>
              <div style={{
                width: '100%',
                height: 100,
                background: `linear-gradient(45deg, ${colors.accent}, ${colors.success})`,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                fontWeight: 500
              }}>
                Preview Content
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Current State Display */}
      <Panel title="Component State" variant="standard">
        <div style={{
          background: colors.darkBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 6,
          padding: 12,
          fontSize: 11,
          fontFamily: 'monospace'
        }}>
          <div style={{ color: colors.textSecondary, marginBottom: 8 }}>Current component values:</div>
          <div style={{ color: colors.textColor, lineHeight: 1.5 }}>
            Search: "{searchValue || 'empty'}"<br />
            Textbox: "{textboxValue || 'empty'}"<br />
            Dropdown: "{dropdownValue || 'none selected'}"<br />
            Checkbox: {checkboxValue ? 'checked' : 'unchecked'}<br />
            Segmented: "{segmentedValue}"<br />
            Loading: {isLoading ? 'true' : 'false'}
          </div>
        </div>
      </Panel>

      {/* Usage Tips */}
      <Panel title="Figma Component Benefits" variant="standard">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h5 style={{ color: colors.textColor, margin: '0 0 6px 0', fontSize: 13 }}>Why Use Figma Native Components:</h5>
            <ul style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 1.5, margin: 0, paddingLeft: 16 }}>
              <li>Consistent with Figma's design system and user expectations</li>
              <li>Automatic keyboard navigation and accessibility features</li>
              <li>Optimized performance for Figma's plugin environment</li>
              <li>Built-in focus management and proper event handling</li>
              <li>Responsive and adapts to different plugin window sizes</li>
            </ul>
          </div>

          <div style={{
            background: colors.darkBg,
            border: `1px solid ${colors.accent}20`,
            borderLeft: `4px solid ${colors.accent}`,
            borderRadius: 4,
            padding: 12
          }}>
            <div style={{ color: colors.accent, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              💡 Pro Tip
            </div>
            <div style={{ color: colors.textSecondary, fontSize: 11, lineHeight: 1.4 }}>
              Always prefer Figma's native components over custom HTML elements for better user experience
              and consistency with Figma's interface patterns.
            </div>
          </div>
        </div>
      </Panel>

      {/* Toast Notification */}
      {toast && (
        <Toast toast={toast} onDismiss={dismissToast} />
      )}
    </div>
  );
}
