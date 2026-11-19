import { useFormContext, useWatch } from 'react-hook-form';

import { useGetOntologyList } from '@/api/generated';
import { type ConceptForm } from '@/components/conceptForm/schema/conceptFormSchema';
import { dictionaryIriOfConcept } from '@/lib/conceptSuggestion/domainDictionary';
import type { ConceptSuggestionRequest } from '@/lib/conceptSuggestion/types';
import { parseLegalActIri } from '@/lib/vocabularyDraft/legalAct';

export type ConceptSuggestionRequestState =
  | { status: 'unsupported' }
  | { status: 'needsDomain' }
  | { status: 'resolving' }
  | { status: 'ready'; request: ConceptSuggestionRequest; key: string };

const ready = (
  request: ConceptSuggestionRequest,
): ConceptSuggestionRequestState => ({
  status: 'ready',
  request,
  key: JSON.stringify(request),
});

const useDictionarySlugOfConcept = (conceptIri?: string) => {
  const dictionaryIri = conceptIri ? dictionaryIriOfConcept(conceptIri) : null;
  const { data, isLoading } = useGetOntologyList(undefined, {
    query: { enabled: !!dictionaryIri },
  });
  const dictionary = dictionaryIri
    ? data?.data?.find((ontology) => ontology.graphName === dictionaryIri)
    : undefined;

  return { slug: dictionary?.slug, isLoading: !!dictionaryIri && isLoading };
};

export const useConceptSuggestionRequest = (
  fragmentIri: string,
  ontologySlug: string,
): ConceptSuggestionRequestState => {
  const { control } = useFormContext<ConceptForm>();
  const kind = useWatch({ control, name: 'conceptTypeEnum' });
  const domain = useWatch({ control, name: 'domain' });
  const domainIri = kind === 'TRIDA' ? undefined : domain?.iri;
  const domainDictionary = useDictionarySlugOfConcept(domainIri);
  const legalAct = parseLegalActIri(fragmentIri);

  if (!legalAct) {
    return { status: 'unsupported' };
  }
  if (kind === 'TRIDA') {
    return ready({ kind, legalAct, knownSlugs: [ontologySlug] });
  }
  if (!domainIri) {
    return { status: 'needsDomain' };
  }
  if (domainDictionary.isLoading) {
    return { status: 'resolving' };
  }
  const knownSlugs =
    domainDictionary.slug && domainDictionary.slug !== ontologySlug
      ? [ontologySlug, domainDictionary.slug]
      : [ontologySlug];
  return ready({ kind, legalAct, knownSlugs, domainIri });
};
