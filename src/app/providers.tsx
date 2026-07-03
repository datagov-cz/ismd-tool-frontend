'use client';

import { ReactNode, useEffect } from 'react';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
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

// SSR-safe: on the server there is no storage and the persister no-ops.
const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'ISMD_OFFLINE_CACHE',
});

// Only mutations registered with setMutationDefaults() in
// offlineMutationDefaults.ts have a restorable mutationFn after reload —
// persisting anything else would leave dead entries that can never resume.
const PERSISTED_MUTATION_KEYS = new Set([
  'createOntology',
  'editOntology',
  'createConcept',
  'editConcept',
]);

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
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: 1000 * 60 * 60 * 24,
            buster: 'v1',
            dehydrateOptions: {
              // Only paused mutations go to disk — never auth'd query data.
              shouldDehydrateQuery: () => false,
              // ...and only the four mutations that have registered defaults
              // (see PERSISTED_MUTATION_KEYS above) — others have no
              // restorable mutationFn after reload.
              shouldDehydrateMutation: (mutation) =>
                mutation.state.isPaused &&
                PERSISTED_MUTATION_KEYS.has(
                  String(mutation.options.mutationKey?.[0]),
                ),
            },
          }}
          onSuccess={() =>
            queryClient
              .resumePausedMutations()
              .then(() => queryClient.invalidateQueries())
          }
        >
          <SessionProvider session={session} basePath={nextAuthBasePath}>
            <SessionGuard>
              <CurrentUserProvider>
                <ToastWrapper />
                {children}
              </CurrentUserProvider>
            </SessionGuard>
          </SessionProvider>
        </PersistQueryClientProvider>
      </Environment>
    </ThemeProvider>
  );
}
