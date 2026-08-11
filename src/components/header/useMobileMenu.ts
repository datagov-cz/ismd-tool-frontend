'use client';

import { useCallback, useState } from 'react';

import { useCloseOnBreakpoint } from '@/hooks/useCloseOnBreakpoint';

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  useCloseOnBreakpoint('--breakpoint-tablet', close);

  return { isOpen, toggle, close };
};
