import { useQueryClient } from '@tanstack/react-query';

import {
  getGetOntologyDetailQueryKey,
  getGetOntologyListQueryKey,
} from '@/api/generated';

export function useQueryInvalidator() {
  const queryClient = useQueryClient();

  return {
    invalidateOntology: async (slug: string) => {
      return await queryClient.invalidateQueries({
        queryKey: getGetOntologyDetailQueryKey(slug),
      });
    },
    invalidateOntologyList: () =>
      queryClient.invalidateQueries({
        queryKey: getGetOntologyListQueryKey(),
      }),
  };
}
