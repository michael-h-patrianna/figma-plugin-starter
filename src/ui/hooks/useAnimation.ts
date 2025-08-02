import {
  animateElement,
  ANIMATION_DURATIONS,
  ANIMATION_PRESETS,
  AnimationConfig,
  applyPreset,
  EASING
} from '@shared/animationUtils';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

/**
 * Animation state for tracking animation lifecycle
 */
export type AnimationState = 'idle' | 'running' | 'finished' | 'cancelled';

/**
 * Hook for managing Web Animations API animations on elements
 *
 * @param initialState - Initial animation state
 * @returns Animation control functions and state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [elementRef, { animate, applyPreset, state }] = useAnimation();
 *
 *   const handleClick = async () => {
 *     const animation = await animate([
 *       { transform: 'scale(1)' },
 *       { transform: 'scale(1.1)' },
 *       { transform: 'scale(1)' }
 *     ], { duration: 200 });
 *   };
 *
 *   return <button ref={elementRef} onClick={handleClick}>Animate Me</button>;
 * }
 * ```
 */
export function useAnimation(initialState: AnimationState = 'idle') {
  const elementRef = useRef<HTMLElement>(null);
  const currentAnimationRef = useRef<Animation | null>(null);
  const [state, setState] = useState<AnimationState>(initialState);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (currentAnimationRef.current) {
        currentAnimationRef.current.cancel();
      }
    };
  }, []);

  /**
   * Animate the element using Web Animations API
   */
  const animate = useCallback(async (
    keyframes: Keyframe[],
    config?: AnimationConfig
  ): Promise<Animation | null> => {
    if (!elementRef.current) {
      console.warn('useAnimation: No element ref available for animation');
      return null;
    }

    // Cancel any existing animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.cancel();
    }

    setState('running');

    try {
      const animation = animateElement(elementRef.current, keyframes, config);
      currentAnimationRef.current = animation;

      // Listen for animation events
      animation.addEventListener('finish', () => {
        setState('finished');
        currentAnimationRef.current = null;
      });

      animation.addEventListener('cancel', () => {
        setState('cancelled');
        currentAnimationRef.current = null;
      });

      await animation.finished;
      return animation;
    } catch (error) {
      console.error('Animation failed:', error);
      setState('idle');
      return null;
    }
  }, []);

  /**
   * Apply an animation preset to the element
   */
  const animateWithPreset = useCallback(async (
    preset: keyof typeof ANIMATION_PRESETS,
    configOverrides?: Partial<AnimationConfig>
  ): Promise<Animation | null> => {
    if (!elementRef.current) {
      console.warn('useAnimation: No element ref available for preset animation');
      return null;
    }

    // Cancel any existing animation
    if (currentAnimationRef.current) {
      currentAnimationRef.current.cancel();
    }

    setState('running');

    try {
      const animation = applyPreset(elementRef.current, preset, configOverrides);
      currentAnimationRef.current = animation;

      // Listen for animation events
      animation.addEventListener('finish', () => {
        setState('finished');
        currentAnimationRef.current = null;
      });

      animation.addEventListener('cancel', () => {
        setState('cancelled');
        currentAnimationRef.current = null;
      });

      await animation.finished;
      return animation;
    } catch (error) {
      console.error('Preset animation failed:', error);
      setState('idle');
      return null;
    }
  }, []);

  /**
   * Cancel the current animation
   */
  const cancel = useCallback(() => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.cancel();
      currentAnimationRef.current = null;
      setState('cancelled');
    }
  }, []);

  /**
   * Pause the current animation
   */
  const pause = useCallback(() => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.pause();
    }
  }, []);

  /**
   * Resume the current animation
   */
  const play = useCallback(() => {
    if (currentAnimationRef.current) {
      currentAnimationRef.current.play();
    }
  }, []);

  /**
   * Reset animation state to idle
   */
  const reset = useCallback(() => {
    cancel();
    setState('idle');
  }, [cancel]);

  return [
    elementRef,
    {
      animate,
      applyPreset: animateWithPreset,
      cancel,
      pause,
      play,
      reset,
      state,
      isRunning: state === 'running',
      isFinished: state === 'finished',
      isCancelled: state === 'cancelled',
      isIdle: state === 'idle'
    }
  ] as const;
}

/**
 * Hook for managing entrance and exit animations
 *
 * @param show - Whether to show the element
 * @param config - Animation configuration
 * @returns Element ref and animation state
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const [elementRef, { isVisible, state }] = useEntranceExitAnimation(isOpen, {
 *     enterPreset: 'scaleIn',
 *     exitPreset: 'scaleOut',
 *     duration: ANIMATION_DURATIONS.normal
 *   });
 *
 *   if (!isVisible) return null;
 *
 *   return (
 *     <div ref={elementRef} className="modal">
 *       Modal content
 *     </div>
 *   );
 * }
 * ```
 */
export function useEntranceExitAnimation(
  show: boolean,
  config: {
    enterPreset?: keyof typeof ANIMATION_PRESETS;
    exitPreset?: keyof typeof ANIMATION_PRESETS;
    duration?: number;
    onEnter?: () => void;
    onExit?: () => void;
    onExited?: () => void;
  } = {}
) {
  const {
    enterPreset = 'fadeIn',
    exitPreset = 'fadeOut',
    duration = ANIMATION_DURATIONS.normal,
    onEnter,
    onExit,
    onExited
  } = config;

  const [elementRef, animationControls] = useAnimation();
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show && !isVisible) {
      // Show element and animate in
      setIsVisible(true);
      setIsExiting(false);

      // Wait for next frame to ensure element is rendered
      requestAnimationFrame(() => {
        animationControls.applyPreset(enterPreset, { duration }).then(() => {
          onEnter?.();
        });
      });
    } else if (!show && isVisible && !isExiting) {
      // Animate out then hide element
      setIsExiting(true);
      onExit?.();

      animationControls.applyPreset(exitPreset, { duration }).then(() => {
        setIsVisible(false);
        setIsExiting(false);
        onExited?.();
      });
    }
  }, [show, isVisible, isExiting, enterPreset, exitPreset, duration, animationControls, onEnter, onExit, onExited]);

  return [
    elementRef,
    {
      isVisible,
      isExiting,
      state: animationControls.state,
      cancel: animationControls.cancel
    }
  ] as const;
}

/**
 * Hook for staggered animations on lists of items
 *
 * @param items - Array of items to animate
 * @param config - Stagger configuration
 * @returns Animation functions for list items
 *
 * @example
 * ```tsx
 * function ItemList({ items }) {
 *   const { getItemRef, animateList } = useStaggeredAnimation(items, {
 *     preset: 'slideDown',
 *     staggerDelay: 100,
 *     duration: ANIMATION_DURATIONS.normal
 *   });
 *
 *   useEffect(() => {
 *     animateList();
 *   }, [items]);
 *
 *   return (
 *     <div>
 *       {items.map((item, index) => (
 *         <div key={item.id} ref={getItemRef(index)}>
 *           {item.content}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStaggeredAnimation<T>(
  items: T[],
  config: {
    preset?: keyof typeof ANIMATION_PRESETS;
    staggerDelay?: number;
    duration?: number;
    easing?: string;
  } = {}
) {
  const {
    preset = 'slideDown',
    staggerDelay = 100,
    duration = ANIMATION_DURATIONS.normal,
    easing = EASING.easeOut
  } = config;

  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);

  // Update refs array when items change
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
  }, [items.length]);

  /**
   * Get ref callback for a specific item index
   */
  const getItemRef = useCallback((index: number) => {
    return (element: HTMLElement | null) => {
      itemRefs.current[index] = element;
    };
  }, []);

  /**
   * Animate all items with staggered delays
   */
  const animateList = useCallback(async () => {
    // Cancel any existing animations
    animationsRef.current.forEach(animation => animation.cancel());
    animationsRef.current = [];

    const { keyframes, config: presetConfig } = ANIMATION_PRESETS[preset];
    const animations: Animation[] = [];

    for (let i = 0; i < itemRefs.current.length; i++) {
      const element = itemRefs.current[i];
      if (!element) continue;

      const delay = i * staggerDelay;
      const animationConfig = {
        ...presetConfig,
        duration,
        easing,
        delay
      };

      try {
        const animation = animateElement(element, [...keyframes], animationConfig);
        animations.push(animation);
      } catch (error) {
        console.error(`Failed to animate item ${i}:`, error);
      }
    }

    animationsRef.current = animations;

    // Wait for all animations to complete
    try {
      await Promise.all(animations.map(animation => animation.finished));
    } catch (error) {
      console.error('Some staggered animations failed:', error);
    }
  }, [items.length, preset, staggerDelay, duration, easing]);

  /**
   * Cancel all running animations
   */
  const cancelAnimations = useCallback(() => {
    animationsRef.current.forEach(animation => animation.cancel());
    animationsRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimations();
    };
  }, [cancelAnimations]);

  return {
    getItemRef,
    animateList,
    cancelAnimations
  };
}

/**
 * Hook for hover animations
 *
 * @param config - Hover animation configuration
 * @returns Element ref and hover handlers
 *
 * @example
 * ```tsx
 * function HoverButton() {
 *   const [elementRef, { onMouseEnter, onMouseLeave }] = useHoverAnimation({
 *     hoverScale: 1.05,
 *     duration: ANIMATION_DURATIONS.fast
 *   });
 *
 *   return (
 *     <button
 *       ref={elementRef}
 *       onMouseEnter={onMouseEnter}
 *       onMouseLeave={onMouseLeave}
 *     >
 *       Hover me
 *     </button>
 *   );
 * }
 * ```
 */
export function useHoverAnimation(config: {
  hoverScale?: number;
  hoverRotation?: number;
  hoverTranslateY?: number;
  duration?: number;
  easing?: string;
} = {}) {
  const {
    hoverScale = 1.05,
    hoverRotation = 0,
    hoverTranslateY = 0,
    duration = ANIMATION_DURATIONS.fast,
    easing = EASING.easeOut
  } = config;

  const [elementRef, { animate }] = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    if (isHovered) return;
    setIsHovered(true);

    const transform = `scale(${hoverScale}) rotate(${hoverRotation}deg) translateY(${hoverTranslateY}px)`;

    animate([
      { transform: 'scale(1) rotate(0deg) translateY(0px)' },
      { transform }
    ], {
      duration,
      easing,
      fillMode: 'forwards'
    });
  }, [isHovered, hoverScale, hoverRotation, hoverTranslateY, duration, easing, animate]);

  const onMouseLeave = useCallback(() => {
    if (!isHovered) return;
    setIsHovered(false);

    animate([
      { transform: `scale(${hoverScale}) rotate(${hoverRotation}deg) translateY(${hoverTranslateY}px)` },
      { transform: 'scale(1) rotate(0deg) translateY(0px)' }
    ], {
      duration,
      easing,
      fillMode: 'forwards'
    });
  }, [isHovered, hoverScale, hoverRotation, hoverTranslateY, duration, easing, animate]);

  return [
    elementRef,
    {
      onMouseEnter,
      onMouseLeave,
      isHovered
    }
  ] as const;
}
