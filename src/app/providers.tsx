'use client';

import { ReactNode, useEffect } from 'react';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { CurrentUserProvider } from '@/components/contexts/CurrentUserProvider';
import type { EnvironmentVariables } from '@/components/contexts/Environment';
import Environment from '@/components/contexts/Environment';
import { QueryProvider } from '@/components/contexts/QueryProvider';
import { SessionGuard } from '@/components/contexts/SessionGuard';
import { ThemeProvider } from '@/components/contexts/ThemeProvider';
import { ToastWrapper } from '@/components/ToastWrapper';
import { normalizeBasePath } from '@/lib/basePath';

export default function Providers({
  children,
  environmentVariables,
  session,
}: {
  children: ReactNode;
  environmentVariables: EnvironmentVariables;
  session: Session | null;
}) {
  const normalizedBasePath = normalizeBasePath(
    environmentVariables.NEXT_PUBLIC_BASE_PATH,
  );
  const nextAuthBasePath = `${normalizedBasePath}/api/auth`;

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_DISABLE_SW &&
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
    } else {
      // In dev, tear down any SW + caches left by a prior prod-like run:
      // its cache-first /_next/static/ handler serves stale chunks and forces
      // a hard refresh to see code changes.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => registration.unregister()),
        )
        .catch(() => {});
      caches
        .keys()
        .then((keys) => keys.forEach((key) => caches.delete(key)))
        .catch(() => {});
    }
  }, [normalizedBasePath]);

  return (
    <ThemeProvider>
      <Environment variables={environmentVariables}>
        <QueryProvider>
          <SessionProvider session={session} basePath={nextAuthBasePath}>
            <SessionGuard>
              <CurrentUserProvider>
                <ToastWrapper />
                {children}
              </CurrentUserProvider>
            </SessionGuard>
          </SessionProvider>
        </QueryProvider>
      </Environment>
    </ThemeProvider>
  );
}
