import { Variants, Transition } from 'framer-motion';

// Animation timing constants aligned with performance goals
export const ANIMATION_DURATION = {
  instant: 0.1,      // 100ms - near instant feedback
  fast: 0.2,         // 200ms - quick interactions
  normal: 0.3,       // 300ms - standard transitions
  slow: 0.5,         // 500ms - deliberate animations
  xslow: 1.0,        // 1s - dramatic reveals
  hero: 3.0,         // 3s - hero animations (Money Meter)
} as const;

// Easing functions for different animation feels
export const ANIMATION_EASING = {
  // Smooth and natural
  ease: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Springy and playful
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBounce: { type: 'spring', stiffness: 400, damping: 10 },
  springSmooth: { type: 'spring', stiffness: 100, damping: 20 },
  
  // Dramatic for hero animations
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
} as const;

// Reusable animation variants
export const fadeIn: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.ease,
    }
  },
};

export const slideIn: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOut,
    }
  },
};

export const slideInFromRight: Variants = {
  hidden: { 
    opacity: 0,
    x: 50,
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOut,
    }
  },
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: ANIMATION_EASING.easeOutBack,
    }
  },
};

// Stagger children animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  },
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0,
    y: 10,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASING.ease,
    }
  },
};

// Money Meter specific animations
export const moneyMeterAnimation: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.5,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.easeOutBack,
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: ANIMATION_DURATION.normal,
      repeat: Infinity,
      repeatDelay: 2,
    }
  }
};

// Performance badge animations
export const performanceBadgeAnimation: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0,
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: ANIMATION_EASING.springBounce,
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

// Success/Error glow animations
export const glowAnimation = {
  success: {
    boxShadow: [
      '0 0 0 rgba(0, 168, 107, 0)',
      '0 0 20px rgba(0, 168, 107, 0.5)',
      '0 0 0 rgba(0, 168, 107, 0)',
    ],
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.ease,
    }
  },
  error: {
    boxShadow: [
      '0 0 0 rgba(239, 68, 68, 0)',
      '0 0 20px rgba(239, 68, 68, 0.5)',
      '0 0 0 rgba(239, 68, 68, 0)',
    ],
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.ease,
    }
  }
};

// Skeleton loading animation
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    }
  }
};

// Demo mode spotlight effect
export const spotlightAnimation: Variants = {
  hidden: {
    clipPath: 'circle(0% at 50% 50%)',
  },
  visible: {
    clipPath: 'circle(150% at 50% 50%)',
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.easeOut,
    }
  }
};

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

// Wrapper to disable animations if user prefers reduced motion
export const getAnimationVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return instant transitions for accessibility
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = {
        ...variants[key],
        transition: { duration: 0 }
      };
      return acc;
    }, {} as Variants);
  }
  return variants;
};

// Animation hooks for React components
export const useAnimationControls = () => {
  const shouldReduceMotion = prefersReducedMotion();
  
  return {
    duration: shouldReduceMotion ? 0 : ANIMATION_DURATION.normal,
    ease: shouldReduceMotion ? 'linear' : ANIMATION_EASING.ease,
    shouldAnimate: !shouldReduceMotion,
  };
};

// Counter animation utility for Money Meter
export const animateCounter = (
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing: 'linear' | 'easeOut' | 'easeOutExpo' = 'easeOutExpo'
) => {
  const startTime = performance.now();
  
  const easingFunctions = {
    linear: (t: number) => t,
    easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
    easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  };
  
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / (duration * 1000), 1);
    
    const easedProgress = easingFunctions[easing](progress);
    const currentValue = start + (end - start) * easedProgress;
    
    onUpdate(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
};