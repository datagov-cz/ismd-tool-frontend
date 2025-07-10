'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import type { EnvironmentVariables } from '@/components/contexts/Environment';
import Environment from '@/components/contexts/Environment';
import { ThemeProvider } from '@/components/contexts/ThemeProvider';

import { getQueryClient } from './get-query-client';

export default function Providers({
  children,
  environmentVariables,
}: {
  children: ReactNode;
  environmentVariables: EnvironmentVariables;
}) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <Environment variables={environmentVariables}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Environment>
    </ThemeProvider>
  );
}
