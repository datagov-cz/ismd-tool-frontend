import { isServer, QueryClient } from '@tanstack/react-query';

import { registerOfflineMutationDefaults } from '@/lib/offlineMutationDefaults';

const makeQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
      },
      mutations: {
        networkMode: 'always',
      },
    },
  });

  // Must run before PersistQueryClientProvider restores + resumes paused
  // mutations — module scope guarantees registration precedes render.
  registerOfflineMutationDefaults(queryClient);

  return queryClient;
};

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
  }
};
