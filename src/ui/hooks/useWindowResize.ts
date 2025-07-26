import { useEffect, useRef } from 'preact/hooks';

export function useWindowResize(
  minWidth = 400,
  minHeight = 300,
  maxWidth = 1200,
  maxHeight = 800,
  extraPadding = 48
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof parent === 'undefined' || !parent.postMessage) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Calculate total dimensions with padding
        const totalWidth = Math.max(minWidth, Math.min(maxWidth, width + extraPadding));
        const totalHeight = Math.max(minHeight, Math.min(maxHeight, height + extraPadding));

        // Send resize message to Figma
        parent.postMessage({
          pluginMessage: {
            type: 'RESIZE',
            width: totalWidth,
            height: totalHeight
          }
        }, '*');
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minWidth, minHeight, maxWidth, maxHeight, extraPadding]);

  return containerRef;
}
