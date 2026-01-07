import { useCallback } from 'react';

/**
 * Hook to provide haptic feedback on touch interactions
 */
export const useTouchFeedback = () => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const lightTap = useCallback(() => {
    vibrate(5);
  }, [vibrate]);

  const tap = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([20, 30, 20]);
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate([50, 50, 50]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  return {
    vibrate,
    lightTap,
    tap,
    success,
    warning,
    error,
  };
};

/**
 * Utility function for haptic feedback on button clicks
 */
export const buttonVibration = (duration: number = 10): void => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

/**
 * CSS class for touch-active state on mobile
 */
export const touchActiveClass = 'active:scale-95 active:bg-gray-100 transition-transform';
