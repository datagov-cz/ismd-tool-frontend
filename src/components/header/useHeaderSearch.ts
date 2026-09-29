'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCloseOnBreakpoint } from '@/hooks/useCloseOnBreakpoint';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export const useHeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocus = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    shouldRestoreFocus.current = true;
    setIsOpen(false);
  }, []);

  useEscapeKey(useCallback(() => isOpen && close(), [isOpen, close]));

  useCloseOnBreakpoint('--breakpoint-desktop', () => setIsOpen(false));

  useEffect(() => {
    if (isOpen || !shouldRestoreFocus.current) {
      return;
    }

    shouldRestoreFocus.current = false;
    toggleRef.current?.focus();
  }, [isOpen]);

  return { isOpen, open, close, toggleRef };
};
