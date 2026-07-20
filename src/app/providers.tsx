'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { CurrentUserProvider } from '@/components/contexts/CurrentUserProvider';
import type { EnvironmentVariables } from '@/components/contexts/Environment';
import Environment from '@/components/contexts/Environment';
import { SessionGuard } from '@/components/contexts/SessionGuard';
import { ThemeProvider } from '@/components/contexts/ThemeProvider';
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
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Service worker lives in /public, which Next serves under basePath.
      // Registering '/sw.js' at root 404s when basePath is set.
      // Dev is excluded: the SW serves /_next/static/* cache-first, which
      // returns stale chunks on a hard browser reload (HMR masks it).
      navigator.serviceWorker
        .register(`${normalizedBasePath}/sw.js`, {
          scope: `${normalizedBasePath}/`,
        })
        .then(() => {})
        .catch(() => {});
    }
  }, [normalizedBasePath]);

  return (
    <ThemeProvider>
      <Environment variables={environmentVariables}>
        <QueryClientProvider client={queryClient}>
          <SessionProvider session={session} basePath={nextAuthBasePath}>
            <SessionGuard>
              <CurrentUserProvider>
                <ToastWrapper />
                {children}
              </CurrentUserProvider>
            </SessionGuard>
          </SessionProvider>
        </QueryClientProvider>
      </Environment>
    </ThemeProvider>
  );
}
