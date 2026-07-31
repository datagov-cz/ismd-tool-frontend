'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useCloseOnBreakpoint } from '@/hooks/useCloseOnBreakpoint';
import { useEscapeKey } from '@/hooks/useEscapeKey';

export const useHeaderSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLGovButtonElement>(null);
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
    void toggleRef.current?.getRef().then((element) => element.focus());
  }, [isOpen]);

  return { isOpen, open, close, toggleRef };
};
