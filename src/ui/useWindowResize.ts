import { useEffect, useRef } from 'preact/hooks';
import { sendToMain } from './messaging-simple';

/**
 * Clean window resize hook using the unified messaging system
 *
 * Automatically handles window resizing based on content size.
 * Uses the proper message format for the unified system.
 */
export function useWindowResize(
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1200,
  maxHeight = 800,
  extraPadding = 48
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof parent === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Calculate dimensions with constraints
        const totalWidth = Math.max(minWidth, Math.min(maxWidth, width + extraPadding));
        const totalHeight = Math.max(minHeight, Math.min(maxHeight, height + extraPadding));

        // Send resize message using unified system
        sendToMain('RESIZE', {
          width: totalWidth,
          height: totalHeight
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minWidth, minHeight, maxWidth, maxHeight, extraPadding]);

  return containerRef;
}
