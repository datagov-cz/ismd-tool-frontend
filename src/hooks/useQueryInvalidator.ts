import { useQueryClient } from '@tanstack/react-query';

import { getGetOntologyDetailQueryKey } from '@/api/generated';

export function useQueryInvalidator() {
  const queryClient = useQueryClient();

  return {
    invalidateOntology: async (slug: string) => {
      return await queryClient.invalidateQueries({
        queryKey: getGetOntologyDetailQueryKey(slug),
      });
    },
  };
}
