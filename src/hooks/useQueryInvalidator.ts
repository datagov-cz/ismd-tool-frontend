import { useQueryClient } from '@tanstack/react-query';

import {
  getGetAllDiagramsQueryKey,
  getGetConceptDetailQueryKey,
  getGetDiagramQueryKey,
  getGetOntologyDetailQueryKey,
  getGetOntologyListQueryKey,
  getListForOntologyQueryKey,
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
    invalidateDiagram: async (ontologySlug: string, diagramId?: number) => {
      const encodedSlug = encodeURIComponent(ontologySlug);
      return await Promise.all([
        queryClient.invalidateQueries({
          ...(diagramId === undefined
            ? {
                predicate: ({ queryKey }) => {
                  const key = queryKey[0];
                  return (
                    typeof key === 'string' &&
                    key.startsWith(`/api/diagram/${encodedSlug}/`) &&
                    key.endsWith('/detail')
                  );
                },
              }
            : { queryKey: getGetDiagramQueryKey(encodedSlug, diagramId) }),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetAllDiagramsQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getListForOntologyQueryKey(encodedSlug),
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
