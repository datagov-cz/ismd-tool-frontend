'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import type { EnvironmentVariables } from '@/components/contexts/Environment';
import Environment from '@/components/contexts/Environment';
import { ThemeProvider } from '@/components/contexts/ThemeProvider';
import { ToastWrapper } from '@/components/ToastWrapper';

import { getQueryClient } from './get-query-client';

export default function Providers({
  children,
  environmentVariables,
  session,
}: {
  children: ReactNode;
  environmentVariables: EnvironmentVariables;
  session: Session | null;
}) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <Environment variables={environmentVariables}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={session}>
            <ToastWrapper />
            {children}
          </SessionProvider>
        </QueryClientProvider>
      </Environment>
    </ThemeProvider>
  );
}
