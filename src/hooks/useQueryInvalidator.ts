import { useQueryClient } from '@tanstack/react-query';

import { getGetOntologyDetailQueryKey } from '@/api/generated';

export function useQueryInvalidator() {
  const queryClient = useQueryClient();

  return {
    invalidateOntology: (slug: string) =>
      queryClient.invalidateQueries({
        queryKey: getGetOntologyDetailQueryKey(slug),
      }),
  };
}
