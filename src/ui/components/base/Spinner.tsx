import { useTheme } from '@ui/contexts/ThemeContext';
import { useEffect, useState } from 'preact/hooks';

interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

export function Spinner({ size = 20, color, thickness = 2 }: SpinnerProps) {
  const { colors } = useTheme();
  const spinnerColor = color || colors.accent;
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 10) % 360);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${thickness}px solid rgba(${parseInt(spinnerColor.slice(1, 3), 16)}, ${parseInt(spinnerColor.slice(3, 5), 16)}, ${parseInt(spinnerColor.slice(5, 7), 16)}, 0.2)`,
        borderTop: `${thickness}px solid ${spinnerColor}`,
        borderRadius: '50%',
        transform: `rotate(${rotation}deg)`,
        display: 'inline-block',
        transition: 'transform 0.016s linear'
      }}
    />
  );
}
