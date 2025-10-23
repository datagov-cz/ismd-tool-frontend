'use client';

import { ToastContainer } from 'react-toastify';

import { useTheme } from './contexts/ThemeProvider';

export function ToastWrapper() {
  const { theme } = useTheme();

  return (
    <ToastContainer
      position="bottom-left"
      autoClose={3000}
      hideProgressBar
      theme={theme}
    />
  );
}
