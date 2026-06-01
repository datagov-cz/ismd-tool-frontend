import { useEffect, useRef, useState } from 'react';

const ACTIVE_DURATION_MS = 60_000; // 1 minute

export function useActiveAnchor(anchor?: string) {
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!anchor) return;

    const activate = (hash: string) => {
      if (hash !== anchor) return;

      setIsActive(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(
        () => setIsActive(false),
        ACTIVE_DURATION_MS,
      );
    };

    // Check on mount (handles page load with hash already in URL)
    activate(window.location.hash.replace('#', ''));

    const handleHashChange = () => {
      activate(window.location.hash.replace('#', ''));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [anchor]);

  // Outside-click dismiss
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      const el = anchor ? document.getElementById(anchor) : null;
      if (el && !el.contains(e.target as Node)) {
        setIsActive(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isActive, anchor]);

  return isActive;
}
