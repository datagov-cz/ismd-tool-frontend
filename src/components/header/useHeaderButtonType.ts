'use client';

import { useTheme } from '../contexts/ThemeProvider';

export const useHeaderButtonType = () => {
  const { theme } = useTheme();

  return theme === 'dark' ? ('base' as const) : ('solid' as const);
};
