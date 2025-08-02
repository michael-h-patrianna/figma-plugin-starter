/**
 * Animation utilities for smooth UI transitions and effects
 *
 * Provides consistent animation timing, easing functions, and helper utilities
 * for creating smooth component transitions throughout the application.
 */

/**
 * Standard animation durations in milliseconds
 */
export const ANIMATION_DURATIONS = {
  /** 150ms - Very fast for micro-interactions */
  fast: 150,
  /** 250ms - Default for most UI transitions */
  normal: 250,
  /** 350ms - Slower for complex state changes */
  slow: 350,
  /** 500ms - For dramatic entrances/exits */
  dramatic: 500
} as const;

/**
 * CSS easing functions for natural feeling animations
 */
export const EASING = {
  /** Linear timing - constant speed */
  linear: 'linear',
  /** Ease out - fast start, slow end (good for entrances) */
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  /** Ease in - slow start, fast end (good for exits) */
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  /** Ease in-out - smooth acceleration and deceleration */
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  /** Bounce - playful spring effect */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  /** Back - slight overshoot for natural feel */
  back: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} as const;

/**
 * Animation direction types
 */
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

/**
 * Animation fill mode types
 */
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';

/**
 * Type alias for animation fill mode values
 */
type FillMode = 'none' | 'forwards' | 'backwards' | 'both';

/**
 * Configuration for Web Animations API
 */
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: FillMode;
}

/**
 * Creates a CSS animation string from configuration
 *
 * @param name - Animation keyframe name
 * @param config - Animation configuration
 * @returns CSS animation property value
 *
 * @example
 * ```typescript
 * const animation = createAnimation('fadeIn', {
 *   duration: ANIMATION_DURATIONS.normal,
 *   easing: EASING.easeOut
 * });
 * // Returns: "fadeIn 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0ms 1 normal both"
 * ```
 */
export function createAnimation(name: string, config: AnimationConfig = {}): string {
  const {
    duration = ANIMATION_DURATIONS.normal,
    easing = EASING.easeOut,
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both'
  } = config;

  return `${name} ${duration}ms ${easing} ${delay}ms ${iterations} ${direction} ${fillMode}`;
}

/**
 * Creates a CSS transition string from configuration
 *
 * @param properties - CSS properties to transition
 * @param config - Transition configuration
 * @returns CSS transition property value
 *
 * @example
 * ```typescript
 * const transition = createTransition(['opacity', 'transform'], {
 *   duration: ANIMATION_DURATIONS.fast,
 *   easing: EASING.easeInOut
 * });
 * // Returns: "opacity 150ms cubic-bezier(0.645, 0.045, 0.355, 1), transform 150ms cubic-bezier(0.645, 0.045, 0.355, 1)"
 * ```
 */
export function createTransition(
  properties: string | string[],
  config: Pick<AnimationConfig, 'duration' | 'easing' | 'delay'> = {}
): string {
  const {
    duration = ANIMATION_DURATIONS.normal,
    easing = EASING.easeOut,
    delay = 0
  } = config;

  const props = Array.isArray(properties) ? properties : [properties];

  return props
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
}

/**
 * Animate an element using Web Animations API
 *
 * @param element - Element to animate
 * @param keyframes - Animation keyframes
 * @param config - Animation configuration
 * @returns Animation instance
 *
 * @example
 * ```typescript
 * const element = document.querySelector('.modal');
 * const animation = animateElement(element, [
 *   { opacity: 0, transform: 'scale(0.9)' },
 *   { opacity: 1, transform: 'scale(1)' }
 * ], {
 *   duration: ANIMATION_DURATIONS.normal,
 *   easing: EASING.easeOut
 * });
 *
 * // Wait for animation to complete
 * await animation.finished;
 * ```
 */
export function animateElement(
  element: Element,
  keyframes: Keyframe[],
  config: AnimationConfig = {}
): Animation {
  const {
    duration = ANIMATION_DURATIONS.normal,
    easing = EASING.easeOut,
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both'
  } = config;

  return element.animate(keyframes, {
    duration,
    easing,
    delay,
    iterations: iterations === 'infinite' ? Infinity : iterations,
    direction,
    fill: fillMode
  });
}

/**
 * Creates a promise that resolves after a specified delay
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 *
 * @example
 * ```typescript
 * // Wait before starting next animation
 * await delay(ANIMATION_DURATIONS.fast);
 * startNextAnimation();
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Stagger animation delays for multiple elements
 *
 * @param count - Number of elements
 * @param staggerDelay - Delay between each element in ms
 * @param initialDelay - Initial delay before first element
 * @returns Array of delay values
 *
 * @example
 * ```typescript
 * const delays = createStaggeredDelays(5, 100, 0);
 * // Returns: [0, 100, 200, 300, 400]
 *
 * elements.forEach((element, index) => {
 *   animateElement(element, keyframes, {
 *     delay: delays[index]
 *   });
 * });
 * ```
 */
export function createStaggeredDelays(
  count: number,
  staggerDelay: number,
  initialDelay: number = 0
): number[] {
  return Array.from({ length: count }, (_, index) => initialDelay + (index * staggerDelay));
}

/**
 * Pre-defined animation configurations for common UI patterns
 * Each preset includes keyframes and default configuration
 */
export const ANIMATION_PRESETS = {
  // Fade animations
  fadeIn: {
    keyframes: [
      { opacity: 0 },
      { opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  fadeOut: {
    keyframes: [
      { opacity: 1 },
      { opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },

  // Scale animations
  scaleIn: {
    keyframes: [
      { transform: 'scale(0.8)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  scaleOut: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.8)', opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },

  // Slide animations
  slideDown: {
    keyframes: [
      { transform: 'translateY(-20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  slideUp: {
    keyframes: [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: 'translateY(-20px)', opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },

  // Bounce animation
  bounceIn: {
    keyframes: [
      { transform: 'scale(0.3)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 1 },
      { transform: 'scale(0.9)' },
      { transform: 'scale(1)' }
    ],
    config: {
      duration: ANIMATION_DURATIONS.slow,
      easing: EASING.bounce,
      fillMode: 'forwards' as FillMode
    }
  },

  // Modal specific animations
  modalEnter: {
    keyframes: [
      { transform: 'scale(0.9)', opacity: 0 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  modalExit: {
    keyframes: [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(0.9)', opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.fast,
      easing: EASING.easeIn,
      fillMode: 'forwards' as FillMode
    }
  },

  // Toast specific animations
  toastSlideIn: {
    keyframes: [
      { transform: 'translateX(100%)', opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  toastSlideOut: {
    keyframes: [
      { transform: 'translateX(0)', opacity: 1 },
      { transform: 'translateX(100%)', opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.fast,
      easing: EASING.easeIn,
      fillMode: 'forwards' as FillMode
    }
  },

  // Accordion specific animations
  accordionExpand: {
    keyframes: [
      { height: '0px', opacity: 0 },
      { height: 'auto', opacity: 1 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.normal,
      easing: EASING.easeOut,
      fillMode: 'forwards' as FillMode
    }
  },
  accordionCollapse: {
    keyframes: [
      { height: 'auto', opacity: 1 },
      { height: '0px', opacity: 0 }
    ],
    config: {
      duration: ANIMATION_DURATIONS.fast,
      easing: EASING.easeIn,
      fillMode: 'forwards' as FillMode
    }
  }
} as const;

/**
 * Apply an animation preset to an element
 *
 * @param element - Element to animate
 * @param preset - Animation preset name
 * @param configOverrides - Optional config overrides
 * @returns Animation instance
 *
 * @example
 * ```typescript
 * const modal = document.querySelector('.modal');
 * const animation = applyPreset(modal, 'scaleIn');
 * await animation.finished;
 * ```
 */
export function applyPreset(
  element: Element,
  preset: keyof typeof ANIMATION_PRESETS,
  configOverrides: Partial<AnimationConfig> = {}
): Animation {
  const { keyframes, config } = ANIMATION_PRESETS[preset];
  const finalConfig = { ...config, ...configOverrides };

  return animateElement(element, [...keyframes], finalConfig);
}

/**
 * Check if an element supports CSS animations
 *
 * @param element - Element to check
 * @returns True if animations are supported
 */
export function supportsAnimations(element: Element): boolean {
  return 'animate' in element;
}

/**
 * Disable animations globally (useful for testing or accessibility)
 */
export function disableAnimations(): void {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Animation event listeners for component lifecycle hooks
 */
export const ANIMATION_EVENTS = {
  animationStart: 'animationstart',
  animationEnd: 'animationend',
  animationIteration: 'animationiteration',
  transitionStart: 'transitionstart',
  transitionEnd: 'transitionend'
} as const;
