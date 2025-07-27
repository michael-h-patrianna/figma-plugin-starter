import { useEffect, useRef } from 'preact/hooks';
import { sendToMain } from '../messaging-simple';

/**
 * Custom hook for automatically resizing the Figma plugin window based on content size.
 *
 * Uses ResizeObserver to monitor content changes and sends resize messages to the main thread
 * when the content size changes. Respects minimum and maximum size constraints.
 *
 * REVERTED: Back to original working format to prevent WASM memory errors.
 * The unified messaging system was causing message format conflicts.
 *
 * @param minWidth - Minimum window width in pixels (default: 400)
 * @param minHeight - Minimum window height in pixels (default: 300)
 * @param maxWidth - Maximum window width in pixels (default: 1200)
 * @param maxHeight - Maximum window height in pixels (default: 800)
 * @param extraPadding - Additional padding to add to content size (default: 48)
 * @returns Ref to attach to the container element that should control window size
 *
 * @example
 * ```tsx
 * const containerRef = useWindowResize(600, 400, 1000, 700);
 *
 * return (
 *   <div ref={containerRef}>
 *     Your plugin content
 *   </div>
 * );
 * ```
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
    if (!containerRef.current || typeof parent === 'undefined' || !parent.postMessage) {
      return;
    }

    /**
     * Observes size changes and sends resize messages to Figma main thread.
     * Uses the EXACT original format that worked without memory errors.
     */
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Calculate total dimensions with padding
        const totalWidth = Math.max(minWidth, Math.min(maxWidth, width + extraPadding));
        const totalHeight = Math.max(minHeight, Math.min(maxHeight, height + extraPadding));

        // Send resize message using simple direct format
        sendToMain('RESIZE', { width: totalWidth, height: totalHeight });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minWidth, minHeight, maxWidth, maxHeight, extraPadding]);

  return containerRef;
}
