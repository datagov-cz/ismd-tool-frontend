import { useEffect, useRef } from 'react';

export const useCloseOnBreakpoint = (
  breakpointVariable: string,
  close: () => void,
) => {
  const closeRef = useRef(close);

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    const breakpoint = getComputedStyle(
      document.documentElement,
    ).getPropertyValue(breakpointVariable);
    const mediaQuery = window.matchMedia(`(width >= ${breakpoint})`);

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeRef.current();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [breakpointVariable]);
};
