import { useEffect } from 'react';

import {
  ConceptDetailModel,
  useResolveConceptReferences,
} from '@/api/generated';
import {
  extractConceptIris,
  ResolvedConceptsMap,
} from '@/utils/conceptRelations';

export const useResolvedConceptReferences = (
  conceptDetail: ConceptDetailModel | undefined,
): {
  resolved: ResolvedConceptsMap;
  isLoading: boolean;
} => {
  const { mutate, data, isPending } = useResolveConceptReferences();

  useEffect(() => {
    if (!conceptDetail) return;

    const iris = extractConceptIris(conceptDetail);
    if (iris.length === 0) return;

    mutate({ data: { iris } });
  }, [conceptDetail, mutate]);

  const resolved = (data?.data?.resolved ?? {}) as ResolvedConceptsMap;

  return { resolved, isLoading: isPending };
};
