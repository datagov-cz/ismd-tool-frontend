'use client';

import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify';

export function ToastWrapper() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position="bottom-left"
      autoClose={3000}
      hideProgressBar
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  );
}
