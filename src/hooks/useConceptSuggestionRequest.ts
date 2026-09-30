import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useGetOntologyList } from '@/api/generated';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import {
  dictionaryIriOfConcept,
  isSameIri,
} from '@/lib/conceptSuggestion/domainDictionary';
import type { ConceptSuggestionRequest } from '@/lib/conceptSuggestion/types';
import { parseLegalActIri } from '@/lib/vocabularyDraft/legalAct';

export type ConceptSuggestionRequestState =
  | { status: 'unsupported' }
  | { status: 'needsDomain' }
  | { status: 'resolving' }
  | { status: 'ready'; request: ConceptSuggestionRequest; key: string };

export const useConceptSuggestionRequest = (
  fragmentIri: string,
  ontologySlug: string,
): ConceptSuggestionRequestState => {
  const { control } = useFormContext<ConceptForm>();
  const kind = useWatch({ control, name: 'conceptTypeEnum' });
  const domain = useWatch({ control, name: 'domain' });

  const domainIri = kind === 'TRIDA' ? undefined : domain?.iri;
  const domainDictionaryIri = domainIri
    ? dictionaryIriOfConcept(domainIri)
    : null;
  const ontologyList = useGetOntologyList(undefined, {
    query: { enabled: !!domainDictionaryIri },
  });
  const domainSlug = domainDictionaryIri
    ? ontologyList.data?.data?.find(
        (ontology) =>
          !!ontology.graphName &&
          isSameIri(ontology.graphName, domainDictionaryIri),
      )?.slug
    : undefined;
  const isResolving = !!domainDictionaryIri && ontologyList.isLoading;

  return useMemo((): ConceptSuggestionRequestState => {
    const legalAct = parseLegalActIri(fragmentIri);
    if (!legalAct) {
      return { status: 'unsupported' };
    }
    if (kind !== 'TRIDA' && !domainIri) {
      return { status: 'needsDomain' };
    }
    if (isResolving) {
      return { status: 'resolving' };
    }
    const knownSlugs =
      domainSlug && domainSlug !== ontologySlug
        ? [ontologySlug, domainSlug]
        : [ontologySlug];
    const key = [kind, fragmentIri, domainIri, ...knownSlugs].join('::');
    if (kind === 'TRIDA' || !domainIri) {
      return {
        status: 'ready',
        key,
        request: { kind: 'TRIDA', legalAct, knownSlugs },
      };
    }
    return {
      status: 'ready',
      key,
      request: { kind, legalAct, knownSlugs, domainIri },
    };
  }, [fragmentIri, ontologySlug, kind, domainIri, domainSlug, isResolving]);
};
