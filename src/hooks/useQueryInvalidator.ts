import { useQueryClient } from '@tanstack/react-query';

import {
  getGetConceptDetailQueryKey,
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
    invalidateConcept: async (slug: string) => {
      return await queryClient.invalidateQueries({
        queryKey: getGetConceptDetailQueryKey(encodeURIComponent(slug)),
      });
    },
    invalidateOntologyList: () =>
      queryClient.invalidateQueries({
        queryKey: getGetOntologyListQueryKey(),
      }),
  };
}
