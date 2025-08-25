/**
 * Guided Demo Mode Component
 * Interactive 6-step walkthrough with spotlight effect
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GuidedDemoMode.module.css';

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action description
  spotlight?: {
    padding?: number;
    borderRadius?: number;
  };
}

export interface GuidedDemoModeProps {
  steps: DemoStep[];
  isActive: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (step: number) => void;
  autoAdvanceDelay?: number; // ms
  className?: string;
  testId?: string;
}

const defaultSteps: DemoStep[] = [
  {
    id: 'filter',
    title: 'Start with Filters',
    description: 'Select your organization type, size, and industry to customize the analysis.',
    target: '[data-testid="filter-panel"]',
    position: 'bottom',
    action: 'Click to open filter options'
  },
  {
    id: 'money-meter',
    title: 'Total Savings Opportunity',
    description: 'See your potential annual savings at a glance with real-time calculations.',
    target: '[data-testid="money-meter"]',
    position: 'bottom',
    action: 'Click for detailed breakdown'
  },
  {
    id: 'what-if',
    title: 'What-If Modeling',
    description: 'Adjust employee count to see how it impacts your savings potential.',
    target: '[data-testid="what-if-panel"]',
    position: 'left',
    action: 'Drag slider to model scenarios'
  },
  {
    id: 'waterfall',
    title: 'Savings Waterfall',
    description: 'Visualize how each optimization contributes to total savings.',
    target: '[data-testid="waterfall-chart"]',
    position: 'top',
    action: 'Hover for details'
  },
  {
    id: 'grid',
    title: 'Detailed Reporting',
    description: 'Dive deep into monthly data with expandable rows and sorting.',
    target: '[data-testid="reporting-grid"]',
    position: 'top',
    action: 'Click rows to expand'
  },
  {
    id: 'export',
    title: 'Export Your Analysis',
    description: 'Download your customized report as PDF or Excel for stakeholder review.',
    target: '[data-testid="export-button"]',
    position: 'left',
    action: 'Click to export'
  }
];

export const GuidedDemoMode: React.FC<GuidedDemoModeProps> = ({
  steps = defaultSteps,
  isActive,
  onComplete,
  onSkip,
  onStepChange,
  autoAdvanceDelay = 0,
  className = '',
  testId = 'guided-demo'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoAdvanceDelay > 0);
  const [targetBounds, setTargetBounds] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStepData = steps[currentStep];

  // Calculate spotlight and tooltip positions
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updatePositions = () => {
      const target = document.querySelector(currentStepData.target);
      if (!target) {
        console.warn(`Target not found: ${currentStepData.target}`);
        return;
      }

      const bounds = target.getBoundingClientRect();
      setTargetBounds(bounds);

      // Calculate tooltip position based on step position preference
      const padding = 20;
      let x = bounds.left + bounds.width / 2;
      let y = bounds.top + bounds.height / 2;

      switch (currentStepData.position) {
        case 'top':
          y = bounds.top - padding;
          break;
        case 'bottom':
          y = bounds.bottom + padding;
          break;
        case 'left':
          x = bounds.left - padding;
          break;
        case 'right':
          x = bounds.right + padding;
          break;
      }

      setTooltipPosition({ x, y });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [isActive, currentStep, currentStepData]);

  // Auto-advance logic
  useEffect(() => {
    if (!isActive || !isAutoPlaying || autoAdvanceDelay <= 0) return;

    const timer = setTimeout(() => {
      handleNext();
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [currentStep, isAutoPlaying, autoAdvanceDelay, isActive]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length, onStepChange]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  const handleComplete = useCallback(() => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
    onSkip?.();
  }, [onSkip]);

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setIsAutoPlaying(autoAdvanceDelay > 0);
  }, [autoAdvanceDelay]);

  const handleStepClick = useCallback((index: number) => {
    setCurrentStep(index);
    onStepChange?.(index);
    setIsAutoPlaying(false);
  }, [onStepChange]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'Escape':
          handleSkip();
          break;
        case ' ':
          e.preventDefault();
          toggleAutoPlay();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNext, handlePrevious, handleSkip, toggleAutoPlay]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <div className={`${styles.container} ${className}`} data-testid={testId}>
        {/* Backdrop with spotlight */}
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {targetBounds && (
            <div
              className={styles.spotlight}
              style={{
                left: targetBounds.left - (currentStepData.spotlight?.padding || 10),
                top: targetBounds.top - (currentStepData.spotlight?.padding || 10),
                width: targetBounds.width + (currentStepData.spotlight?.padding || 10) * 2,
                height: targetBounds.height + (currentStepData.spotlight?.padding || 10) * 2,
                borderRadius: currentStepData.spotlight?.borderRadius || 8
              }}
            >
              <div className={styles.pulseRing} />
            </div>
          )}
        </motion.div>

        {/* Floating tooltip */}
        <motion.div
          className={`${styles.tooltip} ${styles[currentStepData.position || 'bottom']}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: tooltipPosition.x,
            y: tooltipPosition.y
          }}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          <button 
            className={styles.skipButton}
            onClick={handleSkip}
            aria-label="Skip tour"
          >
            <X />
          </button>

          <div className={styles.stepNumber}>
            Step {currentStep + 1} of {steps.length}
          </div>

          <h3 className={styles.stepTitle}>{currentStepData.title}</h3>
          <p className={styles.stepDescription}>{currentStepData.description}</p>
          
          {currentStepData.action && (
            <div className={styles.stepAction}>
              💡 {currentStepData.action}
            </div>
          )}

          {/* Navigation controls */}
          <div className={styles.controls}>
            <button
              className={styles.navButton}
              onClick={handlePrevious}
              disabled={currentStep === 0}
              aria-label="Previous step"
            >
              <ChevronLeft />
            </button>

            <div className={styles.progressDots}>
              {steps.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === currentStep ? styles.activeDot : ''}`}
                  onClick={() => handleStepClick(index)}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <button
              className={styles.navButton}
              onClick={handleNext}
              aria-label={currentStep === steps.length - 1 ? 'Complete tour' : 'Next step'}
            >
              {currentStep === steps.length - 1 ? 'Done' : <ChevronRight />}
            </button>
          </div>

          {/* Auto-play controls */}
          {autoAdvanceDelay > 0 && (
            <div className={styles.autoPlayControls}>
              <button
                className={styles.autoPlayButton}
                onClick={toggleAutoPlay}
                aria-label={isAutoPlaying ? 'Pause auto-advance' : 'Resume auto-advance'}
              >
                {isAutoPlaying ? <Pause /> : <Play />}
              </button>
              <button
                className={styles.restartButton}
                onClick={handleRestart}
                aria-label="Restart tour"
              >
                <RotateCcw />
              </button>
            </div>
          )}
        </motion.div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </AnimatePresence>
  );
};