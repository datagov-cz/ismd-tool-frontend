import { useQueryClient } from '@tanstack/react-query';

import {
  getGetAllDiagramsQueryKey,
  getGetConceptDetailQueryKey,
  getGetDiagramQueryKey,
  getGetOntologyDetailQueryKey,
  getGetOntologyListQueryKey,
} from '@/api/generated';

export function useQueryInvalidator() {
  const queryClient = useQueryClient();

  return {
    invalidateOntology: async (slug: string) => {
      return await queryClient.invalidateQueries({
        queryKey: getGetOntologyDetailQueryKey(encodeURIComponent(slug)),
      });
    },
    invalidateConcept: async (slug: string) => {
      return await queryClient.invalidateQueries({
        queryKey: getGetConceptDetailQueryKey(encodeURIComponent(slug)),
      });
    },
    invalidateDiagram: async (ontologySlug: string) => {
      return await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getGetDiagramQueryKey(encodeURIComponent(ontologySlug)),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetAllDiagramsQueryKey(),
        }),
      ]);
    },
    invalidateOntologyList: async () => {
      return await queryClient.invalidateQueries({
        queryKey: getGetOntologyListQueryKey(),
      });
    },
  };
}
