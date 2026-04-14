'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import type { EnvironmentVariables } from '@/components/contexts/Environment';
import Environment from '@/components/contexts/Environment';
import { ThemeProvider } from '@/components/contexts/ThemeProvider';
import { UserInfoProvider } from '@/components/contexts/UserProvider';
import { ToastWrapper } from '@/components/ToastWrapper';
import { normalizeBasePath } from '@/lib/basePath';

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
  const normalizedBasePath = normalizeBasePath(
    environmentVariables.NEXT_PUBLIC_BASE_PATH,
  );
  const nextAuthBasePath = `${normalizedBasePath}/api/auth`;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {})
        .catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      <Environment variables={environmentVariables}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={session} basePath={nextAuthBasePath}>
            <UserInfoProvider>
              <ToastWrapper />
              {children}
            </UserInfoProvider>
          </SessionProvider>
        </QueryClientProvider>
      </Environment>
    </ThemeProvider>
  );
}
