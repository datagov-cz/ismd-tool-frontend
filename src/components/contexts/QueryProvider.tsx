'use client';

import { ReactNode } from 'react';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { getQueryClient } from '@/app/get-query-client';

const persister = createAsyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'ISMD_OFFLINE_CACHE',
});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: () => false,
          shouldDehydrateMutation: (mutation) =>
            mutation.state.isPaused &&
            !!queryClient.getMutationDefaults(
              mutation.options.mutationKey ?? [],
            ).mutationFn,
        },
      }}
      onSuccess={() =>
        queryClient
          .resumePausedMutations()
          .then(() => queryClient.invalidateQueries())
      }
    >
      {children}
    </PersistQueryClientProvider>
  );
};
